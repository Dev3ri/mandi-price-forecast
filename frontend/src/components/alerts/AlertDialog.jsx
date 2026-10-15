import { Bell, Check, Copy, MessageCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { MandiCombobox } from '@/components/filters/MandiCombobox'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMeta, usePredict } from '@/hooks/useMandiData'
import { buildAlertMessage, buildWhatsAppLink, isValidPhone, normalisePhone } from '@/lib/alertMessage'
import { ALERT_DIRECTIONS, WHATSAPP_NUMBER } from '@/lib/constants'
import { rupees } from '@/lib/format'

export function AlertDialog({ open, onOpenChange, defaultCrop, defaultMandi }) {
  const { data: meta } = useMeta()
  const [crop, setCrop] = useState(defaultCrop ?? '')
  const [mandi, setMandi] = useState(defaultMandi ?? '')
  const [direction, setDirection] = useState('above')
  const [targetPrice, setTargetPrice] = useState('')
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    setCrop(defaultCrop ?? '')
    setMandi(defaultMandi ?? '')
    setSubmitted(false)
    setCopied(false)
  }, [open, defaultCrop, defaultMandi])

  const { data: predict } = usePredict(crop, mandi)

  // Seed the threshold with a round number just above today's price, so the
  // farmer edits a sensible default instead of typing from scratch.
  useEffect(() => {
    if (!predict?.latest_price || targetPrice) return
    setTargetPrice(String(Math.round((predict.latest_price * 1.05) / 10) * 10))
  }, [predict?.latest_price, targetPrice])

  const crops = meta?.crops ?? []
  const mandis = meta?.mandis ?? []

  const message = useMemo(
    () => buildAlertMessage({ crop, mandi, direction, targetPrice }),
    [crop, mandi, direction, targetPrice],
  )

  const priceIsValid = Number(targetPrice) > 0
  const canSubmit = Boolean(crop && mandi && priceIsValid && isValidPhone(phone))

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Check className="size-5 text-brand-700" />
                One tap left
              </DialogTitle>
              <DialogDescription>
                Alerts are armed over WhatsApp. Send this pre-filled message from {`+91 ${normalisePhone(phone)}`} and
                you&apos;ll get a reply confirming the alert.
              </DialogDescription>
            </DialogHeader>

            <p className="rounded-xl border border-border bg-muted px-3 py-2 text-sm">{message}</p>

            {!WHATSAPP_NUMBER ? (
              <p className="text-xs text-muted-foreground">
                No alert number is configured for this deployment (VITE_WHATSAPP_NUMBER), so the link opens WhatsApp
                without a recipient — pick the Mandi Setu number in your contacts, or copy the message.
              </p>
            ) : null}

            <DialogFooter>
              <Button variant="outline" onClick={copyMessage}>
                {copied ? <Check /> : <Copy />}
                {copied ? 'Copied' : 'Copy message'}
              </Button>
              <Button variant="accent" asChild>
                <a href={buildWhatsAppLink(message)} target="_blank" rel="noreferrer">
                  <MessageCircle />
                  Open WhatsApp
                </a>
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="size-5 text-accent-600" />
                Set a price alert
              </DialogTitle>
              <DialogDescription>
                Get a WhatsApp message the moment your target price is hit.
              </DialogDescription>
            </DialogHeader>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault()
                if (canSubmit) setSubmitted(true)
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="alert-crop">Crop</Label>
                <Select value={crop} onValueChange={setCrop}>
                  <SelectTrigger id="alert-crop">
                    <SelectValue placeholder="Choose a crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {crops.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Mandi</Label>
                <MandiCombobox mandis={mandis} value={mandi} onChange={setMandi} placeholder="Choose a mandi" />
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="alert-direction">Notify me when the price</Label>
                  <Select value={direction} onValueChange={setDirection}>
                    <SelectTrigger id="alert-direction">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALERT_DIRECTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="alert-price">₹ / quintal</Label>
                  <Input
                    id="alert-price"
                    inputMode="numeric"
                    className="tnum w-28"
                    value={targetPrice}
                    onChange={(event) => setTargetPrice(event.target.value.replace(/[^0-9.]/g, ''))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="alert-phone">WhatsApp number</Label>
                <div className="flex items-center gap-2">
                  <span className="tnum flex h-11 items-center rounded-xl border border-input bg-muted px-3 text-sm text-muted-foreground">
                    +91
                  </span>
                  <Input
                    id="alert-phone"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="98765 43210"
                    className="tnum"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    aria-invalid={phone.length > 0 && !isValidPhone(phone)}
                  />
                </div>
                {phone.length > 0 && !isValidPhone(phone) ? (
                  <p className="text-xs text-danger-600">Enter a 10-digit Indian mobile number.</p>
                ) : null}
              </div>

              {predict?.latest_price ? (
                <p className="tnum rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-800">
                  Current price: {rupees(predict.latest_price)}/quintal at {mandi}
                </p>
              ) : null}

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="accent" disabled={!canSubmit}>
                  <Bell />
                  Create alert
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
