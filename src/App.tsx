import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { LandingPage } from "./components/LandingPage";
import { TrialSetupForm } from "./components/TrialSetupForm";
import { TrialDashboard } from "./components/TrialDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<LandingPage />} />
          <Route path="/new" element={<TrialSetupForm />} />
          <Route path="/trial/:trialId" element={<TrialDashboard />} />
          <Route
            path="*"
            element={
              <div className="mx-auto max-w-2xl px-6 py-24 text-center">
                <h1 className="text-3xl font-bold">Page not found</h1>
                <p className="mt-2 text-slate-400">
                  The trial you're looking for doesn't exist yet.
                </p>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
