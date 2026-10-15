import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import { PUNJAB_CENTRE } from '@/lib/constants'

const HOUR = 60 * 60 * 1000

export function useMeta() {
  return useQuery({
    queryKey: ['meta'],
    queryFn: ({ signal }) => api.meta({ signal }),
    staleTime: HOUR,
  })
}

// The dataset is Punjab-only and /meta carries no district, so the mandi →
// district map comes from /api/nearby-mandis (which reads mandi_coords.py).
// One call from the state centre with a high limit returns every mandi.
export function useMandiDirectory() {
  return useQuery({
    queryKey: ['mandi-directory'],
    queryFn: ({ signal }) => api.nearbyMandis(PUNJAB_CENTRE.lat, PUNJAB_CENTRE.lon, 500, undefined, { signal }),
    staleTime: HOUR,
    select: (data) => {
      const byMandi = new Map()
      const districts = new Set()
      for (const entry of data.mandis ?? []) {
        byMandi.set(entry.mandi, entry.district)
        districts.add(entry.district)
      }
      return { byMandi, districts: [...districts].sort() }
    },
  })
}

export function usePredict(crop, mandi) {
  return useQuery({
    queryKey: ['predict', crop, mandi],
    queryFn: ({ signal }) => api.predict(crop, mandi, { signal }),
    enabled: Boolean(crop && mandi),
  })
}

export function useHistory(crop, mandi, days = 45) {
  return useQuery({
    queryKey: ['history', crop, mandi, days],
    queryFn: ({ signal }) => api.history(crop, mandi, days, { signal }),
    enabled: Boolean(crop && mandi),
  })
}

export function useTrends(crops) {
  return useQuery({
    queryKey: ['trends', crops],
    queryFn: ({ signal }) => api.trends(crops, { signal }),
    // The backend caches /trends for 10 minutes; matching that avoids
    // re-requesting a response that cannot have changed.
    staleTime: 10 * 60 * 1000,
  })
}

export function useCompare(crop, mandis) {
  return useQuery({
    queryKey: ['compare', crop, [...mandis].sort()],
    queryFn: ({ signal }) => api.compare(crop, mandis, { signal }),
    enabled: Boolean(crop) && mandis.length >= 2,
  })
}

export function useNearbyMandis(position, crop, limit = 22) {
  return useQuery({
    queryKey: ['nearby', position?.lat, position?.lon, crop, limit],
    queryFn: ({ signal }) => api.nearbyMandis(position.lat, position.lon, limit, crop, { signal }),
    enabled: Boolean(position),
  })
}

// Gemini advisories cost tokens per call, so this never runs on mount and
// never auto-refetches — the user asks, we fetch once, the answer is cached.
export function useAdvisory({ crop, mandi, question, language, enabled }) {
  return useQuery({
    queryKey: ['advisory', crop, mandi, question, language],
    queryFn: ({ signal }) => api.advisory(crop, mandi, question, language, { signal }),
    enabled: Boolean(enabled && crop && mandi && question),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 30 * 60 * 1000,
  })
}
