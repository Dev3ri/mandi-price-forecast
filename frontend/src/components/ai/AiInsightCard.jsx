import { Sparkles } from 'lucide-react'
import { useState } from 'react'

import { InlineLoader } from '@/components/common/States'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAdvisory } from '@/hooks/useMandiData'
import { LANGUAGES } from '@/lib/constants'

const DEFAULT_QUESTION = 'Should I sell now or wait a few days?'

/**
 * Gemini-backed advisory from /advisory. The backend degrades to a
 * deterministic summary when no Gemini key is configured and reports that in
 * advisory_source, so the card labels which of the two the user is reading.
 */
export function AiInsightCard({ crop, mandi }) {
  const [language, setLanguage] = useState('en')
  const [draft, setDraft] = useState(DEFAULT_QUESTION)
  const [question, setQuestion] = useState(DEFAULT_QUESTION)
  const [asked, setAsked] = useState(false)

  const { data, isFetching, error } = useAdvisory({ crop, mandi, question, language, enabled: asked })

  return (
    <Card className="border-accent-100 bg-accent-50">
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-accent-600" />
          AI insight
        </CardTitle>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="h-9 w-32 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((option) => (
              <SelectItem key={option.code} value={option.code}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-3">
        {!asked ? (
          <p className="text-sm text-muted-foreground">
            Ask about {crop} at {mandi} — the answer is generated from this mandi&apos;s own forecast.
          </p>
        ) : null}

        {isFetching ? <InlineLoader label="Asking the model" /> : null}

        {error ? (
          <p className="text-sm text-danger-700">{error.message}</p>
        ) : null}

        {data && !isFetching ? (
          <div className="space-y-2">
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{data.advisory}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={data.advisory_source === 'gemini' ? 'accent' : 'outline'}>
                {data.advisory_source === 'gemini' ? 'Gemini' : 'Offline summary'}
              </Badge>
              <Badge variant="outline">trend: {data.forecast_trend}</Badge>
              {data.confidence?.validated_on ? (
                <span className="text-xs text-muted-foreground">{data.confidence.validated_on}</span>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">{data.disclaimer}</p>
          </div>
        ) : null}

        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault()
            const trimmed = draft.trim()
            if (!trimmed) return
            setQuestion(trimmed)
            setAsked(true)
          }}
        >
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask a question about this mandi"
            className="bg-white"
          />
          <Button type="submit" variant="accent" disabled={isFetching}>
            Ask
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
