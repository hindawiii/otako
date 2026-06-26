import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send, Gift as GiftIcon, ArrowRight } from "lucide-react";
import { GiftPicker } from "@/components/GiftPicker";
import { LegendaryGiftVFX } from "@/components/LegendaryGiftVFX";

export const Route = createFileRoute("/chat/$conversationId")({
  head: () => ({ meta: [{ title: "محادثة — أوتاكو" }] }),
  component: ChatRoom,
});

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  kind: string;
  gift_id: string | null;
  created_at: string;
}

interface GiftMeta {
  id: string;
  name: string;
  image_url: string;
  rarity: string;
}

interface OtherUser {
  id: string;
  nickname: string | null;
  username: string | null;
  avatar_url: string | null;
}

function ChatRoom() {
  const { conversationId } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [other, setOther] = useState<OtherUser | null>(null);
  const [gifts, setGifts] = useState<Map<string, GiftMeta>>(new Map());
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(true);
  const [sending, setSending] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [burstId, setBurstId] = useState<string | null>(null);
  const [legendaryGift, setLegendaryGift] = useState<GiftMeta | null>(null);
  const seenRef = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    void boot();
    const ch = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        async (payload) => {
          const m = payload.new as MessageRow;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
          let meta: GiftMeta | undefined = m.gift_id ? gifts.get(m.gift_id) : undefined;
          if (m.gift_id && !meta) {
            const { data } = await supabase
              .from("gift_catalog")
              .select("id,name,image_url,rarity")
              .eq("id", m.gift_id)
              .maybeSingle();
            if (data) {
              meta = data as GiftMeta;
              setGifts((prev) => {
                const next = new Map(prev);
                next.set(data.id, data as GiftMeta);
                return next;
              });
            }
          }
          if (m.kind === "gift" && m.sender_id !== user.id) {
            if (meta?.rarity === "legendary" || meta?.rarity === "mythic") {
              setLegendaryGift(meta);
            } else {
              setBurstId(m.id);
              setTimeout(() => setBurstId(null), 1900);
            }
          }
        },
      )
      .subscribe();
    return () => void supabase.removeChannel(ch);
  }, [user, conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function boot() {
    setBusy(true);
    const [{ data: msgs }, { data: parts }] = await Promise.all([
      supabase
        .from("messages")
        .select("id,conversation_id,sender_id,content,kind,gift_id,created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(200),
      supabase
        .from("conversation_participants")
        .select("user_id, profiles:profiles!conversation_participants_user_id_fkey(id,nickname,username,avatar_url)")
        .eq("conversation_id", conversationId),
    ]);
    setMessages((msgs as MessageRow[]) ?? []);
    const otherPart = (parts ?? []).find((p: any) => p.user_id !== user!.id) as any;
    setOther(otherPart?.profiles ?? null);
    const giftIds = [...new Set((msgs ?? []).map((m) => m.gift_id).filter(Boolean) as string[])];
    if (giftIds.length) await loadGiftMeta(giftIds);
    setBusy(false);
  }

  async function loadGiftMeta(ids: string[]) {
    const { data } = await supabase
      .from("gift_catalog")
      .select("id,name,image_url,rarity")
      .in("id", ids);
    if (data) {
      setGifts((prev) => {
        const next = new Map(prev);
        data.forEach((g) => next.set(g.id, g as GiftMeta));
        return next;
      });
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || sending || !user) return;
    setSending(true);
    setInput("");
    const { error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: user.id, content: text, kind: "text" });
    if (error) setInput(text);
    setSending(false);
  }

  if (loading || !user || busy) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const otherName = other?.nickname || other?.username || "مستخدم";

  return (
    <div dir="rtl" className="mx-auto flex h-[calc(100vh-3.5rem-5rem)] max-w-screen-md flex-col text-right">
      {/* Frosted header */}
      <div
        dir="rtl"
        className="flex items-center gap-3 border-b border-border/60 bg-card/40 px-4 py-3 backdrop-blur-xl"
      >
        {other ? (
          <Link
            to="/u/$userId"
            params={{ userId: other.id }}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/40">
              <AvatarImage src={other.avatar_url ?? undefined} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                {otherName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 text-right">
              <h2 className="truncate font-bold hover:text-primary">{otherName}</h2>
              <p className="text-[11px] text-muted-foreground">عرض الملف</p>
            </div>
          </Link>
        ) : (
          <div className="min-w-0 flex-1 text-right">
            <h2 className="truncate font-bold">{otherName}</h2>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/chat" })}
          aria-label="رجوع"
          className="shrink-0 text-muted-foreground hover:text-primary"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} dir="rtl" className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {messages.map((m) => {
          const mine = m.sender_id === user.id;
          const gift = m.gift_id ? gifts.get(m.gift_id) : null;
          return (
            <div key={m.id} dir="rtl" className="flex w-full">
              <div
                className={
                  "relative max-w-[78%] rounded-2xl px-3 py-2 text-right backdrop-blur-xl " +
                  (mine
                    ? "ms-auto bg-gradient-primary text-primary-foreground shadow-neon"
                    : "me-auto border border-border/60 bg-card/60")
                }
              >
                {gift ? (
                  <Card
                    dir="rtl"
                    className="flex items-center gap-2 border-0 bg-transparent p-0 text-inherit shadow-none"
                  >
                    <img src={gift.image_url} alt={gift.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                    <div className="text-right">
                      <div className="text-xs font-black">🎁 {gift.name}</div>
                      <div className="text-[10px] opacity-80">{gift.rarity}</div>
                    </div>
                  </Card>
                ) : (
                  <p dir="rtl" className="whitespace-pre-wrap break-words text-right text-sm">
                    {m.content}
                  </p>
                )}
                <div dir="ltr" className="mt-1 text-end text-[10px] opacity-70">
                  {new Date(m.created_at).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}
                </div>
                {burstId === m.id && (
                  <div aria-hidden className="neon-burst pointer-events-none absolute inset-0 rounded-2xl" />
                )}
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">قل مرحباً 👋</div>
        )}
      </div>

      {/* Composer */}
      <div
        dir="rtl"
        className="flex items-center gap-2 border-t border-border/60 bg-card/40 p-3 backdrop-blur-xl"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowPicker(true)}
          aria-label="إرسال هدية"
          className="shrink-0 border-primary/40 text-accent hover:bg-primary/10"
        >
          <GiftIcon className="h-5 w-5" />
        </Button>
        <Input
          dir="rtl"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), void send())}
          placeholder="اكتب رسالة..."
          className="flex-1 text-right"
        />
        <Button
          onClick={() => void send()}
          disabled={sending || !input.trim()}
          size="icon"
          className="shrink-0 bg-gradient-primary text-primary-foreground shadow-neon"
          aria-label="إرسال"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      <GiftPicker
        open={showPicker}
        onOpenChange={setShowPicker}
        userId={user.id}
        onPick={async (g) => {
          await supabase.from("messages").insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content: g.name,
            kind: "gift",
            gift_id: g.id,
          });
          setShowPicker(false);
        }}
      />

      {legendaryGift && (
        <LegendaryGiftVFX
          imageUrl={legendaryGift.image_url}
          name={legendaryGift.name}
          rarity={legendaryGift.rarity}
          fromName={otherName}
          onClose={() => setLegendaryGift(null)}
        />
      )}
    </div>
  );
}
