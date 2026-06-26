// تخزين تفضيلات الضيف في localStorage بدون تسجيل دخول.
// TODO: عند إعادة تفعيل تسجيل الدخول، رحّل هذه البيانات إلى جدول profiles.
function getGuestId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("guest_id");
}

export const guestStorage = {
  set(key: string, value: unknown) {
    const guestId = getGuestId();
    if (!guestId) return;
    window.localStorage.setItem(
      `guest_${guestId}_${key}`,
      JSON.stringify(value),
    );
  },
  get<T = unknown>(key: string, defaultValue: T | null = null): T | null {
    const guestId = getGuestId();
    if (!guestId) return defaultValue;
    const item = window.localStorage.getItem(`guest_${guestId}_${key}`);
    if (!item) return defaultValue;
    try { return JSON.parse(item) as T; } catch { return defaultValue; }
  },
  clear() {
    const guestId = getGuestId();
    if (!guestId) return;
    Object.keys(window.localStorage).forEach((key) => {
      if (key.startsWith(`guest_${guestId}`)) {
        window.localStorage.removeItem(key);
      }
    });
    window.localStorage.removeItem("guest_id");
    window.localStorage.removeItem("guest_created");
    window.localStorage.removeItem("user");
  },
};
