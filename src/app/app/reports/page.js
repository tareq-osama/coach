"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useGymList } from "../use-gym-list";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Spinner,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from "@heroui/react";

const defaultFrom = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString().slice(0, 10);
};
const defaultTo = () => new Date().toISOString().slice(0, 10);

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: "long" });
  } catch {
    return iso;
  }
}

function getWeekKey(dateStr) {
  const d = new Date(dateStr);
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return start.toISOString().slice(0, 10);
}

export default function ReportsPage() {
  const { data: sessions, loading: sessionsLoading } = useGymList("sessions");
  const { data: mealLogs } = useGymList("meal-logs");
  const { data: progressPhotos } = useGymList("progress-photos");
  const { data: members } = useGymList("members");
  const { data: plans } = useGymList("workout-plans");

  const [memberId, setMemberId] = useState("");
  const [fromDate, setFromDate] = useState(defaultFrom());
  const [toDate, setToDate] = useState(defaultTo());
  const [applied, setApplied] = useState({ memberId: "", from: defaultFrom(), to: defaultTo() });

  const applyFilters = () => setApplied({ memberId, from: fromDate, to: toDate });
  const resetFilters = () => {
    setMemberId("");
    setFromDate(defaultFrom());
    setToDate(defaultTo());
    setApplied({ memberId: "", from: defaultFrom(), to: defaultTo() });
  };

  const filtered = useMemo(() => {
    const from = new Date(applied.from);
    const to = new Date(applied.to);
    to.setHours(23, 59, 59, 999);
    const inRange = (dateStr) => {
      const d = new Date(dateStr);
      return d >= from && d <= to;
    };
    const byMember = (item) => !applied.memberId || item.member_id === applied.memberId;
    return {
      sessions: (sessions ?? []).filter((s) => byMember(s) && inRange(s.session_date)),
      mealLogs: (mealLogs ?? []).filter((l) => byMember(l) && inRange(l.log_date)),
      progressPhotos: (progressPhotos ?? []).filter((p) => byMember(p) && inRange(p.photo_date)),
    };
  }, [sessions, mealLogs, progressPhotos, applied]);

  const summary = useMemo(() => {
    const total = (sessions ?? []).filter((s) => !applied.memberId || s.member_id === applied.memberId).length;
    const inPeriod = filtered.sessions.length;
    const progressEntries = filtered.progressPhotos.length;
    return {
      totalSessions: total,
      inPeriod,
      currentStreak: 0,
      progressEntries,
      weightChange: "—",
    };
  }, [sessions, applied.memberId, filtered]);

  const sessionsPerWeek = useMemo(() => {
    const byWeek = {};
    filtered.sessions.forEach((s) => {
      const key = getWeekKey(s.session_date);
      byWeek[key] = (byWeek[key] || 0) + 1;
    });
    return Object.entries(byWeek)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 16)
      .map(([week, count]) => ({ week, count }));
  }, [filtered.sessions]);

  const memberMap = useMemo(() => Object.fromEntries((members ?? []).map((m) => [m.$id, m.name || m.email || "—"])), [members]);
  const planMap = useMemo(() => Object.fromEntries((plans ?? []).map((p) => [p.$id, p.name])), [plans]);

  const recentProgress = useMemo(
    () => [...filtered.progressPhotos].sort((a, b) => new Date(b.photo_date) - new Date(a.photo_date)).slice(0, 10),
    [filtered.progressPhotos]
  );
  const recentMealLogs = useMemo(
    () => [...filtered.mealLogs].sort((a, b) => new Date(b.log_date) - new Date(a.log_date)).slice(0, 10),
    [filtered.mealLogs]
  );
  const recentSessions = useMemo(
    () => [...filtered.sessions].sort((a, b) => new Date(b.session_date) - new Date(a.session_date)).slice(0, 10),
    [filtered.sessions]
  );

  const exportSessionsToCsv = () => {
    const headers = "Date,Member,Workout Plan,Notes\n";
    const rows = filtered.sessions.map((s) => {
      const date = s.session_date ? new Date(s.session_date).toLocaleString() : "";
      const member = memberMap[s.member_id] ?? s.member_id ?? "";
      const plan = planMap[s.workout_plan_id] ?? "";
      const notes = (s.notes ?? "").replace(/"/g, '""');
      return `"${date}","${member}","${plan}","${notes}"`;
    });
    const blob = new Blob([headers + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sessions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportProgressToCsv = () => {
    const headers = "Date,Member,Name\n";
    const rows = filtered.progressPhotos.map((p) => {
      const date = p.photo_date ? new Date(p.photo_date).toISOString().slice(0, 10) : "";
      const member = memberMap[p.member_id] ?? p.member_id ?? "";
      const name = (p.name ?? "").replace(/"/g, '""');
      return `"${date}","${member}","${name}"`;
    });
    const blob = new Blob([headers + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "progress.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (sessionsLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Spinner size="lg" color="primary" />
        <p className="text-default-500">Loading reports…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Reports & Analytics</h1>

      {/* Filters */}
      <Card>
        <CardBody className="gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <Select
              label="Select Member"
              placeholder="All members"
              selectedKeys={memberId ? [memberId] : []}
              onSelectionChange={(keys) => setMemberId(Array.from(keys)[0] ?? "")}
              className="min-w-[200px]"
            >
              {(members ?? []).map((m) => (
                <SelectItem key={m.$id}>{m.name || m.email || m.$id}</SelectItem>
              ))}
            </Select>
            <Input type="date" label="From Date" value={fromDate} onValueChange={setFromDate} size="sm" className="max-w-[180px]" />
            <Input type="date" label="To Date" value={toDate} onValueChange={setToDate} size="sm" className="max-w-[180px]" />
            <div className="flex gap-2">
              <Button color="primary" size="sm" onPress={applyFilters}>
                Apply Filters
              </Button>
              <Button variant="bordered" size="sm" onPress={resetFilters}>
                Reset
              </Button>
            </div>
          </div>
          <p className="text-sm text-default-500">
            Showing data from {formatDate(applied.from)} to {formatDate(applied.to)}
            {applied.memberId && ` for ${memberMap[applied.memberId] ?? applied.memberId}`}.
          </p>
        </CardBody>
      </Card>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardBody className="py-4">
            <p className="text-tiny text-default-500 uppercase font-semibold">Total Sessions</p>
            <p className="text-2xl font-bold text-primary">{summary.totalSessions}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <p className="text-tiny text-default-500 uppercase font-semibold">In Period</p>
            <p className="text-2xl font-bold text-success">{summary.inPeriod}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <p className="text-tiny text-default-500 uppercase font-semibold">Current Streak</p>
            <p className="text-2xl font-bold text-danger">{summary.currentStreak}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <p className="text-tiny text-default-500 uppercase font-semibold">Progress Entries</p>
            <p className="text-2xl font-bold text-warning">{summary.progressEntries}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <p className="text-tiny text-default-500 uppercase font-semibold">Weight Change</p>
            <p className="text-2xl font-bold text-foreground">{summary.weightChange}</p>
          </CardBody>
        </Card>
      </div>

      {/* Weight & Measurements Progress (placeholder: no weight/measurements in data yet) */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-lg font-medium text-foreground">
            Weight & Measurements Progress ({formatDate(applied.from)} to {formatDate(applied.to)})
          </h2>
          <div className="flex gap-2">
            <Chip size="sm" color="primary" variant="flat">Weight (kg)</Chip>
            <Chip size="sm" color="danger" variant="flat">Waist (cm)</Chip>
          </div>
        </CardHeader>
        <CardBody className="pt-0 min-h-[200px] flex items-center justify-center">
          <p className="text-default-500 text-sm">Add weight and measurements to progress entries to see this chart.</p>
        </CardBody>
      </Card>

      {/* Training Frequency bar chart */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-lg font-medium text-foreground">
            Training Frequency ({formatDate(applied.from)} to {formatDate(applied.to)})
          </h2>
          <Chip size="sm" color="success" variant="flat">Sessions per week</Chip>
        </CardHeader>
        <CardBody className="pt-0">
          {sessionsPerWeek.length === 0 ? (
            <p className="py-8 text-center text-default-500">No sessions in this period.</p>
          ) : (
            <div className="flex items-end gap-1 h-48">
              {sessionsPerWeek.map(({ week, count }) => {
                const maxCount = Math.max(...sessionsPerWeek.map((x) => x.count), 1);
                const barHeight = Math.max(8, (count / maxCount) * 160);
                return (
                  <div key={week} className="flex-1 flex flex-col items-center justify-end gap-1 h-full" title={`${week}: ${count} sessions`}>
                    <div
                      className="w-full rounded-t bg-success"
                      style={{ height: `${barHeight}px` }}
                    />
                    <span className="text-tiny text-default-400 truncate max-w-full">{new Date(week).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" })}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Two tables: Recent Progress Logs | Recent Meal Logs */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h2 className="text-lg font-medium text-foreground">Recent Progress Logs</h2>
            <Button as={Link} href="/app/members" size="sm" variant="light">
              View All →
            </Button>
          </CardHeader>
          <CardBody className="pt-0 overflow-auto max-h-80">
            {recentProgress.length === 0 ? (
              <p className="py-4 text-sm text-default-500">No progress entries in this period.</p>
            ) : (
              <Table removeWrapper aria-label="Recent progress logs">
                <TableHeader>
                  <TableColumn>Date</TableColumn>
                  <TableColumn>Weight</TableColumn>
                  <TableColumn>Measurements</TableColumn>
                </TableHeader>
                <TableBody>
                  {recentProgress.map((p) => (
                    <TableRow key={p.$id}>
                      <TableCell>
                        <Link href={`/app/members/${p.member_id}`} className="text-primary hover:underline">
                          {formatDate(p.photo_date)}
                        </Link>
                      </TableCell>
                      <TableCell>—</TableCell>
                      <TableCell>—</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h2 className="text-lg font-medium text-foreground">Recent Meal Logs</h2>
            <Button as={Link} href="/app/meal-logs" size="sm" variant="light">
              View All →
            </Button>
          </CardHeader>
          <CardBody className="pt-0 overflow-auto max-h-80">
            {recentMealLogs.length === 0 ? (
              <p className="py-4 text-sm text-default-500">No meal logs in this period.</p>
            ) : (
              <Table removeWrapper aria-label="Recent meal logs">
                <TableHeader>
                  <TableColumn>Date</TableColumn>
                  <TableColumn>Meal</TableColumn>
                  <TableColumn>Description</TableColumn>
                </TableHeader>
                <TableBody>
                  {recentMealLogs.map((log) => (
                    <TableRow key={log.$id}>
                      <TableCell>
                        <Link href={`/app/members/${log.member_id}`} className="text-primary hover:underline">
                          {formatDate(log.log_date)}
                        </Link>
                      </TableCell>
                      <TableCell>—</TableCell>
                      <TableCell>{log.notes || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent Training Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <h2 className="text-lg font-medium text-foreground">Recent Training Sessions</h2>
          <Button as={Link} href="/app/sessions" size="sm" variant="light">
            View All →
          </Button>
        </CardHeader>
        <CardBody className="pt-0 overflow-auto max-h-80">
          {recentSessions.length === 0 ? (
            <p className="py-4 text-sm text-default-500">No sessions in this period.</p>
          ) : (
            <Table removeWrapper aria-label="Recent training sessions">
              <TableHeader>
                <TableColumn>Date</TableColumn>
                <TableColumn>Title</TableColumn>
                <TableColumn>Exercises</TableColumn>
                <TableColumn>Workout Plan</TableColumn>
              </TableHeader>
              <TableBody>
                {recentSessions.map((s) => (
                  <TableRow key={s.$id}>
                    <TableCell>
                      <Link href={`/app/members/${s.member_id}`} className="text-primary hover:underline">
                        {formatDate(s.session_date)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/app/members/${s.member_id}`} className="text-primary hover:underline">
                        Training Session — {formatDate(s.session_date)}
                      </Link>
                    </TableCell>
                    <TableCell>—</TableCell>
                    <TableCell>
                      <span className="text-success-600 dark:text-success-400">
                        {planMap[s.workout_plan_id] ?? s.workout_plan_id ?? "—"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Export Data */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-lg font-medium text-foreground">Export Data</h2>
        </CardHeader>
        <CardBody className="pt-0 flex flex-row gap-3 flex-wrap">
          <Button variant="bordered" color="primary" onPress={exportSessionsToCsv}>
            Export Sessions to CSV
          </Button>
          <Button variant="bordered" color="primary" onPress={exportProgressToCsv}>
            Export Progress to CSV
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
