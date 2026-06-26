import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GiftCard, type GiftCardData } from "@/components/GiftCard";
import { Button } from "@/components/ui/button";
import { Loader2, Gift as GiftIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Arc, Rarity } from "@/lib/gift-utils";
import { ARC_LABELS } from "@/lib/gift-utils";

interface OwnedGift extends GiftCardData {
  arc: Arc;
  rarity: Rarity;
  quantity: number;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  onPick: (gift: OwnedGift) => Promise<void> | void;
}

export function GiftPicker({ open, onOpenChange, userId, onPick }: Props) {
  const [items, setItems] = useState<OwnedGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: inv } = await supabase
        .from("user_gifts")
        .select("quantity, gift_id, gift_catalog(*)")
        .eq("user_id", userId)
        .gt("quantity", 0);
      if (cancelled) return;
      const list: OwnedGift[] = [];
      for (const r of inv ?? []) {
        const g = r.gift_catalog as unknown as { id: string; name: string; image_url: string; rarity: Rarity; arc: Arc; price_points: number; is_free_daily: boolean } | null;
        if (g) list.push({ ...g, quantity: r.quantity });
      }
      setItems(list);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [open, userId]);

  const selected = items.find((g) => g.id === selectedId) ?? null;

  const handleSend = async () => {
    if (!selected) return;
    setSending(true);
    try { await onPick(selected); onOpenChange(false); setSelectedId(null); }
    finally { setSending(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-hidden p-0">
        <DialogHeader className="border-b border-border/60 p-4">
          <DialogTitle className="text-gradient text-lg font-black">🎁 اختر هدية لإرسالها</DialogTitle>
        </DialogHeader>

        <div className="max-h-[55vh] overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : items.length === 0 ? (
            <div className="space-y-3 py-6 text-center">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <GiftIcon className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">حقيبتك فارغة!</p>
              <Button asChild size="sm" className="bg-gradient-primary text-primary-foreground shadow-neon">
                <Link to="/gifts-manga">اذهب للمتجر</Link>
              </Button>
            </div>
          ) : (
            (() => {
              const groups: Record<Arc, OwnedGift[]> = { pirates: [], shinobi: [], dragons: [], luxury: [], attacks: [] };
              items.forEach((g) => groups[g.arc].push(g));
              return (
                <div className="space-y-5">
                  {(Object.keys(groups) as Arc[]).map((arc) =>
                    groups[arc].length === 0 ? null : (
                      <div key={arc}>
                        <p className="mb-2 text-xs font-bold text-muted-foreground">{ARC_LABELS[arc]}</p>
                        <div className="grid grid-cols-3 gap-2">
                          {groups[arc].map((g) => (
                            <GiftCard
                              key={g.id}
                              gift={g}
                              quantity={g.quantity}
                              selected={selectedId === g.id}
                              onClick={() => setSelectedId(g.id)}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              );
            })()
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border/60 bg-card/50 p-3">
            <Button
              className="w-full bg-gradient-primary text-primary-foreground shadow-neon"
              disabled={!selected || sending}
              onClick={handleSend}
            >
              {sending ? <Loader2 className="me-1 h-4 w-4 animate-spin" /> : <GiftIcon className="me-1 h-4 w-4" />}
              {selected ? `أرسل ${selected.name}` : "اختر هدية"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
