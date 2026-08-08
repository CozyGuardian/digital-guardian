import { useEffect, useState } from "react";
import { dbStatus, type DbStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col items-center gap-4">
      {error && <p className="text-red-600">{error}</p>}
      {!error && !status && <p>Loading...</p>}
      {status && (
        <p>
          DB connected: {String(status.connected)} — scans recorded:{" "}
          {status.scan_count}
        </p>
      )}
      <Button variant="outline" onClick={onEditPersonalSpec}>
        Edit Personal Spec
      </Button>
    </div>
  );
}
