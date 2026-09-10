import { Trophy, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { CardSkeleton, EmptyState, ErrorState } from '@/components/common/States'
import { ChipRail } from '@/components/filters/ChipRail'
import { MandiCombobox } from '@/components/filters/MandiCombobox'
import { DeltaBadge } from '@/components/prices/DeltaBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCompare, useMandiDirectory, useMeta, useTrends } from '@/hooks/useMandiData'
import { directionOfTrend, rupees } from '@/lib/format'

const MAX_MANDIS = 5

export default function ComparePage() {
  const { data: meta } = useMeta()
  const { data: directory } = useMandiDirectory()
  const [crop, setCrop] = useState('Potato')
  const [selected, setSelected] = useState([])

  const { data: trends } = useTrends(crop)
  const { data, isLoading, error } = useCompare(crop, selected)

  const cropOptions = useMemo(() => {
    const reliable = meta?.reliable_crops ?? ['Potato', 'Onion', 'Tomato']
    return reliable.map((name) => ({ value: name, label: name }))
  }, [meta])

  const candidates = useMemo(
    () => (trends?.crops?.[crop] ?? []).map((row) => row.mandi).filter((name) => !selected.includes(name)),
    [trends, crop, selected],
  )

  function addMandi(name) {
    if (!name || selected.includes(name) || selected.length >= MAX_MANDIS) return
    setSelected((current) => [...current, name])
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-brand-900">Compare mandis</h1>
        <p className="text-sm text-muted-foreground">
          Where is it worth selling today? Pick 2–{MAX_MANDIS} mandis for the same crop.
        </p>
      </div>

      <ChipRail label="Crop" options={cropOptions} value={crop} onChange={(value) => value && setCrop(value)} />

      <div className="max-w-sm">
        <MandiCombobox
          mandis={candidates}
          value=""
          onChange={addMandi}
          districtOf={(name) => directory?.byMandi.get(name) ?? null}
          placeholder="Add a mandi"
        />
      </div>

      {selected.length ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setSelected((current) => current.filter((item) => item !== name))}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-700 bg-brand-700 px-3 py-1.5 text-sm font-medium text-white"
            >
              {name}
              <X className="size-3.5" />
              <span className="sr-only">Remove {name}</span>
            </button>
          ))}
        </div>
      ) : null}

      {selected.length < 2 ? (
        <EmptyState
          title="Add at least two mandis"
          description="The comparison ranks each mandi by today's price, breaking ties by forecast direction."
        />
      ) : isLoading ? (
        <CardSkeleton lines={5} />
      ) : error ? (
        <ErrorState error={error} />
      ) : (
        <div className="space-y-4">
          {data?.summary ? (
            <Card className="border-accent-100 bg-accent-50">
              <CardContent className="space-y-2 p-5 text-sm leading-relaxed">
                <p>{data.summary}</p>
                {data.dates_aligned === false ? (
                  <p className="text-xs text-muted-foreground">
                    Latest records are {data.date_spread_days} day(s) apart across these mandis.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            {(data?.results ?? []).map((entry) => {
              const forecastPrice = entry.forecast?.at(-1)?.price
              const pct = entry.latest_price
                ? ((forecastPrice - entry.latest_price) / entry.latest_price) * 100
                : 0
              return (
                <Card key={entry.mandi}>
                  <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
                    <CardTitle className="flex items-center gap-2">
                      {entry.rank === 1 ? <Trophy className="size-4 text-accent-600" /> : null}
                      {entry.mandi}
                    </CardTitle>
                    <Badge variant="outline">#{entry.rank}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="tnum text-3xl font-bold text-brand-900">{rupees(entry.latest_price)}</p>
                    <DeltaBadge direction={directionOfTrend(entry.trend)} pct={pct} label="7-day forecast" />
                    <Button variant="outline" size="sm" asChild>
                      <a href={`#/mandi/${encodeURIComponent(crop)}/${encodeURIComponent(entry.mandi)}`}>Details</a>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
