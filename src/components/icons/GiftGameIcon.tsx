import type { SVGProps } from "react";

/**
 * Custom integrated icon: Gift box (top) + Game controller (bottom).
 * Uses currentColor so it inherits text color.
 */
export function GiftGameIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Gift box (top half) */}
      <rect x="5" y="3" width="14" height="4.5" rx="1" />
      <path d="M12 3v4.5" />
      <path d="M9.5 3a1.8 1.8 0 1 1 2.5 2.5" />
      <path d="M14.5 3a1.8 1.8 0 1 0-2.5 2.5" />
      {/* Game controller (bottom half) */}
      <path d="M7 11h10a4 4 0 0 1 4 4v2a3 3 0 0 1-5.4 1.8L14 17h-4l-1.6 1.8A3 3 0 0 1 3 17v-2a4 4 0 0 1 4-4z" />
      <line x1="7.5" y1="14.5" x2="9.5" y2="14.5" />
      <line x1="8.5" y1="13.5" x2="8.5" y2="15.5" />
      <circle cx="15" cy="14" r="0.6" fill="currentColor" />
      <circle cx="16.5" cy="15.5" r="0.6" fill="currentColor" />
    </svg>
  );
}
