import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Gift, Gamepad2, Sparkles, Brain } from "lucide-react";
import { GiftCard } from "@/components/GiftCard";

export const Route = createFileRoute("/gifts-manga")({
  head: () => ({ meta: [{ title: "الهدايا والألعاب — أوتاكو" }] }),
  component: GiftsGamesPage,
});

interface GiftRow {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
  price_points: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  arc: string;
  is_free_daily: boolean;
}

function GiftsGamesPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [gifts, setGifts] = useState<GiftRow[]>([]);
  const [points, setPoints] = useState(0);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      setBusy(true);
      const [{ data: g }, { data: p }] = await Promise.all([
        supabase.from("gift_catalog").select("*").order("price_points", { ascending: true }),
        supabase.from("profiles").select("points").eq("id", user.id).maybeSingle(),
      ]);
      setGifts((g as GiftRow[]) ?? []);
      setPoints(p?.points ?? 0);
      setBusy(false);
    })();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="mx-auto max-w-screen-md px-4 py-4 pb-28 text-right">
      {/* Points hero */}
      <Card className="overflow-hidden border-border/60 bg-card/40 p-0 backdrop-blur-xl">
        <div className="relative bg-gradient-primary p-5 text-primary-foreground">
          <div className="absolute -end-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <p className="text-xs opacity-90">رصيدك</p>
          <div className="mt-1 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <h2 className="text-2xl font-black">{points} نقطة</h2>
          </div>
          <Button asChild size="sm" variant="secondary" className="mt-3 h-8 text-xs">
            <a href="/rewards">تفاعل واربح المزيد</a>
          </Button>
        </div>
      </Card>

      <Tabs defaultValue="gifts" className="mt-4 w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-2 border border-border/60 bg-card/40 backdrop-blur-xl">
          <TabsTrigger
            value="gifts"
            className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon"
          >
            <Gift className="ms-1 h-4 w-4" />
            الهدايا
          </TabsTrigger>
          <TabsTrigger
            value="games"
            className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon"
          >
            <Gamepad2 className="ms-1 h-4 w-4" />
            الألعاب
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gifts" className="mt-4">
          {busy ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : gifts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-10 text-center text-sm text-muted-foreground backdrop-blur-xl">
              لا توجد هدايا متاحة الآن.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gifts.map((g) => (
                <GiftCard key={g.id} gift={g} showPrice />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="games" className="mt-4 space-y-3">
          <Card className="border-border/60 bg-card/40 p-5 text-center backdrop-blur-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-neon">
              <Brain className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="mt-3 text-lg font-black text-gradient">كويز الأوتاكو الذكي</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              اختبر معلوماتك في عالم الأنمي والمانجا واكسب النقاط. قريباً جداً!
            </p>
            <Button disabled className="mt-3 w-full" size="sm">
              قريباً
            </Button>
          </Card>

          <Card className="border-border/60 bg-card/40 p-5 text-center backdrop-blur-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-primary shadow-neon">
              <Gamepad2 className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="mt-3 text-lg font-black text-gradient">ألعاب يومية</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              تحديات يومية ممتعة لكل عشاق الأوتاكو. ترقّب الإطلاق!
            </p>
            <Button disabled className="mt-3 w-full" size="sm">
              قريباً
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
