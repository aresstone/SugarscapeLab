// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/tour/TourOverlay.tsx
// Purpose:    Draws one tour step: the page is dimmed except for a spotlight on the part being
//             explained, and a card with the guide, the title, the text and the Back / Next / Skip buttons.

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { TourStep } from "../../content/tour";
import { PAGES } from "../../lib/navigation";
import Guide from "./Guide";

type Box = { top: number; left: number; width: number; height: number };

type Props = {
  step: TourStep;
  index: number;
  total: number;
  detail: boolean;
  whole: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
};

const HEADER = 72; // the spotlight never covers the header bar
const GAP = 16;

// Finds the first visible element marked data-tour="<name>".
// name: the mark to look for.
function findTarget(name: string): HTMLElement | null {
  for (const element of document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`)) {
    const box = element.getBoundingClientRect();
    if (box.width > 0 && box.height > 0) return element;
  }
  return null;
}

// Keeps a number between a lowest and a highest value.
// value: the number. low, high: the limits.
function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value));
}

// One step of the tour, drawn over the page.
// step: the step to show. index, total: its position in the tour. detail: also show the long text.
// whole: true for the tour of the whole app, false when only one page is being explained.
// onBack, onNext, onSkip: called by the buttons (and by the arrow keys and Escape).
export default function TourOverlay({ step, index, total, detail, whole, onBack, onNext, onSkip }: Props) {
  const [box, setBox] = useState<Box | null>(null);
  const [cardHeight, setCardHeight] = useState(240);
  const cardRef = useRef<HTMLDivElement>(null);

  // Finds the step's target (waiting for the page to draw it), scrolls to it and follows its position.
  useEffect(() => {
    setBox(null);
    if (!step.target) return;
    const name = step.target;
    let element: HTMLElement | null = null;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const measure = () => {
      if (!element) return;
      const r = element.getBoundingClientRect();
      const top = Math.max(r.top - 8, element.closest("header") ? 4 : HEADER); // header items may be lit too
      const bottom = Math.min(r.bottom + 8, window.innerHeight - 8);
      setBox(bottom > top ? { top, left: r.left - 8, width: r.width + 16, height: bottom - top } : null);
    };
    const look = () => {
      element = findTarget(name);
      if (element) {
        const tall = element.offsetHeight > window.innerHeight * 0.6;
        element.scrollIntoView({ block: tall ? "start" : "center", behavior: "smooth" });
        measure();
      } else if (++tries < 40) {
        timer = setTimeout(look, 100);
      }
    };
    look();
    const every = setInterval(measure, 300); // follows the page while it loads or moves
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(timer);
      clearInterval(every);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [step]);

  // The arrow keys move through the tour and Escape stops it.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onSkip();
      if (event.key === "ArrowRight") onNext();
      if (event.key === "ArrowLeft") onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack, onNext, onSkip]);

  useLayoutEffect(() => {
    if (cardRef.current) setCardHeight(cardRef.current.offsetHeight);
  }, [step, detail]);

  // Places the card under the spotlight, above it, or in the bottom corner if neither has room.
  const width = Math.min(380, window.innerWidth - 2 * GAP);
  const place: CSSProperties = { width };
  if (!box) {
    place.left = (window.innerWidth - width) / 2;
    place.top = Math.max(HEADER + GAP, (window.innerHeight - cardHeight) / 2);
  } else {
    place.left = clamp(box.left + box.width / 2 - width / 2, GAP, window.innerWidth - width - GAP);
    if (box.top + box.height + GAP + cardHeight <= window.innerHeight - GAP) place.top = box.top + box.height + GAP;
    else if (box.top - GAP - cardHeight >= HEADER) place.top = box.top - GAP - cardHeight;
    else {
      place.top = window.innerHeight - cardHeight - GAP;
      place.left = window.innerWidth - width - GAP;
    }
  }

  // The guide looks towards the spotlight.
  const lookAt = box
    ? {
        x: clamp((box.left + box.width / 2 - ((place.left as number) + width / 2)) / 200, -1, 1),
        y: clamp((box.top + box.height / 2 - ((place.top as number) + cardHeight / 2)) / 200, -1, 1),
      }
    : { x: 0, y: 0 };
  const last = index === total - 1;
  const pageTitle = PAGES.find((page) => page.id === step.page)?.title ?? "Sugarscape Lab";

  return (
    <div className="pointer-events-none fixed inset-0 z-50" role="dialog" aria-label={step.title}>
      {box ? (
        <div
          className="ai-glow ai-glow-soft absolute rounded-2xl transition-all duration-300"
          style={{ ...box, boxShadow: "0 0 0 200vmax var(--scrim)", ["--glow-radius" as string]: "1rem" }}
        />
      ) : (
        <div className="absolute inset-0 bg-[var(--scrim)]" />
      )}

      <div
        ref={cardRef}
        className="pointer-events-auto absolute overflow-hidden rounded-3xl border border-line bg-card px-6 pb-6 pt-5 shadow-lift transition-[top,left] duration-300"
        style={place}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="-mt-1 flex items-end gap-3">
            <Guide size={48} look={lookAt} hop={index} cheer={last} />
            <span className="pb-1 text-xs font-medium">{pageTitle}</span>
          </div>
          <button type="button" onClick={onSkip} className="text-xs text-muted hover:text-ink">
            {whole ? "Skip tour" : "Close"}
          </button>
        </div>

        <h2 className="mt-3 text-lg font-semibold tracking-tight">{step.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{step.short}</p>
        {detail && <p className="mt-2 text-sm leading-relaxed text-muted">{step.long}</p>}

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-xs tabular-nums text-muted">
            {index + 1} of {total}
          </span>
          <div className="flex gap-2">
            {index > 0 && (
              <button type="button" onClick={onBack} className="btn-secondary">
                Back
              </button>
            )}
            <button type="button" onClick={onNext} className="btn-primary">
              {last ? (whole ? "Finish" : "Done") : "Next"}
            </button>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1 bg-soft">
          <div className="bg-ai h-full transition-all duration-300" style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
