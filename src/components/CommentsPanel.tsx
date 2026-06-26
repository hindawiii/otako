import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Send, Loader2, Mic, Square, Trash2, MoreVertical, Flag, Pencil, Check, X, Replace, Smile,
} from "lucide-react";
import { toast } from "sonner";
import { timeAgo } from "@/lib/arena-utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ReportDialog, type ReportResource } from "@/components/ReportDialog";

interface Reaction { comment_id: string; user_id: string; emoji: string }
interface Comment {
  id: string; user_id: string; content: string | null; audio_url: string | null;
  created_at: string;
  profile?: { nickname: string | null; avatar_url: string | null };
  reactions?: Reaction[];
}

const MAX_RECORD_MS = 30_000;
const EMOJIS = ["👍", "❤️", "😆", "😲", "😢", "🔥"];

export function CommentsPanel({ postId, onCountChange }: { postId: string; onCountChange?: (n: number) => void }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopTimerRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [reportTarget, setReportTarget] = useState<{ id: string; type: ReportResource; profileId: string } | null>(null);

  useEffect(() => { void load(); }, [postId]);

  async function load() {
    const { data: rows } = await supabase
      .from("post_comments")
      .select("id,user_id,content,audio_url,created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (!rows) return;
    const ids = [...new Set(rows.map((r) => r.user_id))];
    const [{ data: profs }, { data: rxs }] = await Promise.all([
      supabase.from("profiles").select("id,nickname,avatar_url").in("id", ids),
      supabase.from("comment_reactions").select("comment_id,user_id,emoji").in("comment_id", rows.map((r) => r.id)),
    ]);
    const profMap = new Map(profs?.map((p) => [p.id, p]) ?? []);
    const rxMap = new Map<string, Reaction[]>();
    (rxs ?? []).forEach((r) => {
      const a = rxMap.get(r.comment_id) ?? []; a.push(r); rxMap.set(r.comment_id, a);
    });
    const next = rows.map((r) => ({
      ...r, profile: profMap.get(r.user_id) ?? undefined, reactions: rxMap.get(r.id) ?? [],
    }));
    setComments(next);
    onCountChange?.(next.length);
  }

  async function handleSendText() {
    if (!user || !text.trim()) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("post_comments").insert({
        post_id: postId, user_id: user.id, content: text.trim(),
      });
      if (error) throw error;
      setText("");
      await load();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  }

  async function startRecording() {
    if (!user) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("المتصفح لا يدعم التسجيل الصوتي"); return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (replaceTargetId) { await replaceAudio(replaceTargetId, blob); setReplaceTargetId(null); }
        else await uploadAudio(blob);
      };
      recorderRef.current = mr;
      mr.start(); setRecording(true); setElapsed(0);
      const started = Date.now();
      tickRef.current = window.setInterval(() => setElapsed(Date.now() - started), 200);
      stopTimerRef.current = window.setTimeout(stopRecording, MAX_RECORD_MS);
    } catch { toast.error("تعذّر الوصول للميكروفون"); }
  }

  function stopRecording() {
    if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
    if (tickRef.current) window.clearInterval(tickRef.current);
    stopTimerRef.current = null; tickRef.current = null; setRecording(false);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }
  function cancelRecording() {
    if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
    if (tickRef.current) window.clearInterval(tickRef.current);
    stopTimerRef.current = null; tickRef.current = null;
    setRecording(false); setReplaceTargetId(null);
    if (recorderRef.current?.state === "recording") { chunksRef.current = []; recorderRef.current.stop(); }
  }

  async function uploadAudio(blob: Blob) {
    if (!user || blob.size === 0) return;
    setBusy(true);
    try {
      const path = `${user.id}/${postId}/${Date.now()}.webm`;
      const { error: upErr } = await supabase.storage.from("comment-audio").upload(path, blob, { contentType: "audio/webm" });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("comment-audio").getPublicUrl(path);
      const { error } = await supabase.from("post_comments").insert({
        post_id: postId, user_id: user.id, audio_url: pub.publicUrl,
      });
      if (error) throw error;
      await load();
    } catch (e: any) { toast.error(e.message ?? "فشل الرفع"); } finally { setBusy(false); }
  }

  async function replaceAudio(oldId: string, blob: Blob) {
    if (!user || blob.size === 0) return;
    setBusy(true);
    try {
      const old = comments.find((c) => c.id === oldId);
      const path = `${user.id}/${postId}/${Date.now()}.webm`;
      const { error: upErr } = await supabase.storage.from("comment-audio").upload(path, blob, { contentType: "audio/webm" });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("comment-audio").getPublicUrl(path);
      const { error: insErr } = await supabase.from("post_comments").insert({
        post_id: postId, user_id: user.id, audio_url: pub.publicUrl,
      });
      if (insErr) throw insErr;
      await supabase.from("post_comments").delete().eq("id", oldId);
      if (old?.audio_url) {
        const idx = old.audio_url.indexOf("/comment-audio/");
        if (idx > -1) await supabase.storage.from("comment-audio").remove([old.audio_url.slice(idx + 15)]);
      }
      toast.success("تم الاستبدال");
      await load();
    } catch (e: any) { toast.error(e.message ?? "فشل الاستبدال"); } finally { setBusy(false); }
  }

  async function handleDelete(c: Comment) {
    if (!confirm("حذف التعليق؟")) return;
    try {
      await supabase.from("post_comments").delete().eq("id", c.id);
      if (c.audio_url) {
        const idx = c.audio_url.indexOf("/comment-audio/");
        if (idx > -1) await supabase.storage.from("comment-audio").remove([c.audio_url.slice(idx + 15)]);
      }
      await load();
    } catch (e: any) { toast.error(e.message); }
  }

  async function saveEditText() {
    if (!editingId || !editText.trim()) return;
    setBusy(true);
    try {
      await supabase.from("post_comments").update({ content: editText.trim() }).eq("id", editingId);
      setEditingId(null); setEditText(""); await load();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  }

  async function toggleReaction(commentId: string, emoji: string) {
    if (!user) return;
    const c = comments.find((x) => x.id === commentId);
    const mine = c?.reactions?.some((r) => r.user_id === user.id && r.emoji === emoji);
    try {
      if (mine) {
        await supabase.from("comment_reactions").delete()
          .eq("comment_id", commentId).eq("user_id", user.id).eq("emoji", emoji);
      } else {
        await supabase.from("comment_reactions").insert({ comment_id: commentId, user_id: user.id, emoji });
      }
      await load();
    } catch (e: any) { toast.error(e.message); }
  }

  const seconds = Math.min(30, Math.floor(elapsed / 1000));

  return (
    <div dir="rtl" className="border-t border-border/40 bg-background/30 px-3 py-3 text-right backdrop-blur">
      <div className="space-y-2">
        {comments.length === 0 && (
          <p className="py-2 text-center text-xs text-muted-foreground">كن أول من يعلق</p>
        )}
        {comments.map((c) => {
          if (replaceTargetId === c.id) return null;
          const isAuthor = user?.id === c.user_id;
          const isVoice = !!c.audio_url;
          const counts = new Map<string, { total: number; mine: boolean }>();
          (c.reactions ?? []).forEach((r) => {
            const cur = counts.get(r.emoji) ?? { total: 0, mine: false };
            cur.total += 1; if (r.user_id === user?.id) cur.mine = true;
            counts.set(r.emoji, cur);
          });
          return (
            <div key={c.id} className="flex gap-2">
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-primary/15">
                {c.profile?.avatar_url ? (
                  <img src={c.profile.avatar_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-primary">
                    {(c.profile?.nickname ?? "?")[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 rounded-2xl border border-border/40 bg-card/40 px-3 py-2 backdrop-blur">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{c.profile?.nickname ?? "أوتاكو"}</span>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_at)}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button aria-label="خيارات" className="rounded-full p-1 text-muted-foreground hover:bg-muted/40 hover:text-foreground">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="border-border/50 bg-background/90 text-right backdrop-blur-xl">
                      {isAuthor && !isVoice && (
                        <DropdownMenuItem onClick={() => { setEditingId(c.id); setEditText(c.content ?? ""); }} className="gap-2">
                          <Pencil className="h-4 w-4" /> تعديل التعليق
                        </DropdownMenuItem>
                      )}
                      {isAuthor && isVoice && (
                        <DropdownMenuItem onClick={() => { if (!recording) { setReplaceTargetId(c.id); void startRecording(); } }} className="gap-2">
                          <Replace className="h-4 w-4" /> تعديل الصوت
                        </DropdownMenuItem>
                      )}
                      {isAuthor && (
                        <DropdownMenuItem onClick={() => handleDelete(c)} className="gap-2 text-destructive focus:text-destructive">
                          <Trash2 className="h-4 w-4" /> حذف
                        </DropdownMenuItem>
                      )}
                      {!isAuthor && (
                        <DropdownMenuItem
                          onClick={() => setReportTarget({ id: c.id, type: isVoice ? "voice_comment" : "comment", profileId: c.user_id })}
                          className="gap-2 text-destructive focus:text-destructive"
                        >
                          <Flag className="h-4 w-4" /> إبلاغ
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {editingId === c.id ? (
                  <div className="mt-2 space-y-2">
                    <Textarea dir="rtl" value={editText} onChange={(e) => setEditText(e.target.value)}
                      className="min-h-12 border-border/50 bg-background/60 text-right" />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditText(""); }}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={saveEditText} disabled={busy || !editText.trim()}
                        className="bg-gradient-primary text-primary-foreground">
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {c.content && <p className="mt-1 text-sm leading-relaxed">{c.content}</p>}
                    {c.audio_url && <audio src={c.audio_url} controls preload="none" className="mt-2 h-9 w-full" />}
                  </>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {[...counts.entries()].map(([emoji, { total, mine }]) => (
                    <button key={emoji} onClick={() => toggleReaction(c.id, emoji)}
                      className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${mine ? "border-primary/60 bg-primary/15 text-primary shadow-neon" : "border-border/50 bg-background/40"}`}>
                      <span>{emoji}</span><span className="tabular-nums">{total}</span>
                    </button>
                  ))}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex h-6 items-center gap-1 rounded-full border border-dashed border-border/60 px-2 text-xs text-muted-foreground hover:border-primary/60 hover:text-primary">
                        <Smile className="h-3.5 w-3.5" /> تفاعل
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto border-border/50 bg-background/90 p-2 backdrop-blur-xl">
                      <div className="flex gap-1">
                        {EMOJIS.map((e) => (
                          <button key={e} onClick={() => toggleReaction(c.id, e)}
                            className="rounded-md px-1.5 py-1 text-lg hover:scale-125 hover:bg-muted/40">
                            {e}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-2">
        {recording ? (
          <>
            <div className="flex flex-1 items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs">
              <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
              <span className="font-bold">{replaceTargetId ? "تسجيل بديل…" : "جارٍ التسجيل…"}</span>
              <span className="ms-auto tabular-nums">{seconds}س / 30س</span>
            </div>
            <Button onClick={cancelRecording} variant="ghost" size="icon" className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button onClick={stopRecording} size="icon" className="bg-gradient-primary text-primary-foreground">
              <Square className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتب تعليقاً…"
              className="text-right" dir="rtl"
              onKeyDown={(e) => e.key === "Enter" && handleSendText()} disabled={busy} />
            <Button onClick={startRecording} variant="outline" size="icon" disabled={busy} title="تسجيل صوتي">
              <Mic className="h-4 w-4" />
            </Button>
            <Button onClick={handleSendText} disabled={busy || !text.trim()}
              className="bg-gradient-primary text-primary-foreground">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </>
        )}
      </div>

      <ReportDialog
        open={!!reportTarget}
        onOpenChange={(o) => !o && setReportTarget(null)}
        resourceType={reportTarget?.type ?? "comment"}
        resourceId={reportTarget?.id ?? null}
        reportedProfileId={reportTarget?.profileId ?? null}
      />
    </div>
  );
}
