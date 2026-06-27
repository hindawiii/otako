import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, Heart, Reply, Languages } from "lucide-react";

export interface ChatSeedMessage {
  name: string;
  badge: string;
  time: string;
  avatar: string;
  avatarGradient: string;
  /** Inline HTML allowed (highlight spans). */
  html: string;
  likes: number;
}

export interface ChatBotReply {
  name: string;
  badge: string;
  text: string;
  color: string;
}

interface ChatBoxProps {
  accentColor: string; // hex
  seedMessages: ChatSeedMessage[];
  quickReplies: string[];
  botReplies: ChatBotReply[];
  placeholder?: string;
  onlineCount?: number;
  title?: string;
}

interface LiveMessage extends ChatSeedMessage {
  id: string;
}

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function ChatBox({
  accentColor,
  seedMessages,
  quickReplies,
  botReplies,
  placeholder = "شارك سؤالك أو تجربتك...",
  onlineCount = 12,
  title = "نقاش المتعلمين",
}: ChatBoxProps) {
  const [messages, setMessages] = useState<LiveMessage[]>(
    seedMessages.map((m, i) => ({ ...m, id: `seed-${i}` })),
  );
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    const v = text.trim();
    if (!v) return;
    const id = `u-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id,
        name: "أنت",
        badge: "ضيف",
        time: nowHHMM(),
        avatar: "أ",
        avatarGradient: `linear-gradient(135deg,${accentColor},#0a0a1a)`,
        html: v.replace(/</g, "&lt;"),
        likes: 0,
      },
    ]);
    setInput("");

    // Bot auto-reply after 1.2s
    window.setTimeout(() => {
      const reply = botReplies[Math.floor(Math.random() * botReplies.length)];
      if (!reply) return;
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          name: reply.name,
          badge: reply.badge,
          time: nowHHMM(),
          avatar: reply.name.charAt(0),
          avatarGradient: `linear-gradient(135deg,${reply.color},${reply.color}99)`,
          html: reply.text,
          likes: 0,
        },
      ]);
    }, 1200);
  };

  return (
    <div
      className="mt-6 rounded-2xl border p-4 backdrop-blur"
      style={{
        background: "rgba(255,255,255,0.03)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white">
          💬 {title}
        </h3>
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-bold"
          style={{ background: "rgba(78,205,196,0.15)", color: "#4ECDC4" }}
        >
          {onlineCount} متصل
        </span>
      </div>

      <div
        ref={scrollRef}
        className="mb-3 max-h-80 space-y-3 overflow-y-auto pr-1"
      >
        <div className="my-2 flex items-center gap-2 text-[11px] text-white/40">
          <div className="h-px flex-1 bg-white/10" />
          <span>اليوم</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {messages.map((m) => (
          <div key={m.id} className="flex gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ background: m.avatarGradient }}
            >
              {m.avatar}
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2 text-xs">
                <span className="font-bold text-white">{m.name}</span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: `${accentColor}33`, color: accentColor }}
                >
                  {m.badge}
                </span>
                <span className="text-white/40">{m.time}</span>
              </div>
              <div
                className="rounded-2xl rounded-tr-sm border border-white/5 bg-white/[0.04] p-3 text-sm leading-relaxed text-white/90 [&_.lang-highlight]:font-bold"
                style={
                  {
                    ["--lang-color" as never]: accentColor,
                  } as React.CSSProperties
                }
                dangerouslySetInnerHTML={{
                  __html: m.html.replace(
                    /class="lang-highlight"/g,
                    `style="color:${accentColor};font-weight:700"`,
                  ),
                }}
              />
              <div className="mt-1.5 flex gap-3 text-[11px] text-white/50">
                <button className="flex items-center gap-1 hover:text-white">
                  <Heart className="size-3" /> {m.likes}
                </button>
                <button className="flex items-center gap-1 hover:text-white">
                  <Reply className="size-3" /> رد
                </button>
                <button className="flex items-center gap-1 hover:text-white">
                  <Languages className="size-3" /> ترجمة
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send(input);
            }}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
          />
          <button type="button" className="text-white/50 hover:text-white">
            <Smile className="size-4" />
          </button>
          <button type="button" className="text-white/50 hover:text-white">
            <Paperclip className="size-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => send(input)}
          className="flex size-10 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105"
          style={{ background: accentColor }}
          aria-label="إرسال"
        >
          <Send className="size-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {quickReplies.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => send(q)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70 hover:bg-white/10"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
