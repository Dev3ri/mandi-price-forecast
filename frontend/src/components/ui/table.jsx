import { cn } from '@/lib/utils'

export function Table({ className, wrapperClassName, ...props }) {
  return (
    <div className={cn('relative w-full overflow-auto', wrapperClassName)}>
      <table className={cn('w-full caption-bottom border-collapse text-sm', className)} {...props} />
    </div>
  )
}

export function TableHeader({ className, ...props }) {
  return <thead className={cn('sticky top-0 z-10 bg-white shadow-[inset_0_-1px_0_hsl(var(--border))]', className)} {...props} />
}

export function TableBody({ className, ...props }) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
}

export function TableRow({ className, ...props }) {
  return <tr className={cn('border-b border-border/70 transition-colors hover:bg-brand-50/60', className)} {...props} />
}

export function TableHead({ className, ...props }) {
  return (
    <th
      className={cn(
        'h-11 px-3 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }) {
  return <td className={cn('px-3 py-3 align-middle', className)} {...props} />
}
