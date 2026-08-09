import { useEffect, useState } from "react";
import Dashboard from "@/pages/Dashboard";
import PersonalSpecWizard from "@/pages/PersonalSpecWizard";
import { getPersonalSpec, type PersonalSpec } from "@/lib/api";
import { SteepingLine } from "@/components/SteepingLine";

type View =
  | { kind: "loading" }
  | { kind: "load-error" }
  | { kind: "wizard" }
  | { kind: "dashboard" }
  | { kind: "edit"; data: PersonalSpec };

export default function App() {
  const [view, setView] = useState<View>({ kind: "loading" });

  useEffect(() => {
    getPersonalSpec()
      .then((spec) => setView(spec ? { kind: "dashboard" } : { kind: "wizard" }))
      .catch(() => setView({ kind: "load-error" }));
  }, []);

  async function openEdit() {
    try {
      const spec = await getPersonalSpec();
      if (spec) setView({ kind: "edit", data: spec });
    } catch {
      setView({ kind: "load-error" });
    }
  }

  return (
    <main className="min-h-screen bg-cozy-bg-light dark:bg-cozy-bg-dark text-slate-800 dark:text-slate-100 p-6 sm:p-8 transition-colors duration-200 font-sans">
      <div className="flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center gap-6">
        <h1 className="font-display text-3xl font-semibold text-slate-900 dark:text-slate-50">
          Digital Guardian
        </h1>
        {view.kind === "loading" && (
          <SteepingLine animate className="h-16 w-10" />
        )}
        {view.kind === "load-error" && (
          <p className="text-sm font-medium text-cozy-status-risk dark:text-cozy-status-risk-dark">
            Couldn't load your data. Try restarting the app.
          </p>
        )}
        {view.kind === "wizard" && (
          <PersonalSpecWizard onSaved={() => setView({ kind: "dashboard" })} />
        )}
        {view.kind === "edit" && (
          <PersonalSpecWizard
            initialData={view.data}
            onSaved={() => setView({ kind: "dashboard" })}
            onCancel={() => setView({ kind: "dashboard" })}
          />
        )}
        {view.kind === "dashboard" && (
          <Dashboard onEditPersonalSpec={openEdit} />
        )}
      </div>
    </main>
  );
}
