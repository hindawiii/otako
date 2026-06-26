import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "تسجيل الدخول — أوتاكو" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("مرحباً بعودتك!"); navigate({ to: "/" }); }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          username: String(fd.get("username")),
          nickname: String(fd.get("nickname")),
        },
      },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("تم إنشاء الحساب! تحقّق من بريدك."); }
  };

  const handleOAuth = async (provider: "google" | "facebook") => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) { toast.error(error.message); setBusy(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-gradient-primary shadow-neon" />
            <h1 className="text-3xl font-black text-gradient">أوتاكو</h1>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">مجتمع عشاق الأنمي العربي</p>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="signin">
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="signin">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="signup">حساب جديد</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="si-email">البريد الإلكتروني</Label>
                  <Input id="si-email" name="email" type="email" required dir="ltr" className="text-right" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="si-pw">كلمة المرور</Label>
                  <Input id="si-pw" name="password" type="password" required minLength={6} dir="ltr" />
                </div>
                <Button type="submit" disabled={busy} className="w-full bg-gradient-primary text-primary-foreground shadow-neon">
                  {busy && <Loader2 className="ms-2 h-4 w-4 animate-spin" />} دخول
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="su-username">اسم المستخدم</Label>
                  <Input id="su-username" name="username" required minLength={3} dir="ltr" className="text-right" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-nickname">الاسم المستعار</Label>
                  <Input id="su-nickname" name="nickname" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-email">البريد الإلكتروني</Label>
                  <Input id="su-email" name="email" type="email" required dir="ltr" className="text-right" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-pw">كلمة المرور</Label>
                  <Input id="su-pw" name="password" type="password" required minLength={6} dir="ltr" />
                </div>
                <Button type="submit" disabled={busy} className="w-full bg-gradient-primary text-primary-foreground shadow-neon">
                  {busy && <Loader2 className="ms-2 h-4 w-4 animate-spin" />} إنشاء حساب
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">أو</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-2">
            <Button variant="outline" onClick={() => handleOAuth("google")} disabled={busy} className="w-full">
              <svg className="ms-2 h-4 w-4" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.5 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 34.7 26.7 35.5 24 35.5c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.4-.4-3.5z"/></svg>
              متابعة بحساب جوجل
            </Button>

            <Button
              type="button"
              onClick={() => handleOAuth("facebook")}
              disabled={busy}
              className="w-full border-2 border-[#1877F2] bg-[#1877F2] text-white hover:bg-[#166FE5] hover:border-[#166FE5]"
              style={{ boxShadow: "0 0 24px -6px rgba(24, 119, 242, 0.55)" }}
            >
              <svg className="ms-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              متابعة عبر فيسبوك
            </Button>
          </div>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          باستخدامك للتطبيق فإنك توافق على{" "}
          <Link to="/privacy" className="text-primary hover:underline">سياسة الخصوصية</Link>
        </p>
      </div>
    </div>
  );
}
