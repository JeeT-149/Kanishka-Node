import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useDebounce } from "../../hooks/useDebounce";
import { apiRequest, ApiError } from "../../lib/api";
import { StatusBadge, type TaskStatusString } from "../../components/tasks/StatusBadge";
import { TaskListSkeleton } from "../../components/feedback/TaskListSkeleton";
import { ErrorState } from "../../components/feedback/ErrorState";
import { btnPrimary } from "../../lib/styles";
import { IconSearch } from "../../components/common/Icons";

interface AdminStats {
  totals: {
    users: number;
    tasks: number;
  };
  byStatus: Record<TaskStatusString, number>;
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TaskItem {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  status: TaskStatusString;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

const ALL_STATUSES: TaskStatusString[] = [
  "Pending",
  "In Progress",
  "Testing",
  "Completed",
];

export default function AdminDashboard() {
  useDocumentTitle("Admin Console | Kiln & Leaf Ops");

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters for tasks table
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [userFilter, setUserFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [page, setPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Inline status update loading map
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStatsAndUsers() {
      try {
        const [statsRes, usersRes] = await Promise.all([
          apiRequest<AdminStats>("/admin/stats"),
          apiRequest<{ users: AdminUser[] }>("/admin/users"),
        ]);
        if (isMounted) {
          setStats(statsRes);
          setUsers(usersRes.users);
        }
      } catch (err) {
        if (isMounted) {
          if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError("Failed to load administrative analytics.");
          }
        }
      } finally {
        if (isMounted) {
          setLoadingStats(false);
        }
      }
    }

    loadStatsAndUsers();

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      const query = new URLSearchParams();
      query.set("page", String(page));
      query.set("limit", "10");

      if (statusFilter !== "All") {
        query.set("status", statusFilter);
      }
      if (userFilter !== "All") {
        query.set("userId", userFilter);
      }
      if (debouncedSearch) {
        query.set("q", debouncedSearch);
      }

      try {
        const res = await apiRequest<{ data: TaskItem[]; meta: typeof meta }>(
          `/tasks?${query.toString()}`,
        );
        if (isMounted) {
          setTasks(res.data);
          setMeta(res.meta);
        }
      } catch (err) {
        if (isMounted && err instanceof ApiError) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoadingTasks(false);
        }
      }
    }

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, [page, statusFilter, userFilter, debouncedSearch, refreshTrigger]);

  const handleInlineStatusChange = async (taskId: number, newStatus: TaskStatusString) => {
    setUpdatingTaskId(taskId);
    setActionNotice(null);
    try {
      await apiRequest(`/tasks/${taskId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      // Update local task list
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
      );

      // Trigger stats refresh
      setRefreshTrigger((prev) => prev + 1);
      setActionNotice(`Task #${taskId} status updated to ${newStatus}`);
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.message);
      }
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (error && !stats) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24">
        <ErrorState
          title="Administrative Dashboard Unavailable"
          message={error}
          onRetry={() => {
            setError(null);
            setLoadingStats(true);
            setLoadingTasks(true);
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      </div>
    );
  }

  const totalTasks = stats?.totals.tasks || 0;

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-8 md:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-6">
        <div>
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">
            Master Console
          </span>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
            Administrative Operations Dashboard
          </h1>
          <p className="mt-1 text-sm text-mute">
            Live metrics, cross-team task lifecycle management, and operator oversight.
          </p>
        </div>

        <Link to="/tasks/new" className={btnPrimary}>
          <span>Dispatch New Task</span>
        </Link>
      </div>

      {actionNotice && (
        <div
          role="status"
          className="rounded-card border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-900"
        >
          {actionNotice}
        </div>
      )}

      {/* Metric Stat Cards */}
      {loadingStats ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-28 rounded-card" />
          ))}
        </div>
      ) : stats ? (
        <div className="space-y-4">
          {/* Top Level Totals */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-card border border-line bg-card p-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-mute">
                Total Operational Tasks
              </span>
              <p className="mt-2 font-display text-4xl font-semibold text-ink">
                {stats.totals.tasks}
              </p>
              <p className="mt-1 text-xs text-mute">Active roastery queue items</p>
            </div>

            <div className="rounded-card border border-line bg-card p-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-mute">
                Active Roastery Operators
              </span>
              <p className="mt-2 font-display text-4xl font-semibold text-ink">
                {stats.totals.users}
              </p>
              <p className="mt-1 text-xs text-mute">Registered staff members</p>
            </div>
          </div>

          {/* Breakdown by Status Cards with CSS proportion bars */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ALL_STATUSES.map((statusKey) => {
              const count = stats.byStatus[statusKey] || 0;
              const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;

              let barColor = "bg-mute";
              if (statusKey === "In Progress") barColor = "bg-accent";
              if (statusKey === "Testing") barColor = "bg-amber-600";
              if (statusKey === "Completed") barColor = "bg-emerald-600";

              return (
                <div key={statusKey} className="rounded-card border border-line bg-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink">{statusKey}</span>
                    <span className="font-mono text-xs font-semibold text-mute">{pct}%</span>
                  </div>

                  <p className="font-display text-2xl font-semibold text-ink">{count}</p>

                  {/* Proportion Bar */}
                  <div className="h-2 w-full rounded-full bg-sunk overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Task Lifecycle Oversight Table */}
      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">
              All Tasks Lifecycle Table
            </h2>
            <p className="text-xs text-mute">
              Inline status changes are immediately persisted to the database.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col gap-3 rounded-card border border-line bg-card p-4 md:flex-row md:items-center md:justify-between text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-mute">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-ctl border border-line bg-paper px-2.5 py-1.5 focus:border-accent focus:outline-none"
              >
                <option value="All">All Statuses</option>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Operator Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-mute">Operator:</span>
              <select
                value={userFilter}
                onChange={(e) => {
                  setUserFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-ctl border border-line bg-paper px-2.5 py-1.5 focus:border-accent focus:outline-none"
              >
                <option value="All">All Operators</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-mute" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search tasks..."
              className="w-full rounded-ctl border border-line bg-paper py-1.5 pl-8 pr-2.5 text-xs focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        {/* Table Content */}
        {loadingTasks ? (
          <TaskListSkeleton />
        ) : tasks.length === 0 ? (
          <div className="rounded-card border border-line bg-card p-12 text-center text-xs text-mute">
            No tasks match the selected administrative filters.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-card border border-line bg-card">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-sunk/50 font-semibold text-mute uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Task Title</th>
                  <th className="px-4 py-3">Assigned Operator</th>
                  <th className="px-4 py-3">Current Status</th>
                  <th className="px-4 py-3">Inline Status Action</th>
                  <th className="px-4 py-3 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {tasks.map((task) => (
                  <tr key={task.id} className="transition hover:bg-sunk/30">
                    <td className="px-4 py-3 font-mono font-semibold text-mute">
                      #{task.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">
                      <Link
                        to={`/tasks/${task.id}`}
                        className="hover:text-accent transition underline-offset-2 hover:underline"
                      >
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-mute">
                      {task.user?.name || `User #${task.userId}`}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={task.status}
                        disabled={updatingTaskId === task.id}
                        onChange={(e) =>
                          handleInlineStatusChange(
                            task.id,
                            e.target.value as TaskStatusString,
                          )
                        }
                        className="rounded border border-line bg-paper px-2 py-1 text-xs font-medium focus:border-accent focus:outline-none"
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            Set to: {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right text-mute whitespace-nowrap">
                      {new Date(task.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-line pt-3 text-xs">
            <span className="text-mute">
              Page {meta.page} of {meta.totalPages} ({meta.total} tasks)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rounded-ctl border border-line bg-card px-2.5 py-1 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-ctl border border-line bg-card px-2.5 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Operator Directory Table */}
      <section className="space-y-4 border-t border-line pt-8">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">
            Staff &amp; Operator Directory
          </h2>
          <p className="text-xs text-mute">
            Overview of team members and their active task counts.
          </p>
        </div>

        <div className="overflow-x-auto rounded-card border border-line bg-card">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-sunk/50 font-semibold text-mute uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Operator</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-right">Assigned Tasks</th>
                <th className="px-4 py-3 text-right">Member Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u.id} className="transition hover:bg-sunk/30">
                  <td className="px-4 py-3 font-semibold text-ink">{u.name}</td>
                  <td className="px-4 py-3 font-mono text-mute">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        u.role === "admin"
                          ? "bg-accent/15 text-accent"
                          : "bg-ink/10 text-mute"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-ink">
                    {u.taskCount}
                  </td>
                  <td className="px-4 py-3 text-right text-mute">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
