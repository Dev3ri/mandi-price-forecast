import { Loader2, SearchX, TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function EmptyState({ title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-white/60 px-6 py-10 text-center', className)}>
      <SearchX className="size-6 text-muted-foreground" />
      <p className="font-semibold">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  )
}

export function ErrorState({ error, onRetry, className }) {
  const status = error?.status
  // 422 is this backend's "this crop-mandi pair has too little history to
  // forecast", which is an ordinary outcome here rather than a failure.
  const isThinSeries = status === 422 || status === 404
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-2xl border px-6 py-8 text-center',
        isThinSeries ? 'border-accent-100 bg-accent-50' : 'border-danger-100 bg-danger-50',
        className,
      )}
    >
      <TriangleAlert className={cn('size-6', isThinSeries ? 'text-accent-600' : 'text-danger-600')} />
      <p className="font-semibold">
        {isThinSeries ? 'Not enough price history here yet' : 'Could not load this data'}
      </p>
      <p className="max-w-md text-sm text-muted-foreground">{error?.message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}

export function InlineLoader({ label = 'Loading' }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      {label}
    </span>
  )
}

export function CardSkeleton({ lines = 3, className }) {
  return (
    <div className={cn('space-y-3 rounded-2xl border border-border/70 bg-card p-5', className)}>
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-10 w-40" />
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className="h-4 w-full" />
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-11 w-full" />
      ))}
    </div>
  )
}
