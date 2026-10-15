import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-brand-100 text-brand-800',
        up: 'border-transparent bg-brand-100 text-brand-800',
        down: 'border-transparent bg-danger-100 text-danger-700',
        flat: 'border-transparent bg-muted text-muted-foreground',
        accent: 'border-transparent bg-accent-100 text-accent-foreground',
        outline: 'border-border text-muted-foreground',
        danger: 'border-transparent bg-danger-100 text-danger-700',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { badgeVariants }
