import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { signedPercent } from '@/lib/format'
import { cn } from '@/lib/utils'

const ICONS = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus }
const VARIANTS = { up: 'up', down: 'down', flat: 'flat' }
const SR_LABEL = { up: 'up', down: 'down', flat: 'unchanged' }

/**
 * Colour is never the only cue: every badge also carries a direction arrow
 * and a signed number, so the movement reads without colour perception.
 */
export function DeltaBadge({ direction, pct, label, className, size = 'default' }) {
  const Icon = ICONS[direction] ?? Minus
  return (
    <Badge
      variant={VARIANTS[direction] ?? 'flat'}
      className={cn('tnum', size === 'lg' && 'px-3 py-1 text-sm', className)}
    >
      <Icon className={cn('size-3.5', size === 'lg' && 'size-4')} aria-hidden="true" />
      <span className="sr-only">{SR_LABEL[direction] ?? 'unchanged'}</span>
      {signedPercent(pct)}
      {label ? <span className="font-medium opacity-80">{label}</span> : null}
    </Badge>
  )
}
