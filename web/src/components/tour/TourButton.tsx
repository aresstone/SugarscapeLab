// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/tour/TourButton.tsx
// Purpose:    The "Take the tour" button in the header, with a small, still drawing of the guide.
//             It opens a menu with two choices: tour the whole app, or explain only this page.

import { useState } from "react";
import { Route, ScanSearch } from "lucide-react";
import { useMenuClose } from "../../lib/menu";
import { PAGES, type PageId } from "../../lib/navigation";
import Guide, { GUIDE_NAME } from "./Guide";
import { useTour } from "./TourProvider";

// The tour button and its menu. On narrower screens only the guide's face is shown on the button.
// page: the page being shown, which the menu names in its second choice.
export default function TourButton({ page }: { page: PageId }) {
  const { start } = useTour();
  const [open, setOpen] = useState(false);
  const menuRef = useMenuClose<HTMLDivElement>(open, () => setOpen(false));
  const pageTitle = PAGES.find((item) => item.id === page)?.title ?? "";

  // Closes the menu and starts the chosen tour.
  // only: "this page" for the page being shown; left out for the whole tour.
  const choose = (only?: "this page") => {
    setOpen(false);
    start(only);
  };

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-line bg-card px-2.5 py-1.5 text-sm shadow-soft hover:bg-soft"
      >
        <Guide size={22} still />
        <span className="sr-only lg:not-sr-only">Take the tour with {GUIDE_NAME}</span>
      </button>

      {open && (
        <div className="card absolute right-0 top-11 z-30 w-64 p-1.5 shadow-lift" role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => choose()}
            className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-soft"
          >
            <Route size={16} className="mt-0.5 shrink-0 text-action" />
            <span>
              <span className="block text-sm font-medium">Tour the whole app</span>
              <span className="block text-xs text-muted">Every page, in order</span>
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => choose("this page")}
            className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-soft"
          >
            <ScanSearch size={16} className="mt-0.5 shrink-0 text-action" />
            <span>
              <span className="block text-sm font-medium">Explain this page</span>
              <span className="block text-xs text-muted">Only the {pageTitle} page</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
