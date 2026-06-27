import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { QuizCard } from "@/components/shared/QuizCard";
import { useSpeak } from "@/lib/useSpeak";
import { jpQuiz } from "@/lib/data/japanese";
import { guestStorage } from "@/lib/guest-storage";

const JP = "#E74C3C";

export function LevelTab() {
  const speak = useSpeak("ja-JP");
  const [progress, setProgress] = useState<number>(35);

  // Load saved progress on mount
  useEffect(() => {
    const saved = guestStorage.get<number>("jp_progress", 35);
    if (typeof saved === "number") setProgress(saved);
  }, []);

  // Persist on change
  useEffect(() => {
    guestStorage.set("jp_progress", progress);
  }, [progress]);

  const total = 350;
  const points = Math.round((progress / 100) * total);

  return (
    <div className="space-y-5 animate-[fadeInUp_0.4s_ease-out]">
      <div
        className="rounded-2xl border p-6 text-center backdrop-blur"
        style={{
          background: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="mb-2 text-4xl">🥉</div>
        <div className="mb-1 text-base font-bold text-white">
          مستوى المبتدئ (N5)
        </div>
        <div className="mb-4 text-xs text-white/60">
          أنت في بداية رحلتك! استمر في التعلم
        </div>
        <ProgressBar
          value={progress}
          gradient={`linear-gradient(90deg,#FFE66D,${JP})`}
        />
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
            onClick={() => setProgress(35)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 hover:bg-white/10"
          >
            إعادة
          </button>
        </div>
      </div>

      <QuizCard
        question={jpQuiz.question}
        options={jpQuiz.options}
        counter="س 1 / 5"
        accentColor={JP}
        onSpeak={() => speak(jpQuiz.speakText, "normal")}
      />

      <div className="text-sm font-bold text-white">
        <span style={{ color: "#FFE66D" }}>🔔</span> أخبار مستواك
      </div>

      {[
        {
          icon: "🎯",
          title: "إنجاز جديد!",
          desc: "حفظت 10 كلمات يابانية هذا الأسبوع",
          time: "اليوم",
        },
        {
          icon: "📈",
          title: "تقدم ملحوظ",
          desc: "أكملت 3 دروس في التحيات",
          time: "أمس",
        },
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
