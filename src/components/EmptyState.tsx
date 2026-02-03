import { Button, Card } from '@heroui/react'

type EmptyStateProps = {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState = ({ title, description, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <Card className="glass-panel border border-dashed border-white/20 p-6 text-[color:var(--fg-muted)]">
      <div className="text-lg font-semibold text-[color:var(--fg)]">{title}</div>
      <div className="mt-2 text-sm text-[color:var(--fg-muted)]">{description}</div>
      {actionLabel && onAction && (
        <Button
          className="mt-4 w-fit bg-white/10 text-[color:var(--fg)]"
          variant="ghost"
          onPress={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </Card>
  )
}
