# Interacting with Appwrite Data (per official docs)

## Env vars

- `NEXT_PUBLIC_APPWRITE_ENDPOINT` / `NEXT_PUBLIC_APPWRITE_PROJECT_ID` – safe for browser; already in use.
- `APPWRITE_API_KEY` – **server only**; create in Appwrite Console → Project → API Keys. Add to `.env.local` (do not use `NEXT_PUBLIC_`).
- Optional for Gym Coach: `APPWRITE_GYM_DATABASE_ID` (default: `gym_coach`). Create the database and **members** collection per `docs/GYM_APP_SETUP.md`.

## Two ways to talk to Appwrite

| Context | Client type | Auth | Use for |
|--------|-------------|------|--------|
| **Browser** (Client Components) | Client with endpoint + project (optional: session) | User session or anonymous | User-scoped reads/writes; respects permissions & rate limits |
| **Server** (API routes, Server Components, actions) | Client with endpoint + project **+ API key** | API key | Admin/server-only access; no rate limits on most writes |

## 1. Client-side (browser)

Your existing `src/lib/appwrite.js` is correct for the browser:

- `Client` with `setEndpoint` + `setProject` only → unauthenticated or use `setSession()` for logged-in user.
- Use `databases` (and `account`) from this lib in Client Components.
- All requests respect **permissions** (collection + document) and **rate limits**.

```js
import { databases } from "@/lib/appwrite";
import { Query, ID } from "appwrite";

// List with filter, sort, pagination
const { documents, total } = await databases.listDocuments(
  "YOUR_DATABASE_ID",
  "YOUR_COLLECTION_ID",
  [
    Query.equal("status", "published"),
    Query.limit(10),
    Query.offset(0),
    Query.orderDesc("$createdAt"),
  ]
);

// Get one
const doc = await databases.getDocument(
  "YOUR_DATABASE_ID",
  "YOUR_COLLECTION_ID",
  "DOCUMENT_ID"
);

// Create (document ID optional; use ID.unique() for auto)
await databases.createDocument(
  "YOUR_DATABASE_ID",
  "YOUR_COLLECTION_ID",
  ID.unique(),
  { title: "Hello", body: "World" }
);
```

## 2. Server-side (API routes / Server Components)

For server code, Appwrite recommends a **separate client with API key** so you get server-to-server access without user session and without rate limits on most operations.

- Create the client only on the server (e.g. in a server-only module).
- Use an env var that is **never** exposed to the browser (e.g. `APPWRITE_API_KEY`), not `NEXT_PUBLIC_*`.

```js
// Server only: setEndpoint + setProject + setKey(process.env.APPWRITE_API_KEY)
const serverClient = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);
const serverDatabases = new Databases(serverClient);
```

Then in API routes or Server Components, use `serverDatabases` for list/get/create/update/delete. Permissions still exist on the backend, but the API key typically has full access.

## 3. Queries (filter, sort, pagination)

Use the **Query** class and pass an array to `queries`:

- **Filter**: `Query.equal("status", "draft")`, `Query.notEqual`, `Query.greaterThan`, `Query.lessThan`, `Query.between`, `Query.contains`, `Query.search` (needs fulltext index), etc.
- **Sort**: `Query.orderAsc("name")`, `Query.orderDesc("$createdAt")` (attribute usually needs an index).
- **Pagination**: `Query.limit(25)`, `Query.offset(50)` or cursor-based with `Query.cursorAfter(id)` / `Query.cursorBefore(id)`.

Default list limit is 25. Combine as many queries as needed (AND between them; for OR use multiple values in one equal or `Query.or([...])`).

## 4. Permissions

- Set on **collection** (default for all documents) or per **document** (if document security is enabled).
- Use `Permission.read(Role.any())`, `Permission.write(Role.users())`, `Role.team("id")`, etc.
- Client SDK requests are checked against these roles; server SDK with API key bypasses for admin use.

## 5. Summary

- **Browser**: use `src/lib/appwrite.js` (no API key); use `Query` for list/get; optional `setSession()` for logged-in user.
- **Server**: use a server-only client with `setKey(APPWRITE_API_KEY)` and the same `Databases` API and `Query` class.
- **Queries**: always use `Query.*` in the `queries` array for filter/sort/pagination.

References: [Client Databases](https://appwrite.io/docs/client/databases), [Server Databases](https://appwrite.io/docs/server/databases), [Queries](https://appwrite.io/docs/queries).
