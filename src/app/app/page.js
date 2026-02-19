"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/app/auth-context";
import { gymApiHeaders } from "@/lib/gym-client";
import { imageUrl } from "@/lib/image-url";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Spinner,
} from "@heroui/react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const CalendarIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const PersonPlusIcon = () => (
  <svg className="h-8 w-8 text-default-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

const ClipboardIcon = () => (
  <svg className="h-8 w-8 text-default-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const AppleIcon = () => (
  <svg className="h-8 w-8 text-default-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="h-6 w-6 text-default-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const VerticalDotsIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
);

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Build chart data: new members per month for last 12 months (from members list). */
function useMembersChartData(members) {
  return useMemo(() => {
    const now = new Date();
    const buckets = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        month: MONTHS_SHORT[d.getMonth()],
        fullLabel: `${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`,
        count: 0,
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
      });
    }
    if (!members?.length) return buckets;
    members.forEach((m) => {
      const created = m.$createdAt ? new Date(m.$createdAt) : null;
      if (!created) return;
      const b = buckets.find(
        (x) => x.year === created.getFullYear() && x.monthIndex === created.getMonth()
      );
      if (b) b.count += 1;
    });
    return buckets;
  }, [members]);
}

/** Recharts line/area styled with HeroUI theme (primary, foreground, default). */
function MembersChart({ data }) {
  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-default-200" vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--foreground))", opacity: 0.5, fontSize: 12 }}
          />
          <YAxis hide domain={[0, (max) => Math.max(max, 1)]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--default-200))",
              borderRadius: "var(--radius-lg)",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(value) => [value, "New members"]}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#chartFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function AppHome() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("12 months");
  const [members, setMembers] = useState([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [workoutPlansTotal, setWorkoutPlansTotal] = useState(0);
  const [exercisesTotal, setExercisesTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const chartData = useMembersChartData(members);

  useEffect(() => {
    if (!user?.$id) return;
    const headers = gymApiHeaders(user);
    Promise.all([
      fetch("/api/gym/members", { headers }).then((r) => r.json()),
      fetch("/api/gym/workout-plans", { headers }).then((r) => r.json()),
      fetch("/api/gym/exercises", { headers }).then((r) => r.json()),
    ])
      .then(([membersRes, plansRes, exercisesRes]) => {
        if (membersRes.documents) {
          setMembers(membersRes.documents);
          setTotalMembers(membersRes.total ?? membersRes.documents.length);
        }
        if (plansRes.total !== undefined) setWorkoutPlansTotal(plansRes.total);
        else if (plansRes.documents) setWorkoutPlansTotal(plansRes.documents.length);
        if (exercisesRes.total !== undefined) setExercisesTotal(exercisesRes.total);
        else if (exercisesRes.documents) setExercisesTotal(exercisesRes.documents.length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.$id]);

  const formatMemberSince = (dateStr) => {
    if (!dateStr) return "Member";
    try {
      const d = new Date(dateStr);
      return `Member since ${d.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
    } catch {
      return "Member";
    }
  };

  const topMembers = members.slice(0, 7);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-2">
          <ButtonGroup
            value={timeRange}
            onChange={setTimeRange}
            options={["12 months", "30 days", "7 days", "24 hours"]}
          />
          <Button variant="bordered" size="sm" startContent={<CalendarIcon />}>
            Select dates
          </Button>
          <Button variant="bordered" size="sm" startContent={<FilterIcon />}>
            Filters
          </Button>
        </div>
      </div>

      {/* ── Row 1: Active members + chart (left) | KPIs (right) ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border border-default-200/50" shadow="sm" radius="lg">
          <CardBody className="p-6">
            <p className="text-sm text-default-500">Active members</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-foreground">
                {loading ? "—" : totalMembers.toLocaleString()}
              </span>
              <span className="flex items-center gap-0.5 text-sm text-success-600">
                <ArrowUpIcon />
                {timeRange === "12 months" ? "12 months" : timeRange}
              </span>
            </div>
            <div className="mt-4 rounded-lg bg-default-100/80 p-4 dark:bg-default-50/50">
              {loading ? (
                <div className="flex h-[180px] items-center justify-center">
                  <Spinner size="md" color="primary" />
                </div>
              ) : (
                <MembersChart data={chartData} />
              )}
            </div>
          </CardBody>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="border border-default-200/50" shadow="sm" radius="lg">
            <CardBody className="p-4">
              <p className="text-sm text-default-500">Total members</p>
              <p className="text-xl font-semibold text-foreground">
                {loading ? "—" : totalMembers.toLocaleString()}
              </p>
              <Button as={Link} href="/app/members" variant="light" size="sm" className="mt-1 -ml-1 text-primary">
                View all
              </Button>
            </CardBody>
          </Card>
          <Card className="border border-default-200/50" shadow="sm" radius="lg">
            <CardBody className="p-4">
              <p className="text-sm text-default-500">Workout plans</p>
              <p className="text-xl font-semibold text-foreground">
                {loading ? "—" : workoutPlansTotal.toLocaleString()}
              </p>
              <Button as={Link} href="/app/workout-plans" variant="light" size="sm" className="mt-1 -ml-1 text-primary">
                View all
              </Button>
            </CardBody>
          </Card>
          <Card className="border border-default-200/50" shadow="sm" radius="lg">
            <CardBody className="p-4">
              <p className="text-sm text-default-500">Exercises</p>
              <p className="text-xl font-semibold text-foreground">
                {loading ? "—" : exercisesTotal.toLocaleString()}
              </p>
              <Button as={Link} href="/app/exercises" variant="light" size="sm" className="mt-1 -ml-1 text-primary">
                View all
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* ── Quick access: Add member, New workout plan, New meal plan ── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Quick access</h2>
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly variant="light" size="sm" aria-label="More options">
                <VerticalDotsIcon />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Quick access">
              <DropdownSection title="Training">
                <DropdownItem key="members" as={Link} href="/app/members">Members</DropdownItem>
                <DropdownItem key="exercises" as={Link} href="/app/exercises">Exercises</DropdownItem>
                <DropdownItem key="plans" as={Link} href="/app/workout-plans">Workout plans</DropdownItem>
              </DropdownSection>
              <DropdownSection title="Nutrition">
                <DropdownItem key="meals" as={Link} href="/app/meals">Meals</DropdownItem>
                <DropdownItem key="meal-plans" as={Link} href="/app/meal-plans">Meal plans</DropdownItem>
              </DropdownSection>
              <DropdownSection title="Tracking">
                <DropdownItem key="reports" as={Link} href="/app/reports">Reports</DropdownItem>
                <DropdownItem key="sessions" as={Link} href="/app/sessions">Sessions</DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card as={Link} href="/app/members/new" isPressable isHoverable className="border border-default-200/50" shadow="sm" radius="lg">
            <CardBody className="flex flex-row items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-default-100">
                <PersonPlusIcon />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">Add member</p>
                <p className="text-sm text-default-500">Create a profile or import</p>
              </div>
            </CardBody>
          </Card>
          <Card as={Link} href="/app/workout-plans" isPressable isHoverable className="border border-default-200/50" shadow="sm" radius="lg">
            <CardBody className="flex flex-row items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-default-100">
                <ClipboardIcon />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">Workout plans</p>
                <p className="text-sm text-default-500">Create and assign routines</p>
              </div>
            </CardBody>
          </Card>
          <Card as={Link} href="/app/meal-plans" isPressable isHoverable className="border border-default-200/50" shadow="sm" radius="lg">
            <CardBody className="flex flex-row items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-default-100">
                <AppleIcon />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">Meal plans</p>
                <p className="text-sm text-default-500">Create and assign meal plans</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* ── Row 3: Quick links (Reports, Sessions, etc.) | Top members ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Tracking & reports</h2>
          <div className="flex flex-col gap-3">
            <Card as={Link} href="/app/reports" isPressable className="border border-default-200/50" shadow="sm" radius="lg">
              <CardBody className="flex flex-row items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <ChartIcon />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">Reports & analytics</p>
                  <p className="text-xs text-default-500">Progress and insights</p>
                </div>
              </CardBody>
            </Card>
            <Card as={Link} href="/app/sessions" isPressable className="border border-default-200/50" shadow="sm" radius="lg">
              <CardBody className="flex flex-row items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-default-100">
                  <CalendarIcon />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">Sessions</p>
                  <p className="text-xs text-default-500">Schedule and track</p>
                </div>
              </CardBody>
            </Card>
            <Card as={Link} href="/app/forms" isPressable className="border border-default-200/50" shadow="sm" radius="lg">
              <CardBody className="flex flex-row items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-default-100">
                  <ClipboardIcon />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">Forms</p>
                  <p className="text-xs text-default-500">Custom forms</p>
                </div>
              </CardBody>
            </Card>
            <Card as={Link} href="/app/meal-logs" isPressable className="border border-default-200/50" shadow="sm" radius="lg">
              <CardBody className="flex flex-row items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-default-100">
                  <AppleIcon />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">Meal logs</p>
                  <p className="text-xs text-default-500">Log client meals</p>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        <Card className="lg:col-span-2 border border-default-200/50" shadow="sm" radius="lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h2 className="text-lg font-semibold text-foreground">Recent members</h2>
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly variant="light" size="sm" aria-label="More options">
                  <VerticalDotsIcon />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Members actions">
                <DropdownSection title="Actions">
                  <DropdownItem key="all" as={Link} href="/app/members">View all members</DropdownItem>
                  <DropdownItem key="new" as={Link} href="/app/members/new">Add member</DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </CardHeader>
          <CardBody className="pt-0">
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" color="primary" />
              </div>
            ) : topMembers.length === 0 ? (
              <p className="py-8 text-center text-sm text-default-500">
                No members yet. Add your first member to get started.
              </p>
            ) : (
              <ul className="divide-y divide-default-200">
                {topMembers.map((m) => (
                  <li key={m.$id}>
                    <Link href={`/app/members/${m.$id}`} className="flex items-center gap-3 py-3">
                      <Avatar
                        src={imageUrl(m.thumbnail) || undefined}
                        name={m.name}
                        size="sm"
                        className="shrink-0"
                        showFallback
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{m.name || "Unnamed"}</p>
                        <p className="text-sm text-default-500">{formatMemberSince(m.$createdAt)}</p>
                      </div>
                      <span className="h-2 w-2 shrink-0 rounded-full bg-success-500" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function ButtonGroup({ value, onChange, options }) {
  return (
    <div className="flex rounded-lg border border-default-200 overflow-hidden">
      {options.map((opt) => (
        <Button
          key={opt}
          size="sm"
          variant={value === opt ? "flat" : "light"}
          className="min-w-0 rounded-none font-normal"
          onPress={() => onChange(opt)}
        >
          {opt}
        </Button>
      ))}
    </div>
  );
}
