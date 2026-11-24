// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/components/tour/TourProvider.tsx
// Purpose:    Runs the guided tour: remembers which step is showing, opens each step's page,
//             and lets any part of the app start the whole tour or the tour of one page.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { tourSteps } from "../../content/tour";
import type { PageId } from "../../lib/navigation";
import { useDetail } from "../../lib/settings";
import TourOverlay from "./TourOverlay";

// What is playing: the page being explained on its own (null for the whole tour) and the step reached.
type Run = { onlyPage: PageId | null; index: number };

const TourContext = createContext<{ start: (only?: "this page") => void }>({ start: () => {} });

type Props = { page: PageId; goTo: (page: PageId) => void; children: ReactNode };

// Makes the tour available to the app and shows the current step on top of the page.
// page: the page being shown. goTo: opens a page. children: the app itself.
export function TourProvider({ page, goTo, children }: Props) {
  const { detail } = useDetail();
  const [run, setRun] = useState<Run | null>(null);
  const steps = run ? tourSteps(run.onlyPage) : [];
  const index = run ? Math.min(run.index, steps.length - 1) : 0;
  const step = run && steps.length > 0 ? steps[index] : null;

  useEffect(() => {
    if (step?.page && step.page !== page) goTo(step.page);
  }, [step, page, goTo]);

  const stop = () => setRun(null);

  // Starts the tour from its first step.
  // only: "this page" to explain just the page being shown; left out for the whole tour.
  const start = (only?: "this page") => setRun({ onlyPage: only ? page : null, index: 0 });

  return (
    <TourContext.Provider value={{ start }}>
      {children}
      {run && step && (
        <TourOverlay
          step={step}
          index={index}
          total={steps.length}
          detail={detail}
          whole={run.onlyPage === null}
          onBack={() => setRun({ ...run, index: Math.max(0, index - 1) })}
          onNext={() => (index >= steps.length - 1 ? stop() : setRun({ ...run, index: index + 1 }))}
          onSkip={stop}
        />
      )}
    </TourContext.Provider>
  );
}

// Gives the function that starts the tour: start() for the whole tour, start("this page") for
// the page being shown. No parameters.
export function useTour() {
  return useContext(TourContext);
}
