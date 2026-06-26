import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Plus, X, Loader2, ChevronLeft, ChevronRight, Send, Repeat, MoreVertical, Clock, Bookmark, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Story {
  id: string;
  creator_id: string;
  media_url: string;
  media_type: string;
  created_at: string;
  kept_in_profile?: boolean;
  profile?: { nickname: string | null; username: string | null; avatar_url: string | null };
}
interface UserGroup {
  user_id: string;
  profile?: Story["profile"];
  stories: Story[];
}

const REACTIONS = ["❤️", "🔥", "😂", "😮", "😢", "👏"];

export function StoryBar() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState<{ groupIdx: number; storyIdx: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void load();
    const ch = supabase
      .channel("stories-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "stories" }, () => void load())
      .subscribe();
    return () => void supabase.removeChannel(ch);
  }, []);

  useEffect(() => {
    if (!pickedFile) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(pickedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pickedFile]);

  async function load() {
    const { data: rows } = await supabase
      .from("stories")
      .select("id,creator_id,media_url,media_type,created_at,kept_in_profile")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true });
    if (!rows) return;
    const ids = [...new Set(rows.map((r) => r.creator_id))];
    const { data: profs } = await supabase
      .from("profiles").select("id,nickname,username,avatar_url").in("id", ids);
    const map = new Map(profs?.map((p) => [p.id, p]) ?? []);
    setStories(rows.map((r) => ({ ...r, profile: map.get(r.creator_id) ?? undefined })));
  }

  const groups = useMemo<UserGroup[]>(() => {
    const m = new Map<string, UserGroup>();
    for (const s of stories) {
      const g = m.get(s.creator_id) ?? { user_id: s.creator_id, profile: s.profile, stories: [] };
      g.stories.push(s);
      m.set(s.creator_id, g);
    }
    const arr = [...m.values()];
    arr.sort((a, b) => (a.user_id === user?.id ? -1 : b.user_id === user?.id ? 1 : 0));
    return arr;
  }, [stories, user]);

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      if (!f.type.startsWith("image/")) {
        toast.error("القصص تدعم الصور فقط");
        if (fileRef.current) fileRef.current.value = "";
        return;
      }
      setPickedFile(f);
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function publish() {
    if (!pickedFile || !user) return;
    setUploading(true);
    try {
      const ext = pickedFile.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("post-media").upload(path, pickedFile);
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("post-media").getPublicUrl(path);
      const { error } = await supabase.from("stories").insert({
        creator_id: user.id, media_url: pub.publicUrl, media_type: "image",
      });
      if (error) throw error;
      toast.success("تم نشر القصة");
      setPickedFile(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل النشر");
    } finally {
      setUploading(false);
    }
  }

  const activeGroup = viewing ? groups[viewing.groupIdx] : null;
  const activeStory = activeGroup ? activeGroup.stories[viewing!.storyIdx] : null;
  const isOwnStory = !!activeStory && activeStory.creator_id === user?.id;

  function nextStory() {
    if (!viewing || !activeGroup) return;
    if (viewing.storyIdx + 1 < activeGroup.stories.length) {
      setViewing({ ...viewing, storyIdx: viewing.storyIdx + 1 });
    } else if (viewing.groupIdx + 1 < groups.length) {
      setViewing({ groupIdx: viewing.groupIdx + 1, storyIdx: 0 });
    } else { setViewing(null); }
  }
  function prevStory() {
    if (!viewing || !activeGroup) return;
    if (viewing.storyIdx > 0) setViewing({ ...viewing, storyIdx: viewing.storyIdx - 1 });
    else if (viewing.groupIdx > 0) {
      const prev = groups[viewing.groupIdx - 1];
      setViewing({ groupIdx: viewing.groupIdx - 1, storyIdx: prev.stories.length - 1 });
    }
  }

  // Auto-advance image stories
  useEffect(() => {
    if (!activeStory) return;
    const t = setTimeout(() => nextStory(), 5000);
    return () => clearTimeout(t);
  }, [viewing?.groupIdx, viewing?.storyIdx]);

  async function toggleKeep() {
    if (!activeStory) return;
    const next = !activeStory.kept_in_profile;
    const { error } = await supabase.from("stories").update({ kept_in_profile: next }).eq("id", activeStory.id);
    if (error) { toast.error(error.message); return; }
    toast.success(next ? "تم حفظ القصة في الملف الشخصي" : "ستختفي القصة بعد 24 ساعة");
    void load();
  }
  async function deleteNow() {
    if (!activeStory) return;
    if (!confirm("حذف القصة الآن؟")) return;
    const { error } = await supabase.from("stories").delete().eq("id", activeStory.id);
    if (error) { toast.error(error.message); return; }
    toast.success("تم حذف القصة");
    setViewing(null);
    void load();
  }
  async function react(emoji: string) {
    if (!activeStory) return;
    toast.success(`تفاعلت ${emoji}`);
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-3">
        <button onClick={() => fileRef.current?.click()}
          className="flex shrink-0 flex-col items-center gap-1" disabled={uploading}>
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-primary/60 bg-primary/10 text-primary">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-6 w-6" />}
          </div>
          <span className="text-[10px] text-muted-foreground">قصتك</span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />

        {groups.map((g, i) => {
          const cover = g.stories[0];
          return (
            <button key={g.user_id} onClick={() => setViewing({ groupIdx: i, storyIdx: 0 })}
              className="relative flex shrink-0 flex-col items-center gap-1">
              <div className="rounded-full bg-gradient-to-tr from-primary via-accent to-neon-orange p-[2px]">
                <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-background bg-card">
                  {g.profile?.avatar_url ? (
                    <img src={g.profile.avatar_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : cover?.media_type === "image" ? (
                    <img src={cover.media_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary">
                      {(g.profile?.nickname ?? "?")[0]}
                    </div>
                  )}
                </div>
              </div>
              {g.stories.length > 1 && (
                <span className="absolute -end-1 top-0 rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground shadow-neon">
                  {g.stories.length}
                </span>
              )}
              <span className="max-w-[64px] truncate text-[10px] text-muted-foreground">
                {g.user_id === user?.id ? "أنت" : g.profile?.nickname ?? "—"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Pre-publish preview — fits within mobile viewport */}
      <Dialog open={!!pickedFile} onOpenChange={(o) => !o && setPickedFile(null)}>
        <DialogContent dir="rtl"
          className="flex max-h-[90vh] max-w-md flex-col gap-3 border-border/60 bg-background/85 p-3 backdrop-blur-xl">
          <h3 className="text-right text-sm font-bold">معاينة القصة قبل النشر</h3>
          {previewUrl && (
            <div className="relative overflow-hidden rounded-xl bg-black">
              <img src={previewUrl} alt=""
                className="mx-auto block max-h-[60vh] w-full object-contain" />
              <div className="absolute end-2 top-2 z-10 flex gap-1">
                <button onClick={() => fileRef.current?.click()}
                  className="rounded-full bg-black/70 p-1.5 text-white hover:bg-black/90" aria-label="استبدال">
                  <Repeat className="h-4 w-4" />
                </button>
                <button onClick={() => setPickedFile(null)}
                  className="rounded-full bg-black/70 p-1.5 text-white hover:bg-black/90" aria-label="إزالة">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={() => setPickedFile(null)} className="text-xs">
              <X className="ms-1 h-4 w-4" /> إلغاء
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()} className="text-xs">
              <Repeat className="ms-1 h-4 w-4" /> تغيير
            </Button>
            <Button onClick={publish} disabled={uploading}
              className="bg-gradient-primary text-primary-foreground shadow-neon text-xs">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="ms-1 h-4 w-4" /> نشر</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Story viewer — full mobile-style */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent dir="rtl"
          className="max-w-md border-border/60 bg-black p-0 backdrop-blur-xl sm:max-w-md">
          {activeStory && activeGroup && (
            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-lg bg-black">
              {/* Top progress bars */}
              <div className="absolute inset-x-2 top-2 z-20 flex gap-1">
                {activeGroup.stories.map((_, idx) => (
                  <div key={idx} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
                    <div className={`h-full bg-white transition-all ${
                      idx < viewing!.storyIdx ? "w-full"
                        : idx === viewing!.storyIdx ? "w-full animate-[grow_5s_linear]"
                        : "w-0"
                    }`} />
                  </div>
                ))}
              </div>

              {/* Header */}
              <div className="absolute inset-x-2 top-5 z-20 flex items-center justify-between">
                <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                  <span className="font-bold">{activeGroup.profile?.nickname ?? "—"}</span>
                </div>
                <div className="flex items-center gap-1">
                  {isOwnStory && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-full bg-black/60 p-1.5 text-white" aria-label="إدارة">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-border/50 bg-background/95 text-right backdrop-blur-xl">
                        <DropdownMenuItem onClick={() => toast.message("القصة ستختفي تلقائيًا بعد 24 ساعة")} className="gap-2">
                          <Clock className="h-4 w-4" /> الاختفاء التلقائي بعد 24 ساعة
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={toggleKeep} className="gap-2">
                          <Bookmark className={`h-4 w-4 ${activeStory.kept_in_profile ? "fill-current text-primary" : ""}`} />
                          {activeStory.kept_in_profile ? "إلغاء الحفظ في الملف" : "الاحتفاظ بالقصة في الملف الشخصي"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={deleteNow} className="gap-2 text-destructive focus:text-destructive">
                          <Trash2 className="h-4 w-4" /> مسح القصة الآن
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <button onClick={() => setViewing(null)} className="rounded-full bg-black/60 p-1.5 text-white" aria-label="إغلاق">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Media */}
              {activeStory.media_type === "video" ? (
                <video src={activeStory.media_url} className="h-full w-full object-contain" controls autoPlay onEnded={nextStory} />
              ) : (
                <img src={activeStory.media_url} className="h-full w-full object-contain" alt="" loading="lazy" />
              )}

              {/* Tap zones */}
              <button onClick={prevStory} aria-label="السابق"
                className="absolute end-0 top-10 z-10 h-[70%] w-1/3 text-white opacity-0 active:opacity-100">
                <ChevronRight className="mx-auto h-6 w-6" />
              </button>
              <button onClick={nextStory} aria-label="التالي"
                className="absolute start-0 top-10 z-10 h-[70%] w-1/3 text-white opacity-0 active:opacity-100">
                <ChevronLeft className="mx-auto h-6 w-6" />
              </button>

              {/* Bottom reaction bar */}
              {!isOwnStory && (
                <div className="absolute inset-x-3 bottom-3 z-20 flex items-center justify-between gap-1 rounded-full bg-black/60 px-3 py-2 backdrop-blur-md">
                  {REACTIONS.map((e) => (
                    <button key={e} onClick={() => react(e)}
                      className="text-xl transition-transform hover:scale-125 active:scale-110">{e}</button>
                  ))}
                </div>
              )}
              {isOwnStory && activeStory.kept_in_profile && (
                <div className="absolute inset-x-3 bottom-3 z-20 rounded-full bg-primary/85 px-3 py-1.5 text-center text-[11px] font-bold text-primary-foreground">
                  محفوظة في الملف الشخصي
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
