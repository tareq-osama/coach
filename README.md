# Gym Coach App

A Next.js app for gym coaches, built with [Appwrite](https://www.appwrite.io) for auth and data. Manage members, exercises, workout modules, meal plans, sessions, and more.

## Getting started

### 1. Clone the project

```bash
git clone https://github.com/tareq-osama/coach.git
cd coach
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure Appwrite

Copy `.env.example` to `.env.local` and set your Appwrite project credentials:

- `NEXT_PUBLIC_APPWRITE_ENDPOINT`  your Appwrite API endpoint  
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID`  your project ID  
- `APPWRITE_API_KEY`  server API key (keep secret)  
- `APPWRITE_GYM_DATABASE_ID`  optional; defaults to `gym_coach`

Create the database and collections in Appwrite Console. See [docs/GYM_APP_SETUP.md](docs/GYM_APP_SETUP.md) for the Gym Coach database setup (members, exercises, workout modules, etc.).

### 4. Run the app

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in or register, then use the app dashboard at `/app`.

## Deploying to Vercel

1. **Environment variables**  
   In Vercel: Project → Settings → Environment Variables, add the same vars you use locally:
   - `NEXT_PUBLIC_APPWRITE_ENDPOINT` (e.g. `https://cloud.appwrite.io/v1`)
   - `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
   - `APPWRITE_API_KEY`
   - `APPWRITE_GYM_DATABASE_ID` (optional)
   - `NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID` (optional; for progress photos)

2. **Allow your Vercel URL in Appwrite**  
   Login runs in the browser and talks to Appwrite directly. If your Vercel URL is not allowed, you get “failed to fetch” or CORS errors.
   - Open [Appwrite Console](https://cloud.appwrite.io) → your project → **Auth** → **Settings** → **Platforms**.
   - Add a **Web** platform if you don’t have one.
   - Set **Hostname** to your Vercel URL, e.g. `your-app.vercel.app` (no `https://`).
   - If you use a custom domain, add that hostname as well.
   - Save. Redeploy on Vercel if you only just set env vars.

## Tech stack

- **Next.js** (App Router)
- **Appwrite** – auth and database
- **HeroUI** – UI components and theming (light/dark)
- **Tailwind CSS**

## Docs

- [Gym Coach Appwrite setup](docs/GYM_APP_SETUP.md) – database and collections
