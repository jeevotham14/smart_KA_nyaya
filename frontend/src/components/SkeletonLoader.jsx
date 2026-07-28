export default function SkeletonLoader({ variant = 'line', count = 1, className = '' }) {
  const items = Array.from({ length: count });

  if (variant === 'card') {
    return (
      <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-100 p-6">
            <div className="skeleton mb-4 h-10 w-10 rounded-xl" />
            <div className="skeleton mb-2 h-5 w-3/4" />
            <div className="skeleton mb-1 h-3 w-full" />
            <div className="skeleton h-3 w-5/6" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="skeleton h-10 w-full rounded-lg" />
        {items.map((_, i) => (
          <div key={i} className="skeleton h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  /* Default: line */
  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((_, i) => (
        <div
          key={i}
          className="skeleton h-4 rounded"
          style={{ width: `${75 + Math.random() * 25}%` }}
        />
      ))}
    </div>
  );
}
