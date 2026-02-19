"use client";

import { useGymList } from "../use-gym-list";
import { Card, CardBody, Spinner } from "@heroui/react";

export default function MuscleGroupsPage() {
  const { data: muscleGroups, loading, error } = useGymList("muscle-groups");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Spinner size="lg" color="primary" />
        <p className="text-default-500">Loading muscle groups…</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-danger-200 bg-danger-50/20">
        <CardBody>
          <p className="font-medium text-danger-700">Error loading muscle groups</p>
          <p className="mt-1 text-sm text-danger-600">{error}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Muscle Groups</h1>
      <p className="mt-2 text-default-500">Categories for exercises.</p>
      <Card className="mt-6">
        {muscleGroups.length === 0 ? (
          <CardBody className="text-center py-12 text-default-500">No muscle groups yet.</CardBody>
        ) : (
          <ul className="divide-y divide-default-200">
            {muscleGroups.map((g) => (
              <li key={g.$id} className="px-4 py-3 sm:px-6">
                <p className="font-medium text-foreground">{g.name}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
