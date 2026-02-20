"use client";

import EmptyState from "../components/EmptyState";

export default function InboxPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Inbox</h1>
      <p className="mt-2 text-default-500">Messages and notifications.</p>
      <EmptyState pathname="/app/inbox" message="No messages yet" className="mt-12" />
    </div>
  );
}
