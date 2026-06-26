import type { SVGProps } from "react";

/**
 * Open manga book icon — two facing pages with a subtle spine.
 * Inherits currentColor.
 */
export function MangaBookIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
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
      {/* Left page */}
      <path d="M3 5.2c2.8-.6 5.6-.6 8.5.4v13.2c-2.9-1-5.7-1-8.5-.4z" />
      {/* Right page */}
      <path d="M21 5.2c-2.8-.6-5.6-.6-8.5.4v13.2c2.9-1 5.7-1 8.5-.4z" />
      {/* Spine */}
      <path d="M12 5.6v13.2" />
      {/* Lines on left page */}
      <path d="M5.5 9h3.5" />
      <path d="M5.5 11.5h3.5" />
      {/* Lines on right page */}
      <path d="M15 9h3.5" />
      <path d="M15 11.5h3.5" />
    </svg>
  );
}
