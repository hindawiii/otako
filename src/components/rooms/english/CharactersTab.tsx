import { Play } from "lucide-react";
import { useSpeak } from "@/lib/useSpeak";
import { enGreetings, enWords } from "@/lib/data/english";

const EN = "#3498DB";
const ACCENT = "#FFE66D";
const SECONDARY = "#4ECDC4";

export function CharactersTab() {
  const speak = useSpeak("en-US");

  return (
    <div className="space-y-5 animate-[fadeInUp_0.4s_ease-out]">
      <div
        className="rounded-2xl border p-5 backdrop-blur"
        style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-white">
            <span style={{ color: ACCENT }}>⭐</span> كلمة اليوم
          </h3>
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{ background: `${EN}26`, color: EN }}
          >
            اليوم · 20 مايو
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {enWords.map((c) => (
            <button
              key={c.symbol}
              type="button"
              onClick={() => speak(c.symbol, "normal")}
              className="group flex flex-col items-center gap-1.5 rounded-2xl border bg-white/[0.03] p-4 text-center transition-all hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(52,152,219,0.18)]"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: `${EN}33`, color: EN }}
              >
                {c.type}
              </span>
              <div className="text-xl font-bold" style={{ color: EN }}>
                {c.symbol}
              </div>
              <div className="text-[11px] text-white/60">{c.reading}</div>
              <div className="text-[11px] text-white/50">{c.meaning}</div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(c.symbol, "slow");
                }}
                className="mt-1 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold"
                style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}
              >
                <Play className="size-2.5" />
                بطيء
              </button>
            </button>
          ))}
        </div>
      </div>

      <div
        className="rounded-2xl border p-5 backdrop-blur"
        style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-white">
            <span style={{ color: SECONDARY }}>✨</span> التحيات والمجاملات
          </h3>
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{ background: `${EN}26`, color: EN }}
          >
            5 عبارات · مع النطق
          </span>
        </div>
        <div className="space-y-2">
          {enGreetings.map((g) => (
            <button
              key={g.target}
              type="button"
              onClick={() => speak(g.target, "normal")}
              className="flex w-full items-center gap-3 rounded-2xl border bg-white/[0.03] p-3 text-start transition-all hover:translate-x-[-2px]"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="text-2xl">{g.icon}</div>
              <div className="flex-1">
                <div className="text-base font-bold" style={{ color: EN }}>
                  {g.target}
                </div>
                <div className="text-xs text-white/60">{g.reading}</div>
                <div className="text-[11px] text-white/50">{g.ar}</div>
              </div>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  speak(g.target, "slow");
                }}
                className="grid size-9 cursor-pointer place-items-center rounded-full border text-sm"
                style={{ borderColor: `${EN}55`, background: `${EN}26`, color: EN }}
                role="button"
              >
                🐢
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
