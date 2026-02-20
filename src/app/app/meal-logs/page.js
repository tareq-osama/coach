"use client";

import { useGymList } from "../use-gym-list";
import { Card, CardBody, Spinner } from "@heroui/react";
import EmptyState from "../components/EmptyState";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { dateStyle: "medium" }) + " " + d.toLocaleTimeString(undefined, { timeStyle: "short" });
  } catch {
    return iso;
  }
}

export default function MealLogsPage() {
  const { data: logs, loading, error } = useGymList("meal-logs");
  const { data: members } = useGymList("members");
  const memberMap = Object.fromEntries((members ?? []).map((m) => [m.$id, m.name || m.email || "—"]));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Spinner size="lg" color="primary" />
        <p className="text-default-500">Loading meal logs…</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-danger-200 bg-danger-50/20">
        <CardBody>
          <p className="font-medium text-danger-700">Error loading meal logs</p>
          <p className="mt-1 text-sm text-danger-600">{error}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Meal Logs</h1>
      <p className="mt-2 text-default-500">Track clients’ meal intake.</p>
      <Card className="mt-6">
        {logs.length === 0 ? (
          <CardBody>
            <EmptyState pathname="/app/meal-logs" className="py-12" />
          </CardBody>
        ) : (
          <ul className="divide-y divide-default-200">
            {logs.map((log) => (
              <li key={log.$id} className="px-4 py-3 sm:px-6">
                <p className="font-medium text-foreground">
                  {formatDate(log.log_date)} — {memberMap[log.member_id] ?? log.member_id}
                </p>
                {log.notes && (
                  <p className="mt-0.5 text-sm text-default-500">{log.notes}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
