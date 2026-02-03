import { Card } from '@heroui/react'
import { useToasts } from '../context/ToastContext'

const toneStyles: Record<string, string> = {
  success: 'border-emerald-400/40 text-emerald-100',
  warning: 'border-amber-400/40 text-amber-100',
  error: 'border-rose-400/40 text-rose-100',
  info: 'border-sky-400/40 text-sky-100',
}

export const ToastHost = () => {
  const { toasts, removeToast } = useToasts()

  return (
    <div className="fixed right-6 top-6 z-50 flex w-[320px] flex-col gap-3">
      {toasts.map((toast) => (
        <Card
          key={toast.id}
          className={`glass-panel fade-in border px-4 py-3 ${
            toneStyles[toast.tone ?? 'info'] ?? toneStyles.info
          }`}
          role="status"
          onClick={() => removeToast(toast.id)}
        >
          <div className="text-sm font-semibold">{toast.title}</div>
          {toast.description && (
            <div className="text-xs text-[color:var(--fg-muted)]">{toast.description}</div>
          )}
        </Card>
      ))}
    </div>
  )
}
