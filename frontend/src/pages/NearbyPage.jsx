import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { LocateFixed, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'

import { CardSkeleton, EmptyState, ErrorState } from '@/components/common/States'
import { ChipRail } from '@/components/filters/ChipRail'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMeta, useNearbyMandis } from '@/hooks/useMandiData'
import { PUNJAB_CENTRE } from '@/lib/constants'
import { rupees, shortDate } from '@/lib/format'

// Leaflet's default marker icon paths break under bundlers like Vite because
// the CSS-relative image URLs it hardcodes don't resolve through the module
// graph; pointing them at the CDN copies sidesteps that entirely.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const userIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function RecenterOnFix({ fix }) {
  const map = useMap()
  useEffect(() => {
    if (fix) map.setView([fix.lat, fix.lon], 10)
  }, [fix, map])
  return null
}

export default function NearbyPage() {
  const { data: meta } = useMeta()
  const [crop, setCrop] = useState('Potato')
  const [fix, setFix] = useState(null)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState(null)

  const centre = fix ?? PUNJAB_CENTRE
  const { data, isLoading, error } = useNearbyMandis(centre, crop, 22)

  const cropOptions = (meta?.reliable_crops ?? ['Potato', 'Onion', 'Tomato']).map((name) => ({
    value: name,
    label: name,
  }))

  function locate() {
    if (!navigator.geolocation) {
      setLocationError('This browser does not support location sharing.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFix({ lat: position.coords.latitude, lon: position.coords.longitude })
        setLocationError(null)
        setLocating(false)
      },
      (geoError) => {
        setLocationError(`Could not get your location — ${geoError.message}`)
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  const mandis = data?.mandis ?? []

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-900">Nearby mandis</h1>
          <p className="text-sm text-muted-foreground">
            {fix
              ? 'Sorted by distance from you, with today’s price for the selected crop.'
              : 'Showing mandis around Punjab’s centre — share your location to sort by distance.'}
          </p>
        </div>
        <Button variant="outline" onClick={locate} disabled={locating}>
          <LocateFixed />
          {locating ? 'Locating…' : 'Use my location'}
        </Button>
      </div>

      <ChipRail label="Price overlay" options={cropOptions} value={crop} onChange={(value) => value && setCrop(value)} />

      {locationError ? (
        <p className="rounded-xl bg-danger-50 px-3 py-2 text-sm text-danger-700">{locationError}</p>
      ) : null}

      <Card className="overflow-hidden">
        <div className="h-[320px] w-full sm:h-[420px]">
          <MapContainer center={[centre.lat, centre.lon]} zoom={8} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={18}
            />
            {mandis.map((entry) => (
              <Marker key={entry.mandi} position={[entry.latitude, entry.longitude]}>
                <Popup>
                  <strong>{entry.mandi}</strong>
                  <br />
                  {entry.district} district
                  {entry.latest_price ? (
                    <>
                      <br />
                      {rupees(entry.latest_price.price)}/quintal ({shortDate(entry.latest_price.date)})
                    </>
                  ) : null}
                </Popup>
              </Marker>
            ))}
            {fix ? (
              <Marker position={[fix.lat, fix.lon]} icon={userIcon}>
                <Popup>You are here</Popup>
              </Marker>
            ) : null}
            <RecenterOnFix fix={fix} />
          </MapContainer>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Closest markets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <CardSkeleton lines={4} className="border-0 shadow-none" />
          ) : error ? (
            <ErrorState error={error} />
          ) : mandis.length === 0 ? (
            <EmptyState title="No mandis to show" />
          ) : (
            mandis.map((entry, index) => (
              <div key={entry.mandi} className="flex items-center gap-3 rounded-xl border border-border/70 p-3">
                <span className="tnum flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold leading-tight">{entry.mandi}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {entry.district} · {entry.distance_km} km
                  </p>
                </div>
                <div className="text-right">
                  {entry.latest_price ? (
                    <>
                      <p className="tnum font-semibold">{rupees(entry.latest_price.price)}</p>
                      <p className="text-xs text-muted-foreground">{shortDate(entry.latest_price.date)}</p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">No price</p>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
