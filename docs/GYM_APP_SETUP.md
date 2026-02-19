# Gym Coach app – Appwrite setup

The Gym Coach app uses a separate Appwrite database. Create it once in the Console so **Members** (and later other sections) work.

## 1. Create database

1. Open **Appwrite Console** → your project.
2. **Databases** → **Create database**.
3. **Name:** `Gym Coach`.
4. **Database ID:** `gym_coach` (must be exactly this, or set `APPWRITE_GYM_DATABASE_ID` in `.env.local` to your ID).

## 2. Create “members” collection

1. Open the **gym_coach** database.
2. **Create collection**.
3. **Name:** `Members`.
4. **Collection ID:** `members`.
5. **Permissions:** e.g. read/write for `any` (or restrict by role later).

### Attributes for “members”

| Key   | Type   | Size  | Required |
|-------|--------|-------|----------|
| name  | string | 512   | No       |
| email | string | 512   | No       |
| phone | string | 128   | No       |
| notes | string | 8192  | No       |

Add these in **Attributes** (no indexes required for basic list/detail).

## 3. Optional env

In `.env.local` you can override the database ID:

```env
APPWRITE_GYM_DATABASE_ID=gym_coach
```

If you use a different ID in the Console, set it here.

## 4. Run the app

- **Dashboard:** `/app`
- **Members:** `/app/members` (list, add, view).
- Other sections (Exercises, Workout Plans, etc.) are placeholders; add collections and API routes as you build them out.

## File storage (progress photos)

Per project rules, use **R2 (Cloudflare)** for file uploads (progress photos, etc.). Store only file URLs or keys in Appwrite; do not store binary files in Appwrite Storage.
