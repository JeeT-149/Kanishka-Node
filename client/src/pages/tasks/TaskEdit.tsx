import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { apiRequest, ApiError } from "../../lib/api";
import { btnPrimary, btnGhost } from "../../lib/styles";
import { IconBack } from "../../components/common/Icons";

interface TaskEditData {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  status: string;
}

export default function TaskEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useDocumentTitle("Edit Task | Kiln & Leaf Ops");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadTask() {
      try {
        const res = await apiRequest<{ task: TaskEditData }>(`/tasks/${id}`);
        if (isMounted) {
          setTitle(res.task.title);
          setDescription(res.task.description || "");
        }
      } catch (err) {
        if (isMounted) {
          if (err instanceof ApiError) {
            setErrorBanner(err.message);
          } else {
            setErrorBanner("Failed to load task details.");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setFieldErrors({});

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFieldErrors({ title: "Task title cannot be empty" });
      return;
    }
    if (trimmedTitle.length > 120) {
      setFieldErrors({ title: "Title cannot exceed 120 characters" });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest<{ task: { id: number } }>(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: trimmedTitle,
          description: description.trim() ? description.trim() : null,
        }),
      });

      navigate(`/tasks/${id}`, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorBanner(err.message);
        if (err.fieldErrors) {
          setFieldErrors(err.fieldErrors);
        }
      } else {
        setErrorBanner("Failed to update task. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-12 md:px-8">
        <div className="skeleton h-8 w-48 rounded mb-6" />
        <div className="space-y-4">
          <div className="skeleton h-12 w-full rounded" />
          <div className="skeleton h-32 w-full rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:px-8">
      <Link
        to={`/tasks/${id}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-mute hover:text-ink transition"
      >
        <IconBack className="size-3.5" />
        <span>Back to task detail</span>
      </Link>

      <div className="mt-4">
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">
          Task Revision
        </span>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
          Edit Task #{id}
        </h1>
        <p className="mt-1 text-xs text-mute">
          Revise task assignment details. (Status modifications are handled separately by administrators).
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
          <label htmlFor="edit-title" className="block text-xs font-semibold uppercase tracking-wider text-mute">
            Task Title <span className="text-accent">*</span>
          </label>
          <input
            id="edit-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            maxLength={120}
            aria-invalid={Boolean(fieldErrors.title)}
            aria-describedby={fieldErrors.title ? "edit-title-error" : undefined}
            className={`mt-1.5 block w-full rounded-ctl border px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-accent ${
              fieldErrors.title ? "border-accent bg-accent-soft/20" : "border-line bg-card hover:border-ink/40"
            }`}
          />
          <div className="mt-1 flex items-center justify-between text-xs">
            {fieldErrors.title ? (
              <p id="edit-title-error" className="text-accent">
                {fieldErrors.title}
              </p>
            ) : (
              <span className="text-mute">Title of the roastery assignment.</span>
            )}
            <span className="text-mute font-mono">{title.length}/120</span>
          </div>
        </div>

        <div>
          <label htmlFor="edit-description" className="block text-xs font-semibold uppercase tracking-wider text-mute">
            Description &amp; Protocol Notes
          </label>
          <textarea
            id="edit-description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            maxLength={2000}
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
            {isSubmitting ? "Saving Changes..." : "Save Changes"}
          </button>
          <Link to={`/tasks/${id}`} className={btnGhost}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
