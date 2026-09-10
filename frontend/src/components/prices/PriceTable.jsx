import { useNavigate } from 'react-router-dom'

import { DeltaBadge } from '@/components/prices/DeltaBadge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { directionOfTrend, rupees } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * Rows come from /trends, whose pct_change is the 7-day forecast move (not a
 * day-over-day change) — the column header says so explicitly so the two
 * different percentages in this app are never read as the same number.
 */
export function PriceTable({ crop, rows, districtOf, className }) {
  const navigate = useNavigate()

  return (
    <Table wrapperClassName={cn('max-h-[28rem] rounded-2xl border border-border/70 bg-white', className)}>
      <TableHeader>
        <TableRow className="hover:bg-white">
          <TableHead>Mandi</TableHead>
          <TableHead className="text-right">Price ₹/qtl</TableHead>
          <TableHead className="text-right">7-day forecast</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={row.mandi}
            tabIndex={0}
            role="link"
            className="cursor-pointer focus:bg-brand-50 focus:outline-none"
            onClick={() => navigate(`/mandi/${encodeURIComponent(crop)}/${encodeURIComponent(row.mandi)}`)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                navigate(`/mandi/${encodeURIComponent(crop)}/${encodeURIComponent(row.mandi)}`)
              }
            }}
          >
            <TableCell>
              <div className="font-semibold leading-tight">{row.mandi}</div>
              {districtOf?.(row.mandi) ? (
                <div className="text-xs text-muted-foreground">{districtOf(row.mandi)}</div>
              ) : null}
            </TableCell>
            <TableCell className="tnum text-right text-base font-semibold">{rupees(row.latest_price)}</TableCell>
            <TableCell className="text-right">
              <div className="flex flex-col items-end gap-1">
                <DeltaBadge direction={directionOfTrend(row.trend)} pct={row.pct_change} />
                <span className="tnum text-xs text-muted-foreground">{rupees(row.forecast_price)}</span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
