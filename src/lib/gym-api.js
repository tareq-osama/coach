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
  "workout-modules": "modules",
  "workout-plans": "workout_plans",
  sessions: "sessions",
  meals: "meals",
  "meals-modules": "meals_modules",
  "meal-plans": "meal_plans",
  "meal-logs": "meal_logs",
  "progress-photos": "progress_photos",
};

export async function listGymDocuments(collectionKey, options = {}) {
  const collectionId = COLLECTIONS[collectionKey] ?? collectionKey;
  const { limit = 100, orderDesc = "$createdAt" } = options;
  const { documents, total } = await serverDatabases.listDocuments(DB_ID, collectionId, [
    Query.limit(limit),
    Query.orderDesc(orderDesc),
  ]);
  return { documents, total };
}
