export function SkeletonLoader({ className = "h-4 w-full" }) {
  return <div className={`skeleton ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="card space-y-4">
      <SkeletonLoader className="h-4 w-1/2" />
      <SkeletonLoader className="h-3 w-full" />
      <SkeletonLoader className="h-3 w-3/4" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonLoader key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}
