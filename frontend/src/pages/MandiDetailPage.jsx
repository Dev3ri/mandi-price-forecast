import { ArrowLeft, Bell } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { AiInsightCard } from '@/components/ai/AiInsightCard'
import { useAlertDialog } from '@/components/alerts/AlertProvider'
import { PriceHistoryChart } from '@/components/charts/PriceHistoryChart'
import { CardSkeleton, ErrorState } from '@/components/common/States'
import { PriceHeroCard } from '@/components/prices/PriceHeroCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useHistory, usePredict } from '@/hooks/useMandiData'
import { HISTORY_RANGES } from '@/lib/constants'
import { shortDate } from '@/lib/format'

export default function MandiDetailPage() {
  const { crop, mandi } = useParams()
  const openAlertDialog = useAlertDialog()
  const [days, setDays] = useState(45)

  const { data: predict, isLoading, error } = usePredict(crop, mandi)
  const { data: history, isLoading: historyLoading, error: historyError } = useHistory(crop, mandi, days)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <ArrowLeft />
            All rates
          </Link>
        </Button>
        <Button variant="accent" size="sm" onClick={() => openAlertDialog({ crop, mandi })}>
          <Bell />
          Set alert
        </Button>
      </div>

      <PriceHeroCard
        crop={crop}
        mandi={mandi}
        predict={predict}
        history={history}
        isLoading={isLoading}
        error={error}
        onSetAlert={() => openAlertDialog({ crop, mandi })}
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Price history & forecast</CardTitle>
            <p className="text-xs text-muted-foreground">
              Solid line: reported prices. Dashed: next {predict?.forecast_horizon_days ?? 7} days.
            </p>
          </div>
          <Tabs value={String(days)} onValueChange={(value) => setDays(Number(value))}>
            <TabsList>
              {HISTORY_RANGES.map((range) => (
                <TabsTrigger key={range.days} value={String(range.days)}>
                  {range.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <CardSkeleton lines={4} className="border-0 shadow-none" />
          ) : historyError ? (
            <ErrorState error={historyError} />
          ) : (
            <PriceHistoryChart points={history?.points ?? []} forecast={predict?.forecast ?? []} />
          )}
          {predict?.model_note ? (
            <p className="mt-3 rounded-xl bg-muted p-3 text-xs text-muted-foreground">{predict.model_note}</p>
          ) : null}
        </CardContent>
      </Card>

      <AiInsightCard crop={crop} mandi={mandi} />

      {predict?.anomaly_flag?.most_recent_anomaly ? (
        <Card>
          <CardHeader>
            <CardTitle>Unusual moves</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">
                {predict.anomaly_flag.anomalies_last_30_days} in the last 30 days
              </Badge>
              <span className="text-muted-foreground">
                Most recent: {shortDate(predict.anomaly_flag.most_recent_anomaly.date)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{predict.anomaly_flag.note}</p>
          </CardContent>
        </Card>
      ) : null}

      {predict?.confidence?.note ? (
        <p className="pb-2 text-xs text-muted-foreground">{predict.confidence.note}</p>
      ) : null}
    </div>
  )
}
