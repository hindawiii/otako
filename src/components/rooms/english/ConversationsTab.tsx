import { Volume2 } from "lucide-react";
import { useSpeak } from "@/lib/useSpeak";
import { enConversation, enShortcuts } from "@/lib/data/english";

const EN = "#3498DB";

export function ConversationsTab() {
  const speak = useSpeak("en-US");

  return (
    <div className="space-y-5 animate-[fadeInUp_0.4s_ease-out]">
      <div
        className="rounded-2xl border p-5 backdrop-blur"
        style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
          💬 {enConversation.title}
        </div>
        <div className="space-y-3">
          {enConversation.bubbles.map((b, i) => {
            const isMe = b.who === "me";
            return (
              <div key={i} className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: b.avatarGradient }}
                >
                  {b.avatar}
                </div>
                <div
                  className={`relative max-w-[80%] rounded-2xl border p-3 ${
                    isMe ? "rounded-tr-sm" : "rounded-tl-sm"
                  }`}
                  style={{
                    background: isMe ? "rgba(52,152,219,0.12)" : "rgba(255,255,255,0.04)",
                    borderColor: isMe ? "rgba(52,152,219,0.3)" : "rgba(255,255,255,0.08)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => speak(b.target, "normal")}
                    className="absolute -top-2.5 grid size-7 place-items-center rounded-full border"
                    style={{
                      background: `${EN}33`,
                      borderColor: `${EN}66`,
                      color: EN,
                      [isMe ? "left" : "right"]: "-6px",
                    }}
                    aria-label="استمع"
                  >
                    <Volume2 className="size-3" />
                  </button>
                  <div className="text-sm font-bold" style={{ color: EN }}>
                    {b.target}
                  </div>
                  <div className="text-xs text-white/60">{b.reading}</div>
                  <div className="text-[11px] text-white/50">{b.ar}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center text-xs text-white/50">📌 اختصارات الإنترنت الشائعة</div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {enShortcuts.map((s) => (
          <div
            key={s.short}
            className="rounded-2xl border bg-white/[0.04] p-3 text-center"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="mb-1 text-lg font-bold" style={{ color: EN }}>
              {s.short}
            </div>
            <div className="text-[11px] text-white/60">{s.full}</div>
            <div className="mt-1 text-[11px] text-white/50">{s.meaning}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
