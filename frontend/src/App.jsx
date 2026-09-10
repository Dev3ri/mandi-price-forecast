import { QueryClientProvider } from '@tanstack/react-query'
import { HashRouter, Route, Routes } from 'react-router-dom'

import { AlertProvider, useAlertDialog } from '@/components/alerts/AlertProvider'
import { AppShell } from '@/components/layout/AppShell'
import ComparePage from '@/pages/ComparePage'
import DashboardPage from '@/pages/DashboardPage'
import MandiDetailPage from '@/pages/MandiDetailPage'
import NearbyPage from '@/pages/NearbyPage'
import { queryClient } from '@/lib/queryClient'

function Shell() {
  const openAlertDialog = useAlertDialog()
  return (
    <AppShell onSetAlert={() => openAlertDialog({})}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/mandi/:crop/:mandi" element={<MandiDetailPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/nearby" element={<NearbyPage />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* HashRouter, not BrowserRouter: the FastAPI backend only serves the
          SPA at / and has no catch-all, so a hard refresh on a path route
          would 404. */}
      <HashRouter>
        <AlertProvider>
          <Shell />
        </AlertProvider>
      </HashRouter>
    </QueryClientProvider>
  )
}
