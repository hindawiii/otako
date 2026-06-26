import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, ExternalLink, Star, BookOpen, Tv, Compass, Image as ImageIcon, Gamepad2 } from "lucide-react";

export const Route = createFileRoute("/anime-manga")({
  head: () => ({
    meta: [
      { title: "المانجا والأنمي — أوتاكو" },
      { name: "description", content: "دليل تفاعلي للأنمي الموسمي، المانجا المترجمة، والاستكشاف لمحبي الأوتاكو." },
    ],
  }),
  component: AnimeMangaHub,
});

interface AnimeCard {
  title: string;
  image: string;
  rating: number;
  status: "ongoing" | "completed";
  newsUrl: string;
}

const SEASONAL_ANIME: AnimeCard[] = [
  {
    title: "Solo Leveling — Season 2",
    image: "https://cdn.myanimelist.net/images/anime/1473/146241l.jpg",
    rating: 9.1,
    status: "ongoing",
    newsUrl: "https://myanimelist.net/anime/58567",
  },
  {
    title: "Frieren: Beyond Journey's End",
    image: "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg",
    rating: 9.3,
    status: "completed",
    newsUrl: "https://myanimelist.net/anime/52991",
  },
  {
    title: "Jujutsu Kaisen",
    image: "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg",
    rating: 8.7,
    status: "ongoing",
    newsUrl: "https://myanimelist.net/anime/40748",
  },
  {
    title: "Chainsaw Man",
    image: "https://cdn.myanimelist.net/images/anime/1806/126216l.jpg",
    rating: 8.5,
    status: "ongoing",
    newsUrl: "https://myanimelist.net/anime/44511",
  },
  {
    title: "Demon Slayer: Hashira Training",
    image: "https://cdn.myanimelist.net/images/anime/1765/142073l.jpg",
    rating: 8.2,
    status: "completed",
    newsUrl: "https://myanimelist.net/anime/55701",
  },
  {
    title: "One Piece",
    image: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg",
    rating: 8.7,
    status: "ongoing",
    newsUrl: "https://myanimelist.net/anime/21",
  },
];

const MANGA_SITES = {
  ar: [
    { name: "MangaLek", url: "https://like-manga.net", desc: "أكبر موقع عربي للمانجا المترجمة." },
    { name: "Team X", url: "https://team-x.fun", desc: "فريق ترجمة عربي شهير لأحدث الفصول." },
    { name: "MangaSwat", url: "https://swatscans.com", desc: "ترجمات عربية احترافية لأشهر السلاسل." },
    { name: "Azora", url: "https://azoramoon.com", desc: "موقع مانجا عربي بترجمات سريعة." },
  ],
  en: [
    { name: "MangaDex", url: "https://mangadex.org", desc: "أكبر مكتبة مانجا مجانية بلغات متعددة." },
    { name: "VIZ Media", url: "https://www.viz.com/shonenjump", desc: "المصدر الرسمي لمانجا شونن جامب." },
    { name: "MangaPlus", url: "https://mangaplus.shueisha.co.jp", desc: "المنصة الرسمية من Shueisha." },
    { name: "Bato.to", url: "https://bato.to", desc: "مكتبة مانجا واسعة بترجمات معجبين." },
  ],
};

const WALLPAPERS = [
  { name: "Wallhaven", url: "https://wallhaven.cc/search?categories=010&q=anime", desc: "خلفيات أنمي عالية الدقة 4K." },
  { name: "Pixiv", url: "https://www.pixiv.net", desc: "أعمال فنية أصلية من فنانين يابانيين." },
  { name: "Danbooru", url: "https://danbooru.donmai.us", desc: "أرشيف ضخم للفنون الأنمية." },
];

const ANIME_GAMES = [
  { name: "Genshin Impact", url: "https://genshin.hoyoverse.com", desc: "RPG مفتوح العالم بأسلوب أنمي." },
  { name: "Honkai: Star Rail", url: "https://hsr.hoyoverse.com", desc: "مغامرة فضائية بنظام قتال أدوار." },
  { name: "Wuthering Waves", url: "https://wutheringwaves.kurogames.com", desc: "أكشن أنمي مفتوح العالم." },
  { name: "Blue Archive", url: "https://bluearchive.nexon.com", desc: "RPG تكتيكي بأسلوب موي." },
];

function AnimeMangaHub() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="mx-auto max-w-screen-md px-4 py-4 pb-28 text-right">
      {/* Hero */}
      <Card className="overflow-hidden border-border/60 bg-card/40 p-0 backdrop-blur-xl">
        <div className="relative bg-gradient-primary p-5 text-primary-foreground">
          <div className="absolute -end-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <p className="text-xs opacity-90">دليل الأوتاكو التفاعلي</p>
          <h2 className="mt-1 text-2xl font-black">المانجا والأنمي</h2>
          <p className="mt-1 text-xs opacity-90">آخر الأخبار، أفضل المصادر، واستكشاف لا ينتهي.</p>
        </div>
      </Card>

      <Tabs defaultValue="anime" className="mt-4 w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-3 border border-border/60 bg-card/40 backdrop-blur-xl">
          <TabsTrigger
            value="anime"
            className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon"
          >
            <Tv className="ms-1 h-4 w-4" />
            الأنمي
          </TabsTrigger>
          <TabsTrigger
            value="manga"
            className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon"
          >
            <BookOpen className="ms-1 h-4 w-4" />
            المانجا
          </TabsTrigger>
          <TabsTrigger
            value="explore"
            className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon"
          >
            <Compass className="ms-1 h-4 w-4" />
            استكشاف
          </TabsTrigger>
        </TabsList>

        {/* TAB 1 — ANIME */}
        <TabsContent value="anime" className="mt-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {SEASONAL_ANIME.map((a) => (
              <Card
                key={a.title}
                className="group overflow-hidden border-border/60 bg-card/40 p-0 backdrop-blur-xl transition hover:shadow-neon"
              >
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={a.image}
                    alt={a.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={
                          "rounded-full px-1.5 py-0.5 text-[9px] font-bold " +
                          (a.status === "ongoing"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-sky-500/20 text-sky-300")
                        }
                      >
                        {a.status === "ongoing" ? "مستمر" : "مكتمل"}
                      </span>
                      <span className="flex items-center gap-0.5 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                        <Star className="h-2.5 w-2.5 fill-current" />
                        {a.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <h3 className="line-clamp-1 text-xs font-bold">{a.title}</h3>
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="mt-1 h-7 w-full text-[11px] text-primary hover:bg-primary/10"
                  >
                    <a href={a.newsUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="ms-1 h-3 w-3" />
                      اقرأ الأخبار
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 2 — MANGA */}
        <TabsContent value="manga" className="mt-4 space-y-4">
          <section>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                عربي
              </span>
              <h3 className="text-sm font-bold">مواقع الترجمة العربية</h3>
            </div>
            <div className="space-y-2">
              {MANGA_SITES.ar.map((m) => (
                <SiteRow key={m.url} {...m} />
              ))}
            </div>
          </section>
          <section>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">
                English
              </span>
              <h3 className="text-sm font-bold">المصادر الإنجليزية</h3>
            </div>
            <div className="space-y-2">
              {MANGA_SITES.en.map((m) => (
                <SiteRow key={m.url} {...m} />
              ))}
            </div>
          </section>
        </TabsContent>

        {/* TAB 3 — EXPLORE */}
        <TabsContent value="explore" className="mt-4 space-y-4">
          <section>
            <div className="mb-2 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold">خلفيات أنمي عالية الجودة</h3>
            </div>
            <div className="space-y-2">
              {WALLPAPERS.map((w) => (
                <SiteRow key={w.url} {...w} />
              ))}
            </div>
          </section>
          <section>
            <div className="mb-2 flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-accent" />
              <h3 className="text-sm font-bold">قواعد ألعاب الأنمي</h3>
            </div>
            <div className="space-y-2">
              {ANIME_GAMES.map((g) => (
                <SiteRow key={g.url} {...g} />
              ))}
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SiteRow({ name, url, desc }: { name: string; url: string; desc: string }) {
  return (
    <Card className="flex items-center justify-between gap-3 border-border/60 bg-card/40 p-3 backdrop-blur-xl">
      <div className="min-w-0 flex-1">
        <h4 className="font-bold">{name}</h4>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
      <Button asChild size="sm" variant="secondary" className="shrink-0">
        <a href={url} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="ms-1 h-3.5 w-3.5" />
          فتح
        </a>
      </Button>
    </Card>
  );
}
