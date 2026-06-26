import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Loader2, ArrowRight, Sparkles, Trophy, Crown,
  Image as ImageIcon, ShoppingBag, PlayCircle, Pencil, Gift as GiftIcon,
  Camera, X, Plus,
} from "lucide-react";
import { toast } from "sonner";
import { RARITY_STYLES, type Rarity } from "@/lib/gift-utils";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "ملفي الشخصي — أوتاكو" }] }),
  component: ProfilePage,
});

const LEVEL_THRESHOLDS = (() => {
  const out: number[] = [0];
  let total = 0;
  let step = 100;
  for (let i = 1; i <= 50; i++) {
    total += step;
    out.push(total);
    step += 50;
  }
  return out;
})();

function levelFromPoints(points: number) {
  let lvl = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (points >= LEVEL_THRESHOLDS[i]) lvl = i;
    else break;
  }
  const current = LEVEL_THRESHOLDS[lvl];
  const next = LEVEL_THRESHOLDS[lvl + 1] ?? current + 100;
  const pct = Math.min(100, Math.round(((points - current) / (next - current)) * 100));
  return { level: lvl, current, next, pct };
}

function titlesForLevel(lvl: number, points: number): string[] {
  const t: string[] = [];
  if (points > 0) t.push("🌱 أوتاكو مبتدئ");
  if (lvl >= 2) t.push("⚔️ مقاتل الأرينا");
  if (lvl >= 3) t.push("🥷 شينوبي");
  if (lvl >= 5) t.push("🏴‍☠️ قرصان");
  if (lvl >= 8) t.push("🐉 صائد التنانين");
  if (lvl >= 12) t.push("👑 أسطورة الأوتاكو");
  return t;
}

interface GiftRow {
  gift_id: string;
  gift: { id: string; name: string; image_url: string; rarity: Rarity } | null;
}

interface StoryRow { id: string; media_url: string; media_type: string; created_at: string }

interface ProfileForm {
  username: string;
  nickname: string;
  bio: string;
  avatar_url: string;
  cover_url: string;
  years_watching: string;
  watch_history: string[];
  favorites: string[];
  watchlist: string[];
}

function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    username: "", nickname: "", bio: "", avatar_url: "", cover_url: "",
    years_watching: "", watch_history: [], favorites: [], watchlist: [],
  });
  const [points, setPoints] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [museumGifts, setMuseumGifts] = useState<GiftRow[]>([]);
  const [archivedStories, setArchivedStories] = useState<StoryRow[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const [{ data: prof }, { data: gifts }, { data: stories }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("gift_transactions")
          .select("gift_id, gift:gift_catalog!gift_transactions_gift_id_fkey(id,name,image_url,rarity)")
          .eq("recipient_id", user.id)
          .order("created_at", { ascending: false })
          .limit(24),
        supabase
          .from("stories")
          .select("id, media_url, media_type, created_at")
          .eq("creator_id", user.id)
          .eq("kept_in_profile", true)
          .order("created_at", { ascending: false }),
      ]);

      if (prof) {
        setForm({
          username: prof.username ?? "",
          nickname: prof.nickname ?? "",
          bio: prof.bio ?? "",
          avatar_url: prof.avatar_url ?? "",
          cover_url: (prof as any).cover_url ?? "",
          years_watching: (prof as any).years_watching != null ? String((prof as any).years_watching) : "",
          watch_history: (prof as any).watch_history ?? [],
          favorites: (prof as any).favorites ?? [],
          watchlist: (prof as any).watchlist ?? [],
        });
        setPoints(prof.points ?? 0);
      }

      let mg = (gifts as unknown as GiftRow[]) ?? [];
      if (mg.length && mg.every((r) => !r.gift)) {
        const ids = Array.from(new Set(mg.map((r) => r.gift_id)));
        const { data: cat } = await supabase
          .from("gift_catalog").select("id,name,image_url,rarity").in("id", ids);
        const byId = new Map((cat ?? []).map((c) => [c.id, c]));
        mg = mg.map((r) => ({ ...r, gift: byId.get(r.gift_id) ?? null }));
      }
      mg = mg.filter((r) => r.gift && ["rare", "epic", "legendary", "mythic"].includes(r.gift.rarity));
      setMuseumGifts(mg);
      setArchivedStories((stories as StoryRow[]) ?? []);
      setHydrated(true);
    })();
  }, [user]);

  const lvl = useMemo(() => levelFromPoints(points), [points]);
  const titles = useMemo(() => titlesForLevel(lvl.level, points), [lvl.level, points]);

  async function uploadMedia(file: File, bucket: "avatars" | "covers") {
    if (!user) return null;
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from(bucket).upload(path, file, { upsert: true, cacheControl: "3600" });
    if (error) {
      toast.error(error.message);
      return null;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || !user) return;
    if (!f.type.startsWith("image/")) return toast.error("صورة فقط");
    setUploadingAvatar(true);
    const url = await uploadMedia(f, "avatars");
    if (url) {
      const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
      if (error) toast.error(error.message);
      else {
        setForm((p) => ({ ...p, avatar_url: url }));
        toast.success("تم تحديث الصورة");
      }
    }
    setUploadingAvatar(false);
  }

  async function handleCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || !user) return;
    if (!f.type.startsWith("image/")) return toast.error("صورة فقط");
    setUploadingCover(true);
    const url = await uploadMedia(f, "covers");
    if (url) {
      const { error } = await supabase.from("profiles").update({ cover_url: url }).eq("id", user.id);
      if (error) toast.error(error.message);
      else {
        setForm((p) => ({ ...p, cover_url: url }));
        toast.success("تم تحديث الغلاف");
      }
    }
    setUploadingCover(false);
  }

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({
      username: form.username || null,
      nickname: form.nickname || null,
      bio: form.bio || null,
      avatar_url: form.avatar_url || null,
      cover_url: form.cover_url || null,
      years_watching: form.years_watching ? Number(form.years_watching) : null,
      watch_history: form.watch_history,
      favorites: form.favorites,
      watchlist: form.watchlist,
    }).eq("id", user.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("تم حفظ التغييرات");
      setEditing(false);
    }
  };

  if (loading || !user || !hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen text-right">
      <main className="mx-auto max-w-screen-md px-4 py-4 pb-28">
        <Link to="/" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowRight className="h-4 w-4" /> العودة
        </Link>

        <input ref={avatarInputRef} type="file" accept="image/*" hidden onChange={handleAvatarFile} />
        <input ref={coverInputRef} type="file" accept="image/*" hidden onChange={handleCoverFile} />

        <Card className="relative overflow-hidden border-border/60 bg-card/40 p-0 backdrop-blur-xl">
          <div
            className="relative h-32 bg-gradient-to-l from-primary/40 via-accent/30 to-primary/20"
            style={form.cover_url ? { backgroundImage: `url(${form.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary)/0.35),transparent_60%)]" />
            <Button
              size="sm" variant="secondary"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="absolute end-3 top-3 h-8 gap-1 text-xs backdrop-blur"
            >
              {uploadingCover ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
              تعديل غلاف
            </Button>
          </div>
          <div className="-mt-12 flex flex-col items-center px-5 pb-5">
            <div className="relative">
              <div className="rounded-full bg-gradient-primary p-[3px] shadow-neon">
                <Avatar className="h-24 w-24 ring-2 ring-background">
                  <AvatarImage src={form.avatar_url || undefined} />
                  <AvatarFallback className="bg-card text-2xl">
                    {(form.nickname || form.username || "؟").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 end-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-neon ring-2 ring-background"
                aria-label="تغيير الصورة"
              >
                {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
            </div>
            <h1 className="mt-3 text-xl font-black text-gradient">{form.nickname || "أوتاكو"}</h1>
            {form.username && <p dir="ltr" className="mt-0.5 text-xs text-muted-foreground">@{form.username}</p>}
            {form.bio && <p className="mt-2 line-clamp-2 max-w-md text-xs text-muted-foreground">{form.bio}</p>}
            <div className="mt-3 flex w-full flex-wrap items-center justify-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing((v) => !v)} className="h-8 gap-1 text-xs">
                <Pencil className="h-3.5 w-3.5" /> {editing ? "إغلاق" : "تعديل الملف"}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => toast.message("قريباً: متجر الإطارات الفخمة")}
                className="h-8 gap-1 text-xs">
                <ShoppingBag className="h-3.5 w-3.5" /> شراء إطار فخم
              </Button>
            </div>
          </div>
        </Card>

        <Card className="mt-4 border-border/60 bg-card/40 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">المستوى</p>
              <h2 className="text-3xl font-black text-gradient">Lv.{lvl.level}</h2>
            </div>
            <div className="text-end">
              <p className="text-xs text-muted-foreground">رصيد النقاط</p>
              <div className="flex items-center justify-end gap-1.5">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <span className="text-3xl font-black tabular-nums">{points}</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/50 ring-1 ring-border/60">
              <div className="h-full rounded-full bg-gradient-to-l from-cyan-400 via-fuchsia-500 to-purple-600 shadow-[0_0_12px_rgba(168,85,247,0.6)] transition-all"
                style={{ width: `${lvl.pct}%` }} />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground tabular-nums">
              <span>{lvl.current}</span><span>{lvl.pct}%</span><span>{lvl.next}</span>
            </div>
          </div>
          <Button asChild size="sm" className="mt-4 w-full bg-gradient-primary text-primary-foreground shadow-neon">
            <Link to="/rewards">
              <PlayCircle className="ms-1 h-4 w-4" /> شاهد إعلانًا للحصول على نقاط
            </Link>
          </Button>
        </Card>

        <Card className="mt-4 border-2 border-primary/30 bg-card/40 p-5 shadow-neon backdrop-blur-xl">
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-black text-gradient">الألقاب والإنجازات</h3>
          </div>
          {titles.length === 0 ? (
            <p className="text-sm text-muted-foreground">ابدأ بالتفاعل في الأرينا وأرسل الهدايا لتفتح أول لقب لك ✨</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {titles.map((t) => (
                <span key={t} className="rounded-full border border-primary/40 bg-gradient-to-l from-primary/20 to-accent/20 px-3 py-1 text-xs font-bold text-foreground shadow-[0_0_10px_hsl(var(--primary)/0.35)]">
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="mt-3"><Progress value={lvl.pct} className="h-1.5" /></div>
        </Card>

        <Card className="mt-4 border-border/60 bg-card/40 p-5 backdrop-blur-xl">
          <div className="mb-3 flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-300" />
            <h3 className="text-lg font-black text-gradient">هدايا الأوتاكو المستلمة</h3>
          </div>
          {museumGifts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 py-8 text-center">
              <GiftIcon className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">لم تستلم أي هدية أسطورية بعد. شارك في الدردشات لتظهر هنا!</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {museumGifts.map((r, idx) => {
                const g = r.gift!;
                const styles = RARITY_STYLES[g.rarity];
                return (
                  <div key={`${g.id}-${idx}`} className="flex flex-col items-center gap-1">
                    <div className={`relative flex h-14 w-14 items-center justify-center rounded-full ${styles.bg} ring-2 ring-inset ${styles.ring} shadow-[0_0_14px_hsl(var(--primary)/0.4)]`}>
                      <img src={g.image_url} alt={g.name} loading="lazy" className="h-10 w-10 object-contain" />
                    </div>
                    <span className="line-clamp-1 w-full text-center text-[10px] text-muted-foreground">{g.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="mt-4 border-border/60 bg-card/40 p-5 backdrop-blur-xl">
          <div className="mb-3 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-black text-gradient">أرشيف القصص</h3>
          </div>
          {archivedStories.length === 0 ? (
            <p className="text-xs text-muted-foreground">لا توجد قصص محفوظة. عند نشر قصة، اختر «احتفظ بها في الملف» لتظهر هنا.</p>
          ) : (
            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
              {archivedStories.map((s) => (
                <div key={s.id} className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 border-primary/60 shadow-[0_0_12px_hsl(var(--primary)/0.45)]">
                  {s.media_type === "video" ? (
                    <video src={s.media_url} className="h-full w-full object-cover" muted preload="none" />
                  ) : (
                    <img src={s.media_url} alt="story" loading="lazy" className="h-full w-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {editing && (
          <Card className="mt-4 border-border/60 bg-card/40 p-5 backdrop-blur-xl">
            <h3 className="mb-3 text-lg font-black text-gradient">تعديل الملف الشخصي</h3>
            <form onSubmit={onSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">اسم المستخدم</Label>
                <Input id="username" dir="ltr" className="text-right" value={form.username} required minLength={3}
                  onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">الاسم المستعار</Label>
                <Input id="nickname" value={form.nickname} required
                  onChange={(e) => setForm({ ...form, nickname: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">النبذة</Label>
                <Textarea id="bio" rows={3} value={form.bio} maxLength={300}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="عرّف بنفسك وبأنميك المفضل..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="years">منذ كم سنة تشاهد الأنمي؟</Label>
                <Input id="years" type="number" min={0} max={80} dir="ltr" className="text-right"
                  value={form.years_watching}
                  onChange={(e) => setForm({ ...form, years_watching: e.target.value })} />
              </div>

              <TagEditor
                label="أنميات شاهدتها"
                tags={form.watch_history}
                onChange={(t) => setForm({ ...form, watch_history: t })}
                tone="muted"
              />
              <TagEditor
                label="الأنميات المفضلة"
                tags={form.favorites}
                onChange={(t) => setForm({ ...form, favorites: t })}
                tone="hot"
              />
              <TagEditor
                label="أنميات أنوي مشاهدتها"
                tags={form.watchlist}
                onChange={(t) => setForm({ ...form, watchlist: t })}
                tone="cool"
              />

              <Button type="submit" disabled={busy} className="w-full bg-gradient-primary text-primary-foreground shadow-neon">
                {busy && <Loader2 className="ms-2 h-4 w-4 animate-spin" />} حفظ التغييرات
              </Button>
              <p className="text-xs text-muted-foreground">
                البريد المسجَّل: <span dir="ltr" className="font-mono text-foreground">{user.email}</span>
              </p>
            </form>
          </Card>
        )}
      </main>
    </div>
  );
}

function TagEditor({
  label, tags, onChange, tone,
}: {
  label: string;
  tags: string[];
  onChange: (next: string[]) => void;
  tone: "muted" | "hot" | "cool";
}) {
  const [v, setV] = useState("");
  const cls =
    tone === "hot"
      ? "border-rose-400/40 bg-rose-500/15 text-rose-100"
      : tone === "cool"
      ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-100"
      : "border-border/60 bg-muted/30 text-foreground";
  function add() {
    const t = v.trim();
    if (!t || tags.includes(t)) return;
    onChange([...tags, t]);
    setV("");
  }
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={v}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="أضف اسم أنمي..."
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={add} className="h-9 gap-1">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${cls}`}>
              {t}
              <button
                type="button"
                onClick={() => onChange(tags.filter((x) => x !== t))}
                className="rounded-full p-0.5 hover:bg-background/30"
                aria-label="حذف"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
