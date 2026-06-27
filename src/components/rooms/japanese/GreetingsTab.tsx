// Reusable greetings-only tab — currently the greetings block is rendered inside
// CharactersTab to match the original HTML layout. This component is exported
// for future standalone use (e.g. dedicated "Greetings" sub-route).
import { useSpeak } from "@/lib/useSpeak";
import { jpGreetings } from "@/lib/data/japanese";

const JP = "#E74C3C";

export function GreetingsTab() {
  const speak = useSpeak("ja-JP");
  return (
    <div className="space-y-2 animate-[fadeInUp_0.4s_ease-out]">
      {jpGreetings.map((g) => (
        <button
          key={g.target}
          type="button"
          onClick={() => speak(g.target, "normal")}
          className="flex w-full items-center gap-3 rounded-2xl border bg-white/[0.03] p-3 text-start transition-all hover:translate-x-[-2px]"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="text-2xl">{g.icon}</div>
          <div className="flex-1">
            <div className="text-base font-bold" style={{ color: JP }}>
              {g.target}
            </div>
            <div className="text-xs text-white/60">{g.reading}</div>
            <div className="text-[11px] text-white/50">{g.ar}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
