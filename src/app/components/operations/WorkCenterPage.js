"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { getUserFacingErrorMessage } from "@/lib/errors/user-facing";
import WorkCenterControlTower from "@/app/components/operations/WorkCenterControlTower";

export default function WorkCenterPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOperations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/work-center");
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Work center data could not be loaded.");
      }
      setData(payload);
    } catch (err) {
      setError(getUserFacingErrorMessage(err, "Work center error."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOperations();
  }, [loadOperations]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw size={26} className="animate-spin text-indigo-600" />
        <span className="text-sm font-bold text-slate-700">
          Loading Operations Control Tower...
        </span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold">
        {error}
      </div>
    );
  }

  return <WorkCenterControlTower initialData={data} onRefresh={loadOperations} />;
}
