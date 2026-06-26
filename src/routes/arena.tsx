import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mic } from "lucide-react";
import { StoryBar } from "@/components/StoryBar";
import { PostComposer } from "@/components/PostComposer";
import { PostCard, type PostRow } from "@/components/PostCard";
import { VoiceRooms } from "@/components/VoiceRooms";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/arena")({
  head: () => ({ meta: [{ title: "ساحة الأوتاكو — أوتاكو" }] }),
  component: ArenaPage,
});

const PAGE_SIZE = 10;

function ArenaPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const loadInitial = useCallback(async () => {
    setFeedLoading(true);
    const rows = await fetchPage(0);
    setPosts(rows);
    setHasMore(rows.length === PAGE_SIZE);
    setFeedLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    void loadInitial();
    const ch = supabase
      .channel("arena-posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, () => void loadInitial())
      .subscribe();
    return () => void supabase.removeChannel(ch);
  }, [user, loadInitial]);

  async function fetchPage(offset: number): Promise<PostRow[]> {
    const { data: rows } = await supabase
      .from("posts")
      .select("id,creator_id,content_text,media_url,media_type,visible_duration,created_at")
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
    if (!rows?.length) return [];
    const ids = [...new Set(rows.map((r) => r.creator_id))];
    const { data: profs } = await supabase
      .from("profiles").select("id,nickname,username,avatar_url").in("id", ids);
    const map = new Map(profs?.map((p) => [p.id, p]) ?? []);
    return rows.map((r) => ({ ...r, profile: map.get(r.creator_id) ?? undefined }));
  }

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const next = await fetchPage(posts.length);
    setPosts((prev) => [...prev, ...next]);
    if (next.length < PAGE_SIZE) setHasMore(false);
    setLoadingMore(false);
  }

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const el = sentinelRef.current;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) void loadMore();
    }, { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, posts.length, loadingMore]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="mx-auto max-w-screen-md px-4 py-4 pb-28 text-right">
      <Tabs defaultValue="feed" className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-2 border border-border/60 bg-card/40 backdrop-blur-xl">
          <TabsTrigger value="feed"
            className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon">
            الساحة العامة
          </TabsTrigger>
          <TabsTrigger value="rooms"
            className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon">
            <Mic className="ms-1 h-4 w-4" />
            الغرف الصوتية
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-4 space-y-4">
          <StoryBar />
          <PostComposer onPosted={loadInitial} />
          <div className="space-y-4">
            {feedLoading && posts.length === 0 ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-10 text-center text-sm text-muted-foreground backdrop-blur-xl">
                لا توجد منشورات بعد. كن أول من يبدأ الساحة 🔥
              </div>
            ) : (
              <>
                {posts.map((p) => (
                  <PostCard key={p.id} post={p} onDeleted={loadInitial} onUpdated={loadInitial} />
                ))}
                <div ref={sentinelRef} className="flex h-12 items-center justify-center">
                  {loadingMore && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                  {!hasMore && posts.length > 0 && (
                    <span className="text-[11px] text-muted-foreground">— نهاية الساحة —</span>
                  )}
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rooms" className="mt-4">
          <VoiceRooms />
        </TabsContent>
      </Tabs>
    </div>
  );
}
