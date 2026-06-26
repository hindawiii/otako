export type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";
export type Arc = "pirates" | "shinobi" | "dragons" | "luxury" | "attacks";

export const ARC_LABELS: Record<Arc, string> = {
  pirates: "🏴‍☠️ القراصنة",
  shinobi: "🥷 الشينوبي",
  dragons: "🐉 التنانين",
  luxury: "💎 الفخامة",
  attacks: "⚔️ الهجمات",
};

export const RARITY_LABELS: Record<Rarity, string> = {
  common: "عادي",
  rare: "نادر",
  epic: "ملحمي",
  legendary: "أسطوري",
  mythic: "خرافي",
};

// Tailwind classes for rarity glow / border
export const RARITY_STYLES: Record<Rarity, { ring: string; text: string; bg: string }> = {
  common: { ring: "ring-border", text: "text-muted-foreground", bg: "bg-muted/40" },
  rare: { ring: "ring-sky-500/60", text: "text-sky-400", bg: "bg-sky-500/10" },
  epic: { ring: "ring-fuchsia-500/60", text: "text-fuchsia-400", bg: "bg-fuchsia-500/10" },
  legendary: { ring: "ring-amber-400/70", text: "text-amber-300", bg: "bg-amber-500/10" },
  mythic: { ring: "ring-orange-500/80 animate-pulse", text: "text-orange-300", bg: "bg-gradient-to-br from-orange-500/20 to-blue-500/20" },
};

export function isRare(r: Rarity) {
  return r === "epic" || r === "legendary" || r === "mythic";
}
