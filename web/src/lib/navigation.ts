// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/lib/navigation.ts
// Purpose:    The list of pages and a hook that keeps the current page in the address bar
//             (for example #/simulate), so the browser's back button works.

import { useEffect, useState } from "react";

export type PageId = "simulate" | "experiments" | "how-it-works" | "questions" | "project-map" | "learn";

// The pages in navigation order.
export const PAGES: { id: PageId; title: string }[] = [
  { id: "simulate", title: "Simulate" },
  { id: "experiments", title: "Experiments" },
  { id: "how-it-works", title: "How it works" },
  { id: "questions", title: "Questions and answers" },
  { id: "project-map", title: "Project map" },
  { id: "learn", title: "Learn" },
];

// Reads the page id from the address bar, falling back to Simulate.
// No parameters.
function readPageFromAddress(): PageId {
  const id = window.location.hash.replace(/^#\/?/, "");
  return PAGES.some((page) => page.id === id) ? (id as PageId) : "simulate";
}

// Gives the current page and a function to change it. The page is stored in the address bar.
// No parameters.
export function usePage(): [PageId, (page: PageId) => void] {
  const [page, setPage] = useState<PageId>(readPageFromAddress);

  useEffect(() => {
    const onChange = () => setPage(readPageFromAddress());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return [page, openPage];
}

// Opens a page by putting its id in the address bar, and scrolls to the top.
// page: the page to open.
export function openPage(page: PageId) {
  window.location.hash = `/${page}`;
  window.scrollTo({ top: 0 });
}
