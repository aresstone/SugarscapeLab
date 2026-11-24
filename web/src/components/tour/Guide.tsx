// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/tour/Guide.tsx
// Purpose:    Sugi, the tour guide: its name and its drawing, kept together in this one file. Sugi is a
//             small sugar cube seen at a slight angle, with rounded corners, a friendly face and a
//             highlight, filled with the brand gradient. It floats gently, blinks, hops on each new tour
//             step and looks towards what it is talking about.

import { useEffect, useId, useState } from "react";

// The guide's name, used wherever the app mentions it.
export const GUIDE_NAME = "Sugi";

type Props = {
  size?: number;
  look?: { x: number; y: number };
  hop?: string | number;
  cheer?: boolean;
  still?: boolean;
};

// The corners of the cube's three visible faces, as SVG points: the front, the top and the right side.
const FRONT = "12,26 44,26 44,58 12,58";
const TOP = "12,26 21,17 53,17 44,26";
const SIDE = "44,26 53,17 53,49 44,58";

// Sugi, drawn as an SVG. Every colour comes from the palette in src/index.css.
// size: width and height in pixels. look: which way to look, from -1 to 1 across and down.
// hop: change this value to make Sugi hop. cheer: a bigger, happier hop (end of the tour).
// still: no floating, blinking or sparkle (for the small face on the "Take the tour" button).
export default function Guide({ size = 56, look = { x: 0, y: 0 }, hop, cheer = false, still = false }: Props) {
  const id = useId().replace(/:/g, ""); // unique names for this drawing's gradient
  const blinking = useBlink(!still);
  const hopClass = hop === undefined ? "" : cheer ? "guide-cheer" : "guide-hop";
  const light = { fill: "var(--on-colour)" };
  const ink = { fill: "var(--guide-ink)" };
  // The rounded corners come from a thick stroke, with round joins, in the face's own colour.
  const face = { fill: `url(#${id}-sugar)`, stroke: `url(#${id}-sugar)`, strokeWidth: 5, strokeLinejoin: "round" as const };

  return (
    <div aria-hidden style={{ width: size, height: size }} className={still ? "" : "guide-float"}>
      <div key={String(hop)} className={hopClass}>
        <svg viewBox="0 0 64 64" width={size} height={size} className="overflow-visible">
          <defs>
            <linearGradient id={`${id}-sugar`} x1="0.1" y1="0.05" x2="0.9" y2="0.95">
              <stop offset="0" style={{ stopColor: "var(--brand-1)" }} />
              <stop offset="0.5" style={{ stopColor: "var(--brand-2)" }} />
              <stop offset="1" style={{ stopColor: "var(--brand-3)" }} />
            </linearGradient>
          </defs>

          {/* The cube: the side in shade, the top in light, the front in the plain gradient */}
          <polygon points={SIDE} style={face} />
          <polygon points={SIDE} style={{ ...ink, stroke: "var(--guide-ink)", strokeWidth: 5, strokeLinejoin: "round" }} opacity="0.22" />
          <polygon points={TOP} style={face} />
          <polygon points={TOP} style={{ ...light, stroke: "var(--on-colour)", strokeWidth: 5, strokeLinejoin: "round" }} opacity="0.4" />
          <polygon points={FRONT} style={face} />

          {/* Sugar grains on the top, and the highlight down the front's left edge */}
          <circle cx="26" cy="21.5" r="1" style={light} opacity="0.8" />
          <circle cx="35" cy="20" r="0.8" style={light} opacity="0.8" />
          <circle cx="43" cy="21.5" r="0.9" style={light} opacity="0.8" />
          <rect x="14.5" y="29.5" width="3" height="11" rx="1.5" style={light} opacity="0.6" />
          <circle cx="16" cy="44.5" r="1.3" style={light} opacity="0.6" />

          {/* Eyes: they close for a moment to blink, and the pupils follow `look` */}
          <g className="guide-eyes" style={{ transform: `scaleY(${blinking ? 0.1 : 1})` }}>
            <ellipse cx="23" cy="39.5" rx="3.4" ry="4.1" style={light} />
            <ellipse cx="34" cy="39.5" rx="3.4" ry="4.1" style={light} />
            <g className="guide-pupils" style={{ transform: `translate(${look.x * 1.3}px, ${look.y * 1.5}px)` }}>
              <circle cx="23" cy="40" r="2" style={ink} />
              <circle cx="34" cy="40" r="2" style={ink} />
              <circle cx="22.3" cy="39" r="0.7" style={light} />
              <circle cx="33.3" cy="39" r="0.7" style={light} />
            </g>
          </g>

          {/* Cheeks and a small smile */}
          <ellipse cx="18" cy="46.5" rx="2.5" ry="1.5" style={{ fill: "var(--brand-3)" }} opacity="0.45" />
          <ellipse cx="39" cy="46.5" rx="2.5" ry="1.5" style={{ fill: "var(--brand-3)" }} opacity="0.45" />
          <path d="M25 46.5 Q28.5 49.8 32 46.5" fill="none" style={{ stroke: "var(--guide-ink)" }} strokeWidth="2" strokeLinecap="round" />

          {/* A sparkle that twinkles beside the cube */}
          {!still && (
            <path
              d="M58 3.5 L59.3 7.7 L63.5 9 L59.3 10.3 L58 14.5 L56.7 10.3 L52.5 9 L56.7 7.7 Z"
              style={{ fill: "var(--brand-2)" }}
              className="guide-sparkle"
            />
          )}
        </svg>
      </div>
    </div>
  );
}

// Blinks every few seconds, at slightly random times, like a real face.
// active: false stops the blinking (and for people who ask for less motion it never starts).
function useBlink(active: boolean): boolean {
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (!active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout>;
    const blinkSoon = () => {
      timer = setTimeout(() => {
        setBlinking(true);
        timer = setTimeout(() => {
          setBlinking(false);
          blinkSoon();
        }, 140);
      }, 2200 + Math.random() * 3000);
    };
    blinkSoon();
    return () => clearTimeout(timer);
  }, [active]);

  return blinking;
}
