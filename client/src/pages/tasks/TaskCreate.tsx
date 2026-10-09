import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { apiRequest, ApiError } from "../../lib/api";
import { btnPrimary, btnGhost } from "../../lib/styles";
import { IconBack } from "../../components/common/Icons";

export default function TaskCreate() {
  useDocumentTitle("New Operations Task | Kiln & Leaf Ops");
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setFieldErrors({});

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFieldErrors({ title: "Task title is required" });
      return;
    }
    if (trimmedTitle.length > 120) {
      setFieldErrors({ title: "Title cannot exceed 120 characters" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiRequest<{ task: { id: number } }>("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: trimmedTitle,
          description: description.trim() || undefined,
        }),
      });

      navigate(`/tasks/${res.task.id}`, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorBanner(err.message);
        if (err.fieldErrors) {
          setFieldErrors(err.fieldErrors);
        }
      } else {
        setErrorBanner("Failed to create task. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:px-8">
      <Link
        to="/tasks"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-mute hover:text-ink transition"
      >
        <IconBack className="size-3.5" />
        <span>Back to tasks</span>
      </Link>

      <div className="mt-4">
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">
          Workflow Dispatch
        </span>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
          Create Operations Task
        </h1>
        <p className="mt-1 text-sm text-mute">
          New tasks are automatically registered with <span className="font-semibold text-ink">Pending</span> status.
        </p>
      </div>

      {errorBanner && (
        <div
          role="alert"
          className="mt-6 rounded-card border border-accent/20 bg-accent-soft/30 p-4 text-sm text-accent"
        >
          {errorBanner}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
        <div>
          <label htmlFor="task-title" className="block text-xs font-semibold uppercase tracking-wider text-mute">
            Task Title <span className="text-accent">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            maxLength={120}
            aria-invalid={Boolean(fieldErrors.title)}
            aria-describedby={fieldErrors.title ? "task-title-error" : undefined}
            placeholder="e.g. Roast batch ET-015 (Yirgacheffe)"
            className={`mt-1.5 block w-full rounded-ctl border px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-accent ${
              fieldErrors.title ? "border-accent bg-accent-soft/20" : "border-line bg-card hover:border-ink/40"
            }`}
          />
          <div className="mt-1 flex items-center justify-between text-xs">
            {fieldErrors.title ? (
              <p id="task-title-error" className="text-accent">
                {fieldErrors.title}
              </p>
            ) : (
              <span className="text-mute">Brief summary of the roastery assignment.</span>
            )}
            <span className="text-mute font-mono">{title.length}/120</span>
          </div>
        </div>

        <div>
          <label htmlFor="task-description" className="block text-xs font-semibold uppercase tracking-wider text-mute">
            Description &amp; Protocol Notes
          </label>
          <textarea
            id="task-description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            maxLength={2000}
            placeholder="Include roast profile milestones, origin lot numbers, or cupping specs..."
            className="mt-1.5 block w-full rounded-ctl border border-line bg-card px-3.5 py-2.5 text-sm transition hover:border-ink/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <div className="mt-1 flex items-center justify-between text-xs text-mute">
            <span>Optional supplementary instructions (max 2000 chars).</span>
            <span className="font-mono">{description.length}/2000</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-line">
          <button
            type="submit"
            disabled={isSubmitting}
            className={btnPrimary}
          >
            {isSubmitting ? "Creating Task..." : "Create Task"}
          </button>
          <Link to="/tasks" className={btnGhost}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
