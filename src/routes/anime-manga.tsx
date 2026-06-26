import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/anime-manga")({
  head: () => ({
    meta: [
      { title: "المانجا والأنمي — أوتاكو" },
      { name: "description", content: "قسم المانجا والأنمي — قيد التطوير." },
    ],
  }),
  component: AnimeMangaHub,
});

// ─────────────────────────────────────────────────────────────
// تم تفريغ هذا القسم بناءً على طلب المالك — جاهز لإعادة البناء.
// الهيكل والتصميم الداكن محفوظ. لا تحذف الملف.
// ─────────────────────────────────────────────────────────────
function AnimeMangaHub() {
  return (
    <div dir="rtl" className="mx-auto max-w-screen-md px-4 py-6 pb-28 text-right">
      <Card className="overflow-hidden border-border/60 bg-card/40 p-0 backdrop-blur-xl">
        <div className="relative bg-gradient-primary p-6 text-primary-foreground">
          <div className="absolute -end-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <p className="text-xs opacity-90">قسم قيد التطوير</p>
          <h2 className="mt-1 text-2xl font-black">المانجا والأنمي</h2>
          <p className="mt-1 text-xs opacity-90">دليل محدّث، أفضل المصادر، وتجربة جديدة قريبًا.</p>
        </div>
      </Card>

      <div className="mt-6 rounded-2xl border border-dashed border-border/60 bg-card/30 p-10 text-center backdrop-blur-xl">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <p className="text-sm font-bold text-foreground">المحتوى قيد الإعداد</p>
        <p className="mt-1 text-xs text-muted-foreground">
          سيتم إطلاق دليل جديد للأنمي والمانجا قريبًا.
        </p>
      </div>
    </div>
  );
}
