import { useEffect, useState } from "react";
import { dbStatus, type DbStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { SteepingLine } from "@/components/SteepingLine";

interface DashboardProps {
  onEditPersonalSpec: () => void;
}

export default function Dashboard({ onEditPersonalSpec }: DashboardProps) {
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dbStatus()
      .then(setStatus)
      .catch(() => setError("Couldn't load dashboard data."));
  }, []);

  return (
    <div className="relative w-full max-w-md bg-cozy-card-light dark:bg-cozy-card-dark rounded-cozy p-6 sm:p-8 border border-stone-200/50 dark:border-white/5 shadow-sm motion-safe:animate-cozy-stagger-in">
      <SteepingLine className="pointer-events-none absolute -top-4 right-6 h-20 w-12" />

      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 font-display">
        Your Digital Guardian
      </h3>

      <div
        className="mt-6 flex flex-col items-start gap-3 motion-safe:animate-cozy-stagger-in"
        style={{ animationDelay: "60ms" }}
      >
        {error && (
          <p className="text-sm font-medium text-cozy-status-risk dark:text-cozy-status-risk-dark">
            {error}
          </p>
        )}
        {!error && !status && (
          <SteepingLine animate className="h-10 w-6" />
        )}
        {status && (
          <>
            <StatusBadge level={status.connected ? "safe" : "watch"}>
              {status.connected ? "Database Connected" : "Database Unavailable"}
            </StatusBadge>
            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              {status.scan_count} scan{status.scan_count === 1 ? "" : "s"}{" "}
              recorded so far.
            </p>
          </>
        )}
      </div>

      <div
        className="mt-6 motion-safe:animate-cozy-stagger-in"
        style={{ animationDelay: "120ms" }}
      >
        <Button variant="outline" onClick={onEditPersonalSpec}>
          Edit Personal Spec
        </Button>
      </div>
    </div>
  );
}
