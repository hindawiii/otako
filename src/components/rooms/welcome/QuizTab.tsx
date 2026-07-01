import { QuizCard } from "@/components/shared/QuizCard";
import { welcomeQuiz } from "@/lib/data/welcome";

const WC = "#FF6B6B";
const ACCENT = "#FFE66D";

export function QuizTab() {
  return (
    <div className="space-y-5 animate-[fadeInUp_0.4s_ease-out]">
      <QuizCard
        question={welcomeQuiz.question}
        options={welcomeQuiz.options}
        counter="س 1 / 3"
        accentColor={WC}
      />

      <div className="text-sm font-bold text-white">
        <span style={{ color: ACCENT }}>🏆</span> نتائج الاختبار السابقة
      </div>

      <div
        className="flex items-center gap-3 rounded-2xl border bg-white/[0.03] p-3"
        style={{ borderColor: "rgba(255,107,107,0.1)" }}
      >
        <div
          className="grid size-10 place-items-center rounded-full text-lg"
          style={{
            background: "linear-gradient(135deg,rgba(255,107,107,0.2),rgba(255,107,107,0.05))",
          }}
        >
          📝
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-white">اختبار اللغة اليابانية</div>
          <div className="text-xs text-white/60">المستوى: مبتدئ (N5) - 65%</div>
        </div>
        <div className="text-[11px] text-white/40">منذ يومين</div>
      </div>
    </div>
  );
}
