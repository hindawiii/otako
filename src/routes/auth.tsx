import { createFileRoute, Navigate } from "@tanstack/react-router";

// ─────────────────────────────────────────────────────────────
// TODO: إعادة تفعيل صفحة تسجيل الدخول
// راجع AUTH_ROADMAP.md للخطوات الكاملة.
// الكود الأصلي للصفحة محفوظ في git history (قبل تعطيل المصادقة).
// عند إعادة التفعيل:
//   1. استعد الكود من git history (commit قبل التعطيل)
//   2. أعد تفعيل supabase.auth.signInWithPassword
//   3. أعد ظهور أزرار "تسجيل الدخول" / "إنشاء حساب" في الواجهة
//   4. أعد توجيه /auth إلى هذه الصفحة بدل /
// ─────────────────────────────────────────────────────────────

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "أوتاكو" }] }),
  component: AuthDisabled,
});

function AuthDisabled() {
  // المصادقة معطّلة مؤقتًا — الجميع يدخل كضيف.
  return <Navigate to="/" replace />;
}
