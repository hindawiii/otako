import { ProgressBar } from "@/components/shared/ProgressBar";
import { QuizCard } from "@/components/shared/QuizCard";
import { drawChallenge, drawQuiz } from "@/lib/data/drawing";

const ART = "#9B59B6";
const ACCENT = "#FFE66D";

export function ChallengesTab() {
  return (
    <div className="space-y-5 animate-[fadeInUp_0.4s_ease-out]">
      <div
        className="rounded-2xl border p-6 text-center backdrop-blur"
        style={{
          background: "linear-gradient(145deg,rgba(155,89,182,0.08),rgba(155,89,182,0.02))",
          borderColor: "rgba(155,89,182,0.12)",
        }}
      >
        <div className="mb-2 text-4xl">🏆</div>
        <div className="mb-1 text-base font-bold text-white">{drawChallenge.title}</div>
        <div className="mb-4 text-xs text-white/60">{drawChallenge.desc}</div>
        <ProgressBar
          value={drawChallenge.progress}
          gradient={`linear-gradient(90deg,${ACCENT},${ART})`}
        />
        <div className="mt-2 text-xs text-white/70">{drawChallenge.progressText}</div>
      </div>

      <QuizCard
        question={drawQuiz.question}
        options={drawQuiz.options}
        counter="س 1 / 3"
        accentColor={ART}
      />
    </div>
  );
}
