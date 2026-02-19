import { Client } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

// Only client is exported. Use server API routes + serverDatabases for documents
// so we never call getDocument(undefined) or account.get() (guests scope) from the browser.
export { client };
