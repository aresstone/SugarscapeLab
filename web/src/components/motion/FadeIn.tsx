// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/motion/FadeIn.tsx
// Purpose:    Wraps content so it fades, un-blurs and rises into place when it scrolls into view.
//             The animation itself is the .fade-in style in index.css.

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = { children: ReactNode; className?: string; delay?: number } & Record<`data-${string}`, string>;

// Shows its content with a short fade when it first comes into view.
// children: the content. className: extra styles. delay: seconds to wait before fading in.
// Any data-… attribute (for example data-tour) is passed on to the wrapper.
export default function FadeIn({ children, className = "", delay = 0, ...data }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      {...data}
      data-shown={shown ? "" : undefined}
      className={`fade-in ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}
