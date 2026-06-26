import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Loader2,
  MessageCircle,
  Sparkles,
  Trophy,
  Crown,
  Image as ImageIcon,
  Calendar,
  Heart,
  Bookmark,
  Eye,
  Gift as GiftIcon,
} from "lucide-react";
import { toast } from "sonner";
import { FollowButton } from "@/components/FollowButton";
import { RARITY_STYLES, type Rarity } from "@/lib/gift-utils";

export const Route = createFileRoute("/u/$userId")({
  head: () => ({ meta: [{ title: "ملف الأوتاكو — أوتاكو" }] }),
  component: PublicProfile,
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

interface ProfileFull {
  id: string;
  username: string | null;
  nickname: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  points: number;
  years_watching: number | null;
  watch_history: string[];
  favorites: string[];
  watchlist: string[];
}

interface GiftRow {
  gift_id: string;
  gift: { id: string; name: string; image_url: string; rarity: Rarity } | null;
}

function PublicProfile() {
  const { userId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileFull | null>(null);
  const [gifts, setGifts] = useState<GiftRow[]>([]);
  const [followers, setFollowers] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    void load();
    const ch = supabase
      .channel(`profile-${userId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${userId}` },
        (payload) => setProfile((p) => (p ? { ...p, ...(payload.new as Partial<ProfileFull>) } : p)),
      )
      .subscribe();
    return () => void supabase.removeChannel(ch);
  }, [userId]);

  async function load() {
    const [{ data: prof }, { data: gs }, { count: fers }, { count: fing }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("gift_transactions")
        .select("gift_id, gift:gift_catalog!gift_transactions_gift_id_fkey(id,name,image_url,rarity)")
        .eq("recipient_id", userId)
        .order("created_at", { ascending: false })
        .limit(18),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
    ]);
    setProfile((prof as ProfileFull) ?? null);
    setGifts(((gs as unknown as GiftRow[]) ?? []).filter((r) => r.gift));
    setFollowers(fers ?? 0);
    setFollowingCount(fing ?? 0);
  }

  const lvl = useMemo(() => levelFromPoints(profile?.points ?? 0), [profile?.points]);

  async function openChat() {
    if (!user || !profile) return;
    setOpening(true);
    const { data, error } = await supabase.rpc("get_or_create_conversation", { _other_user: profile.id });
    setOpening(false);
    if (error || !data) {
      toast.error(error?.message ?? "تعذر فتح المحادثة");
      return;
    }
    navigate({ to: "/chat/$conversationId", params: { conversationId: data as string } });
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const isMe = user?.id === profile.id;
  const name = profile.nickname || profile.username || "أوتاكو";

  return (
    <div dir="rtl" className="min-h-screen text-right">
      <main className="mx-auto max-w-screen-md px-4 py-4 pb-28">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" /> العودة
        </button>

        <Card className="relative overflow-hidden border-border/60 bg-card/40 p-0 backdrop-blur-xl">
          <div
            className="relative h-32 bg-gradient-to-l from-primary/40 via-accent/30 to-primary/20"
            style={
              profile.cover_url
                ? { backgroundImage: `url(${profile.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" }
                : undefined
            }
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>
          <div className="-mt-12 flex flex-col items-center px-5 pb-5">
            <div className="rounded-full bg-gradient-primary p-[3px] shadow-neon">
              <Avatar className="h-24 w-24 ring-2 ring-background">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback className="bg-card text-2xl">{name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <h1 className="mt-3 text-xl font-black text-gradient">{name}</h1>
            {profile.username && (
              <p dir="ltr" className="mt-0.5 text-xs text-muted-foreground">@{profile.username}</p>
            )}
            {profile.bio && (
              <p className="mt-2 line-clamp-3 max-w-md text-xs text-muted-foreground">{profile.bio}</p>
            )}

            <div className="mt-3 flex items-center gap-4 text-xs">
              <div className="text-center">
                <p className="font-bold tabular-nums">{followers}</p>
                <p className="text-muted-foreground">متابِع</p>
              </div>
              <div className="text-center">
                <p className="font-bold tabular-nums">{followingCount}</p>
                <p className="text-muted-foreground">يتابع</p>
              </div>
              <div className="text-center">
                <p className="font-bold tabular-nums">Lv.{lvl.level}</p>
                <p className="text-muted-foreground">المستوى</p>
              </div>
            </div>

            {!isMe && (
              <div className="mt-4 flex w-full max-w-xs items-center gap-2">
                <FollowButton
                  targetUserId={profile.id}
                  className="flex-1"
                  onChange={() => void load()}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openChat}
                  disabled={opening}
                  className="h-8 flex-1 gap-1 border-primary/40"
                >
                  {opening ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageCircle className="h-3.5 w-3.5" />}
                  <span className="text-xs">دردشة</span>
                </Button>
              </div>
            )}
            {isMe && (
              <Button asChild size="sm" variant="outline" className="mt-4 h-8 gap-1 text-xs">
                <Link to="/profile">تعديل ملفي</Link>
              </Button>
            )}
          </div>
        </Card>

        {/* Level + points */}
        <Card className="mt-4 border-border/60 bg-card/40 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">المستوى</p>
              <h2 className="text-3xl font-black text-gradient">Lv.{lvl.level}</h2>
            </div>
            <div className="text-end">
              <p className="text-xs text-muted-foreground">النقاط</p>
              <div className="flex items-center justify-end gap-1.5">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <span className="text-3xl font-black tabular-nums">{profile.points}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted/50 ring-1 ring-border/60">
            <div
              className="h-full rounded-full bg-gradient-to-l from-cyan-400 via-fuchsia-500 to-purple-600 shadow-[0_0_12px_rgba(168,85,247,0.6)]"
              style={{ width: `${lvl.pct}%` }}
            />
          </div>
        </Card>

        {/* Otaku DNA */}
        <Card className="mt-4 border-border/60 bg-card/40 p-5 backdrop-blur-xl">
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-black text-gradient">هوية الأوتاكو</h3>
          </div>
          <div className="grid gap-4 text-sm">
            <Field icon={<Calendar className="h-4 w-4 text-primary" />} label="سنوات المشاهدة">
              {profile.years_watching != null ? `${profile.years_watching} سنة` : "—"}
            </Field>
            <TagField
              icon={<Eye className="h-4 w-4 text-primary" />}
              label="أنميات شاهدتها"
              tags={profile.watch_history}
              tone="muted"
            />
            <TagField
              icon={<Heart className="h-4 w-4 text-rose-400" />}
              label="الأنميات المفضلة"
              tags={profile.favorites}
              tone="hot"
            />
            <TagField
              icon={<Bookmark className="h-4 w-4 text-cyan-300" />}
              label="أنوي مشاهدتها"
              tags={profile.watchlist}
              tone="cool"
            />
          </div>
        </Card>

        {/* Gifts museum */}
        <Card className="mt-4 border-border/60 bg-card/40 p-5 backdrop-blur-xl">
          <div className="mb-3 flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-300" />
            <h3 className="text-lg font-black text-gradient">هدايا تم استلامها</h3>
          </div>
          {gifts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 py-8 text-center">
              <GiftIcon className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">لا توجد هدايا بعد.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {gifts.map((r, idx) => {
                const g = r.gift!;
                const styles = RARITY_STYLES[g.rarity];
                return (
                  <div key={`${g.id}-${idx}`} className="flex flex-col items-center gap-1">
                    <div className={`relative flex h-14 w-14 items-center justify-center rounded-full ${styles.bg} ring-2 ring-inset ${styles.ring}`}>
                      <img src={g.image_url} alt={g.name} loading="lazy" className="h-10 w-10 object-contain" />
                    </div>
                    <span className="line-clamp-1 w-full text-center text-[10px] text-muted-foreground">
                      {g.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
          <ImageIcon className="h-3 w-3" /> ملف عام لأي أوتاكو في الشبكة
        </div>
      </main>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/40 bg-muted/10 p-3">
      <div className="mb-1 flex items-center gap-2 text-xs font-bold text-muted-foreground">
        {icon} {label}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function TagField({
  icon,
  label,
  tags,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tags: string[];
  tone: "muted" | "hot" | "cool";
}) {
  const cls =
    tone === "hot"
      ? "border-rose-400/40 bg-rose-500/15 text-rose-100 shadow-[0_0_10px_rgba(244,63,94,0.35)]"
      : tone === "cool"
      ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-100"
      : "border-border/60 bg-muted/30 text-foreground";
  return (
    <Field icon={icon} label={label}>
      {tags.length === 0 ? (
        <span className="text-xs text-muted-foreground">—</span>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${cls}`}>
              {t}
            </span>
          ))}
        </div>
      )}
    </Field>
  );
}
