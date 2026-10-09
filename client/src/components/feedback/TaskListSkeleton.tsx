export function TaskListSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading tasks">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="skeleton flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-card border border-line/40 h-24"
        >
          <div className="space-y-2 w-2/3">
            <div className="h-4 bg-ink/10 rounded w-1/3" />
            <div className="h-3 bg-ink/10 rounded w-2/3" />
          </div>
          <div className="h-6 w-20 bg-ink/10 rounded-full mt-3 sm:mt-0" />
        </div>
      ))}
    </div>
  );
}
