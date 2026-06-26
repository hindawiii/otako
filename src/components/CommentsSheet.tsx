import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Send,
  Loader2,
  Mic,
  Square,
  Trash2,
  MoreVertical,
  Flag,
  Pencil,
  Check,
  X,
  Replace,
  Smile,
} from "lucide-react";
import { toast } from "sonner";
import { timeAgo } from "@/lib/arena-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ReportDialog, type ReportResource } from "@/components/ReportDialog";

interface Reaction {
  comment_id: string;
  user_id: string;
  emoji: string;
}

interface Comment {
  id: string;
  user_id: string;
  content: string | null;
  audio_url: string | null;
  created_at: string;
  profile?: { nickname: string | null; avatar_url: string | null };
  reactions?: Reaction[];
}

const MAX_RECORD_MS = 30_000;
const EMOJIS = ["👍", "❤️", "😆", "😲", "😢", "🔥"];

export function CommentsSheet({
  postId,
  open,
  onOpenChange,
}: {
  postId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  // Voice recording
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopTimerRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  // Replace-mode for voice editing: when set, the next finished recording
  // replaces the audio of this existing comment (and deletes the old file).
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);

  // Text edit mode
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Reporting
  const [reportTarget, setReportTarget] = useState<{
    id: string;
    type: ReportResource;
    profileId: string;
  } | null>(null);

  useEffect(() => {
    if (!postId || !open) return;
    void load();
  }, [postId, open]);

  async function load() {
    if (!postId) return;
    const { data: rows } = await supabase
      .from("post_comments")
      .select("id,user_id,content,audio_url,created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (!rows) return;
    const ids = [...new Set(rows.map((r) => r.user_id))];
    const [{ data: profs }, { data: rxs }] = await Promise.all([
      supabase.from("profiles").select("id,nickname,avatar_url").in("id", ids),
      supabase
        .from("comment_reactions")
        .select("comment_id,user_id,emoji")
        .in("comment_id", rows.map((r) => r.id)),
    ]);
    const profMap = new Map(profs?.map((p) => [p.id, p]) ?? []);
    const reactionsByComment = new Map<string, Reaction[]>();
    (rxs ?? []).forEach((r) => {
      const arr = reactionsByComment.get(r.comment_id) ?? [];
      arr.push(r);
      reactionsByComment.set(r.comment_id, arr);
    });
    setComments(
      rows.map((r) => ({
        ...r,
        profile: profMap.get(r.user_id) ?? undefined,
        reactions: reactionsByComment.get(r.id) ?? [],
      })),
    );
  }

  async function handleSendText() {
    if (!user || !postId || !text.trim()) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("post_comments").insert({
        post_id: postId,
        user_id: user.id,
        content: text.trim(),
      });
      if (error) throw error;
      setText("");
      await load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function startRecording() {
    if (!user || !postId) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("المتصفح لا يدعم التسجيل الصوتي");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (replaceTargetId) {
          await replaceAudio(replaceTargetId, blob);
          setReplaceTargetId(null);
        } else {
          await uploadAudio(blob);
        }
      };
      recorderRef.current = mr;
      mr.start();
      setRecording(true);
      setElapsed(0);
      const started = Date.now();
      tickRef.current = window.setInterval(() => setElapsed(Date.now() - started), 200);
      stopTimerRef.current = window.setTimeout(stopRecording, MAX_RECORD_MS);
    } catch {
      toast.error("تعذّر الوصول للميكروفون");
    }
  }

  function stopRecording() {
    if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
    if (tickRef.current) window.clearInterval(tickRef.current);
    stopTimerRef.current = null;
    tickRef.current = null;
    setRecording(false);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  function cancelRecording() {
    if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
    if (tickRef.current) window.clearInterval(tickRef.current);
    stopTimerRef.current = null;
    tickRef.current = null;
    setRecording(false);
    setReplaceTargetId(null);
    if (recorderRef.current?.state === "recording") {
      chunksRef.current = [];
      recorderRef.current.stop();
    }
  }

  async function uploadAudio(blob: Blob) {
    if (!user || !postId || blob.size === 0) return;
    setBusy(true);
    try {
      const path = `${user.id}/${postId}/${Date.now()}.webm`;
      const { error: upErr } = await supabase.storage
        .from("comment-audio")
        .upload(path, blob, { contentType: "audio/webm" });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("comment-audio").getPublicUrl(path);
      const { error } = await supabase.from("post_comments").insert({
        post_id: postId,
        user_id: user.id,
        audio_url: pub.publicUrl,
      });
      if (error) throw error;
      await load();
    } catch (err: any) {
      toast.error(err.message ?? "فشل رفع التسجيل");
    } finally {
      setBusy(false);
    }
  }

  // Voice "edit" = true replacement: delete old audio file, insert new
  // comment row, then delete the old comment row. Storage cleanup is best-effort.
  async function replaceAudio(oldId: string, blob: Blob) {
    if (!user || !postId || blob.size === 0) return;
    setBusy(true);
    try {
      const old = comments.find((c) => c.id === oldId);
      // Upload new audio
      const path = `${user.id}/${postId}/${Date.now()}.webm`;
      const { error: upErr } = await supabase.storage
        .from("comment-audio")
        .upload(path, blob, { contentType: "audio/webm" });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("comment-audio").getPublicUrl(path);
      // Insert replacement comment
      const { error: insErr } = await supabase.from("post_comments").insert({
        post_id: postId,
        user_id: user.id,
        audio_url: pub.publicUrl,
      });
      if (insErr) throw insErr;
      // Delete old DB row
      await supabase.from("post_comments").delete().eq("id", oldId);
      // Best-effort: delete old storage object
      if (old?.audio_url) {
        const marker = "/comment-audio/";
        const idx = old.audio_url.indexOf(marker);
        if (idx > -1) {
          const oldPath = old.audio_url.slice(idx + marker.length);
          await supabase.storage.from("comment-audio").remove([oldPath]);
        }
      }
      toast.success("تم استبدال التعليق الصوتي");
      await load();
    } catch (err: any) {
      toast.error(err.message ?? "فشل استبدال التسجيل");
    } finally {
      setBusy(false);
    }
  }

  function startReplaceVoice(id: string) {
    if (recording) return;
    setReplaceTargetId(id);
    void startRecording();
  }

  async function handleDeleteComment(c: Comment) {
    if (!confirm(c.audio_url ? "حذف التعليق الصوتي؟" : "حذف التعليق؟")) return;
    try {
      const { error } = await supabase.from("post_comments").delete().eq("id", c.id);
      if (error) throw error;
      if (c.audio_url) {
        const marker = "/comment-audio/";
        const idx = c.audio_url.indexOf(marker);
        if (idx > -1) {
          await supabase.storage
            .from("comment-audio")
            .remove([c.audio_url.slice(idx + marker.length)]);
        }
      }
      await load();
    } catch (err: any) {
      toast.error(err.message ?? "تعذّر الحذف");
    }
  }

  function startEditText(c: Comment) {
    setEditingId(c.id);
    setEditText(c.content ?? "");
  }

  async function saveEditText() {
    if (!editingId || !editText.trim()) return;
    setBusy(true);
    try {
      const { error } = await supabase
        .from("post_comments")
        .update({ content: editText.trim() })
        .eq("id", editingId);
      if (error) throw error;
      setEditingId(null);
      setEditText("");
      await load();
    } catch (err: any) {
      toast.error(err.message ?? "تعذّر التعديل");
    } finally {
      setBusy(false);
    }
  }

  async function toggleReaction(commentId: string, emoji: string) {
    if (!user) return;
    const c = comments.find((x) => x.id === commentId);
    const mine = c?.reactions?.some((r) => r.user_id === user.id && r.emoji === emoji);
    try {
      if (mine) {
        await supabase
          .from("comment_reactions")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", user.id)
          .eq("emoji", emoji);
      } else {
        await supabase
          .from("comment_reactions")
          .insert({ comment_id: commentId, user_id: user.id, emoji });
      }
      await load();
    } catch (err: any) {
      toast.error(err.message ?? "تعذّر تسجيل التفاعل");
    }
  }

  const seconds = Math.min(30, Math.floor(elapsed / 1000));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] border-border/60 bg-background/85 backdrop-blur-xl"
        dir="rtl"
      >
        <SheetHeader>
          <SheetTitle className="text-right">التعليقات</SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex h-[calc(85vh-180px)] flex-col gap-3 overflow-y-auto pb-2">
          {comments.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">كن أول من يعلق</p>
          )}
          {comments.map((c) => {
            // Hide the bubble of the comment being voice-replaced
            if (replaceTargetId === c.id) return null;
            const isAuthor = user?.id === c.user_id;
            const isVoice = !!c.audio_url;
            // Aggregate reactions by emoji
            const counts = new Map<string, { total: number; mine: boolean }>();
            (c.reactions ?? []).forEach((r) => {
              const cur = counts.get(r.emoji) ?? { total: 0, mine: false };
              cur.total += 1;
              if (r.user_id === user?.id) cur.mine = true;
              counts.set(r.emoji, cur);
            });

            return (
              <div key={c.id} className="flex gap-2">
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-primary/15">
                  {c.profile?.avatar_url ? (
                    <img src={c.profile.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-primary">
                      {(c.profile?.nickname ?? "?")[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 rounded-2xl border border-border/40 bg-card/40 px-3 py-2 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">
                        {c.profile?.nickname ?? "أوتاكو"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {timeAgo(c.created_at)}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          aria-label="خيارات التعليق"
                          className="rounded-full p-1 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="border-border/50 bg-background/90 text-right backdrop-blur-xl"
                      >
                        {isAuthor && !isVoice && (
                          <DropdownMenuItem
                            onClick={() => startEditText(c)}
                            className="gap-2"
                          >
                            <Pencil className="h-4 w-4" />
                            تعديل التعليق
                          </DropdownMenuItem>
                        )}
                        {isAuthor && isVoice && (
                          <DropdownMenuItem
                            onClick={() => startReplaceVoice(c.id)}
                            className="gap-2"
                          >
                            <Replace className="h-4 w-4" />
                            تعديل التعليق الصوتي
                          </DropdownMenuItem>
                        )}
                        {isAuthor && (
                          <DropdownMenuItem
                            onClick={() => handleDeleteComment(c)}
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            مسح التعليق
                          </DropdownMenuItem>
                        )}
                        {isAuthor && <DropdownMenuSeparator />}
                        {!isAuthor && (
                          <DropdownMenuItem
                            onClick={() =>
                              setReportTarget({
                                id: c.id,
                                type: isVoice ? "voice_comment" : "comment",
                                profileId: c.user_id,
                              })
                            }
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <Flag className="h-4 w-4" />
                            إبلاغ عن محتوى
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Body */}
                  {editingId === c.id ? (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        dir="rtl"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="min-h-16 border-border/50 bg-background/60 text-right backdrop-blur"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(null);
                            setEditText("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={saveEditText}
                          disabled={busy || !editText.trim()}
                          className="bg-gradient-primary text-primary-foreground"
                        >
                          {busy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {c.content && (
                        <p className="mt-1 text-sm leading-relaxed">{c.content}</p>
                      )}
                      {c.audio_url && (
                        <audio src={c.audio_url} controls className="mt-2 h-9 w-full" />
                      )}
                    </>
                  )}

                  {/* Reactions row */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {[...counts.entries()].map(([emoji, { total, mine }]) => (
                      <button
                        key={emoji}
                        onClick={() => toggleReaction(c.id, emoji)}
                        className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition ${
                          mine
                            ? "border-primary/60 bg-primary/15 text-primary shadow-neon"
                            : "border-border/50 bg-background/40 hover:border-border"
                        }`}
                      >
                        <span>{emoji}</span>
                        <span className="tabular-nums">{total}</span>
                      </button>
                    ))}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          aria-label="إضافة تفاعل"
                          className="flex h-6 items-center gap-1 rounded-full border border-dashed border-border/60 px-2 text-xs text-muted-foreground hover:border-primary/60 hover:text-primary"
                        >
                          <Smile className="h-3.5 w-3.5" />
                          تفاعل
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        className="w-auto border-border/50 bg-background/90 p-2 backdrop-blur-xl"
                      >
                        <div className="flex gap-1">
                          {EMOJIS.map((e) => (
                            <button
                              key={e}
                              onClick={() => toggleReaction(c.id, e)}
                              className="rounded-md px-1.5 py-1 text-lg transition hover:scale-125 hover:bg-muted/40"
                            >
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

        <div className="absolute inset-x-4 bottom-4 flex items-center gap-2">
          {recording ? (
            <>
              <div className="flex flex-1 items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs">
                <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
                <span className="font-bold">
                  {replaceTargetId ? "جارٍ تسجيل البديل…" : "جارٍ التسجيل…"}
                </span>
                <span className="ms-auto tabular-nums">{seconds}س / 30س</span>
              </div>
              <Button
                onClick={cancelRecording}
                variant="ghost"
                size="icon"
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                onClick={stopRecording}
                size="icon"
                className="bg-gradient-primary text-primary-foreground"
              >
                <Square className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="اكتب تعليقاً…"
                className="text-right"
                dir="rtl"
                onKeyDown={(e) => e.key === "Enter" && handleSendText()}
                disabled={busy}
              />
              <Button
                onClick={startRecording}
                variant="outline"
                size="icon"
                disabled={busy}
                title="تسجيل صوتي (30 ثانية)"
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSendText}
                disabled={busy || !text.trim()}
                className="bg-gradient-primary text-primary-foreground"
              >
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
      </SheetContent>
    </Sheet>
  );
}
