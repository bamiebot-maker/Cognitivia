import { Button, Card, Chip } from '@heroui/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAttempt, getStudySet } from '../data/db'
import type { StudyAttempt, StudySet } from '../data/types'
import { useSettings } from '../context/SettingsContext'
import { useToasts } from '../context/ToastContext'
import { createAIProvider } from '../utils/ai/provider'
import { summarizeNotes } from '../utils/text'

export const Results = () => {
  const { attemptId } = useParams()
  const [attempt, setAttempt] = useState<StudyAttempt | null>(null)
  const [studySet, setStudySet] = useState<StudySet | null>(null)
  const [loadingExplain, setLoadingExplain] = useState<Record<number, boolean>>({})
  const [explanations, setExplanations] = useState<Record<number, string>>({})
  const { settings } = useSettings()
  const provider = useMemo(() => createAIProvider(settings), [settings])
  const { pushToast } = useToasts()
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      if (!attemptId) return
      const saved = await getAttempt(attemptId)
      if (saved) {
        setAttempt(saved)
        const set = await getStudySet(saved.setId)
        if (set) setStudySet(set)
      }
    }
    load()
  }, [attemptId])

  if (!attempt) {
    return (
      <Card className="glass-panel border border-white/10 p-6 text-[color:var(--fg-muted)]">
        Session not found.
      </Card>
    )
  }

  const accuracy = attempt.total ? Math.round((attempt.correct / attempt.total) * 100) : 0
  const notesContext = summarizeNotes(studySet?.notes ?? '', 1400)

  const handleExplain = async (index: number) => {
    const result = attempt.results[index]
    if (!result) return
    setLoadingExplain((prev) => ({ ...prev, [index]: true }))
    try {
      const explanation = await provider.explainAnswer(
        result.question,
        result.userAnswer,
        result.question.answer,
        notesContext,
      )
      setExplanations((prev) => ({ ...prev, [index]: explanation }))
    } catch (error) {
      pushToast({
        title: 'Explanation failed',
        description: error instanceof Error ? error.message : 'Try again later',
        tone: 'error',
      })
    } finally {
      setLoadingExplain((prev) => ({ ...prev, [index]: false }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm uppercase tracking-[0.3em] text-[color:var(--fg-soft)]">Results</div>
          <h1 className="text-2xl font-semibold text-[color:var(--fg)]">
            {studySet?.title ?? 'Study Set'}
          </h1>
          <div className="text-xs text-[color:var(--fg-soft)]">
            {new Date(attempt.createdAt).toLocaleString()}
          </div>
        </div>
        <Button className="bg-white/10 text-[color:var(--fg)]" onPress={() => navigate('/progress')}>
          View Progress
        </Button>
      </div>

      <Card className="glass-panel border border-white/10 p-6">
        <div className="text-sm text-[color:var(--fg-muted)]">Accuracy</div>
        <div className="mt-2 text-3xl font-semibold text-[color:var(--fg)]">{accuracy}%</div>
        <div className="mt-1 text-xs text-[color:var(--fg-soft)]">
          {attempt.correct} correct out of {attempt.total}
        </div>
      </Card>

      <div className="space-y-4">
        {attempt.results.map((result, index) => (
          <Card key={`${result.question.prompt}-${index}`} className="glass-panel border border-white/10 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Chip
                size="sm"
                className={result.correct ? 'bg-emerald-400/80 text-black' : 'bg-rose-500/80 text-white'}
              >
                {result.correct ? 'Correct' : 'Needs Review'}
              </Chip>
              <div className="text-xs text-[color:var(--fg-soft)]">{result.question.topic}</div>
            </div>
            <div className="mt-3 text-sm font-semibold text-[color:var(--fg)]">
              {result.question.prompt}
            </div>
            <div className="mt-2 text-sm text-[color:var(--fg-muted)]">
              Your answer: {result.userAnswer || '-'}
            </div>
            <div className="text-sm text-[color:var(--fg-muted)]">
              Correct answer: {result.question.answer}
            </div>
            <div className="mt-3">
              <Button
                size="sm"
                className="bg-white/10 text-[color:var(--fg)]"
                isDisabled={loadingExplain[index]}
                onPress={() => handleExplain(index)}
              >
                {loadingExplain[index] ? 'Explaining...' : 'Explain why'}
              </Button>
            </div>
            {explanations[index] && (
              <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-[color:var(--fg-muted)]">
                {explanations[index]}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
