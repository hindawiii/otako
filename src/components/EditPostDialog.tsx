import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, Loader2, X, Save } from "lucide-react";
import { toast } from "sonner";
import type { PostRow } from "@/components/PostCard";

interface Props {
  post: PostRow;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved?: () => void;
}

export function EditPostDialog({ post, open, onOpenChange, onSaved }: Props) {
  const { user } = useAuth();
  const [text, setText] = useState(post.content_text ?? "");
  const [mediaUrl, setMediaUrl] = useState<string | null>(post.media_url);
  const [mediaType, setMediaType] = useState<string>(post.media_type);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setText(post.content_text ?? "");
      setMediaUrl(post.media_url);
      setMediaType(post.media_type);
      setNewFile(null);
    }
  }, [open, post]);

  async function handleSave() {
    if (!user) return;
    setBusy(true);
    try {
      let media_url: string | null = mediaUrl;
      let media_type: string = mediaType;

      if (newFile) {
        const ext = newFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("post-media").upload(path, newFile);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("post-media").getPublicUrl(path);
        media_url = pub.publicUrl;
        media_type = newFile.type.startsWith("video") ? "video" : "image";
      } else if (!mediaUrl) {
        media_type = "none";
      }

      const { error } = await supabase
        .from("posts")
        .update({ content_text: text.trim() || null, media_url, media_type: media_type as any })
        .eq("id", post.id);
      if (error) throw error;
      toast.success("تم تحديث المنشور");
      onOpenChange(false);
      onSaved?.();
    } catch (err: any) {
      toast.error(err.message ?? "تعذر التحديث");
    } finally {
      setBusy(false);
    }
  }

  const previewUrl = newFile ? URL.createObjectURL(newFile) : mediaUrl;
  const previewType = newFile
    ? newFile.type.startsWith("video")
      ? "video"
      : "image"
    : mediaType;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="border-border/60 bg-background/85 text-right backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-right">تعديل المنشور</DialogTitle>
        </DialogHeader>

        <Textarea
          dir="rtl"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="ماذا يدور في عالم الأنمي اليوم؟"
          className="min-h-[100px] resize-none border-border/40 bg-background/50 text-right"
        />

        {previewUrl && (
          <div className="relative overflow-hidden rounded-xl border border-border/40 bg-card/40">
            {previewType === "video" || previewType === "video_link" ? (
              previewType === "video_link" ? (
                <iframe src={previewUrl} className="aspect-video w-full" allowFullScreen />
              ) : (
                <video src={previewUrl} controls className="max-h-[300px] w-full" />
              )
            ) : (
              <img src={previewUrl} alt="" loading="lazy" className="max-h-[300px] w-full object-cover" />
            )}
            <button
              onClick={() => {
                setNewFile(null);
                setMediaUrl(null);
                setMediaType("none");
              }}
              className="absolute end-2 top-2 rounded-full bg-black/60 p-1.5 text-white"
              aria-label="إزالة الوسائط"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setNewFile(f);
          }}
        />

        <DialogFooter className="flex-row justify-between gap-2 sm:justify-between">
          <Button type="button" variant="ghost" onClick={() => fileRef.current?.click()} className="gap-1">
            <ImageIcon className="h-4 w-4" />
            استبدال صورة/فيديو
          </Button>
          <Button onClick={handleSave} disabled={busy} className="bg-gradient-primary text-primary-foreground">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="ms-1 h-4 w-4" /> حفظ</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
