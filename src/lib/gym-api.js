/**
 * Shared config and helpers for gym coach API routes.
 * Database and collection IDs must match Appwrite.
 */
import { Query } from "node-appwrite";
import { serverDatabases } from "@/lib/appwrite-server";

export const DB_ID = (process.env.APPWRITE_GYM_DATABASE_ID ?? "gym_coach").trim();

export const COLLECTIONS = {
  members: "members",
  exercises: "exercises",
  "muscle-groups": "muscle_groups",
  "meal-categories": "meal_categories",
  "workout-modules": "modules",
  "workout-plans": "workout_plans",
  "module-exercises": "module_exercises",
  sessions: "sessions",
  meals: "meals",
  "meals-modules": "meals_modules",
  "meal-plans": "meal_plans",
  "meal-module-meals": "meal_module_meals",
  "workout-plan-modules": "workout_plan_modules",
  "meal-plan-modules": "meal_plan_modules",
  "meal-logs": "meal_logs",
  "progress-photos": "progress_photos",
};

/** Collection keys that are scoped by owner_id (coach). */
export const OWNER_SCOPED_KEYS = new Set([
  "members",
  "workout-plans",
  "meal-plans",
  "sessions",
  "meal-logs",
]);

export async function listGymDocuments(collectionKey, options = {}) {
  const collectionId = COLLECTIONS[collectionKey] ?? collectionKey;
  const {
    limit = 100,
    orderDesc = "$createdAt",
    orderBy,
    orderAsc,
    ownerId,
    filters = [],
  } = options;
  const queries = [Query.limit(limit)];
  if (orderBy && orderAsc) {
    queries.push(Query.orderAsc(orderBy));
  } else {
    queries.push(Query.orderDesc(orderDesc));
  }
  if (ownerId && OWNER_SCOPED_KEYS.has(collectionKey)) {
    queries.push(Query.equal("owner_id", ownerId));
  }
  for (const { attribute, value } of filters) {
    if (attribute != null && value != null && value !== "") {
      queries.push(Query.equal(attribute, value));
    }
  }
  const { documents, total } = await serverDatabases.listDocuments(DB_ID, collectionId, queries);
  return { documents, total };
}
