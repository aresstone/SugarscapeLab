// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/lib/menu.ts
// Purpose:    What the small menus in the header share (the tour's and the settings'): they close
//             when the user clicks somewhere else or presses Escape.

import { useEffect, useRef } from "react";

// Closes a menu when the user clicks outside it or presses Escape.
// open: whether the menu is showing. close: called to close it.
// Returns a ref to put on the element that wraps the button and its menu.
export function useMenuClose<T extends HTMLElement>(open: boolean, close: () => void) {
  const wrapper = useRef<T>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return wrapper;
}
