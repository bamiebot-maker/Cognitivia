import type { StudyAttempt } from '../data/types'

type ProgressChartProps = {
  attempts: StudyAttempt[]
}

export const ProgressChart = ({ attempts }: ProgressChartProps) => {
  if (attempts.length === 0) {
    return (
      <div className="glass-panel rounded-2xl border border-white/10 p-6 text-sm text-[color:var(--fg-muted)]">
        Complete a quiz session to see accuracy over time.
      </div>
    )
  }

  const sorted = [...attempts].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
  const points = sorted.map((attempt, index) => {
    const accuracy = attempt.total === 0 ? 0 : attempt.correct / attempt.total
    return { x: index, y: accuracy }
  })
  const width = 460
  const height = 160
  const padding = 24
  const maxX = Math.max(points.length - 1, 1)
  const toX = (x: number) => padding + (x / maxX) * (width - padding * 2)
  const toY = (y: number) => height - padding - y * (height - padding * 2)
  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${toX(point.x)} ${toY(point.y)}`)
    .join(' ')

  return (
    <div className="glass-panel rounded-2xl border border-white/10 p-6">
      <div className="mb-4 text-sm font-semibold text-[color:var(--fg)]">Accuracy Over Time</div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="accuracyGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6de0f6" />
            <stop offset="100%" stopColor="#9b7cff" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={width} height={height} fill="transparent" />
        <path d={path} fill="none" stroke="url(#accuracyGradient)" strokeWidth="3" />
        {points.map((point) => (
          <circle
            key={`${point.x}-${point.y}`}
            cx={toX(point.x)}
            cy={toY(point.y)}
            r="4"
            fill="#ff9d6c"
          />
        ))}
      </svg>
    </div>
  )
}
