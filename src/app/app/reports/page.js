"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { parseDate } from "@internationalized/date";
import { useGymList } from "../use-gym-list";
import {
  Button,
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
  DateRangePicker,
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
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const dateRangeValue = useMemo(
    () => ({ start: parseDate(fromDate), end: parseDate(toDate) }),
    [fromDate, toDate]
  );

  const resetFilters = () => {
    setMemberId("");
    setFromDate(defaultFrom());
    setToDate(defaultTo());
  };

  const filtered = useMemo(() => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);
    const inRange = (dateStr) => {
      const d = new Date(dateStr);
      return d >= from && d <= to;
    };
    const byMember = (item) => !memberId || item.member_id === memberId;
    return {
      sessions: (sessions ?? []).filter((s) => byMember(s) && inRange(s.session_date)),
      mealLogs: (mealLogs ?? []).filter((l) => byMember(l) && inRange(l.log_date)),
      progressPhotos: (progressPhotos ?? []).filter((p) => byMember(p) && inRange(p.photo_date)),
    };
  }, [sessions, mealLogs, progressPhotos, memberId, fromDate, toDate]);

  const summary = useMemo(() => {
    const total = (sessions ?? []).filter((s) => !memberId || s.member_id === memberId).length;
    const inPeriod = filtered.sessions.length;
    const progressEntries = filtered.progressPhotos.length;
    return {
      totalSessions: total,
      inPeriod,
      currentStreak: 0,
      progressEntries,
      weightChange: "—",
    };
  }, [sessions, memberId, filtered]);

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
      <div className="rounded-lg border border-default-200 p-4 gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <Select
            label="Member"
            placeholder="Select Member"
            selectedKeys={memberId ? [memberId] : []}
            onSelectionChange={(keys) => setMemberId(Array.from(keys)[0] ?? "")}
            size="sm"
            className="w-[200px] shrink-0"
          >
            {(members ?? []).map((m) => (
              <SelectItem key={m.$id}>{m.name || m.email || m.$id}</SelectItem>
            ))}
          </Select>
          <div
            className="w-[280px] shrink-0 cursor-pointer"
            onClick={() => setDatePickerOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setDatePickerOpen(true)}
            aria-label="Open date range picker"
          >
            <DateRangePicker
              label="Date range"
              value={dateRangeValue}
              onChange={(range) => {
                if (range?.start && range?.end) {
                  setFromDate(range.start.toString());
                  setToDate(range.end.toString());
                }
              }}
              isOpen={datePickerOpen}
              onOpenChange={setDatePickerOpen}
              size="sm"
              className="w-full pointer-events-none"
              visibleMonths={2}
            />
          </div>
          <Button variant="solid" color="default" size="sm" onPress={resetFilters} className="shrink-0 pb-0.5">
            Reset
          </Button>
        </div>
        <p className="mt-2 text-sm text-default-500">
          Showing data from {formatDate(fromDate)} to {formatDate(toDate)}
          {memberId && ` for ${memberMap[memberId] ?? memberId}`}.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 rounded-lg border border-default-200 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="py-2">
          <p className="text-tiny text-default-500 uppercase font-semibold">Total Sessions</p>
          <p className="text-2xl font-bold text-primary">{summary.totalSessions}</p>
        </div>
        <div className="py-2">
          <p className="text-tiny text-default-500 uppercase font-semibold">In Period</p>
          <p className="text-2xl font-bold text-success">{summary.inPeriod}</p>
        </div>
        <div className="py-2">
          <p className="text-tiny text-default-500 uppercase font-semibold">Current Streak</p>
          <p className="text-2xl font-bold text-danger">{summary.currentStreak}</p>
        </div>
        <div className="py-2">
          <p className="text-tiny text-default-500 uppercase font-semibold">Progress Entries</p>
          <p className="text-2xl font-bold text-warning">{summary.progressEntries}</p>
        </div>
        <div className="py-2">
          <p className="text-tiny text-default-500 uppercase font-semibold">Weight Change</p>
          <p className="text-2xl font-bold text-foreground">{summary.weightChange}</p>
        </div>
      </div>

      {/* Weight & Measurements Progress */}
      <section className="rounded-lg border border-default-200 p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-medium text-foreground">
            Weight & Measurements Progress ({formatDate(fromDate)} to {formatDate(toDate)})
          </h2>
          <Chip size="sm" color="primary" variant="flat">Weight (kg)</Chip>
          <Chip size="sm" color="danger" variant="flat">Waist (cm)</Chip>
        </div>
        <div className="min-h-[120px] flex items-center">
          <p className="text-default-500 text-sm">Add weight and measurements to progress entries to see this chart.</p>
        </div>
      </section>

      {/* Training Frequency */}
      <section className="rounded-lg border border-default-200 p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-medium text-foreground">
            Training Frequency ({formatDate(fromDate)} to {formatDate(toDate)})
          </h2>
          <Chip size="sm" color="success" variant="flat">Sessions per week</Chip>
        </div>
        {sessionsPerWeek.length === 0 ? (
          <p className="py-8 text-default-500">No sessions in this period.</p>
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
      </section>

      {/* Recent Progress Logs | Recent Meal Logs */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-default-200 p-4">
          <div className="mb-2 flex flex-row items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">Recent Progress Logs</h2>
            <Button as={Link} href="/app/members" size="sm" variant="light">
              View All →
            </Button>
          </div>
          <div className="overflow-auto max-h-80">
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
          </div>
        </section>
        <section className="rounded-lg border border-default-200 p-4">
          <div className="mb-2 flex flex-row items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">Recent Meal Logs</h2>
            <Button as={Link} href="/app/meal-logs" size="sm" variant="light">
              View All →
            </Button>
          </div>
          <div className="overflow-auto max-h-80">
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
          </div>
        </section>
      </div>

      {/* Recent Training Sessions */}
      <section className="rounded-lg border border-default-200 p-4">
        <div className="mb-2 flex flex-row items-center justify-between">
          <h2 className="text-lg font-medium text-foreground">Recent Training Sessions</h2>
          <Button as={Link} href="/app/sessions" size="sm" variant="light">
            View All →
          </Button>
        </div>
        <div className="overflow-auto max-h-80">
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
        </div>
      </section>

      {/* Export Data */}
      <section className="rounded-lg border border-default-200 p-4">
        <h2 className="mb-2 text-lg font-medium text-foreground">Export Data</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="solid" color="primary" onPress={exportSessionsToCsv}>
            Export Sessions to CSV
          </Button>
          <Button variant="solid" color="default" onPress={exportProgressToCsv}>
            Export Progress to CSV
          </Button>
        </div>
      </section>
    </div>
  );
}
