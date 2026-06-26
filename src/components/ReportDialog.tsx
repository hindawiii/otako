import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";

export type ReportResource = "post" | "comment" | "voice_comment" | "audio_room";

const REASONS: { value: "abuse" | "inappropriate" | "spam" | "other"; label: string }[] = [
  { value: "abuse", label: "إساءة" },
  { value: "inappropriate", label: "محتوى غير لائق" },
  { value: "spam", label: "سبام" },
  { value: "other", label: "أخرى" },
];

export function ReportDialog({
  open,
  onOpenChange,
  resourceType,
  resourceId,
  reportedProfileId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  resourceType: ReportResource;
  resourceId: string | null;
  reportedProfileId?: string | null;
}) {
  const { user } = useAuth();
  const [reason, setReason] = useState<"abuse" | "inappropriate" | "spam" | "other">("abuse");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    if (!user || !resourceId) return;
    const reasonAr = REASONS.find((r) => r.value === reason)?.label ?? "أخرى";
    setBusy(true);
    try {
      const { error } = await supabase.from("reports").insert({
        reporter_id: user.id,
        reported_profile_id: reportedProfileId ?? null,
        resource_type: resourceType,
        resource_id: resourceId,
        reason,
        reason_ar: reasonAr,
        description_ar: description.trim() || null,
      });
      if (error) throw error;
      toast.success("تم استلام بلاغك. شكراً لمساهمتك في حماية المجتمع.");
      setDescription("");
      setReason("abuse");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message ?? "تعذّر إرسال البلاغ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="border-border/50 bg-background/85 text-right backdrop-blur-2xl sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-end gap-2 text-right">
            <span>إبلاغ عن محتوى</span>
            <Flag className="h-5 w-5 text-destructive" />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-bold text-muted-foreground">سبب الإبلاغ</p>
            <div className="grid grid-cols-2 gap-2">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReason(r.value)}
                  className={`rounded-xl border px-3 py-2 text-sm transition ${
                    reason === r.value
                      ? "border-destructive/60 bg-destructive/15 text-destructive shadow-neon"
                      : "border-border/50 bg-card/40 text-foreground hover:border-border"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold text-muted-foreground">
              تفاصيل إضافية (اختياري)
            </p>
            <Textarea
              dir="rtl"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              placeholder="اشرح المشكلة باختصار…"
              className="min-h-24 border-border/50 bg-card/40 text-right backdrop-blur"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">{description.length}/500</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={busy}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={busy}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "إرسال البلاغ"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
