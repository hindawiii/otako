import { Link, useNavigate, useLocation, useRouter } from "@tanstack/react-router";
import { Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { SettingsSheet } from "@/components/settings-sheet";

// Routes treated as "home/main" — show full logo + menu, no back arrow
const ROOT_PAGES: Record<string, string> = {
  "/": "أوتاكو",
  "/arena": "ساحة الأوتاكو",
  "/chat": "الرسائل",
  "/gifts-manga": "الهدايا والألعاب",
  "/anime-manga": "المانجا والأنمي",
  "/profile": "ملف الأوتاكو",
};

// Page titles for sub-pages
const PAGE_TITLES: { match: (p: string) => boolean; title: string }[] = [
  { match: (p) => p.startsWith("/chat/"), title: "محادثة" },
  { match: (p) => p === "/rewards", title: "تفاعل واربح" },
  { match: (p) => p === "/privacy", title: "سياسة الخصوصية" },
];

function getPageTitle(pathname: string): string {
  return PAGE_TITLES.find((p) => p.match(pathname))?.title ?? "";
}

export function AppHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const { pathname } = useLocation();

  const isRoot = pathname in ROOT_PAGES;
  const subTitle = getPageTitle(pathname);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.history.back();
    else navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="relative mx-auto flex h-14 max-w-screen-md items-center justify-between gap-2 px-4">
        {isRoot ? (
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-primary shadow-neon" />
            <span className="text-xl font-bold text-gradient">أوتاكو</span>
          </Link>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label="رجوع"
            className="text-primary hover:bg-primary/10"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        )}

        {!isRoot && subTitle && (
          <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-bold text-gradient">
            {subTitle}
          </h1>
        )}

        {user && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild aria-label="الهدايا والألعاب">
              <Link to="/gifts-manga"><Gift className="h-5 w-5 text-accent" /></Link>
            </Button>
            <SettingsSheet />
          </div>
        )}
      </div>
    </header>
  );
}
