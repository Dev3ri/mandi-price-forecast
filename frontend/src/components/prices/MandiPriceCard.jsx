import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { DeltaBadge } from '@/components/prices/DeltaBadge'
import { Card } from '@/components/ui/card'
import { directionOfTrend, rupees } from '@/lib/format'

export function MandiPriceCard({ crop, row, district }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <Link
        to={`/mandi/${encodeURIComponent(crop)}/${encodeURIComponent(row.mandi)}`}
        className="flex items-center gap-3 p-4"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold leading-tight">{row.mandi}</p>
          {district ? <p className="text-xs text-muted-foreground">{district}</p> : null}
          <p className="tnum mt-2 text-3xl font-bold tracking-tight text-brand-900">
            {rupees(row.latest_price)}
            <span className="ml-1 text-xs font-medium text-muted-foreground">/qtl</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <DeltaBadge direction={directionOfTrend(row.trend)} pct={row.pct_change} />
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">7-day</span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </div>
      </Link>
    </Card>
  )
}
