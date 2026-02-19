"use client";

import { useGymList } from "../use-gym-list";
import { Tabs, Tab, Card, CardHeader, CardBody, Image, Spinner } from "@heroui/react";

const ListIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const GridIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const tabs = [
  { id: "list", label: "List", title: "List" },
  { id: "grid", label: "Grid", title: "Grid" },
];

const EXERCISE_PLACEHOLDER_IMAGE = "https://heroui.com/images/hero-card-complete.jpeg";

export default function ExercisesPage() {
  const { data: exercises, loading, error } = useGymList("exercises");
  const { data: muscleGroups } = useGymList("muscle-groups");
  const groupMap = Object.fromEntries((muscleGroups ?? []).map((g) => [g.$id, g.name]));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Spinner size="lg" color="primary" />
        <p className="text-default-500">Loading exercises…</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-danger-200 bg-danger-50/20">
        <CardBody>
          <p className="font-medium text-danger-700">Error loading exercises</p>
          <p className="mt-1 text-sm text-danger-600">{error}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Exercises</h1>
      <p className="mt-2 text-default-500">Exercise library.</p>

      <div className="mt-6 flex w-full flex-col">
        <Tabs aria-label="View" items={tabs}>
          {(item) => (
            <Tab
              key={item.id}
              title={
                <span className="flex items-center gap-2">
                  {item.id === "list" ? <ListIcon /> : <GridIcon />}
                  {item.label}
                </span>
              }
            >
              <div className="mt-4">
                {item.id === "list" ? (
                  exercises.length === 0 ? (
                    <p className="text-center py-12 text-default-500">No exercises yet.</p>
                  ) : (
                    <ul className="divide-y divide-default-200">
                      {exercises.map((ex) => (
                        <li key={ex.$id} className="px-4 py-3 sm:px-6">
                          <p className="font-medium text-foreground">{ex.name}</p>
                          {ex.description && (
                            <p className="mt-0.5 text-sm text-default-500">{ex.description}</p>
                          )}
                          {ex.muscle_group_id && (
                            <p className="mt-1 text-xs text-default-400">
                              Muscle group: {groupMap[ex.muscle_group_id] ?? ex.muscle_group_id}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )
                ) : exercises.length === 0 ? (
                  <p className="text-center py-12 text-default-500">No exercises yet.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {exercises.map((ex) => (
                      <Card key={ex.$id} className="py-4">
                        <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
                          <p className="text-tiny font-bold uppercase text-default-500">
                            {ex.muscle_group_id ? groupMap[ex.muscle_group_id] ?? "Exercise" : "Exercise"}
                          </p>
                          <small className="text-default-500">
                            {ex.muscle_group_id ? "Muscle group" : "Exercise"}
                          </small>
                          <h4 className="font-bold text-large text-foreground">{ex.name}</h4>
                        </CardHeader>
                        <CardBody className="overflow-visible py-2">
                          <Image
                            alt={ex.name}
                            className="rounded-xl object-cover"
                            src={ex.image_url ?? ex.thumbnail ?? EXERCISE_PLACEHOLDER_IMAGE}
                            width={270}
                          />
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Tab>
          )}
        </Tabs>
      </div>
    </div>
  );
}
