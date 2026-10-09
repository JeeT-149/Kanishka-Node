import type { ReactNode } from "react";
import { IconX } from "../common/Icons";
import { btnPrimary } from "../../lib/styles";

export interface ErrorStateProps {
  title?: string;
  message?: ReactNode;
  onRetry?: () => void;
  action?: ReactNode;
}

export function ErrorState({
  title = "We couldn't load the shelves",
  message = "Something went wrong on our side while fetching products. Check your connection and give it another go.",
  onRetry,
  action,
}: ErrorStateProps) {
  const renderedAction =
    action ??
    (onRetry && (
      <button type="button" className={btnPrimary} onClick={onRetry}>
        Try again
      </button>
    ));

  return (
    <div className="fade mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <div className="mb-6 grid size-16 place-items-center rounded-full bg-sunk text-accent">
        <IconX width={28} height={28} />
      </div>
      <h2 className="font-display text-3xl leading-tight">{title}</h2>
      {message && <div className="mt-3 text-sm leading-relaxed text-mute">{message}</div>}
      {renderedAction && (
        <div className="mt-7 flex flex-wrap justify-center gap-3">{renderedAction}</div>
      )}
    </div>
  );
}
