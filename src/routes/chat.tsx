import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, MessageCircle, Search, Loader as LoaderIcon } from "lucide-react";
import { toast } from "sonner";

interface ProfileSearchRow {
  id: string;
  username: string | null;
  nickname: string | null;
  avatar_url: string | null;
}

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "الرسائل — أوتاكو" }] }),
  component: ChatLayout,
});

interface ConvRow {
  conversation_id: string;
  other: { id: string; nickname: string | null; username: string | null; avatar_url: string | null } | null;
  last: { content: string; created_at: string; kind: string } | null;
  last_message_at: string;
}

function ChatLayout() {
  const { pathname } = useLocation();
  // If we're inside a specific conversation, render the child route only.
  if (pathname !== "/chat") return <Outlet />;
  return <ChatList />;
}

function ChatList() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ConvRow[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    void load();
    const ch = supabase
      .channel("chat-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => void load())
      .subscribe();
    return () => void supabase.removeChannel(ch);
  }, [user]);

  async function load() {
    if (!user) return;
    setBusy(true);
    const { data: parts } = await supabase
      .from("conversation_participants")
      .select("conversation_id, archived, conversations!inner(id,last_message_at)")
      .eq("user_id", user.id)
      .eq("archived", false);

    const convIds = (parts ?? []).map((p) => p.conversation_id);
    if (convIds.length === 0) {
      setItems([]);
      setBusy(false);
      return;
    }

    const [{ data: others }, { data: lasts }] = await Promise.all([
      supabase
        .from("conversation_participants")
        .select("conversation_id, user_id, profiles:profiles!conversation_participants_user_id_fkey(id,nickname,username,avatar_url)")
        .in("conversation_id", convIds)
        .neq("user_id", user.id),
      supabase
        .from("messages")
        .select("conversation_id, content, created_at, kind")
        .in("conversation_id", convIds)
        .order("created_at", { ascending: false }),
    ]);

    const otherMap = new Map<string, ConvRow["other"]>();
    (others ?? []).forEach((o: any) => otherMap.set(o.conversation_id, o.profiles ?? null));
    const lastMap = new Map<string, ConvRow["last"]>();
    (lasts ?? []).forEach((m: any) => {
      if (!lastMap.has(m.conversation_id)) lastMap.set(m.conversation_id, m);
    });

    const rows: ConvRow[] = (parts ?? [])
      .map((p: any) => ({
        conversation_id: p.conversation_id,
        other: otherMap.get(p.conversation_id) ?? null,
        last: lastMap.get(p.conversation_id) ?? null,
        last_message_at: p.conversations?.last_message_at ?? "",
      }))
      .sort((a, b) => (b.last_message_at > a.last_message_at ? 1 : -1));

    setItems(rows);
    setBusy(false);
  }

  if (loading || !user || busy) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="mx-auto max-w-screen-md px-4 py-4 pb-28 text-right">
      <ChatHomeHeader currentUserId={user.id} />
      {items.length === 0 ? (
        <Card className="border-border/60 bg-card/40 p-10 text-center backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-neon">
            <MessageCircle className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-bold">لا توجد محادثات بعد</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            ابدأ محادثة من خلال الضغط على زر الرسائل في أي منشور بساحة الأوتاكو.
          </p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {items.map((row) => {
            const name = row.other?.nickname || row.other?.username || "مستخدم";
            const initial = name.charAt(0);
            const preview =
              row.last?.kind === "gift"
                ? "🎁 هدية مميزة"
                : row.last?.content || "ابدأ المحادثة";
            return (
              <li key={row.conversation_id}>
                <Link
                  to="/chat/$conversationId"
                  params={{ conversationId: row.conversation_id }}
                  className="block"
                >
                  <Card
                    dir="rtl"
                    className="flex flex-row items-center gap-3 border-border/60 bg-card/40 p-3 text-right backdrop-blur-xl transition hover:border-primary/40 hover:shadow-neon"
                  >
                    <Avatar className="h-12 w-12 shrink-0 ring-2 ring-primary/30">
                      <AvatarImage src={row.other?.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 text-right">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate font-bold">{name}</h3>
                        {row.last?.created_at && (
                          <span dir="ltr" className="shrink-0 text-[10px] text-muted-foreground">
                            {formatTime(row.last.created_at)}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{preview}</p>
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("ar", { day: "2-digit", month: "2-digit" });
}

function ChatHomeHeader({ currentUserId }: { currentUserId: string }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ProfileSearchRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [opening, setOpening] = useState<string | null>(null);

  const term = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    if (term.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id,username,nickname,avatar_url")
        .neq("id", currentUserId)
        .or(`username.ilike.%${term}%,nickname.ilike.%${term}%`)
        .limit(8);
      if (!cancelled) {
        setResults((data ?? []) as ProfileSearchRow[]);
        setSearching(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [term, currentUserId]);

  async function openChatWith(otherId: string) {
    setOpening(otherId);
    const { data, error } = await supabase.rpc("get_or_create_conversation", { _other_user: otherId });
    setOpening(null);
    if (error || !data) {
      toast.error("تعذر فتح المحادثة");
      return;
    }
    setQ("");
    setResults([]);
    navigate({ to: "/chat/$conversationId", params: { conversationId: data as string } });
  }

  return (
    <div dir="rtl" className="mb-4 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gradient">محادثاتي</h1>
      </div>
      <div className="relative">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          dir="rtl"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="بحث عن مستخدم..."
          className="border-border/60 bg-card/40 pe-3 ps-10 text-right backdrop-blur-xl"
        />
        {searching && (
          <LoaderIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
        )}
      </div>
      {results.length > 0 && (
        <Card dir="rtl" className="border-border/60 bg-card/60 p-2 backdrop-blur-xl">
          <ul className="space-y-1">
            {results.map((p) => {
              const name = p.nickname || p.username || "مستخدم";
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    disabled={opening === p.id}
                    onClick={() => void openChatWith(p.id)}
                    className="flex w-full items-center gap-3 rounded-lg p-2 text-right transition hover:bg-primary/10 disabled:opacity-60"
                  >
                    <Avatar className="h-9 w-9 ring-2 ring-primary/30">
                      <AvatarImage src={p.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                        {name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 text-right">
                      <div className="truncate text-sm font-bold">{name}</div>
                      {p.username && (
                        <div className="truncate text-[11px] text-muted-foreground">@{p.username}</div>
                      )}
                    </div>
                    {opening === p.id && <LoaderIcon className="h-4 w-4 animate-spin text-primary" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
      {term.length >= 2 && !searching && results.length === 0 && (
        <p className="text-xs text-muted-foreground">لا يوجد مستخدم بهذا الاسم.</p>
      )}
    </div>
  );
}
