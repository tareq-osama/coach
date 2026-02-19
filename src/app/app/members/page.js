"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Spinner,
  User,
  Chip,
} from "@heroui/react";

const columns = [
  { name: "NAME", uid: "name", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "PHONE", uid: "phone" },
  { name: "ACTIONS", uid: "actions" },
];

const statusOptions = [
  { name: "Active", uid: "active" },
  { name: "Paused", uid: "paused" },
  { name: "Vacation", uid: "vacation" },
];

const statusColorMap = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

const INITIAL_VISIBLE_COLUMNS = ["name", "status", "phone", "actions"];

const PlusIcon = ({ size = 24, width, height, ...props }) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    >
      <path d="M6 12h12" />
      <path d="M12 18V6" />
    </g>
  </svg>
);

const VerticalDotsIcon = ({ size = 24, width, height, ...props }) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <path
      d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
      fill="currentColor"
    />
  </svg>
);

const SearchIcon = (props) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

const ChevronDownIcon = ({ strokeWidth = 1.5, ...otherProps }) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...otherProps}
  >
    <path
      d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={strokeWidth}
    />
  </svg>
);

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = useState(new Set(statusOptions.map((s) => s.uid)));
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "name",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    const url = "/api/gym/members";
    fetch(url)
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) {
          try {
            const data = JSON.parse(text);
            throw new Error(data.details || data.error || `HTTP ${res.status}`);
          } catch (e) {
            if (e instanceof SyntaxError || text.trimStart().startsWith("<")) {
              throw new Error(`API error (${res.status}). Check that ${url} is available.`);
            }
            throw e;
          }
        }
        try {
          return JSON.parse(text);
        } catch (e) {
          if (text.trimStart().startsWith("<")) {
            throw new Error("API returned HTML instead of JSON. Check that the server and /api/gym/members are correct.");
          }
          throw new Error("Invalid JSON from API");
        }
      })
      .then((data) => {
        if (data.error) throw new Error(data.details || data.error);
        setMembers(data.documents ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const pages = Math.ceil(members.length / rowsPerPage) || 1;
  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((col) => Array.from(visibleColumns).includes(col.uid));
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filtered = [...members];
    if (filterValue) {
      const lower = filterValue.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          (m.name ?? "").toLowerCase().includes(lower) ||
          (m.email ?? "").toLowerCase().includes(lower)
      );
    }
    if (statusFilter.size > 0 && statusFilter.size < statusOptions.length) {
      filtered = filtered.filter((m) => statusFilter.has(m.status ?? "active"));
    }
    return filtered;
  }, [members, filterValue, statusFilter]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const col = sortDescriptor.column;
      const first = a[col] ?? "";
      const second = b[col] ?? "";
      const cmp = String(first).localeCompare(String(second), undefined, { numeric: true });
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback((member, columnKey) => {
    const cellValue = member[columnKey];
    const status = member.status ?? "active";
    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{
              radius: "full",
              size: "sm",
              src: member.avatar ?? `https://i.pravatar.cc/150?u=${member.$id}`,
            }}
            classNames={{ description: "text-default-500" }}
            description={member.email ?? ""}
            name={member.name ?? "—"}
          />
        );
      case "status":
        return (
          <Chip
            className="capitalize border-none gap-1 text-default-600"
            color={statusColorMap[status] ?? "default"}
            size="sm"
            variant="dot"
          >
            {status}
          </Chip>
        );
      case "phone":
        return <span className="text-default-600">{member.phone ?? "—"}</span>;
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Button
              as={Link}
              href={`/app/members/${member.$id}`}
              size="sm"
              variant="flat"
            >
              View
            </Button>
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly radius="full" size="sm" variant="light">
                  <VerticalDotsIcon className="text-default-400" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Member actions">
                <DropdownItem key="view" as={Link} href={`/app/members/${member.$id}`}>
                  View
                </DropdownItem>
                <DropdownItem key="edit" as={Link} href={`/app/members/${member.$id}`}>
                  Edit
                </DropdownItem>
                <DropdownItem key="delete" color="danger">
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue ?? "—";
    }
  }, []);

  const onRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = useCallback((value) => {
    setFilterValue(value ?? "");
    setPage(1);
  }, []);

  const topContent = useMemo(
    () => (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <Input
            isClearable
            classNames={{ base: "w-full sm:max-w-[44%]", inputWrapper: "border-1" }}
            placeholder="Search by name or email..."
            size="sm"
            startContent={<SearchIcon className="text-default-300" />}
            value={filterValue}
            variant="bordered"
            onClear={() => setFilterValue("")}
            onValueChange={onSearchChange}
          />
          <div className="flex items-center gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button className="min-h-9" endContent={<ChevronDownIcon className="text-small" />} size="sm" variant="flat">
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Status filter"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {status.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button className="min-h-9" endContent={<ChevronDownIcon className="text-small" />} size="sm" variant="flat">
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((col) => (
                  <DropdownItem key={col.uid}>{col.name}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button
              as={Link}
              href="/app/members/new"
              className="min-h-9 bg-foreground text-background"
              endContent={<PlusIcon />}
              size="sm"
            >
              Add New
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-small text-default-400">
            Total {filteredItems.length} member{filteredItems.length !== 1 ? "s" : ""}
          </span>
          <label className="flex items-center gap-2 text-small text-default-400">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-500"
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
            </select>
          </label>
        </div>
      </div>
    ),
    [
      filterValue,
      statusFilter,
      visibleColumns,
      onSearchChange,
      onRowsPerPageChange,
      filteredItems.length,
      rowsPerPage,
    ]
  );

  const bottomContent = useMemo(
    () => (
      <div className="flex items-center justify-between px-2 py-2">
        <Pagination
          showControls
          classNames={{ cursor: "bg-foreground text-background" }}
          color="default"
          isDisabled={hasSearchFilter}
          page={page}
          total={pages}
          variant="light"
          onChange={setPage}
        />
        <span className="text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${items.length} selected`}
        </span>
      </div>
    ),
    [selectedKeys, items.length, page, pages, hasSearchFilter]
  );

  const classNames = useMemo(
    () => ({
      th: ["bg-transparent", "text-default-500", "border-b", "border-divider"],
      td: [
        "first:group-data-[first=true]/tr:before:rounded-none",
        "last:group-data-[first=true]/tr:before:rounded-none",
        "group-data-[middle=true]/tr:before:rounded-none",
        "first:group-data-[last=true]/tr:before:rounded-none",
        "last:group-data-[last=true]/tr:before:rounded-none",
      ],
    }),
    []
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Spinner size="lg" color="primary" />
        <p className="text-default-500">Loading members…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-danger-200 bg-danger-50/20 p-4 dark:bg-danger-50/10">
        <p className="font-medium text-danger-700 dark:text-danger-600">Error loading members</p>
        <p className="mt-1 text-sm text-danger-600 dark:text-danger-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Members</h1>
      <p className="mt-2 text-default-500">Manage client profiles.</p>

      <div className="mt-6">
        <Table
          isCompact
          removeWrapper
          aria-label="Members table with search, pagination and sorting"
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          checkboxesProps={{
            classNames: { wrapper: "after:bg-foreground after:text-background text-background" },
          }}
          classNames={classNames}
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          sortDescriptor={sortDescriptor}
          topContent={topContent}
          topContentPlacement="outside"
          onSelectionChange={setSelectedKeys}
          onSortChange={setSortDescriptor}
        >
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
                allowsSorting={column.sortable}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody emptyContent="No members found" items={sortedItems}>
            {(item) => (
              <TableRow key={item.$id}>
                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
