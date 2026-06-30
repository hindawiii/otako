import { Play } from "lucide-react";
import { useSpeak } from "@/lib/useSpeak";
import { arSentences } from "@/lib/data/arabic";

const AR = "#27AE60";

export function SentencesTab() {
  const speak = useSpeak("ar-SA");

  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      {arSentences.map((s) => (
        <button
          key={s.target}
          type="button"
          onClick={() => speak(s.speakText, "normal")}
          className="relative block w-full rounded-2xl border bg-white/[0.04] p-5 text-start transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(39,174,96,0.15)]"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <span
            className="absolute end-4 top-4 rounded-full px-2.5 py-1 text-[10px] font-bold"
            style={{ background: `${AR}26`, color: AR }}
          >
            {s.level}
          </span>
          <div className="mb-1 text-lg font-bold" style={{ color: AR }}>
            {s.target}
          </div>
          <div className="text-sm text-white/60">{s.reading}</div>
          <div className="mt-1 text-xs text-white/50">{s.ar}</div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {s.tags.map((t) => (
              <span key={t} className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-white/70">
                {t}
              </span>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <span
              onClick={(e) => {
                e.stopPropagation();
                speak(s.speakText, "slow");
              }}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-semibold text-white/70"
              style={{ borderColor: "rgba(255,255,255,0.15)" }}
              role="button"
            >
              🐢 بطيء
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                speak(s.speakText, "normal");
              }}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-semibold text-white/70"
              style={{ borderColor: "rgba(255,255,255,0.15)" }}
              role="button"
            >
              <Play className="size-3" /> عادي
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
