// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/Header.tsx
// Purpose:    The bar at the top of every page: the Sugarscape Lab name, the page links, the tour button
//             and the settings menu.

import { Grid3x3 } from "lucide-react";
import { PAGES, type PageId } from "../lib/navigation";
import SettingsMenu from "./SettingsMenu";
import TourButton from "./tour/TourButton";

// The header with navigation.
// page: the page being shown. onNavigate: called with a page id when a link is clicked.
export default function Header({ page, onNavigate }: { page: PageId; onNavigate: (page: PageId) => void }) {

  return (
    <header className="glass sticky top-0 z-20 border-b border-line">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5">
        <button type="button" onClick={() => onNavigate("simulate")} className="flex shrink-0 items-center gap-2.5">
          <span className="bg-ai flex h-8 w-8 items-center justify-center rounded-xl text-[var(--on-brand)] shadow-soft">
            <Grid3x3 size={17} />
          </span>
          <span className="hidden text-[17px] font-semibold tracking-tight sm:inline">Sugarscape Lab</span>
        </button>

        <nav className="flex flex-1 justify-center gap-1 overflow-x-auto" data-tour="navigation">
          {PAGES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={page === item.id ? "page" : undefined}
              data-tour={item.id === "learn" ? "learn-nav" : undefined}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                page === item.id ? "bg-soft font-medium text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {item.title}
            </button>
          ))}
        </nav>

        <TourButton page={page} />
        <SettingsMenu />
      </div>
    </header>
  );
}
