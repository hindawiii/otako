import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { guestStorage } from "@/lib/guest-storage";

const ART = "#9B59B6";
const ACCENT = "#FFE66D";

export function LevelTab() {
  const [progress, setProgress] = useState<number>(40);

  useEffect(() => {
    const saved = guestStorage.get<number>("draw_progress", 40);
    if (typeof saved === "number") setProgress(saved);
  }, []);

  useEffect(() => {
    guestStorage.set("draw_progress", progress);
  }, [progress]);

  const total = 200;
  const points = Math.round((progress / 100) * total);

  return (
    <div className="space-y-5 animate-[fadeInUp_0.4s_ease-out]">
      <div
        className="rounded-2xl border p-6 text-center backdrop-blur"
        style={{
          background: "linear-gradient(145deg,rgba(155,89,182,0.08),rgba(155,89,182,0.02))",
          borderColor: "rgba(155,89,182,0.12)",
        }}
      >
        <div className="mb-2 text-4xl">🥉</div>
        <div className="mb-1 text-base font-bold text-white">مستوى الرسام المبتدئ</div>
        <div className="mb-4 text-xs text-white/60">أنت تتعلم الأساسيات! استمر في التمرين</div>
        <ProgressBar value={progress} gradient={`linear-gradient(90deg,${ACCENT},${ART})`} />
        <div className="mt-2 text-xs text-white/70">
          {progress}% - {points}/{total} نقطة للمستوى التالي
        </div>
        <div className="mt-3 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setProgress((p) => Math.min(100, p + 5))}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
          >
            +5%
          </button>
          <button
            type="button"
            onClick={() => setProgress(40)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 hover:bg-white/10"
          >
            إعادة
          </button>
        </div>
      </div>

      <div className="text-sm font-bold text-white">
        <span style={{ color: ACCENT }}>🔔</span> أخبار مستواك
      </div>

      <div
        className="flex items-center gap-3 rounded-2xl border bg-white/[0.03] p-3"
        style={{ borderColor: "rgba(155,89,182,0.1)" }}
      >
        <div
          className="grid size-10 place-items-center rounded-full text-lg"
          style={{
            background: "linear-gradient(135deg,rgba(155,89,182,0.2),rgba(155,89,182,0.05))",
          }}
        >
          🎯
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-white">إنجاز جديد!</div>
          <div className="text-xs text-white/60">أكملت درس "عيون الأنمي" بنجاح</div>
        </div>
        <div className="text-[11px] text-white/40">اليوم</div>
      </div>
    </div>
  );
}
