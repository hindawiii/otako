import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { JapaneseRoom } from "@/components/rooms/JapaneseRoom";
import { EnglishRoom } from "@/components/rooms/EnglishRoom";
import { ArabicRoom } from "@/components/rooms/ArabicRoom";

export const Route = createFileRoute("/arena")({
  head: () => ({ meta: [{ title: "ساحة الأوتاكو — أوتاكو" }] }),
  component: ArenaPage,
});

type RoomId = "ja" | "en" | "ar" | "other";

interface RoomCard {
  id: RoomId;
  flag: string;
  title: string;
  desc: string;
  color: string;
  available: boolean;
}

const ROOMS: RoomCard[] = [
  {
    id: "ja",
    flag: "🇯🇵",
    title: "اليابانية",
    desc: "هيراغانا · كاتاكانا · كانجي · محادثات",
    color: "#E74C3C",
    available: true,
  },
  {
    id: "en",
    flag: "🇬🇧",
    title: "الإنجليزية",
    desc: "مفردات · قواعد · محادثات · IELTS",
    color: "#3498DB",
    available: true,
  },
  {
    id: "ar",
    flag: "🇸🇦",
    title: "العربية الفصحى",
    desc: "مفردات · نحو · بلاغة · إعراب",
    color: "#27AE60",
    available: true,
  },
  {
    id: "other",
    flag: "🌐",
    title: "غرف أخرى",
    desc: "قريباً — الكورية، الصينية، الفرنسية…",
    color: "#4ECDC4",
    available: false,
  },
];

function ArenaPage() {
  const [active, setActive] = useState<RoomId | null>(null);

  if (active === "ja" || active === "en" || active === "ar") {
    return (
      <div dir="rtl" className="pb-24">
        <div className="sticky top-0 z-20 border-b border-white/10 bg-[#0a0a1a]/80 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3">
            <button
              type="button"
              onClick={() => setActive(null)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
            >
              <ArrowRight className="size-3.5" />
              رجوع للغرف
            </button>
          </div>
        </div>
        {active === "ja" ? <JapaneseRoom /> : active === "en" ? <EnglishRoom /> : <ArabicRoom />}
      </div>
    );
  }


  return (
    <div
      dir="rtl"
      className="mx-auto min-h-screen max-w-screen-md px-4 pb-28 pt-6 text-white"
      style={{ background: "radial-gradient(ellipse at top,#1a0a14 0%,#0a0a1a 60%)" }}
    >
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold">🎌 ساحة الأوتاكو</h1>
        <p className="mt-1 text-sm text-white/60">اختر غرفة لتبدأ التعلم</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {ROOMS.map((r) => (
          <button
            key={r.id}
            type="button"
            disabled={!r.available}
            onClick={() => r.available && setActive(r.id)}
            className="group relative overflow-hidden rounded-3xl border p-5 text-start transition-all enabled:hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background: `linear-gradient(135deg,${r.color}26,${r.color}08)`,
              borderColor: `${r.color}55`,
              boxShadow: r.available ? `0 10px 30px -10px ${r.color}66` : undefined,
            }}
          >
            <div className="mb-3 text-4xl">{r.flag}</div>
            <div className="text-lg font-bold" style={{ color: r.color }}>
              {r.title}
            </div>
            <div className="mt-1 text-xs text-white/60">{r.desc}</div>
            {!r.available && (
              <span className="absolute end-3 top-3 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                قريباً
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
