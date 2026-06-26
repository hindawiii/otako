import { useState, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Link as LinkIcon, Loader2, Send, X, Repeat } from "lucide-react";
import { toast } from "sonner";
import { DURATION_OPTIONS, type PostDuration, extractVideoEmbed } from "@/lib/arena-utils";

type Mode = "text" | "media" | "link";

export function PostComposer({ onPosted }: { onPosted?: () => void }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [duration, setDuration] = useState<PostDuration>("forever");
  const [file, setFile] = useState<File | null>(null);
  const [videoLink, setVideoLink] = useState("");
  const [mode, setMode] = useState<Mode>("text");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const isVideoFile = !!file && file.type.startsWith("video");
  // All uploaded media (images & videos) can pick a duration; default forever.
  const requiresDuration = mode === "media" && !!file;
  const allDurationOptions = DURATION_OPTIONS;

  function pickFile() {
    fileRef.current?.click();
  }
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setMode("media");
    if (f.type.startsWith("video")) setDuration("day");
    else setDuration("forever");
    if (fileRef.current) fileRef.current.value = "";
  }
  function clearFile() {
    setFile(null);
    setMode("text");
    setDuration("forever");
  }

  async function handleSubmit() {
    if (!user) { toast.error("سجل الدخول أولاً"); return; }
    if (!text.trim() && !file && !videoLink.trim()) {
      toast.error("اكتب شيئاً أو أضف وسائط");
      return;
    }
    setBusy(true);
    try {
      let media_url: string | null = null;
      let media_type: "none" | "image" | "video" | "video_link" = "none";
      let finalDuration: PostDuration = "forever";

      if (mode === "media" && file) {
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("post-media").upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("post-media").getPublicUrl(path);
        media_url = pub.publicUrl;
        media_type = isVideoFile ? "video" : "image";
        finalDuration = duration;
      } else if (mode === "link" && videoLink.trim()) {
        const embed = extractVideoEmbed(videoLink.trim());
        if (!embed) { toast.error("رابط الفيديو غير مدعوم (يوتيوب/فيميو)"); setBusy(false); return; }
        media_url = embed;
        media_type = "video_link";
        finalDuration = "forever";
      } else {
        finalDuration = "forever";
      }

      const { error } = await supabase.from("posts").insert({
        creator_id: user.id,
        content_text: text.trim() || null,
        media_url,
        media_type,
        visible_duration: finalDuration,
      });
      if (error) throw error;
      toast.success("تم النشر في الساحة");
      setText(""); setFile(null); setVideoLink(""); setMode("text"); setDuration("forever");
      onPosted?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل النشر";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-border/40 bg-card/40 p-4 backdrop-blur-xl" dir="rtl">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ماذا يدور في عالم الأنمي اليوم؟"
        className="min-h-[80px] resize-none border-border/40 bg-background/50 text-right"
        dir="rtl"
      />

      {mode === "media" && file && previewUrl && (
        <div className="relative mt-3 overflow-hidden rounded-xl border border-border/50 bg-black/40">
          {isVideoFile ? (
            <video src={previewUrl} controls className="max-h-72 w-full object-contain" />
          ) : (
            <img src={previewUrl} alt="معاينة" className="max-h-72 w-full object-contain" />
          )}
          <div className="absolute end-2 top-2 flex gap-1">
            <button type="button" onClick={pickFile}
              className="rounded-full bg-black/70 p-1.5 text-white hover:bg-black/90" aria-label="استبدال">
              <Repeat className="h-4 w-4" />
            </button>
            <button type="button" onClick={clearFile}
              className="rounded-full bg-black/70 p-1.5 text-white hover:bg-black/90" aria-label="إزالة">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="px-3 py-1.5 text-[11px] text-muted-foreground bg-card/60">{file.name}</div>
        </div>
      )}

      {mode === "link" && (
        <Input
          value={videoLink}
          onChange={(e) => setVideoLink(e.target.value)}
          placeholder="رابط يوتيوب / تيك توك / فيميو"
          className="mt-2 text-right"
          dir="ltr"
        />
      )}

      <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={onFileChange} />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
          <Button type="button" size="sm" variant="ghost" onClick={pickFile} className="h-9 gap-1 text-xs">
            <ImageIcon className="h-4 w-4" />
            صورة/فيديو
          </Button>
          <Button type="button" size="sm" variant={mode === "link" ? "secondary" : "ghost"}
            onClick={() => { setMode(mode === "link" ? "text" : "link"); if (mode !== "link") clearFile(); }}
            className="h-9 gap-1 text-xs">
            <LinkIcon className="h-4 w-4" />
            رابط
          </Button>
        </div>

        {requiresDuration && (
          <div className="flex flex-wrap gap-1">
            <span className="self-center text-[11px] text-muted-foreground">مدة الظهور:</span>
            {allDurationOptions.map((opt) => (
              <button key={opt.value} type="button" onClick={() => setDuration(opt.value)}
                className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                  duration === opt.value
                    ? "bg-gradient-primary text-primary-foreground shadow-neon"
                    : "bg-muted/50 text-muted-foreground"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        )}
        {!requiresDuration && (mode !== "text" || text.trim()) && (
          <span className="text-[11px] text-muted-foreground">سيبقى المنشور للأبد</span>
        )}
      </div>

      <Button onClick={handleSubmit} disabled={busy}
        className="mt-3 w-full bg-gradient-primary text-primary-foreground shadow-neon">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="ms-1 h-4 w-4" /> نشر</>}
      </Button>
    </Card>
  );
}
