# Appwrite server log errors – what they mean

## 1. `Document with the requested ID could not be found`  
**URL:** `GET /v1/databases/.../documents/:documentId`

- A **getDocument** call was made with a document ID that doesn’t exist or is invalid (e.g. `undefined`).
- **This app** uses **listDocuments** and **getDocument** for Gym Coach members via `/api/gym/members`.
- So these 404s can come from: **Appwrite Console** (e.g. Documents table with undefined ID), another app/tab, or a member detail page when the ID in the URL doesn’t exist.
- **What to do:** Ignore if you don’t use getDocument in your code. If you add a “single document” page, only call getDocument when the id from the URL/params is defined and valid.

---

## 2. `Invalid document structure: Missing required attribute "…"`  
**URL:** `POST /v1/databases/.../documents`

- A document was created without a required attribute (e.g. **name**, **email** for members).
- **What to do:** Ensure all required attributes for the collection are sent. For **members**, see `docs/GYM_APP_SETUP.md` for the schema.

---

## 3. `User (role: guests) missing scope (account)`  
**URL:** `GET /v1/account`

- An unauthenticated (guest) request was made to the **account** endpoint.
- **This app** does not call `account.get()`; it only uses `client.ping()` from the client.
- So this usually comes from the **Appwrite Console** or another app checking the current user without a session.
- **What to do:** Safe to ignore if you don’t need account in your app. The client lib no longer exports `account` so this app won’t trigger it by mistake.
