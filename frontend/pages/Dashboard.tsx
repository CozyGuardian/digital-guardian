import { useEffect, useState } from "react";
import { dbStatus, type DbStatus } from "@/lib/api";

export default function Dashboard() {
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dbStatus()
      .then(setStatus)
      .catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className="text-red-600">DB error: {error}</p>;
  if (!status) return <p>Loading...</p>;

  return (
    <p>
      DB connected: {String(status.connected)} — scans recorded:{" "}
      {status.scan_count}
    </p>
  );
}
