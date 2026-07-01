import { ProgressBar } from "@/components/shared/ProgressBar";
import { welcomeSteps } from "@/lib/data/welcome";

const WC = "#FF6B6B";
const ACCENT = "#FFE66D";

export function GuideTab() {
  return (
    <div className="space-y-5 animate-[fadeInUp_0.4s_ease-out]">
      <div
        className="rounded-2xl border p-5 backdrop-blur"
        style={{
          background: "linear-gradient(145deg,rgba(255,107,107,0.08),rgba(255,107,107,0.02))",
          borderColor: "rgba(255,107,107,0.1)",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-white">
            <span style={{ color: ACCENT }}>⭐</span> مرحباً بك في أوتاكو جو!
          </h3>
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{ background: `${WC}26`, color: WC }}
          >
            دليل المبتدئين
          </span>
        </div>
        <div className="space-y-2">
          {welcomeSteps.map((s) => (
            <div
              key={s.target}
              className="flex items-start gap-3 rounded-2xl border bg-white/[0.03] p-3"
              style={{ borderColor: "rgba(255,107,107,0.1)" }}
            >
              <div
                className="grid size-10 shrink-0 place-items-center rounded-full text-lg"
                style={{
                  background:
                    "linear-gradient(135deg,rgba(255,107,107,0.2),rgba(255,107,107,0.05))",
                }}
              >
                {s.n}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold" style={{ color: WC }}>
                  {s.target}
                </div>
                <div className="text-xs text-white/60">{s.reading}</div>
                <div className="text-[11px] text-white/50">{s.ar}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-2xl border p-5 text-center backdrop-blur"
        style={{
          background: "linear-gradient(145deg,rgba(255,107,107,0.08),rgba(255,107,107,0.02))",
          borderColor: "rgba(255,107,107,0.12)",
        }}
      >
        <div className="mb-2 text-4xl">🌱</div>
        <div className="mb-1 text-base font-bold text-white">مستوى البرعم (المستوى 1)</div>
        <div className="mb-4 text-xs text-white/60">
          أهلاً بك! ابدأ رحلتك بتعلم أساسيات غرفتك المختارة
        </div>
        <ProgressBar value={15} gradient={`linear-gradient(90deg,${ACCENT},${WC})`} />
        <div className="mt-2 text-xs text-white/70">15% - 45/300 نقطة للمستوى التالي</div>
      </div>
    </div>
  );
}
