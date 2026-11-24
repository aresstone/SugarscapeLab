// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/SettingsMenu.tsx
// Purpose:    The settings button in the header. It opens a small menu with the Detail switch and the
//             choice of a light or dark theme.

import { useState } from "react";
import { Moon, Settings, Sun } from "lucide-react";
import { useMenuClose } from "../lib/menu";
import { useDetail, useTheme } from "../lib/settings";

// The settings button and its menu. Clicking outside the menu or pressing Escape closes it.
// No props.
export default function SettingsMenu() {
  const { detail, setDetail } = useDetail();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useMenuClose<HTMLDivElement>(open, () => setOpen(false));

  return (
    <div className="relative" ref={menuRef} data-tour="settings">
      <button
        type="button"
        aria-label="Settings"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-soft hover:text-ink"
      >
        <Settings size={18} />
      </button>

      {open && (
        <div className="card absolute right-0 top-11 z-30 w-72 p-4 shadow-lift">
          <div className="flex items-center justify-between gap-4">
            <span id="detail-label" className="text-sm font-semibold">
              Detail
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={detail}
              aria-labelledby="detail-label"
              onClick={() => setDetail(!detail)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${detail ? "bg-action" : "bg-line"}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${detail ? "left-[22px]" : "left-0.5"}`}
              />
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Off: short text. On: every longer explanation is shown too.
          </p>

          <div className="mt-4 border-t border-line pt-4">
            <span className="text-sm font-semibold">Theme</span>
            <div className="mt-2 grid grid-cols-2 gap-1 rounded-full bg-soft p-1" role="radiogroup" aria-label="Theme">
              {(["light", "dark"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={theme === option}
                  onClick={() => setTheme(option)}
                  className={`flex items-center justify-center gap-1.5 rounded-full py-1.5 text-sm ${
                    theme === option ? "bg-card font-medium shadow-sm" : "text-muted hover:text-ink"
                  }`}
                >
                  {option === "light" ? <Sun size={14} /> : <Moon size={14} />}
                  {option === "light" ? "Light" : "Dark"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
