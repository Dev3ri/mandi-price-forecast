import { useMemo } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { rupees, shortDate } from '@/lib/format'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  const isForecast = point.forecast !== undefined && point.actual === undefined
  return (
    <div className="rounded-xl border border-border bg-white px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold">{shortDate(label)}</p>
      <p className="tnum text-brand-800">{rupees(point.actual ?? point.forecast)}/qtl</p>
      <p className="text-xs text-muted-foreground">{isForecast ? 'Forecast' : 'Reported price'}</p>
    </div>
  )
}

/**
 * Reported history and the 7-day forecast on one axis. The two series are
 * joined at the last reported day so the dashed forecast continues the solid
 * line instead of starting from a gap.
 */
export function PriceHistoryChart({ points = [], forecast = [], height = 280 }) {
  const data = useMemo(() => {
    const rows = points.map((point) => ({ date: point.date, actual: point.price }))
    const lastActual = points.at(-1)
    if (lastActual) {
      rows[rows.length - 1] = { ...rows[rows.length - 1], forecast: lastActual.price }
    }
    for (const point of forecast) {
      rows.push({ date: point.date, forecast: point.price })
    }
    return rows
  }, [points, forecast])

  const lastActualDate = points.at(-1)?.date

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <defs>
          <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity={0.24} />
            <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2ece5" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={shortDate}
          tick={{ fontSize: 11, fill: '#5b6b60' }}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#5b6b60' }}
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(value) => `₹${value}`}
          domain={['auto', 'auto']}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area type="monotone" dataKey="actual" stroke="none" fill="url(#actualFill)" isAnimationActive={false} />
        <Line
          type="monotone"
          dataKey="actual"
          name="Reported"
          stroke="#15803d"
          strokeWidth={2.5}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="forecast"
          name="Forecast"
          stroke="#f59e0b"
          strokeWidth={2.5}
          strokeDasharray="6 4"
          dot={false}
          isAnimationActive={false}
        />
        {lastActualDate ? (
          <ReferenceLine
            x={lastActualDate}
            stroke="#c8d6cc"
            label={{ value: 'today', position: 'insideTopRight', fontSize: 10, fill: '#5b6b60' }}
          />
        ) : null}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
