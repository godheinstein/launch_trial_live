/**
 * BrandLogos.tsx
 * Inline SVG marks for the third-party brands TrialRun is built on.
 * Hand-rolled approximations sized to fit the homepage strip — used as a
 * fallback when first-party logo assets aren't bundled.
 */

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * OpenAI — six-petal knot/rosette. The official mark is three interlocking
 * "broken hexagon" bands; we approximate with three rotated petal shapes
 * to evoke the same six-fold symmetry without the licensed asset.
 */
export function OpenAILogo({ className, style }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M 4 12 Q 12 4 20 12 Q 12 20 4 12 Z" />
      <path
        d="M 4 12 Q 12 4 20 12 Q 12 20 4 12 Z"
        transform="rotate(60 12 12)"
      />
      <path
        d="M 4 12 Q 12 4 20 12 Q 12 20 4 12 Z"
        transform="rotate(120 12 12)"
      />
    </svg>
  );
}

/**
 * Convex — three-arc tri-color swirl in red / yellow / purple, matching
 * their brand wheel.
 */
export function ConvexLogo({ className, style }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={3}
      strokeLinecap="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M 12 4 A 8 8 0 0 1 18.93 16" stroke="#dc2626" />
      <path d="M 18.93 16 A 8 8 0 0 1 5.07 16" stroke="#f59e0b" />
      <path d="M 5.07 16 A 8 8 0 0 1 12 4" stroke="#7c3aed" />
    </svg>
  );
}

/** Fal — black 4-point compass icon next to "fal" wordmark. */
export function FalLogo({ className, style }: LogoProps) {
  return (
    <svg
      viewBox="0 0 40 24"
      fill="currentColor"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* Compass / starburst on the left. */}
      <g>
        <circle
          cx="8"
          cy="12"
          r="3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        {/* Four directional spikes around the circle. */}
        <path d="M 8 2 L 7 6 L 8 7 L 9 6 Z" />
        <path d="M 8 22 L 7 18 L 8 17 L 9 18 Z" />
        <path d="M 18 12 L 14 11 L 13 12 L 14 13 Z" />
        <path d="M -2 12 L 2 11 L 3 12 L 2 13 Z" />
      </g>
      {/* "fal" wordmark on the right. */}
      <text
        x="20"
        y="17"
        fontSize="13"
        fontWeight="800"
        fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
      >
        fal
      </text>
    </svg>
  );
}

/** Gemini — the four-pointed sparkle star with Google's gradient. */
export function GeminiLogo({ className, style }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gemini-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1c69ff" />
          <stop offset="33%" stopColor="#9b72cb" />
          <stop offset="66%" stopColor="#d96570" />
          <stop offset="100%" stopColor="#f9bd00" />
        </linearGradient>
      </defs>
      <path
        d="M 12 2 C 12 7 12 7 17 12 C 12 17 12 17 12 22 C 12 17 12 17 7 12 C 12 7 12 7 12 2 Z"
        fill="url(#gemini-grad)"
      />
    </svg>
  );
}
