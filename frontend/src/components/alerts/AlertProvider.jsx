import { createContext, useCallback, useContext, useMemo, useState } from 'react'

import { AlertDialog } from '@/components/alerts/AlertDialog'

const AlertContext = createContext(null)

/**
 * One alert dialog for the whole app: the header button, the hero card and
 * the mandi detail page all open the same instance, pre-filled with whatever
 * crop/mandi the user was looking at.
 */
export function AlertProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [context, setContext] = useState({})

  const openAlertDialog = useCallback((next = {}) => {
    setContext(next)
    setOpen(true)
  }, [])

  const value = useMemo(() => ({ openAlertDialog }), [openAlertDialog])

  return (
    <AlertContext.Provider value={value}>
      {children}
      <AlertDialog open={open} onOpenChange={setOpen} defaultCrop={context.crop} defaultMandi={context.mandi} />
    </AlertContext.Provider>
  )
}

export function useAlertDialog() {
  const context = useContext(AlertContext)
  if (!context) throw new Error('useAlertDialog must be used inside AlertProvider')
  return context.openAlertDialog
}
