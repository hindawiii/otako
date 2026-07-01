import { useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LessonsTab } from "./drawing/LessonsTab";
import { GalleryTab } from "./drawing/GalleryTab";
import { ChallengesTab } from "./drawing/ChallengesTab";
import { LevelTab } from "./drawing/LevelTab";
import { ChatBox } from "@/components/shared/ChatBox";
import {
  drawBotReplies,
  drawQuickReplies,
  drawSeedMessages,
} from "@/lib/data/drawing";

const ART = "#9B59B6";
const ACCENT = "#FFE66D";
const SECONDARY = "#4ECDC4";

const TABS = [
  { value: "lessons", icon: "✏️", label: "الدروس" },
  { value: "gallery", icon: "🖼️", label: "معرض" },
  { value: "challenges", icon: "🎯", label: "تحديات" },
  { value: "level", icon: "📊", label: "مستواي" },
] as const;

export function DrawingRoom() {
  const stars = useMemo(
    () =>
      Array.from({ length: 40 }, () => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 3,
      })),
    [],
  );

  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-hidden px-4 py-6 text-white"
      style={
        {
          background: "radial-gradient(ellipse at top,#1c0a24 0%,#0a0a1a 60%)",
          ["--art" as never]: ART,
          ["--accent" as never]: ACCENT,
          ["--secondary" as never]: SECONDARY,
          fontFamily: '"Cairo","Tajawal",system-ui,sans-serif',
        } as React.CSSProperties
      }
    >
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(12px);} to {opacity:1; transform:translateY(0);} }
        @keyframes twinkle { 0%,100% { opacity:.3; transform:scale(1);} 50% { opacity:1; transform:scale(1.4);} }
        .dr-star { position:absolute; background:#fff; border-radius:9999px; animation: twinkle 3s ease-in-out infinite; pointer-events:none; }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {stars.map((s, i) => (
          <span
            key={i}
            className="dr-star"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-3xl">
        <div
          className="mb-5 flex items-center gap-4 rounded-3xl border p-5 backdrop-blur"
          style={{
            background: "linear-gradient(135deg,rgba(155,89,182,0.15),rgba(155,89,182,0.04))",
            borderColor: "rgba(155,89,182,0.3)",
            boxShadow: "0 10px 40px -10px rgba(155,89,182,0.4)",
          }}
        >
          <div
            className="grid size-14 place-items-center rounded-2xl text-2xl text-white shadow-lg"
            style={{ background: `linear-gradient(135deg,${ART},#8E44AD)` }}
          >
            🎨
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">تعلم الرسم</h2>
            <p className="text-xs text-white/60">
              رسم الأنمي · الشخصيات · الخلفيات · التلوين الرقمي · تحديات أسبوعية
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: ART }}>
              67
            </div>
            <div className="text-[11px] text-white/50">رسام</div>
          </div>
        </div>

        <Tabs defaultValue="lessons" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-4 gap-2 bg-transparent p-0">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="flex h-auto flex-col items-center gap-1 rounded-2xl border bg-white/[0.04] px-2 py-3 text-xs font-bold text-white/70 transition-all data-[state=active]:bg-[image:var(--art-grad)] data-[state=active]:text-white data-[state=active]:shadow-[0_4px_15px_rgba(155,89,182,0.35)]"
                style={
                  {
                    borderColor: "rgba(255,255,255,0.08)",
                    ["--art-grad" as never]: `linear-gradient(135deg,${ART},#8E44AD)`,
                  } as React.CSSProperties
                }
              >
                <span className="text-base">{t.icon}</span>
                <span>{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-5">
            <TabsContent value="lessons" className="mt-0">
              <LessonsTab />
            </TabsContent>
            <TabsContent value="gallery" className="mt-0">
              <GalleryTab />
            </TabsContent>
            <TabsContent value="challenges" className="mt-0">
              <ChallengesTab />
            </TabsContent>
            <TabsContent value="level" className="mt-0">
              <LevelTab />
            </TabsContent>
          </div>
        </Tabs>

        <ChatBox
          accentColor={ART}
          seedMessages={drawSeedMessages}
          quickReplies={drawQuickReplies}
          botReplies={drawBotReplies}
          onlineCount={18}
          title="نقاش الرسامين"
          placeholder="شارك رسمتك أو اسأل..."
        />
      </div>
    </div>
  );
}
