"use client";

import { useGymList } from "../use-gym-list";
import { Card, CardBody, Spinner } from "@heroui/react";

export default function MealPlansPage() {
  const { data: plans, loading, error } = useGymList("meal-plans");
  const { data: members } = useGymList("members");
  const memberMap = Object.fromEntries((members ?? []).map((m) => [m.$id, m.name || m.email || "—"]));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Spinner size="lg" color="primary" />
        <p className="text-default-500">Loading meal plans…</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-danger-200 bg-danger-50/20">
        <CardBody>
          <p className="font-medium text-danger-700">Error loading meal plans</p>
          <p className="mt-1 text-sm text-danger-600">{error}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Meal Plans</h1>
      <p className="mt-2 text-default-500">Create and assign meal plans.</p>
      <Card className="mt-6">
        {plans.length === 0 ? (
          <CardBody className="text-center py-12 text-default-500">No meal plans yet.</CardBody>
        ) : (
          <ul className="divide-y divide-default-200">
            {plans.map((p) => (
              <li key={p.$id} className="px-4 py-3 sm:px-6">
                <p className="font-medium text-foreground">{p.name}</p>
                {p.description && (
                  <p className="mt-0.5 text-sm text-default-500">{p.description}</p>
                )}
                {p.member_id && (
                  <p className="mt-1 text-xs text-default-400">
                    Member: {memberMap[p.member_id] ?? p.member_id}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
