import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  imageUrl: string;
  name: string;
  rarity?: string;
  fromName?: string;
  onClose: () => void;
}

/**
 * Full-screen Legendary gift overlay.
 * Frosted-glass backdrop + dramatic neon glow + auto-reveal close button after 3s.
 * Optimized: pure CSS transforms/opacity, will-change hints, no layout thrash.
 */
export function LegendaryGiftVFX({ imageUrl, name, rarity = "legendary", fromName, onClose }: Props) {
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setCanClose(true), 3000);
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && canClose) onClose();
    };
    window.addEventListener("keydown", esc);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", esc);
    };
  }, [onClose, canClose]);

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[300] flex items-center justify-center overflow-hidden"
      role="dialog"
      aria-label={`هدية أسطورية: ${name}`}
    >
      {/* Frosted backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-2xl animate-[lvfx-fade_400ms_ease-out_forwards]" />

      {/* Radiating neon rays */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="h-[200vmax] w-[200vmax] opacity-60 will-change-transform animate-[lvfx-spin_8s_linear_infinite]"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, hsl(var(--primary) / 0.55) 8deg, transparent 18deg, transparent 40deg, hsl(var(--accent) / 0.5) 50deg, transparent 60deg, transparent 90deg, hsl(var(--primary) / 0.55) 100deg, transparent 110deg)",
            maskImage: "radial-gradient(circle, black 0%, transparent 65%)",
            WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 65%)",
          }}
        />
      </div>

      {/* Sparkles */}
      {Array.from({ length: 22 }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute h-2 w-2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.95)] pointer-events-none"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `lvfx-sparkle ${1 + Math.random() * 1.6}s ease-out ${Math.random() * 0.6}s infinite`,
          }}
        />
      ))}

      {/* Card */}
      <div className="relative mx-4 max-w-md rounded-3xl border border-primary/40 bg-card/40 p-6 text-center shadow-neon backdrop-blur-2xl will-change-transform animate-[lvfx-pop_700ms_cubic-bezier(.2,.8,.2,1)_forwards]">
        <div className="absolute inset-0 -m-10 rounded-full bg-gradient-primary opacity-50 blur-3xl pointer-events-none" />

        <div className="relative">
          <p className="text-xs font-black uppercase tracking-widest text-accent">🌟 هدية أسطورية</p>
          <div className="my-4 flex items-center justify-center">
            <img
              src={imageUrl}
              alt={name}
              width={320}
              height={320}
              className="relative h-56 w-56 object-contain drop-shadow-[0_0_45px_hsl(var(--primary))] sm:h-72 sm:w-72 animate-[lvfx-float_3s_ease-in-out_infinite]"
            />
          </div>
          <h2 className="text-2xl font-black text-gradient sm:text-3xl">{name}</h2>
          {fromName && (
            <p className="mt-2 text-sm text-muted-foreground">من <span className="font-bold text-foreground">{fromName}</span></p>
          )}
          <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{rarity}</p>
        </div>

        {/* Close button — appears only after 3s */}
        <Button
          onClick={onClose}
          variant="outline"
          size="icon"
          aria-label="إغلاق"
          disabled={!canClose}
          className={
            "absolute -top-3 -left-3 h-9 w-9 rounded-full border-primary/50 bg-card/80 backdrop-blur-xl transition-all duration-500 " +
            (canClose ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none")
          }
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <style>{`
        @keyframes lvfx-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes lvfx-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes lvfx-pop {
          0% { transform: scale(0.4) rotate(-6deg); opacity: 0; }
          60% { transform: scale(1.05) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes lvfx-float {
          0%, 100% { transform: translateY(0) }
          50% { transform: translateY(-10px) }
        }
        @keyframes lvfx-sparkle {
          0% { transform: scale(0); opacity: 0 }
          50% { transform: scale(1.4); opacity: 1 }
          100% { transform: scale(0); opacity: 0 }
        }
      `}</style>
    </div>
  );
}
