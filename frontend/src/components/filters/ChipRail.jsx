import { cn } from '@/lib/utils'

/**
 * Horizontal, swipeable filter rail. Scrolls with touch/trackpad on mobile
 * and stays keyboard-navigable (each chip is a real button in tab order).
 */
export function ChipRail({ label, options, value, onChange, allLabel, className }) {
  const items = allLabel ? [{ value: null, label: allLabel }, ...options] : options

  return (
    <div className={cn('space-y-1', className)}>
      <p className="px-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="chip-rail" role="group" aria-label={label}>
        {items.map((option) => {
          const isActive = option.value === value
          return (
            <button
              key={option.value ?? '__all__'}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option.value)}
              className={cn(
                'snap-start whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'border-brand-700 bg-brand-700 text-white shadow-sm'
                  : 'border-border bg-white text-foreground hover:bg-brand-50',
              )}
            >
              {option.label}
              {option.hint ? <span className="ml-1.5 text-xs opacity-70">{option.hint}</span> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
