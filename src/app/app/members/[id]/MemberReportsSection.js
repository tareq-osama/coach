"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { parseDate } from "@internationalized/date";
import { useGymList } from "../../use-gym-list";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  DateRangePicker,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
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

export default function MemberReportsSection({ memberId, memberName }) {
  const { data: sessions } = useGymList("sessions");
  const { data: mealLogs } = useGymList("meal-logs");
  const { data: progressPhotos } = useGymList("progress-photos");
  const { data: plans } = useGymList("workout-plans");
  const [fromDate, setFromDate] = useState(defaultFrom());
  const [toDate, setToDate] = useState(defaultTo());
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const dateRangeValue = useMemo(
    () => ({ start: parseDate(fromDate), end: parseDate(toDate) }),
    [fromDate, toDate]
  );

  const filtered = useMemo(() => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);
    const inRange = (dateStr) => {
      const d = new Date(dateStr);
      return d >= from && d <= to;
    };
    return {
      sessions: (sessions ?? []).filter(
        (s) => s.member_id === memberId && inRange(s.session_date)
      ),
      mealLogs: (mealLogs ?? []).filter(
        (l) => l.member_id === memberId && inRange(l.log_date)
      ),
      progressPhotos: (progressPhotos ?? []).filter(
        (p) => p.member_id === memberId && inRange(p.photo_date)
      ),
    };
  }, [sessions, mealLogs, progressPhotos, memberId, fromDate, toDate]);

  const summary = useMemo(() => {
    const total = (sessions ?? []).filter((s) => s.member_id === memberId).length;
    return {
      totalSessions: total,
      inPeriod: filtered.sessions.length,
      currentStreak: 0,
      progressEntries: filtered.progressPhotos.length,
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

  const planMap = useMemo(
    () => Object.fromEntries((plans ?? []).map((p) => [p.$id, p.name])),
    [plans]
  );

  const recentProgress = useMemo(
    () =>
      [...filtered.progressPhotos].sort(
        (a, b) => new Date(b.photo_date) - new Date(a.photo_date)
      ).slice(0, 10),
    [filtered.progressPhotos]
  );
  const recentMealLogs = useMemo(
    () =>
      [...filtered.mealLogs].sort(
        (a, b) => new Date(b.log_date) - new Date(a.log_date)
      ).slice(0, 10),
    [filtered.mealLogs]
  );
  const recentSessions = useMemo(
    () =>
      [...filtered.sessions].sort(
        (a, b) => new Date(b.session_date) - new Date(a.session_date)
      ).slice(0, 10),
    [filtered.sessions]
  );

  const exportSessionsToCsv = () => {
    const headers = "Date,Workout Plan,Notes\n";
    const rows = filtered.sessions.map((s) => {
      const date = s.session_date ? new Date(s.session_date).toLocaleString() : "";
      const plan = planMap[s.workout_plan_id] ?? "";
      const notes = (s.notes ?? "").replace(/"/g, '""');
      return `"${date}","${plan}","${notes}"`;
    });
    const blob = new Blob([headers + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sessions-${memberName || memberId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportProgressToCsv = () => {
    const headers = "Date,Name\n";
    const rows = filtered.progressPhotos.map((p) => {
      const date = p.photo_date ? new Date(p.photo_date).toISOString().slice(0, 10) : "";
      const name = (p.name ?? "").replace(/"/g, '""');
      return `"${date}","${name}"`;
    });
    const blob = new Blob([headers + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `progress-${memberName || memberId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
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
      </div>
      <p className="text-sm text-default-500">
        Showing data from {formatDate(fromDate)} to {formatDate(toDate)} for this member.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card shadow="sm">
          <CardBody className="py-4">
            <p className="text-tiny text-default-500 uppercase font-semibold">Total Sessions</p>
            <p className="text-2xl font-bold text-primary">{summary.totalSessions}</p>
          </CardBody>
        </Card>
        <Card shadow="sm">
          <CardBody className="py-4">
            <p className="text-tiny text-default-500 uppercase font-semibold">In Period</p>
            <p className="text-2xl font-bold text-success">{summary.inPeriod}</p>
          </CardBody>
        </Card>
        <Card shadow="sm">
          <CardBody className="py-4">
            <p className="text-tiny text-default-500 uppercase font-semibold">Current Streak</p>
            <p className="text-2xl font-bold text-danger">{summary.currentStreak}</p>
          </CardBody>
        </Card>
        <Card shadow="sm">
          <CardBody className="py-4">
            <p className="text-tiny text-default-500 uppercase font-semibold">Progress Entries</p>
            <p className="text-2xl font-bold text-warning">{summary.progressEntries}</p>
          </CardBody>
        </Card>
        <Card shadow="sm">
          <CardBody className="py-4">
            <p className="text-tiny text-default-500 uppercase font-semibold">Weight Change</p>
            <p className="text-2xl font-bold text-foreground">{summary.weightChange}</p>
          </CardBody>
        </Card>
      </div>

      <Card shadow="sm">
        <CardHeader className="flex flex-wrap items-center gap-2 pb-2">
          <h3 className="text-lg font-medium text-foreground">
            Training Frequency ({formatDate(fromDate)} to {formatDate(toDate)})
          </h3>
          <Chip size="sm" color="success" variant="flat">Sessions per week</Chip>
        </CardHeader>
        <CardBody className="pt-0">
          {sessionsPerWeek.length === 0 ? (
            <p className="py-6 text-default-500 text-sm">No sessions in this period.</p>
          ) : (
            <div className="flex items-end gap-1 h-40">
              {sessionsPerWeek.map(({ week, count }) => {
                const maxCount = Math.max(...sessionsPerWeek.map((x) => x.count), 1);
                const barHeight = Math.max(8, (count / maxCount) * 120);
                return (
                  <div
                    key={week}
                    className="flex-1 flex flex-col items-center justify-end gap-1 h-full"
                    title={`${week}: ${count} sessions`}
                  >
                    <div
                      className="w-full rounded-t bg-success"
                      style={{ height: `${barHeight}px` }}
                    />
                    <span className="text-tiny text-default-400 truncate max-w-full">
                      {new Date(week).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card shadow="sm">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <h3 className="text-lg font-medium text-foreground">Recent Progress Logs</h3>
          </CardHeader>
          <CardBody className="pt-0">
            {recentProgress.length === 0 ? (
              <p className="py-4 text-sm text-default-500">No progress entries in this period.</p>
            ) : (
              <Table removeWrapper aria-label="Recent progress logs">
                <TableHeader>
                  <TableColumn>Date</TableColumn>
                  <TableColumn>Name</TableColumn>
                </TableHeader>
                <TableBody>
                  {recentProgress.map((p) => (
                    <TableRow key={p.$id}>
                      <TableCell>{formatDate(p.photo_date)}</TableCell>
                      <TableCell>{p.name || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
        <Card shadow="sm">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <h3 className="text-lg font-medium text-foreground">Recent Meal Logs</h3>
          </CardHeader>
          <CardBody className="pt-0">
            {recentMealLogs.length === 0 ? (
              <p className="py-4 text-sm text-default-500">No meal logs in this period.</p>
            ) : (
              <Table removeWrapper aria-label="Recent meal logs">
                <TableHeader>
                  <TableColumn>Date</TableColumn>
                  <TableColumn>Notes</TableColumn>
                </TableHeader>
                <TableBody>
                  {recentMealLogs.map((log) => (
                    <TableRow key={log.$id}>
                      <TableCell>{formatDate(log.log_date)}</TableCell>
                      <TableCell>{log.notes || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </div>

      <Card shadow="sm">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <h3 className="text-lg font-medium text-foreground">Recent Training Sessions</h3>
        </CardHeader>
        <CardBody className="pt-0">
          {recentSessions.length === 0 ? (
            <p className="py-4 text-sm text-default-500">No sessions in this period.</p>
          ) : (
            <Table removeWrapper aria-label="Recent training sessions">
              <TableHeader>
                <TableColumn>Date</TableColumn>
                <TableColumn>Workout Plan</TableColumn>
                <TableColumn>Notes</TableColumn>
              </TableHeader>
              <TableBody>
                {recentSessions.map((s) => (
                  <TableRow key={s.$id}>
                    <TableCell>{formatDate(s.session_date)}</TableCell>
                    <TableCell>
                      <span className="text-success-600 dark:text-success-400">
                        {planMap[s.workout_plan_id] ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>{s.notes || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Card shadow="sm">
        <CardHeader className="pb-2">
          <h3 className="text-lg font-medium text-foreground">Export Data</h3>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="flex flex-wrap gap-3">
            <Button variant="solid" color="primary" onPress={exportSessionsToCsv}>
              Export Sessions to CSV
            </Button>
            <Button variant="solid" color="default" onPress={exportProgressToCsv}>
              Export Progress to CSV
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
