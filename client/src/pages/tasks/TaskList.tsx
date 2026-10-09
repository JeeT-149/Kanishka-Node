import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useDebounce } from "../../hooks/useDebounce";
import { apiRequest, ApiError } from "../../lib/api";
import { StatusBadge, type TaskStatusString } from "../../components/tasks/StatusBadge";
import { TaskListSkeleton } from "../../components/feedback/TaskListSkeleton";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { btnPrimary } from "../../lib/styles";
import { IconSearch, IconPlus } from "../../components/common/Icons";

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

interface TasksResponse {
  data: TaskItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const STATUS_FILTERS: Array<TaskStatusString | "All"> = [
  "All",
  "Pending",
  "In Progress",
  "Testing",
  "Completed",
];

export default function TaskList() {
  const { user } = useAuth();
  useDocumentTitle(user?.role === "admin" ? "All Operations Tasks | Kiln & Leaf Ops" : "My Tasks | Kiln & Leaf Ops");

  const [searchParams, setSearchParams] = useSearchParams();

  const currentStatus = searchParams.get("status") || "All";
  const currentQuery = searchParams.get("q") || "";
  const currentPage = Number(searchParams.get("page")) || 1;

  const [searchTerm, setSearchTerm] = useState(currentQuery);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync debounced search with URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
      params.set("page", "1");
    } else {
      params.delete("q");
    }
    setSearchParams(params, { replace: true });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch tasks
  useEffect(() => {
    let isCancelled = false;

    async function fetchTasks() {
      setLoading(true);
      setError(null);

      const query = new URLSearchParams();
      query.set("page", String(currentPage));
      query.set("limit", "10");

      if (currentStatus !== "All") {
        query.set("status", currentStatus);
      }
      if (currentQuery) {
        query.set("q", currentQuery);
      }

      try {
        const res = await apiRequest<TasksResponse>(`/tasks?${query.toString()}`);
        if (!isCancelled) {
          setTasks(res.data);
          setMeta(res.meta);
        }
      } catch (err) {
        if (!isCancelled) {
          if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError("Unable to load tasks at this time.");
          }
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchTasks();

    return () => {
      isCancelled = true;
    };
  }, [currentStatus, currentQuery, currentPage]);

  const handleStatusChange = (status: TaskStatusString | "All") => {
    const params = new URLSearchParams(searchParams);
    if (status === "All") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-8 md:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">
            {user?.role === "admin" ? "Master Operations" : "Operator Workspace"}
          </span>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
            {user?.role === "admin" ? "All Operations Tasks" : "My Assigned Tasks"}
          </h1>
          <p className="mt-1 text-sm text-mute">
            {user?.role === "admin"
              ? "Comprehensive oversight across all roasting batches, testing cuppings, and packing queues."
              : "Track and update your personal daily tasks and cupping notes."}
          </p>
        </div>

        <Link to="/tasks/new" className={btnPrimary}>
          <IconPlus className="size-4" />
          <span>New Task</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-line pb-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter tasks by status">
          {STATUS_FILTERS.map((s) => {
            const active = currentStatus === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => handleStatusChange(s)}
                role="tab"
                aria-selected={active}
                className={`rounded-full px-3.5 py-1 text-xs font-medium transition ${
                  active
                    ? "bg-ink text-paper"
                    : "bg-sunk/60 text-mute hover:bg-sunk hover:text-ink"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mute" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or description..."
            className="w-full rounded-ctl border border-line bg-card py-2 pl-9 pr-3 text-xs placeholder:text-mute focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="mt-6">
        {loading ? (
          <TaskListSkeleton />
        ) : error ? (
          <ErrorState
            title="Unable to load tasks"
            message={error}
            onRetry={() => {
              setSearchParams(new URLSearchParams(searchParams));
            }}
          />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No tasks found"
            message={
              currentQuery || currentStatus !== "All"
                ? "No tasks match your active filters or query. Try clearing your search."
                : "You have no tasks registered yet. Create your first operational task to get started."
            }
            action={
              currentQuery || currentStatus !== "All" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSearchParams({});
                  }}
                  className={btnPrimary}
                >
                  Clear Filters
                </button>
              ) : (
                <Link to="/tasks/new" className={btnPrimary}>
                  Create First Task
                </Link>
              )
            }
          />
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className="group flex flex-col justify-between rounded-card border border-line bg-card p-5 transition hover:border-ink/40 hover:shadow-soft sm:flex-row sm:items-center"
              >
                <div className="space-y-1.5 sm:max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-mute">
                      #{task.id}
                    </span>
                    <h2 className="font-display text-lg font-semibold text-ink group-hover:text-accent transition">
                      {task.title}
                    </h2>
                  </div>

                  {task.description && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-mute">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-mute">
                    <span>Updated {new Date(task.updatedAt).toLocaleDateString()}</span>
                    {task.user && (
                      <span className="inline-flex items-center gap-1 font-medium text-ink">
                        <span>•</span>
                        <span>Owner: {task.user.name}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between sm:mt-0 sm:flex-col sm:items-end sm:gap-2">
                  <StatusBadge status={task.status} />
                  <span className="text-xs font-medium text-accent opacity-0 transition group-hover:opacity-100 sm:block hidden">
                    View Details →
                  </span>
                </div>
              </Link>
            ))}

            {/* Pagination Controls */}
            {meta.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between border-t border-line pt-4 text-xs">
                <p className="text-mute">
                  Showing page <span className="font-semibold text-ink">{meta.page}</span> of{" "}
                  <span className="font-semibold text-ink">{meta.totalPages}</span> ({meta.total} total tasks)
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={meta.page <= 1}
                    onClick={() => handlePageChange(meta.page - 1)}
                    className="rounded-ctl border border-line bg-card px-3 py-1.5 font-medium transition hover:border-ink hover:bg-sunk disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={meta.page >= meta.totalPages}
                    onClick={() => handlePageChange(meta.page + 1)}
                    className="rounded-ctl border border-line bg-card px-3 py-1.5 font-medium transition hover:border-ink hover:bg-sunk disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
