import { Button, Card, Radio, RadioGroup } from '@heroui/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { getGeneratedContent, getStudySet, saveAttempt } from '../data/db'
import type { GeneratedContent, QuizQuestion, StudyAttempt, StudySet } from '../data/types'
import { useToasts } from '../context/ToastContext'
import { createId } from '../utils/id'

const normalizeAnswer = (value: string) => value.trim().toLowerCase()

export const StudySession = () => {
  const { setId } = useParams()
  const [studySet, setStudySet] = useState<StudySet | null>(null)
  const [content, setContent] = useState<GeneratedContent | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [results, setResults] = useState<
    { question: QuizQuestion; userAnswer: string; correct: boolean }[]
  >([])
  const navigate = useNavigate()
  const { pushToast } = useToasts()

  useEffect(() => {
    const load = async () => {
      if (!setId) return
      const set = await getStudySet(setId)
      const generated = await getGeneratedContent(setId)
      if (set) setStudySet(set)
      if (generated) setContent(generated)
    }
    load()
  }, [setId])

  const questions = content?.quiz ?? []
  const question = questions[currentIndex]
  const progress = useMemo(() => {
    if (!questions.length) return 0
    return Math.round(((currentIndex + 1) / questions.length) * 100)
  }, [currentIndex, questions.length])

  const handleSubmit = async () => {
    if (!question) return
    const userAnswer = answers[currentIndex] ?? ''
    const correct =
      normalizeAnswer(userAnswer) === normalizeAnswer(question.answer) ||
      (question.type === 'short' && normalizeAnswer(userAnswer).includes(normalizeAnswer(question.answer)))
    const nextResults = [...results, { question, userAnswer, correct }]
    setResults(nextResults)
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      const correctCount = nextResults.filter((item) => item.correct).length
      const attempt: StudyAttempt = {
        id: createId(),
        setId: studySet?.id ?? '',
        createdAt: new Date().toISOString(),
        total: questions.length,
        correct: correctCount,
        results: nextResults,
        topicsMissed: nextResults.filter((item) => !item.correct).map((item) => item.question.topic),
      }
      await saveAttempt(attempt)
      pushToast({ title: 'Session complete', tone: 'success' })
      navigate(`/results/${attempt.id}`)
    }
  }

  if (!studySet) {
    return (
      <Card className="glass-panel border border-white/10 p-6 text-[color:var(--fg-muted)]">
        Study set not found.
      </Card>
    )
  }

  if (!content || questions.length === 0) {
    return (
      <EmptyState
        title="No quiz questions yet"
        description="Generate a quiz from your notes before starting a study session."
        actionLabel="Generate Quiz"
        onAction={() => navigate(`/sets/${studySet.id}/generate`)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm uppercase tracking-[0.3em] text-[color:var(--fg-soft)]">
            Study Session
          </div>
          <h1 className="text-2xl font-semibold text-[color:var(--fg)]">{studySet.title}</h1>
          <div className="text-xs text-[color:var(--fg-soft)]">
            Question {currentIndex + 1} of {questions.length}
          </div>
        </div>
        <Button
          className="bg-white/10 text-[color:var(--fg)]"
          onPress={() => navigate(`/sets/${studySet.id}/generate`)}
        >
          Back to Generate
        </Button>
      </div>

      <Card className="glass-panel border border-white/10 p-6">
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-sm font-semibold text-[color:var(--fg)]">{question.prompt}</div>
        {question.type === 'mcq' ? (
          <RadioGroup
            className="mt-4 flex flex-col gap-2"
            value={answers[currentIndex] ?? ''}
            onChange={(value: string) =>
              setAnswers((prev) => ({ ...prev, [currentIndex]: value }))
            }
          >
            {question.choices.map((choice) => (
              <Radio key={choice} value={choice} className="text-[color:var(--fg-muted)]">
                {choice}
              </Radio>
            ))}
          </RadioGroup>
        ) : (
          <textarea
            className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-[color:var(--fg)] outline-none"
            rows={4}
            placeholder="Type your answer..."
            value={answers[currentIndex] ?? ''}
            onChange={(event) =>
              setAnswers((prev) => ({ ...prev, [currentIndex]: event.target.value }))
            }
          />
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button className="bg-white/10 text-[color:var(--fg)]" onPress={handleSubmit}>
            {currentIndex + 1 === questions.length ? 'Finish Session' : 'Next Question'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
