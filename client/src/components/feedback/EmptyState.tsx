import type { ReactNode } from "react";
import { IconSearch } from "../common/Icons";

export interface EmptyStateProps {
  title: string;
  message?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({
  title,
  message,
  action,
  icon = <IconSearch width={28} height={28} />,
}: EmptyStateProps) {
  return (
    <div className="fade mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <div className="mb-6 grid size-16 place-items-center rounded-full bg-sunk text-accent">
        {icon}
      </div>
      <h2 className="font-display text-3xl leading-tight">{title}</h2>
      {message && <div className="mt-3 text-sm leading-relaxed text-mute">{message}</div>}
      {action && <div className="mt-7 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
