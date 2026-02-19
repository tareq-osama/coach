"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardBody, Button, Spinner } from "@heroui/react";
import ProgressPhotosSection from "./ProgressPhotosSection";

export default function MemberDetailPage() {
  const params = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/gym/members/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.details || data.error);
        setMember(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Spinner size="lg" color="primary" />
        <p className="text-default-500">Loading…</p>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div>
        <Button as={Link} href="/app/members" variant="light" size="sm">
          ← Members
        </Button>
        <Card className="mt-4 border-danger-200 bg-danger-50 dark:bg-danger-50/10">
          <CardBody>
            <p className="text-danger-700 dark:text-danger-400">{error ?? "Member not found."}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button as={Link} href="/app/members" variant="light" size="sm">
          ← Members
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">{member.name || "Unnamed"}</h1>
      </div>
      <Card>
        <CardBody className="gap-4">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-default-500">Email</dt>
              <dd className="mt-1 text-foreground">{member.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-default-500">Phone</dt>
              <dd className="mt-1 text-foreground">{member.phone || "—"}</dd>
            </div>
            {member.notes && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-default-500">Notes</dt>
                <dd className="mt-1 whitespace-pre-wrap text-foreground">{member.notes}</dd>
              </div>
            )}
          </dl>
        </CardBody>
      </Card>

      <div className="mt-6">
        <ProgressPhotosSection memberId={member.$id} />
      </div>
    </div>
  );
}
