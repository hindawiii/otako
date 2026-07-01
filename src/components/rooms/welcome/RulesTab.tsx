import { welcomeRules } from "@/lib/data/welcome";

const WC = "#FF6B6B";

export function RulesTab() {
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
            <span style={{ color: WC }}>🛡️</span> قواعد ساحة الأوتاكو
          </h3>
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{ background: `${WC}26`, color: WC }}
          >
            إلزامية
          </span>
        </div>
        <div className="space-y-2">
          {welcomeRules.map((r) => (
            <div
              key={r.target}
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
                {r.icon}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold" style={{ color: WC }}>
                  {r.target}
                </div>
                <div className="text-xs text-white/60">{r.reading}</div>
                <div className="text-[11px] text-white/50">{r.ar}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
