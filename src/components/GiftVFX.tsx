import { useEffect, useState } from "react";

interface Props {
  imageUrl: string;
  name: string;
  onDone?: () => void;
  duration?: number;
}

/**
 * Lightweight, web-optimized full-screen VFX shown when receiving/sending a rare gift.
 * Pure CSS transforms — no heavy libs.
 */
export function GiftVFX({ imageUrl, name, onDone, duration = 2400 }: Props) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setShow(false);
      onDone?.();
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onDone]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Dim backdrop */}
      <div className="absolute inset-0 bg-black/70 animate-[vfx-fade_2.4s_ease-out_forwards]" />

      {/* Radiating rays */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[180vmax] w-[180vmax] animate-[vfx-spin_2.4s_linear] opacity-60"
          style={{
            background: "conic-gradient(from 0deg, transparent 0deg, var(--neon-blue) 10deg, transparent 20deg, transparent 40deg, var(--neon-orange) 50deg, transparent 60deg, transparent 90deg, var(--neon-blue) 100deg, transparent 110deg)",
            maskImage: "radial-gradient(circle, black 0%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Sparkles */}
      {[...Array(18)].map((_, i) => (
        <span
          key={i}
          className="absolute h-2 w-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `vfx-sparkle ${0.8 + Math.random() * 1.4}s ease-out ${Math.random() * 0.4}s forwards`,
          }}
        />
      ))}

      {/* Gift image */}
      <div className="relative animate-[vfx-pop_2.4s_cubic-bezier(.2,.8,.2,1)_forwards]">
        <div className="absolute inset-0 -m-12 rounded-full bg-gradient-primary blur-3xl opacity-70" />
        <img
          src={imageUrl}
          alt={name}
          width={320}
          height={320}
          className="relative h-64 w-64 sm:h-80 sm:w-80 object-contain drop-shadow-[0_0_40px_rgba(255,150,50,0.8)]"
        />
        <p className="relative mt-4 text-center text-2xl font-black text-gradient">{name}</p>
      </div>

      <style>{`
        @keyframes vfx-fade { 0% { opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes vfx-spin { 0% { transform: rotate(0deg) scale(0.4); opacity: 0; } 30% { opacity: 0.8; } 100% { transform: rotate(360deg) scale(1); opacity: 0; } }
        @keyframes vfx-pop {
          0% { transform: scale(0.2) rotate(-20deg); opacity: 0; }
          25% { transform: scale(1.15) rotate(5deg); opacity: 1; }
          40% { transform: scale(1) rotate(0); }
          80% { transform: scale(1) rotate(0); opacity: 1; }
          100% { transform: scale(1.1) translateY(-20px); opacity: 0; }
        }
        @keyframes vfx-sparkle {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.4); opacity: 1; }
          100% { transform: scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
