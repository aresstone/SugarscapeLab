// Name:       Nikita Devi Gurumayum
// Student ID: SCSJ2400109
// Module:     6COM2012 Social and Collective Artificial Intelligence
// File:       web/src/App.tsx
// Purpose:    The page layout: the soft background glows, the header on top and the chosen page below.
//             It also makes the file viewer, the current simulation run and the guided tour available
//             everywhere.

import Header from "./components/Header";
import { FileViewerProvider } from "./components/FileViewer";
import Aurora from "./components/motion/Aurora";
import { TourProvider } from "./components/tour/TourProvider";
import { usePage, type PageId } from "./lib/navigation";
import { RunProvider } from "./lib/run-store";
import ExperimentsPage from "./pages/ExperimentsPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import LearnPage from "./pages/LearnPage";
import ProjectMapPage from "./pages/ProjectMapPage";
import QuestionsPage from "./pages/QuestionsPage";
import SimulatePage from "./pages/SimulatePage";

// Gives the page to show for a page id.
// page: the page id from the address bar.
function pageFor(page: PageId) {
  if (page === "experiments") return <ExperimentsPage />;
  if (page === "how-it-works") return <HowItWorksPage />;
  if (page === "questions") return <QuestionsPage />;
  if (page === "project-map") return <ProjectMapPage />;
  if (page === "learn") return <LearnPage />;
  return <SimulatePage />;
}

// The whole app. Shows the page named in the address bar. No props.
export default function App() {
  const [page, goTo] = usePage();

  return (
    <FileViewerProvider>
      <RunProvider>
        <TourProvider page={page} goTo={goTo}>
          <div className="relative isolate min-h-screen">
            <Aurora />
            <Header page={page} onNavigate={goTo} />
            <main key={page} className="mx-auto max-w-6xl px-5 pb-24">
              {pageFor(page)}
            </main>
          </div>
        </TourProvider>
      </RunProvider>
    </FileViewerProvider>
  );
}
