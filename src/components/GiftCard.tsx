import { Card } from "@/components/ui/card";
import { RARITY_LABELS, RARITY_STYLES, type Rarity } from "@/lib/gift-utils";
import { Coins } from "lucide-react";

export interface GiftCardData {
  id: string;
  name: string;
  image_url: string;
  rarity: Rarity;
  price_points: number;
  is_free_daily?: boolean;
}

interface Props {
  gift: GiftCardData;
  quantity?: number;
  onClick?: () => void;
  selected?: boolean;
  showPrice?: boolean;
}

export function GiftCard({ gift, quantity, onClick, selected, showPrice }: Props) {
  const styles = RARITY_STYLES[gift.rarity];
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative w-full text-start",
        onClick ? "cursor-pointer" : "cursor-default",
      ].join(" ")}
    >
      <Card
        className={[
          "relative overflow-hidden p-2 transition-all",
          "ring-2 ring-inset",
          styles.ring,
          selected ? "scale-95 ring-4 ring-primary" : onClick ? "hover:scale-[1.03] hover:-translate-y-0.5" : "",
        ].join(" ")}
      >
        <div className={`relative aspect-square w-full overflow-hidden rounded-lg ${styles.bg}`}>
          <img
            src={gift.image_url}
            alt={gift.name}
            loading="lazy"
            width={256}
            height={256}
            className="h-full w-full object-contain p-1 transition-transform group-hover:scale-110"
          />
          {quantity != null && quantity > 0 && (
            <span className="absolute end-1 top-1 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-bold backdrop-blur">
              ×{quantity}
            </span>
          )}
        </div>
        <div className="mt-2 px-1">
          <p className="truncate text-xs font-bold">{gift.name}</p>
          <div className="mt-0.5 flex items-center justify-between">
            <span className={`text-[10px] font-semibold ${styles.text}`}>{RARITY_LABELS[gift.rarity]}</span>
            {showPrice && gift.price_points > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400">
                <Coins className="h-3 w-3" />
                {gift.price_points}
              </span>
            )}
            {showPrice && gift.is_free_daily && (
              <span className="text-[10px] font-bold text-emerald-400">مجاني</span>
            )}
          </div>
        </div>
      </Card>
    </button>
  );
}
