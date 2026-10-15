import { Bell, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

import { DeltaBadge } from '@/components/prices/DeltaBadge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CardSkeleton, ErrorState } from '@/components/common/States'
import { directionOfTrend, freshnessLabel, longDate, movementOf, rupees } from '@/lib/format'

/**
 * The one price a farmer opened the app for: today's rate at the selected
 * mandi, its day-over-day move (computed from the last two /history points,
 * since no endpoint returns it) and the backend's 7-day forecast direction.
 */
export function PriceHeroCard({ crop, mandi, predict, history, isLoading, error, onSetAlert }) {
  if (isLoading) return <CardSkeleton />
  if (error) return <ErrorState error={error} />
  if (!predict) return null

  const points = history?.points ?? []
  const dayOverDay = movementOf(points.at(-1)?.price, points.at(-2)?.price)
  const forecastPrice = predict.forecast?.at(-1)?.price
  const forecastPct = predict.latest_price
    ? ((forecastPrice - predict.latest_price) / predict.latest_price) * 100
    : 0

  return (
    <Card className="overflow-hidden">
      <div className="flex items-stretch">
        <div aria-hidden="true" className="w-1.5 shrink-0 bg-brand-600" />
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Today&apos;s rate</p>
              <Link
                to={`/mandi/${encodeURIComponent(crop)}/${encodeURIComponent(mandi)}`}
                className="text-lg font-semibold hover:underline"
              >
                {crop} · {mandi}
              </Link>
            </div>
            <Button variant="accent" size="sm" onClick={onSetAlert}>
              <Bell />
              Alert
            </Button>
          </div>

          <p className="tnum mt-3 text-5xl font-bold leading-none tracking-tight text-brand-900">
            {rupees(predict.latest_price)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">per quintal</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <DeltaBadge size="lg" direction={dayOverDay.direction} pct={dayOverDay.pct} label="vs previous day" />
            <DeltaBadge
              size="lg"
              className="bg-accent-100 text-accent-foreground"
              direction={directionOfTrend(predict.trend)}
              pct={forecastPct}
              label={`7-day forecast · ${rupees(forecastPrice)}`}
            />
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Latest reported {longDate(predict.latest_date)} ({freshnessLabel(predict.latest_date)}) ·
            model {predict.model}
          </p>

          {predict.anomaly_flag?.latest_price_is_anomaly ? (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-accent-50 p-3 text-xs text-accent-foreground">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              Unusually large move for this mandi — worth double-checking before you sell.
            </p>
          ) : null}

          {predict.data_note ? (
            <p className="mt-3 rounded-xl bg-muted p-3 text-xs text-muted-foreground">{predict.data_note}</p>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
