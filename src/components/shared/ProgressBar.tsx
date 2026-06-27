interface ProgressBarProps {
  value: number; // 0-100
  /** CSS gradient for the fill, e.g. "linear-gradient(90deg,#FFE66D,#E74C3C)" */
  gradient?: string;
  height?: number;
}

export function ProgressBar({
  value,
  gradient = "linear-gradient(90deg,#FFE66D,#E74C3C)",
  height = 10,
}: ProgressBarProps) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className="w-full overflow-hidden rounded-full bg-white/10"
      style={{ height }}
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${v}%`, background: gradient }}
      />
    </div>
  );
}
