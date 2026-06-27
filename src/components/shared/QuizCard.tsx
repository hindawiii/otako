import { useState } from "react";
import { Volume2 } from "lucide-react";

export interface QuizOption {
  label: string;
  correct: boolean;
}

interface QuizCardProps {
  question: string;
  options: QuizOption[];
  counter?: string;
  accentColor: string; // hex
  onSpeak?: () => void;
  speakLabel?: string;
}

export function QuizCard({
  question,
  options,
  counter,
  accentColor,
  onSpeak,
  speakLabel = "استمع للسؤال",
}: QuizCardProps) {
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <div
      className="rounded-2xl border p-5 backdrop-blur"
      style={{
        background: "rgba(255,255,255,0.04)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-base font-bold text-white">
          <span style={{ color: "#FFE66D" }}>🧠</span> اختبار سريع
        </h4>
        {counter && <span className="text-xs text-white/60">{counter}</span>}
      </div>

      {onSpeak && (
        <div className="mb-3">
          <button
            type="button"
            onClick={onSpeak}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition-colors hover:bg-white/10"
            style={{ color: accentColor, borderColor: `${accentColor}55` }}
          >
            <Volume2 className="size-3.5" />
            {speakLabel}
          </button>
        </div>
      )}

      <div
        className="mb-4 text-center text-lg font-bold"
        style={{ color: accentColor }}
      >
        {question}
      </div>

      <div className="grid gap-2">
        {options.map((opt, i) => {
          const isPicked = picked === i;
          const showResult = picked !== null;
          const isCorrect = opt.correct;
          let style: React.CSSProperties = {
            background: "rgba(255,255,255,0.05)",
            borderColor: "rgba(255,255,255,0.1)",
            color: "#fff",
          };
          if (showResult && isCorrect) {
            style = {
              background: "rgba(78,205,196,0.18)",
              borderColor: "#4ECDC4",
              color: "#4ECDC4",
            };
          } else if (showResult && isPicked && !isCorrect) {
            style = {
              background: "rgba(231,76,60,0.18)",
              borderColor: "#E74C3C",
              color: "#E74C3C",
            };
          }
          return (
            <button
              key={i}
              type="button"
              disabled={picked !== null}
              onClick={() => setPicked(i)}
              className="rounded-xl border px-4 py-2.5 text-start text-sm font-semibold transition-all disabled:cursor-not-allowed"
              style={style}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <button
          type="button"
          onClick={() => setPicked(null)}
          className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 py-2 text-xs text-white/70 hover:bg-white/10"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
