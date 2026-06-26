import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Loader2, UserCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface Props {
  targetUserId: string;
  size?: "sm" | "default";
  className?: string;
  onChange?: (following: boolean) => void;
}

export function FollowButton({ targetUserId, size = "sm", className, onChange }: Props) {
  const { user } = useAuth();
  const [following, setFollowing] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || user.id === targetUserId) return;
    void (async () => {
      const { data } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
        .maybeSingle();
      setFollowing(!!data);
    })();
  }, [user, targetUserId]);

  if (!user || user.id === targetUserId || following === null) return null;

  async function toggle() {
    if (!user) return;
    setBusy(true);
    if (following) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId);
      if (error) toast.error(error.message);
      else {
        setFollowing(false);
        onChange?.(false);
      }
    } else {
      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: user.id, following_id: targetUserId });
      if (error) toast.error(error.message);
      else {
        setFollowing(true);
        onChange?.(true);
        toast.success("بدأت المتابعة ✨");
      }
    }
    setBusy(false);
  }

  return (
    <Button
      type="button"
      size={size}
      variant={following ? "outline" : "default"}
      onClick={toggle}
      disabled={busy}
      className={
        (following
          ? "h-8 gap-1 border-primary/40 text-foreground"
          : "h-8 gap-1 bg-gradient-primary text-primary-foreground shadow-neon") +
        (className ? ` ${className}` : "")
      }
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : following ? (
        <UserCheck className="h-3.5 w-3.5" />
      ) : (
        <UserPlus className="h-3.5 w-3.5" />
      )}
      <span className="text-xs">{following ? "تتابعه" : "متابعة"}</span>
    </Button>
  );
}
