import { drawFeatured, drawGalleryShortcuts } from "@/lib/data/drawing";

const ART = "#9B59B6";

export function GalleryTab() {
  return (
    <div className="space-y-5 animate-[fadeInUp_0.4s_ease-out]">
      <div
        className="relative rounded-2xl border bg-white/[0.04] p-5"
        style={{ borderColor: "rgba(155,89,182,0.1)" }}
      >
        <span
          className="absolute end-4 top-4 rounded-full px-2.5 py-1 text-[10px] font-bold"
          style={{ background: `${ART}26`, color: ART }}
        >
          ⭐ مميز
        </span>
        <div className="mb-1 text-lg font-bold" style={{ color: ART }}>
          {drawFeatured.title}
        </div>
        <div className="text-sm text-white/60">{drawFeatured.by}</div>
        <div className="mt-1 text-xs text-white/50">{drawFeatured.desc}</div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {drawFeatured.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-white/70"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="text-center text-xs text-white/50">📌 أعمال المجتمع</div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {drawGalleryShortcuts.map((s) => (
          <div
            key={s.full}
            className="rounded-2xl border bg-white/[0.04] p-3 text-center"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="mb-1 text-lg" style={{ color: ART }}>
              {s.short}
            </div>
            <div className="text-[11px] font-bold text-white/80">{s.full}</div>
            <div className="mt-1 text-[11px] text-white/50">{s.meaning}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
