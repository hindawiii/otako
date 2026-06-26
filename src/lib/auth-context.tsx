import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// ─────────────────────────────────────────────────────────────
// TODO: إعادة تفعيل تسجيل الدخول
// راجع AUTH_ROADMAP.md
// حاليًا: دخول ضيف تلقائي بدون Supabase auth
// لإعادة التفعيل: استبدل GUEST AUTO-LOGIN block بمنطق Supabase الأصلي
// (محفوظ في git history / في ملف auth.tsx كـ comment).
// ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isGuest: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getOrCreateGuestId(): string {
  if (typeof window === "undefined") return "guest_ssr";
  let guestId = window.localStorage.getItem("guest_id");
  if (!guestId) {
    guestId =
      "guest_" +
      Date.now() +
      "_" +
      Math.random().toString(36).substring(2, 11);
    window.localStorage.setItem("guest_id", guestId);
    window.localStorage.setItem("guest_created", new Date().toISOString());
  }
  return guestId;
}

function buildGuestUser(): User {
  const id = getOrCreateGuestId();
  const guestData = {
    id,
    name: "ضيف",
    email: null,
    isGuest: true,
    loginAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem("user", JSON.stringify(guestData));
  }
  // Minimal shape compatible with Supabase User; cast for typing.
  return {
    id,
    app_metadata: { provider: "guest" },
    user_metadata: { nickname: "ضيف", username: "guest", is_guest: true },
    aud: "guest",
    created_at: new Date().toISOString(),
    email: undefined,
  } as unknown as User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // GUEST AUTO-LOGIN — مرحلة تجريبية
    const guest = buildGuestUser();
    setUser(guest);
    setIsGuest(true);
    setSession(null);
    setLoading(false);
    // eslint-disable-next-line no-console
    console.log("✅ Guest logged in:", guest.id);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isGuest,
        signOut: async () => {
          // مسح بيانات الضيف
          if (typeof window !== "undefined") {
            const guestId = window.localStorage.getItem("guest_id");
            if (guestId) {
              Object.keys(window.localStorage).forEach((key) => {
                if (key.startsWith(`guest_${guestId}`)) {
                  window.localStorage.removeItem(key);
                }
              });
            }
            window.localStorage.removeItem("guest_id");
            window.localStorage.removeItem("guest_created");
            window.localStorage.removeItem("user");
            window.localStorage.removeItem("otaku:lastTab");
          }
          try { await supabase.auth.signOut(); } catch { /* ignore */ }
          // أعد تحميل لإنشاء ضيف جديد
          if (typeof window !== "undefined") window.location.reload();
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
