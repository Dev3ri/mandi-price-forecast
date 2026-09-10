import { QueryClient } from '@tanstack/react-query'

import { ApiError } from '@/lib/api'

const FIVE_MINUTES = 5 * 60 * 1000

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: FIVE_MINUTES,
      refetchOnWindowFocus: false,
      // 404 (unknown crop/mandi) and 422 (series too short to forecast)
      // are permanent answers from this backend, not transient failures.
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
        return failureCount < 2
      },
    },
  },
})
