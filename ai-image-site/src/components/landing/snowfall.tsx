"use client";

import { Snowflake } from "@/components/brand/snowflake";

// Deterministic so server and client markup match exactly.
const FLAKES = [
  { left: 4, size: 14, delay: 0, duration: 17, drift: 40, opacity: 0.16 },
  { left: 13, size: 9, delay: 5, duration: 22, drift: -30, opacity: 0.1 },
  { left: 22, size: 18, delay: 2, duration: 15, drift: 60, opacity: 0.13 },
  { left: 31, size: 11, delay: 8, duration: 24, drift: -50, opacity: 0.09 },
  { left: 43, size: 15, delay: 1, duration: 19, drift: 24, opacity: 0.14 },
  { left: 52, size: 8, delay: 11, duration: 26, drift: -18, opacity: 0.08 },
  { left: 61, size: 17, delay: 4, duration: 16, drift: -64, opacity: 0.12 },
  { left: 70, size: 10, delay: 9, duration: 21, drift: 34, opacity: 0.1 },
  { left: 79, size: 13, delay: 3, duration: 18, drift: -26, opacity: 0.15 },
  { left: 88, size: 9, delay: 7, duration: 25, drift: 46, opacity: 0.09 },
  { left: 95, size: 16, delay: 13, duration: 20, drift: -38, opacity: 0.11 },
];

export function Snowfall() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {FLAKES.map((f, i) => (
        <Snowflake
          key={i}
          strokeWidth={6}
          className="absolute top-0 animate-fall text-solar-soft"
          style={
            {
              left: `${f.left}%`,
              width: f.size,
              height: f.size,
              opacity: f.opacity,
              animationDelay: `-${f.delay}s`,
              animationDuration: `${f.duration}s`,
              "--drift-x": `${f.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
