import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { QuizCard } from "@/components/shared/QuizCard";
import { useSpeak } from "@/lib/useSpeak";
import { arQuiz } from "@/lib/data/arabic";
import { guestStorage } from "@/lib/guest-storage";

const AR = "#27AE60";

export function LevelTab() {
  const speak = useSpeak("ar-SA");
  const [progress, setProgress] = useState<number>(48);

  useEffect(() => {
    const saved = guestStorage.get<number>("ar_progress", 48);
    if (typeof saved === "number") setProgress(saved);
  }, []);

  useEffect(() => {
    guestStorage.set("ar_progress", progress);
  }, [progress]);

  const total = 500;
  const points = Math.round((progress / 100) * total);

  return (
    <div className="space-y-5 animate-[fadeInUp_0.4s_ease-out]">
      <div
        className="rounded-2xl border p-6 text-center backdrop-blur"
        style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="mb-2 text-4xl">🥉</div>
        <div className="mb-1 text-base font-bold text-white">مستوى المبتدئ المتقدّم</div>
        <div className="mb-4 text-xs text-white/60">واصل الحفظ والإعراب يومياً</div>
        <ProgressBar value={progress} gradient={`linear-gradient(90deg,#FFE66D,${AR})`} />
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
            onClick={() => setProgress(48)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 hover:bg-white/10"
          >
            إعادة
          </button>
        </div>
      </div>

      <QuizCard
        question={arQuiz.question}
        options={arQuiz.options}
        counter="س 1 / 5"
        accentColor={AR}
        onSpeak={() => speak(arQuiz.speakText, "normal")}
      />

      <div className="text-sm font-bold text-white">
        <span style={{ color: "#FFE66D" }}>🔔</span> أخبار مستواك
      </div>

      {[
        { icon: "📖", title: "إنجاز جميل!", desc: "أتممت قراءة 15 جملة فصيحة هذا الأسبوع", time: "اليوم" },
        { icon: "🗣️", title: "نطقٌ أوضح", desc: "استخدمت ميزة النطق 30 مرة هذا الأسبوع", time: "أمس" },
      ].map((n) => (
        <div
          key={n.title}
          className="flex items-center gap-3 rounded-2xl border bg-white/[0.03] p-3"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="text-2xl">{n.icon}</div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white">{n.title}</div>
            <div className="text-xs text-white/60">{n.desc}</div>
          </div>
          <div className="text-[11px] text-white/40">{n.time}</div>
        </div>
      ))}
    </div>
  );
}
