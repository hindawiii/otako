import { Outlet, Link, createRootRoute, HeadContent, Scripts, useLocation } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { DataSaverProvider } from "@/lib/data-saver-context";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">الصفحة غير موجودة</h2>
        <p className="mt-2 text-sm text-muted-foreground">لم نتمكن من إيجاد ما تبحث عنه.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-xl bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-neon">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#1a1530" },
      { title: "أوتاكو — مجتمع عشاق الأنمي العربي" },
      { name: "description", content: "أوتاكو: منصة عربية لمحبي الأنمي للتواصل والمشاركة في بيئة آمنة وممتعة." },
      { property: "og:title", content: "أوتاكو — مجتمع عشاق الأنمي" },
      { property: "og:description", content: "تواصل مع محبي الأنمي العرب في بيئة آمنة وحديثة." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { pathname } = useLocation();
  const hideChrome = pathname === "/auth";
  return (
    <ThemeProvider>
      <DataSaverProvider>
        <AuthProvider>
          {!hideChrome && <AppHeader />}
          <div className={hideChrome ? "" : "pb-24 lg:pb-6"}>
            <Outlet />
          </div>
          {!hideChrome && <BottomNav />}
          <Toaster position="top-center" />
        </AuthProvider>
      </DataSaverProvider>
    </ThemeProvider>
  );
}
