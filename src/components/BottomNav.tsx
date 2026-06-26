import { Link, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { MessageCircle, Home, User } from "lucide-react";
import { GiftGameIcon } from "@/components/icons/GiftGameIcon";
import { MangaBookIcon } from "@/components/icons/MangaBookIcon";
import { useAuth } from "@/lib/auth-context";

// Visual order under dir="rtl": FIRST item appears on the RIGHT.
// Required order from RIGHT → LEFT:
//   1) الرسائل   2) ساحة الأوتاكو   3) الهدايا والألعاب   4) المانجا والأنمي   5) ملف الأوتاكو
const ITEMS = [
  { to: "/chat", label: "الرسائل", Icon: MessageCircle },
  { to: "/arena", label: "ساحة الأوتاكو", Icon: Home },
  { to: "/gifts-manga", label: "الهدايا والألعاب", Icon: GiftGameIcon },
  { to: "/anime-manga", label: "المانجا والأنمي", Icon: MangaBookIcon },
  { to: "/profile", label: "ملف الأوتاكو", Icon: User },
] as const;

export function BottomNav() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    const match = ITEMS.find((i) => pathname === i.to || pathname.startsWith(i.to + "/"));
    if (match) {
      try { window.localStorage.setItem("otaku:lastTab", match.to); } catch { /* ignore */ }
    }
  }, [pathname]);

  if (!user || pathname === "/auth") return null;

  return (
    <nav
      dir="rtl"
      aria-label="التنقل السفلي"
      className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Frosted dark bar with subtle neon glow on top edge */}
      <div className="relative border-t border-primary/30 bg-background/85 backdrop-blur-2xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-l from-transparent via-primary/70 to-transparent"
        />
        <ul className="mx-auto flex max-w-screen-md items-stretch justify-around px-2 py-2">
          {ITEMS.map(({ to, label, Icon }) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            return (
              <li key={to} className="flex-1">
                <Link
                  to={to}
                  aria-current={active ? "page" : undefined}
                  className="group relative flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 transition"
                >
                  <span
                    className={
                      "flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300 " +
                      (active
                        ? "bg-gradient-primary text-primary-foreground shadow-neon scale-110"
                        : "text-muted-foreground group-hover:text-foreground group-hover:bg-card/40")
                    }
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span
                    className={
                      "text-[10px] font-bold transition " +
                      (active ? "text-gradient" : "text-muted-foreground")
                    }
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
