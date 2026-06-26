import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Gift, Trash2, MoreVertical, Flag, Pencil } from "lucide-react";
import { useNavigate, Link } from "@tanstack/react-router";
import { timeAgo } from "@/lib/arena-utils";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportDialog } from "@/components/ReportDialog";
import { CommentsPanel } from "@/components/CommentsPanel";
import { EditPostDialog } from "@/components/EditPostDialog";
import { FollowButton } from "@/components/FollowButton";

export interface PostRow {
  id: string;
  creator_id: string;
  content_text: string | null;
  media_url: string | null;
  media_type: string;
  visible_duration: string;
  created_at: string;
  profile?: { nickname: string | null; username: string | null; avatar_url: string | null };
}

export function PostCard({ post, onDeleted, onUpdated }: { post: PostRow; onDeleted?: () => void; onUpdated?: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => { void refresh(); }, [post.id]);

  async function refresh() {
    const [{ count: lc }, { count: cc }, mineRes] = await Promise.all([
      supabase.from("post_likes").select("*", { count: "exact", head: true }).eq("post_id", post.id),
      supabase.from("post_comments").select("*", { count: "exact", head: true }).eq("post_id", post.id),
      user
        ? supabase.from("post_likes").select("user_id").eq("post_id", post.id).eq("user_id", user.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    setLikes(lc ?? 0);
    setCommentCount(cc ?? 0);
    setLiked(!!mineRes.data);
  }

  async function toggleLike() {
    if (!user) return;
    if (liked) await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user.id);
    else await supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id });
    void refresh();
  }

  async function openChat() {
    if (!user) return;
    const { data, error } = await supabase.rpc("get_or_create_conversation", { _other_user: post.creator_id });
    if (error || !data) { toast.error(error?.message ?? "تعذر فتح المحادثة"); return; }
    navigate({ to: "/chat/$conversationId", params: { conversationId: data as string } });
  }

  async function sendGift() {
    return openChat();
  }

  async function handleDelete() {
    if (!confirm("حذف المنشور؟")) return;
    await supabase.from("posts").delete().eq("id", post.id);
    onDeleted?.();
  }

  const isOwner = user?.id === post.creator_id;

  return (
    <Card className="overflow-hidden border-border/40 bg-card/40 p-0 backdrop-blur-xl">
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          <Link
            to="/u/$userId"
            params={{ userId: post.creator_id }}
            className="flex items-center gap-3"
          >
            <div className="h-10 w-10 overflow-hidden rounded-full bg-primary/15 ring-2 ring-primary/30">
              {post.profile?.avatar_url ? (
                <img src={post.profile.avatar_url} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-bold text-primary">
                  {(post.profile?.nickname ?? "?")[0]}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-bold hover:text-primary">{post.profile?.nickname ?? "أوتاكو"}</p>
              <p className="text-[11px] text-muted-foreground">{timeAgo(post.created_at)}</p>
            </div>
          </Link>
          {!isOwner && (
            <>
              <FollowButton targetUserId={post.creator_id} />
              <button
                type="button"
                onClick={openChat}
                aria-label="بدء محادثة"
                title="بدء محادثة"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition hover:bg-primary/20 hover:shadow-neon"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full p-1.5 text-muted-foreground hover:bg-muted/40 hover:text-foreground" aria-label="خيارات">
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="border-border/50 bg-background/90 text-right backdrop-blur-xl">
            {isOwner ? (
              <>
                <DropdownMenuItem onClick={() => setEditOpen(true)} className="gap-2">
                  <Pencil className="h-4 w-4" /> تعديل المنشور
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="gap-2 text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4" /> حذف المنشور
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={() => setReportOpen(true)} className="gap-2 text-destructive focus:text-destructive">
                <Flag className="h-4 w-4" /> إبلاغ عن المنشور
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ReportDialog
        open={reportOpen} onOpenChange={setReportOpen}
        resourceType="post" resourceId={post.id} reportedProfileId={post.creator_id}
      />
      <EditPostDialog post={post} open={editOpen} onOpenChange={setEditOpen} onSaved={onUpdated} />

      {post.content_text && (
        <p className="px-4 pb-3 text-sm leading-relaxed whitespace-pre-wrap">{post.content_text}</p>
      )}

      {post.media_url && post.media_type === "image" && (
        <img src={post.media_url} alt="" loading="lazy" decoding="async" className="max-h-[500px] w-full object-cover" />
      )}
      {post.media_url && post.media_type === "video" && (
        <video src={post.media_url} controls preload="none" className="max-h-[500px] w-full" />
      )}
      {post.media_url && post.media_type === "video_link" && (
        <div className="aspect-video w-full bg-black">
          <iframe src={post.media_url} loading="lazy" className="h-full w-full" allow="autoplay; encrypted-media" allowFullScreen />
        </div>
      )}

      <div className="flex items-center justify-around border-t border-border/40 px-2 py-2">
        <button onClick={toggleLike}
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs transition ${liked ? "text-neon-orange" : "text-muted-foreground hover:text-foreground"}`}>
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
          {likes}
        </button>
        <button onClick={() => setShowComments((v) => !v)}
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs transition ${showComments ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <MessageCircle className="h-4 w-4" />
          {commentCount}
        </button>
        {!isOwner && (
          <button onClick={sendGift}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs text-accent hover:text-accent">
            <Gift className="h-4 w-4" /> هدية
          </button>
        )}
      </div>

      {showComments && (
        <CommentsPanel postId={post.id} onCountChange={setCommentCount} />
      )}
    </Card>
  );
}
