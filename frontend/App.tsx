import { useEffect, useState } from "react";
import Dashboard from "@/pages/Dashboard";
import PersonalSpecWizard from "@/pages/PersonalSpecWizard";
import { getPersonalSpec, type PersonalSpec } from "@/lib/api";

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
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Digital Guardian</h1>
      {view.kind === "loading" && <p>Loading...</p>}
      {view.kind === "load-error" && (
        <p className="text-red-600">
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
      {view.kind === "dashboard" && <Dashboard onEditPersonalSpec={openEdit} />}
    </main>
  );
}
