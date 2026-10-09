import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { apiRequest, ApiError } from "../../lib/api";
import { StatusBadge, type TaskStatusString } from "../../components/tasks/StatusBadge";
import { ErrorState } from "../../components/feedback/ErrorState";
import { btnPrimary, btnGhost } from "../../lib/styles";
import { IconBack, IconCheck } from "../../components/common/Icons";

interface TaskDetailData {
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

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  useDocumentTitle("Task Details | Kiln & Leaf Ops");

  const [task, setTask] = useState<TaskDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Status update state for Admins
  const [selectedStatus, setSelectedStatus] = useState<TaskStatusString>("Pending");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusSuccessMessage, setStatusSuccessMessage] = useState<string | null>(null);
  const [statusErrorMessage, setStatusErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadTask() {
      setLoading(true);
      setErrorStatus(null);
      setErrorMessage(null);

      try {
        const res = await apiRequest<{ task: TaskDetailData }>(`/tasks/${id}`);
        if (isMounted) {
          setTask(res.task);
          setSelectedStatus(res.task.status);
        }
      } catch (err) {
        if (isMounted) {
          if (err instanceof ApiError) {
            setErrorStatus(err.status);
            setErrorMessage(err.message);
          } else {
            setErrorStatus(500);
            setErrorMessage("Failed to load task details.");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadTask();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    setIsUpdatingStatus(true);
    setStatusSuccessMessage(null);
    setStatusErrorMessage(null);

    try {
      const res = await apiRequest<{ task: TaskDetailData }>(`/tasks/${task.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: selectedStatus }),
      });

      setTask(res.task);
      setSelectedStatus(res.task.status);
      setStatusSuccessMessage(`Task status updated to "${res.task.status}".`);
    } catch (err) {
      if (err instanceof ApiError) {
        setStatusErrorMessage(err.message);
      } else {
        setStatusErrorMessage("Failed to update task status.");
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-12 md:px-8">
        <div className="skeleton h-6 w-32 rounded mb-6" />
        <div className="space-y-4">
          <div className="skeleton h-10 w-2/3 rounded" />
          <div className="skeleton h-24 w-full rounded" />
          <div className="skeleton h-16 w-1/2 rounded" />
        </div>
      </div>
    );
  }

  if (errorStatus === 404 || !task) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <span className="font-mono text-sm font-semibold uppercase tracking-widest text-accent">
          Task Not Found
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
          Record Unavailable
        </h1>
        <p className="mt-2 text-sm text-mute leading-relaxed">
          The requested task ID does not exist or belongs to another operator.
        </p>
        <Link to="/tasks" className={`${btnPrimary} mt-6`}>
          Return to Task Board
        </Link>
      </div>
    );
  }

  if (errorStatus) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20">
        <ErrorState
          title="Error loading task"
          message={errorMessage || "An unexpected error occurred."}
          action={
            <Link to="/tasks" className={btnPrimary}>
              Back to Tasks
            </Link>
          }
        />
      </div>
    );
  }

  const isAdmin = user?.role === "admin";
  const isOwner = user?.id === task.userId;
  const canEdit = isOwner || isAdmin;

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 md:px-8">
      {/* Navigation and Actions */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <Link
          to="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-mute hover:text-ink transition"
        >
          <IconBack className="size-3.5" />
          <span>Back to tasks</span>
        </Link>

        {canEdit && (
          <Link to={`/tasks/${task.id}/edit`} className={btnGhost}>
            <span>Edit Task Details</span>
          </Link>
        )}
      </div>

      {/* Main Task Information */}
      <div className="mt-6 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold text-mute">
              Task #{task.id}
            </span>
            <StatusBadge status={task.status} />
          </div>

          <div className="text-xs text-mute sm:text-right">
            <span>Created {new Date(task.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div>
          <h1 className="font-display text-3xl font-semibold text-ink leading-tight">
            {task.title}
          </h1>
          {task.description ? (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink/80 rounded-card border border-line bg-card p-5">
              {task.description}
            </p>
          ) : (
            <p className="mt-4 text-xs italic text-mute">No description notes provided.</p>
          )}
        </div>

        {/* Ownership and Metadata */}
        <div className="rounded-card border border-line bg-card p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-mute">
            Assignment &amp; Audit Metadata
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div>
              <span className="text-mute block">Assigned Operator:</span>
              <span className="font-semibold text-ink">
                {task.user?.name || `Operator ID ${task.userId}`}
              </span>
              {task.user?.email && (
                <span className="text-mute block">{task.user.email}</span>
              )}
            </div>
            <div>
              <span className="text-mute block">Last Modified:</span>
              <span className="font-semibold text-ink">
                {new Date(task.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Status Lifecycle Control */}
        {isAdmin ? (
          <div className="rounded-card border border-accent/20 bg-accent-soft/20 p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-accent">
                  Administrator Privilege
                </span>
                <h3 className="font-display text-lg font-semibold text-ink">
                  Update Task Status
                </h3>
              </div>
            </div>

            <form onSubmit={handleStatusUpdate} className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <label htmlFor="admin-status-select" className="sr-only">
                Select new status
              </label>
              <select
                id="admin-status-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as TaskStatusString)}
                disabled={isUpdatingStatus}
                className="rounded-ctl border border-line bg-card px-3.5 py-2 text-xs font-medium focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={isUpdatingStatus || selectedStatus === task.status}
                className={btnPrimary}
              >
                {isUpdatingStatus ? "Updating..." : "Update Status"}
              </button>
            </form>

            {statusSuccessMessage && (
              <div
                role="status"
                className="mt-3 flex items-center gap-2 text-xs text-emerald-800 font-medium"
              >
                <IconCheck className="size-4 text-emerald-600" />
                <span>{statusSuccessMessage}</span>
              </div>
            )}

            {statusErrorMessage && (
              <p role="alert" className="mt-3 text-xs text-accent">
                {statusErrorMessage}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-card border border-line bg-sunk/40 p-4 text-xs text-mute flex items-center justify-between">
            <span>
              Status transitions are managed exclusively by administrator staff.
            </span>
            <span className="font-medium text-ink">Status: {task.status}</span>
          </div>
        )}
      </div>
    </div>
  );
}
