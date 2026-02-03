import { Card, Chip } from '@heroui/react'
import { useEffect, useMemo, useState } from 'react'
import { ProgressChart } from '../components/ProgressChart'
import { getAttempts, getStudySets } from '../data/db'
import type { StudyAttempt, StudySet } from '../data/types'

export const Progress = () => {
  const [attempts, setAttempts] = useState<StudyAttempt[]>([])
  const [sets, setSets] = useState<StudySet[]>([])

  useEffect(() => {
    const load = async () => {
      const [attemptData, setData] = await Promise.all([getAttempts(), getStudySets()])
      setAttempts(attemptData)
      setSets(setData)
    }
    load()
  }, [])

  const weakTopics = useMemo(() => {
    const counts = new Map<string, number>()
    attempts.forEach((attempt) => {
      attempt.topicsMissed.forEach((topic) => {
        if (!topic) return
        counts.set(topic, (counts.get(topic) ?? 0) + 1)
      })
    })
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [attempts])

  const attemptsBySet = useMemo(() => {
    return sets.map((set) => {
      const setAttempts = attempts.filter((attempt) => attempt.setId === set.id)
      const total = setAttempts.reduce((acc, attempt) => acc + attempt.total, 0)
      const correct = setAttempts.reduce((acc, attempt) => acc + attempt.correct, 0)
      const accuracy = total ? Math.round((correct / total) * 100) : 0
      return { set, accuracy, sessions: setAttempts.length }
    })
  }, [attempts, sets])

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[0.3em] text-[color:var(--fg-soft)]">Progress</div>
        <h1 className="text-2xl font-semibold text-[color:var(--fg)]">Learning Insights</h1>
        <p className="mt-2 text-sm text-[color:var(--fg-muted)]">
          Track performance over time and focus on frequently missed topics.
        </p>
      </div>

      <ProgressChart attempts={attempts} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-panel border border-white/10 p-6">
          <div className="text-sm font-semibold text-[color:var(--fg)]">Weak Topics</div>
          {weakTopics.length === 0 ? (
            <div className="mt-3 text-sm text-[color:var(--fg-muted)]">No missed topics yet.</div>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {weakTopics.map(([topic, count]) => (
                <Chip key={topic} className="bg-white/10 text-[color:var(--fg)]">
                  {topic} - {count}
                </Chip>
              ))}
            </div>
          )}
        </Card>
        <Card className="glass-panel border border-white/10 p-6">
          <div className="text-sm font-semibold text-[color:var(--fg)]">Study Set Accuracy</div>
          {attemptsBySet.length === 0 ? (
            <div className="mt-3 text-sm text-[color:var(--fg-muted)]">Start a quiz to see data.</div>
          ) : (
            <div className="mt-3 space-y-3 text-sm text-[color:var(--fg-muted)]">
              {attemptsBySet.map(({ set, accuracy, sessions }) => (
                <div key={set.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-[color:var(--fg)]">{set.title}</div>
                    <div className="text-xs text-[color:var(--fg-soft)]">{sessions} sessions</div>
                  </div>
                  <div className="text-base font-semibold text-[color:var(--fg)]">{accuracy}%</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
