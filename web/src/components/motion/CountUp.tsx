// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/motion/CountUp.tsx
// Purpose:    A number that counts up to its value when it comes into view. The final value is
//             always the real one; people who ask for less motion see it straight away.

import { useEffect, useRef } from "react";

type Props = { value: number; format: (value: number) => string; className?: string };

// Counts from zero to the value over a little more than a second.
// value: the number to reach. format: turns a number into text (for example a percentage).
// className: extra styles.
export default function CountUp({ value, format, className = "" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const show = (n: number) => (element.textContent = format(n));
    const lessMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (lessMotion || typeof IntersectionObserver === "undefined") return void show(value);

    let frame = 0;
    // Runs the count once the number is on screen: fast at first, slowing down at the end.
    const start = () => {
      const began = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - began) / 1200, 1);
        show(value * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) frame = requestAnimationFrame(step);
        else show(value); // end on the exact value
      };
      frame = requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        start();
      }
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, format]);

  return (
    <span ref={ref} data-value={format(value)} className={`tabular-nums ${className}`}>
      {format(0)}
    </span>
  );
}
