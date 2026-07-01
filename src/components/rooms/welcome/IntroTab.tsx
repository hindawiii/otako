import { welcomeNewbies } from "@/lib/data/welcome";

const WC = "#FF6B6B";

export function IntroTab() {
  return (
    <div className="space-y-5 animate-[fadeInUp_0.4s_ease-out]">
      <div
        className="rounded-2xl border p-5 backdrop-blur"
        style={{
          background: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
          👥 قالب التعريف بالنفس
        </div>
        <div className="flex gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg,#FF6B6B,#FF8E8E)" }}
          >
            أ
          </div>
          <div
            className="flex-1 rounded-2xl rounded-tr-sm border p-3"
            style={{
              background: "rgba(255,107,107,0.08)",
              borderColor: "rgba(255,107,107,0.2)",
            }}
          >
            <div className="text-sm font-bold" style={{ color: WC }}>
              أهلاً! أنا [الاسم] 👋
            </div>
            <div className="text-xs text-white/60">
              مستوىي في [اللغة/المهارة]: [المستوى]
            </div>
            <div className="text-[11px] text-white/50">
              أنمي/مانجا مفضلة: [العنوان]
            </div>
          </div>
        </div>
      </div>

      <div
        className="rounded-2xl border p-5 backdrop-blur"
        style={{
          background: "linear-gradient(145deg,rgba(255,107,107,0.08),rgba(255,107,107,0.02))",
          borderColor: "rgba(255,107,107,0.1)",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-white">
            <span style={{ color: WC }}>🔥</span> الأوتاكو الجدد هذا الأسبوع
          </h3>
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{ background: `${WC}26`, color: WC }}
          >
            +12 جديد
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {welcomeNewbies.map((n) => (
            <div
              key={n.name}
              className="flex flex-col items-center gap-1 rounded-2xl border bg-white/[0.03] p-3 text-center"
              style={{ borderColor: "rgba(255,107,107,0.1)" }}
            >
              <div className="text-2xl" style={{ color: WC }}>
                {n.emoji}
              </div>
              <div className="text-sm font-bold text-white">{n.name}</div>
              <div className="text-[11px] text-white/50">{n.level}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
