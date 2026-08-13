import { cn } from "@/lib/utils";

const ARM_ANGLES = [0, 60, 120, 180, 240, 300];

export function Snowflake({
  className,
  strokeWidth = 5,
  style,
}: {
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      style={style}
      className={cn("size-6", className)}
    >
      <g
        transform="translate(60 60)"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {ARM_ANGLES.map((angle) => (
          <g key={angle} transform={`rotate(${angle})`}>
            <path d="M0 -6 V-50" />
            <path d="M0 -20 L12 -32" />
            <path d="M0 -20 L-12 -32" />
            <path d="M0 -35 L8.5 -43.5" />
            <path d="M0 -35 L-8.5 -43.5" />
          </g>
        ))}
        <circle r="5.5" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  wordClassName,
  spin = false,
}: {
  className?: string;
  markClassName?: string;
  wordClassName?: string;
  spin?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <Snowflake
        className={cn(
          "size-6 text-solar drop-shadow-[0_0_12px_rgba(255,212,38,0.45)]",
          spin && "animate-spin-slow",
          markClassName,
        )}
      />
      <span
        className={cn(
          "text-[1.35rem] font-semibold tracking-[-0.045em] lowercase leading-none",
          wordClassName,
        )}
      >
        minsuro
      </span>
    </span>
  );
}
