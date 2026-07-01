import { useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GuideTab } from "./welcome/GuideTab";
import { QuizTab } from "./welcome/QuizTab";
import { RulesTab } from "./welcome/RulesTab";
import { IntroTab } from "./welcome/IntroTab";
import { ChatBox } from "@/components/shared/ChatBox";
import {
  welcomeBotReplies,
  welcomeQuickReplies,
  welcomeSeedMessages,
} from "@/lib/data/welcome";

const WC = "#FF6B6B";
const ACCENT = "#FFE66D";
const SECONDARY = "#4ECDC4";

const TABS = [
  { value: "guide", icon: "📋", label: "دليل" },
  { value: "quiz", icon: "🎯", label: "اختبار" },
  { value: "rules", icon: "📜", label: "القواعد" },
  { value: "intro", icon: "👋", label: "تعريف" },
] as const;

export function WelcomeRoom() {
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
          background: "radial-gradient(ellipse at top,#2a0a0a 0%,#0a0a1a 60%)",
          ["--welcome" as never]: WC,
          ["--accent" as never]: ACCENT,
          ["--secondary" as never]: SECONDARY,
          fontFamily: '"Cairo","Tajawal",system-ui,sans-serif',
        } as React.CSSProperties
      }
    >
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(12px);} to {opacity:1; transform:translateY(0);} }
        @keyframes twinkle { 0%,100% { opacity:.3; transform:scale(1);} 50% { opacity:1; transform:scale(1.4);} }
        .wc-star { position:absolute; background:#fff; border-radius:9999px; animation: twinkle 3s ease-in-out infinite; pointer-events:none; }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {stars.map((s, i) => (
          <span
            key={i}
            className="wc-star"
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
            background: "linear-gradient(135deg,rgba(255,107,107,0.15),rgba(255,107,107,0.04))",
            borderColor: "rgba(255,107,107,0.3)",
            boxShadow: "0 10px 40px -10px rgba(255,107,107,0.4)",
          }}
        >
          <div
            className="grid size-14 place-items-center rounded-2xl text-2xl text-white shadow-lg"
            style={{ background: `linear-gradient(135deg,${WC},#FF8E8E)` }}
          >
            🎌
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">استقبال الجدد</h2>
            <p className="text-xs text-white/60">
              دليل المبتدئين · اختبار المستوى · قواعد الساحة · التعريف بالمجتمع
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: WC }}>
              124
            </div>
            <div className="text-[11px] text-white/50">نشط</div>
          </div>
        </div>

        <Tabs defaultValue="guide" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-4 gap-2 bg-transparent p-0">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="flex h-auto flex-col items-center gap-1 rounded-2xl border bg-white/[0.04] px-2 py-3 text-xs font-bold text-white/70 transition-all data-[state=active]:bg-[image:var(--wc-grad)] data-[state=active]:text-white data-[state=active]:shadow-[0_4px_15px_rgba(255,107,107,0.35)]"
                style={
                  {
                    borderColor: "rgba(255,255,255,0.08)",
                    ["--wc-grad" as never]: `linear-gradient(135deg,${WC},#FF8E8E)`,
                  } as React.CSSProperties
                }
              >
                <span className="text-base">{t.icon}</span>
                <span>{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-5">
            <TabsContent value="guide" className="mt-0">
              <GuideTab />
            </TabsContent>
            <TabsContent value="quiz" className="mt-0">
              <QuizTab />
            </TabsContent>
            <TabsContent value="rules" className="mt-0">
              <RulesTab />
            </TabsContent>
            <TabsContent value="intro" className="mt-0">
              <IntroTab />
            </TabsContent>
          </div>
        </Tabs>

        <ChatBox
          accentColor={WC}
          seedMessages={welcomeSeedMessages}
          quickReplies={welcomeQuickReplies}
          botReplies={welcomeBotReplies}
          onlineCount={24}
          title="نقاش الأعضاء الجدد"
          placeholder="قدم نفسك..."
        />
      </div>
    </div>
  );
}
