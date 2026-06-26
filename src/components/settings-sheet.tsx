import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Settings, Sun, Moon, UserCog, ShieldCheck, LogOut, Flag, Signal, FileText,
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import { useDataSaver } from "@/lib/data-saver-context";

export function SettingsSheet() {
  const { theme, toggle } = useTheme();
  const { signOut } = useAuth();
  const { dataSaver, toggle: toggleDataSaver } = useDataSaver();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const handleLogout = async () => {
    setOpen(false);
    await signOut();
    navigate({ to: "/auth" });
  };

  const rowBase =
    "flex w-full items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/40 px-4 py-3 text-right backdrop-blur-md transition hover:border-primary/60 hover:bg-primary/5 hover:shadow-neon";

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="الإعدادات">
            <Settings className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          dir="rtl"
          className="w-full max-w-sm border-border/60 bg-background/80 backdrop-blur-2xl"
        >
          <SheetHeader className="text-right">
            <SheetTitle className="text-xl font-black text-gradient">الإعدادات</SheetTitle>
            <SheetDescription className="text-right text-xs text-muted-foreground">
              خصّص تجربتك في أوتاكو
            </SheetDescription>
          </SheetHeader>

          <div className="mt-5 space-y-2.5">
            {/* Theme */}
            <button type="button" onClick={toggle} className={rowBase}>
              <span className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-amber-400" />
                ) : (
                  <Moon className="h-5 w-5 text-primary" />
                )}
                <span className="text-sm font-semibold">
                  {theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
                </span>
              </span>
            </button>

            {/* Profile */}
            <Link to="/profile" onClick={() => setOpen(false)} className={rowBase}>
              <span className="flex items-center gap-3">
                <UserCog className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">تعديل الملف الشخصي</span>
              </span>
            </Link>

            {/* Data Saver Toggle */}
            <div className={rowBase}>
              <span className="flex items-center gap-3">
                <Signal className="h-5 w-5 text-accent drop-shadow-[0_0_6px_hsl(var(--accent)/0.7)]" />
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">توفير البيانات</span>
                  <span className="text-[11px] text-muted-foreground">صور أخف وتحميل أبطأ للوسائط</span>
                </span>
              </span>
              <Switch
                checked={dataSaver}
                onCheckedChange={toggleDataSaver}
                className="data-[state=checked]:bg-primary data-[state=checked]:shadow-neon"
                aria-label="توفير البيانات"
              />
            </div>

            {/* About */}
            <button
              type="button"
              onClick={() => setAboutOpen(true)}
              className={rowBase}
            >
              <span className="flex items-center gap-3">
                <Flag className="h-5 w-5 text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.7)]" />
                <span className="text-sm font-semibold">حول التطبيق</span>
              </span>
            </button>

            {/* Privacy */}
            <Link to="/privacy" onClick={() => setOpen(false)} className={rowBase}>
              <span className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">سياسة الخصوصية</span>
              </span>
            </Link>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-right text-destructive backdrop-blur-md transition hover:bg-destructive/10"
            >
              <span className="flex items-center gap-3">
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-semibold">تسجيل الخروج</span>
              </span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* About Modal */}
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent
          dir="rtl"
          className="max-w-sm border-border/60 bg-background/85 text-right backdrop-blur-2xl"
        >
          <DialogHeader>
            <DialogTitle className="text-right text-lg font-black text-gradient">حول التطبيق</DialogTitle>
            <DialogDescription className="text-right text-xs text-muted-foreground">
              معلومات عامة عن منصة أوتاكو
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-3 py-2">
            <div className="flex items-center gap-2">
              <div className="h-12 w-12 rounded-2xl bg-gradient-primary shadow-neon" />
              <span className="text-2xl font-black text-gradient">أوتاكو</span>
            </div>
            <p className="text-sm font-semibold">أوتاكو Hub — الإصدار 1.0.0</p>
            <p className="text-center text-xs text-muted-foreground">
              مجتمع عشاق الأنمي العربي. صُمّم بحب في عالم الـ RTL.
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              asChild
              variant="outline"
              className="border-primary/40 hover:border-primary hover:bg-primary/10"
              onClick={() => setAboutOpen(false)}
            >
              <Link to="/privacy">
                <ShieldCheck className="ms-2 h-4 w-4" />
                سياسة الخصوصية
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-accent/40 hover:border-accent hover:bg-accent/10"
              onClick={() => setAboutOpen(false)}
            >
              <Link to="/privacy">
                <FileText className="ms-2 h-4 w-4" />
                شروط الخدمة
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
