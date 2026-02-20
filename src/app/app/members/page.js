"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/auth-context";
import { gymApiHeaders } from "@/lib/gym-client";
import EmptyState from "../components/EmptyState";
import { imageUrl } from "@/lib/image-url";
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
  Tabs,
  Tab,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Image,
  Checkbox,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  addToast,
} from "@heroui/react";

const ListIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const GridIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const MEMBER_PLACEHOLDER_IMG = "https://i.pravatar.cc/300?u=";

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
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { user } = useAuth();

  useEffect(() => {
    const url = "/api/gym/members";
    fetch(url, { headers: gymApiHeaders(user) })
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
  }, [user?.$id]);

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
          <div className="flex items-center gap-2 text-small text-default-400">
            Rows per page:
            <Dropdown>
              <DropdownTrigger>
                <Button size="sm" variant="flat" endContent={<ChevronDownIcon className="text-small" />} className="min-h-7 h-7">
                  {rowsPerPage}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Rows per page"
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={new Set([String(rowsPerPage)])}
                onSelectionChange={(keys) => {
                  setRowsPerPage(Number(Array.from(keys)[0]));
                  setPage(1);
                }}
              >
                <DropdownItem key="5">5</DropdownItem>
                <DropdownItem key="10">10</DropdownItem>
                <DropdownItem key="15">15</DropdownItem>
                <DropdownItem key="25">25</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    ),
    [
      filterValue,
      statusFilter,
      visibleColumns,
      onSearchChange,
      filteredItems.length,
      rowsPerPage,
      page,
    ]
  );

  const selectedCount = selectedKeys === "all" ? sortedItems.length : selectedKeys.size;

  async function handleBulkDelete() {
    const ids = selectedKeys === "all"
      ? sortedItems.map((m) => m.$id)
      : Array.from(selectedKeys);
    setBulkDeleting(true);
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/gym/members/${id}`, { method: "DELETE", headers: gymApiHeaders(user) })
        )
      );
      setMembers((prev) => prev.filter((m) => !ids.includes(m.$id)));
      setSelectedKeys(new Set());
      onDeleteClose();
      addToast({
        title: "Deleted",
        description: `${ids.length} member${ids.length !== 1 ? "s" : ""} deleted.`,
        color: "success",
      });
    } catch (err) {
      addToast({ title: "Error", description: err.message, color: "danger" });
    } finally {
      setBulkDeleting(false);
    }
  }

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
        <div className="flex items-center gap-3">
          {selectedCount > 0 && (
            <Button
              size="sm"
              color="danger"
              variant="flat"
              onPress={onDeleteOpen}
            >
              Delete {selectedCount} selected
            </Button>
          )}
          <span className="text-small text-default-400">
            {selectedKeys === "all"
              ? "All items selected"
              : `${selectedKeys.size} of ${items.length} selected`}
          </span>
        </div>
      </div>
    ),
    [selectedKeys, selectedCount, items.length, page, pages, hasSearchFilter, onDeleteOpen]
  );

  const isAllListSelected =
    sortedItems.length > 0 &&
    sortedItems.every((m) => selectedKeys === "all" || (typeof selectedKeys !== "string" && selectedKeys.has(m.$id)));

  const toggleSelectAllList = useCallback(() => {
    if (isAllListSelected) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(sortedItems.map((m) => m.$id)));
    }
  }, [isAllListSelected, sortedItems]);

  const toggleSelectRow = useCallback(
    (memberId) => {
      setSelectedKeys((prev) => {
        const next = prev === "all" ? new Set(sortedItems.map((m) => m.$id)) : new Set(prev);
        if (next.has(memberId)) {
          next.delete(memberId);
          return next;
        }
        next.add(memberId);
        return next;
      });
    },
    [sortedItems]
  );

  const isRowSelected = (memberId) => selectedKeys === "all" || (typeof selectedKeys === "object" && selectedKeys.has(memberId));

  const viewTabs = [
    { id: "list", label: "List", title: "List" },
    { id: "grid", label: "Grid", title: "Grid" },
  ];

  const handleSort = useCallback(
    (columnUid) => {
      const direction =
        sortDescriptor.column === columnUid && sortDescriptor.direction === "ascending" ? "descending" : "ascending";
      setSortDescriptor({ column: columnUid, direction });
    },
    [sortDescriptor]
  );

  const SortIcon = useCallback(
    ({ column }) =>
      sortDescriptor.column === column ? (
        <span className="ml-0.5">{sortDescriptor.direction === "ascending" ? " ↑" : " ↓"}</span>
      ) : null,
    [sortDescriptor]
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

      <div className="mt-6 flex w-full flex-col">
        {topContent}
        <Tabs aria-label="View mode" className="mt-4" items={viewTabs}>
          {(tab) => (
            <Tab
              key={tab.id}
              title={
                <span className="flex items-center gap-2">
                  {tab.id === "list" ? <ListIcon /> : <GridIcon />}
                  {tab.label}
                </span>
              }
            >
              <div className="mt-4">
                {tab.id === "list" ? (
                  sortedItems.length === 0 ? (
                    <EmptyState pathname="/app/members" message="No members found." className="py-12" />
                  ) : (
                    <div className="rounded-lg border border-default-200">
                      <div className="grid grid-cols-[auto_1fr_130px_160px_120px] items-center gap-4 border-b border-default-200 bg-default-50/50 px-4 py-3 sm:px-6">
                        <Checkbox
                          isSelected={isAllListSelected}
                          onValueChange={toggleSelectAllList}
                          aria-label="Select all"
                        />
                        <button
                          type="button"
                          className="text-small font-medium text-default-500 cursor-pointer select-none hover:text-foreground text-left"
                          onClick={() => handleSort("name")}
                        >
                          NAME
                          <SortIcon column="name" />
                        </button>
                        <button
                          type="button"
                          className="text-small font-medium text-default-500 cursor-pointer select-none hover:text-foreground text-left"
                          onClick={() => handleSort("status")}
                        >
                          STATUS
                          <SortIcon column="status" />
                        </button>
                        <span className="text-small font-medium text-default-500">PHONE</span>
                        <span className="text-small font-medium text-default-500 text-center">ACTIONS</span>
                      </div>
                      <ul className="divide-y divide-default-200">
                        {sortedItems.map((member) => (
                          <li
                            key={member.$id}
                            className="grid grid-cols-[auto_1fr_130px_160px_120px] items-center gap-4 px-4 py-3 sm:px-6"
                          >
                            <Checkbox
                              isSelected={isRowSelected(member.$id)}
                              onValueChange={() => toggleSelectRow(member.$id)}
                              aria-label={`Select ${member.name ?? member.$id}`}
                            />
                            <div className="flex min-w-0 flex-1 items-center gap-4">
                              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-default-100">
                                <Image
                                  alt=""
                                  className="h-full w-full object-cover"
                                  src={imageUrl(member.thumbnail) || `${MEMBER_PLACEHOLDER_IMG}${member.$id}`}
                                  width={40}
                                  height={40}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <Link
                                  href={`/app/members/${member.$id}`}
                                  className="font-medium text-foreground hover:underline"
                                >
                                  {member.name ?? "—"}
                                </Link>
                                {member.email && (
                                  <p className="mt-0.5 text-sm text-default-500 truncate">{member.email}</p>
                                )}
                              </div>
                            </div>
                            <div>
                              <Chip
                                className="capitalize border-none gap-1 text-default-600"
                                color={statusColorMap[member.status ?? "active"] ?? "default"}
                                size="sm"
                                variant="dot"
                              >
                                {member.status ?? "active"}
                              </Chip>
                            </div>
                            <span className="text-sm text-default-600">{member.phone ?? "—"}</span>
                            <div className="flex items-center justify-center gap-2">
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
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                ) : sortedItems.length === 0 ? (
                  <EmptyState pathname="/app/members" message="No members found." className="py-12" />
                ) : (
                  <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-small text-default-500 shrink-0">Sort by:</span>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button size="sm" variant="flat" endContent={<ChevronDownIcon className="text-small" />} className="min-h-7 h-7 capitalize">
                          {sortDescriptor.column === "name" ? "Name" : "Status"} · {sortDescriptor.direction === "ascending" ? "Ascending" : "Descending"}
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Sort options"
                        selectionMode="single"
                        disallowEmptySelection
                        selectedKeys={new Set([`${sortDescriptor.column}-${sortDescriptor.direction}`])}
                        onSelectionChange={(keys) => {
                          const [col, dir] = Array.from(keys)[0].split("-");
                          setSortDescriptor({ column: col, direction: dir });
                        }}
                      >
                        <DropdownItem key="name-ascending">Name · Ascending</DropdownItem>
                        <DropdownItem key="name-descending">Name · Descending</DropdownItem>
                        <DropdownItem key="status-ascending">Status · Ascending</DropdownItem>
                        <DropdownItem key="status-descending">Status · Descending</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                    {sortedItems.map((member) => {
                      const isInactive = member.status === "inactive";
                      return (
                        <Link
                          key={member.$id}
                          href={isInactive ? "#" : `/app/members/${member.$id}`}
                          className={`block w-full${isInactive ? " opacity-30 pointer-events-none select-none" : ""}`}
                          tabIndex={isInactive ? -1 : undefined}
                          aria-disabled={isInactive}
                        >
                          <Card isPressable shadow="sm" className="w-full border-none">
                            <CardBody className="overflow-hidden p-0">
                              <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
                                <img
                                  alt={member.name ?? "Member"}
                                  className="absolute inset-0 h-full w-full object-cover"
                                  src={imageUrl(member.thumbnail) || `${MEMBER_PLACEHOLDER_IMG}${member.$id}`}
                                />
                                <span
                                  className={`absolute right-2 top-2 h-2.5 w-2.5 rounded-full ring-2 ring-white bg-${statusColorMap[member.status ?? "active"] ?? "default"}`}
                                  title={member.status ?? "active"}
                                />
                              </div>
                            </CardBody>
                            <CardFooter className="text-small">
                              <b className="truncate">{member.name ?? "—"}</b>
                            </CardFooter>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                  </div>
                )}
              </div>
            </Tab>
          )}
        </Tabs>
        {bottomContent}
      </div>

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>Delete members</ModalHeader>
          <ModalBody>
            <p>
              Permanently delete <strong>{selectedCount} member{selectedCount !== 1 ? "s" : ""}</strong>? This cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteClose} isDisabled={bulkDeleting}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleBulkDelete} isLoading={bulkDeleting}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
