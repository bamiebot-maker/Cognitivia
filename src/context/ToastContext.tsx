import { createContext, useContext, useMemo, useState } from 'react'
import { createId } from '../utils/id'

export type ToastMessage = {
  id: string
  title: string
  description?: string
  tone?: 'success' | 'warning' | 'error' | 'info'
}

type ToastContextValue = {
  toasts: ToastMessage[]
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export const ToastProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const value = useMemo(
    () => ({
      toasts,
      pushToast: (toast: Omit<ToastMessage, 'id'>) => {
        const id = createId()
        setToasts((current) => [...current, { ...toast, id }])
        setTimeout(() => {
          setToasts((current) => current.filter((item) => item.id !== id))
        }, 4200)
      },
      removeToast: (id: string) =>
        setToasts((current) => current.filter((item) => item.id !== id)),
    }),
    [toasts],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export const useToasts = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToasts must be used within ToastProvider')
  }
  return context
}
