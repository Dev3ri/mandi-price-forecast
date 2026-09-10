import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { useMemo, useState } from 'react'

import { AiInsightCard } from '@/components/ai/AiInsightCard'
import { useAlertDialog } from '@/components/alerts/AlertProvider'
import { CardSkeleton, EmptyState, ErrorState, TableSkeleton } from '@/components/common/States'
import { ChipRail } from '@/components/filters/ChipRail'
import { MandiCombobox } from '@/components/filters/MandiCombobox'
import { MandiPriceCard } from '@/components/prices/MandiPriceCard'
import { PriceHeroCard } from '@/components/prices/PriceHeroCard'
import { PriceTable } from '@/components/prices/PriceTable'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useHistory, useMandiDirectory, useMeta, usePredict, useTrends } from '@/hooks/useMandiData'
import { freshnessLabel } from '@/lib/format'

export default function DashboardPage() {
  const openAlertDialog = useAlertDialog()
  const { data: meta } = useMeta()
  const { data: directory } = useMandiDirectory()

  const [crop, setCrop] = useState('Potato')
  const [district, setDistrict] = useState(null)
  const [mandi, setMandi] = useState(null)

  const { data: trends, isLoading: trendsLoading, error: trendsError, refetch } = useTrends(crop)

  const districtOf = useMemo(
    () => (name) => directory?.byMandi.get(name) ?? null,
    [directory],
  )

  const rows = useMemo(() => {
    const all = trends?.crops?.[crop] ?? []
    if (!district) return all
    return all.filter((row) => districtOf(row.mandi) === district)
  }, [trends, crop, district, districtOf])

  // Highest price in the current filter is the mandi worth leading with; an
  // explicit pick wins, but only while it still exists under the current
  // crop/district filter.
  const featuredMandi = useMemo(() => {
    if (mandi && rows.some((row) => row.mandi === mandi)) return mandi
    return [...rows].sort((a, b) => b.latest_price - a.latest_price)[0]?.mandi ?? null
  }, [mandi, rows])

  const { data: predict, isLoading: predictLoading, error: predictError } = usePredict(crop, featuredMandi)
  const { data: history } = useHistory(crop, featuredMandi, 45)

  const cropOptions = useMemo(() => {
    const reliable = meta?.reliable_crops ?? ['Potato', 'Onion', 'Tomato']
    const forecastable = Object.keys(trends?.crops ?? {})
    const names = [...new Set([...reliable, ...forecastable])]
    return names.map((name) => ({ value: name, label: name }))
  }, [meta, trends])

  const districtOptions = useMemo(() => {
    const inCrop = new Set(
      (trends?.crops?.[crop] ?? []).map((row) => districtOf(row.mandi)).filter(Boolean),
    )
    return [...inCrop].sort().map((name) => ({ value: name, label: name }))
  }, [trends, crop, districtOf])

  const summary = trends?.summary

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-900">Mandi rates</h1>
            <p className="text-sm text-muted-foreground">
              Punjab mandis · ₹ per quintal
              {predict?.latest_date ? ` · updated ${freshnessLabel(predict.latest_date)}` : ''}
            </p>
          </div>
          {summary ? (
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="up">
                <ArrowUpRight className="size-3.5" />
                {summary.rising} rising
              </Badge>
              <Badge variant="down">
                <ArrowDownRight className="size-3.5" />
                {summary.falling} falling
              </Badge>
              <Badge variant="flat">
                <Minus className="size-3.5" />
                {summary.stable} stable
              </Badge>
            </div>
          ) : null}
        </div>

        <ChipRail
          label="Crop"
          options={cropOptions}
          value={crop}
          onChange={(value) => value && setCrop(value)}
        />
        <ChipRail
          label="District"
          allLabel="All districts"
          options={districtOptions}
          value={district}
          onChange={setDistrict}
        />
        <div className="max-w-sm space-y-1">
          <p className="px-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Mandi</p>
          <MandiCombobox
            mandis={rows.map((row) => row.mandi)}
            value={mandi && rows.some((row) => row.mandi === mandi) ? mandi : ''}
            onChange={setMandi}
            districtOf={districtOf}
            placeholder="All mandis"
          />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {featuredMandi ? (
            <PriceHeroCard
              crop={crop}
              mandi={featuredMandi}
              predict={predict}
              history={history}
              isLoading={predictLoading}
              error={predictError}
              onSetAlert={() => openAlertDialog({ crop, mandi: featuredMandi })}
            />
          ) : trendsLoading ? (
            <CardSkeleton />
          ) : null}

          {featuredMandi ? <AiInsightCard crop={crop} mandi={featuredMandi} /> : null}
        </div>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Market movers</CardTitle>
            <p className="text-xs text-muted-foreground">
              {rows.length} mandi{rows.length === 1 ? '' : 's'} trading {crop}
              {district ? ` in ${district}` : ''}, biggest forecast moves first
            </p>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            {trendsLoading ? (
              <TableSkeleton />
            ) : trendsError ? (
              <ErrorState className="m-4" error={trendsError} onRetry={refetch} />
            ) : rows.length === 0 ? (
              <EmptyState
                className="m-4"
                title="No mandis match this filter"
                description={`No ${crop} prices reported${district ? ` in ${district}` : ''} yet. Try another district.`}
              />
            ) : (
              <>
                <div className="hidden sm:block">
                  <PriceTable crop={crop} rows={rows} districtOf={districtOf} className="border-0 shadow-none" />
                </div>
                <div className="space-y-3 p-4 sm:hidden">
                  {rows.map((row) => (
                    <MandiPriceCard key={row.mandi} crop={crop} row={row} district={districtOf(row.mandi)} />
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
