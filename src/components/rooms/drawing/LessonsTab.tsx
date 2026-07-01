import { Play } from "lucide-react";
import { drawLessons, drawTools } from "@/lib/data/drawing";

const ART = "#9B59B6";
const ACCENT = "#FFE66D";

export function LessonsTab() {
  return (
    <div className="space-y-5 animate-[fadeInUp_0.4s_ease-out]">
      <div
        className="rounded-2xl border p-5 backdrop-blur"
        style={{
          background: "linear-gradient(145deg,rgba(155,89,182,0.08),rgba(155,89,182,0.02))",
          borderColor: "rgba(155,89,182,0.1)",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-white">
            <span style={{ color: ACCENT }}>⭐</span> درس اليوم
          </h3>
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{ background: `${ART}26`, color: ART }}
          >
            20 مايو
          </span>
        </div>
        <div className="space-y-2">
          {drawLessons.map((l) => (
            <div
              key={l.target}
              className="flex items-start gap-3 rounded-2xl border bg-white/[0.03] p-3"
              style={{ borderColor: "rgba(155,89,182,0.1)" }}
            >
              <div
                className="grid size-10 shrink-0 place-items-center rounded-full text-lg"
                style={{
                  background:
                    "linear-gradient(135deg,rgba(155,89,182,0.2),rgba(155,89,182,0.05))",
                }}
              >
                {l.icon}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold" style={{ color: ART }}>
                  {l.target}
                </div>
                <div className="text-xs text-white/60">{l.reading}</div>
                <div className="text-[11px] text-white/50">{l.ar}</div>
              </div>
              <button
                type="button"
                className="grid size-9 place-items-center rounded-full border"
                style={{
                  background: `${ART}26`,
                  borderColor: `${ART}55`,
                  color: ART,
                }}
                aria-label="تشغيل"
              >
                <Play className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-2xl border p-5 backdrop-blur"
        style={{
          background: "linear-gradient(145deg,rgba(155,89,182,0.08),rgba(155,89,182,0.02))",
          borderColor: "rgba(155,89,182,0.1)",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-white">
            <span style={{ color: ART }}>🎨</span> أدوات الرسم
          </h3>
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{ background: `${ART}26`, color: ART }}
          >
            موصى بها
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {drawTools.map((t) => (
            <div
              key={t.reading}
              className="flex flex-col items-center gap-1 rounded-2xl border bg-white/[0.03] p-3 text-center"
              style={{ borderColor: "rgba(155,89,182,0.1)" }}
            >
              <div className="text-xl" style={{ color: ART }}>
                {t.symbol}
              </div>
              <div className="text-xs font-bold text-white/80">{t.reading}</div>
              <div className="text-[11px] text-white/50">{t.meaning}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
