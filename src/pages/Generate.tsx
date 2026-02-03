import { Button, Card, Chip, Input, Label, Radio, RadioGroup, TextField } from '@heroui/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { getGeneratedContent, getStudySet, saveGeneratedContent } from '../data/db'
import type { GeneratedContent, StudySet } from '../data/types'
import { useSettings } from '../context/SettingsContext'
import { useToasts } from '../context/ToastContext'
import { createAIProvider } from '../utils/ai/provider'

const difficultyOptions = [
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' },
]

export const Generate = () => {
  const { setId } = useParams()
  const [studySet, setStudySet] = useState<StudySet | null>(null)
  const [generated, setGenerated] = useState<GeneratedContent | null>(null)
  const [mode, setMode] = useState<'flashcards' | 'quiz'>('flashcards')
  const [count, setCount] = useState(8)
  const [focusTopic, setFocusTopic] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [loading, setLoading] = useState(false)
  const { settings } = useSettings()
  const { pushToast } = useToasts()
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      if (!setId) return
      const set = await getStudySet(setId)
      const saved = await getGeneratedContent(setId)
      if (set) {
        setStudySet(set)
      }
      if (saved) {
        setGenerated(saved)
      }
      setDifficulty(settings.difficulty)
    }
    load()
  }, [setId, settings.difficulty])

  const provider = useMemo(() => createAIProvider(settings), [settings])
  const usingOffline = !settings.apiKey || !settings.apiUrl

  const handleGenerate = async () => {
    if (!studySet) return
    setLoading(true)
    try {
      if (mode === 'flashcards') {
        const flashcards = await provider.generateFlashcards(studySet.notes, {
          count,
          difficulty,
          focusTopic: focusTopic || undefined,
        })
        const content: GeneratedContent = {
          setId: studySet.id,
          flashcards,
          quiz: generated?.quiz ?? [],
          updatedAt: new Date().toISOString(),
        }
        await saveGeneratedContent(studySet.id, content)
        setGenerated(content)
      } else {
        const quiz = await provider.generateQuiz(studySet.notes, {
          count,
          difficulty,
          focusTopic: focusTopic || undefined,
        })
        const content: GeneratedContent = {
          setId: studySet.id,
          flashcards: generated?.flashcards ?? [],
          quiz,
          updatedAt: new Date().toISOString(),
        }
        await saveGeneratedContent(studySet.id, content)
        setGenerated(content)
      }
      pushToast({ title: 'Generation complete', tone: 'success' })
    } catch (error) {
      pushToast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Please try again',
        tone: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!studySet) {
    return (
      <Card className="glass-panel border border-white/10 p-6 text-[color:var(--fg-muted)]">
        Study set not found.
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm uppercase tracking-[0.3em] text-[color:var(--fg-soft)]">Generate</div>
          <h1 className="text-2xl font-semibold text-[color:var(--fg)]">{studySet.title}</h1>
          <div className="text-xs text-[color:var(--fg-soft)]">
            {usingOffline ? 'Offline generator active' : 'Connected to BYOK API'}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className={
              mode === 'flashcards'
                ? 'bg-sky-400/90 text-black'
                : 'bg-white/10 text-[color:var(--fg)]'
            }
            onPress={() => setMode('flashcards')}
          >
            Flashcards
          </Button>
          <Button
            size="sm"
            className={
              mode === 'quiz'
                ? 'bg-sky-400/90 text-black'
                : 'bg-white/10 text-[color:var(--fg)]'
            }
            onPress={() => setMode('quiz')}
          >
            Quiz
          </Button>
        </div>
      </div>

      <Card className="glass-panel border border-white/10 p-5">
        <div className="grid gap-4 md:grid-cols-4">
          <TextField
            value={String(count)}
            onChange={(value: string) => {
              const next = Number(value)
              setCount(Number.isNaN(next) ? 0 : next)
            }}
          >
            <Label>Number of items</Label>
            <Input type="number" min={3} max={30} />
          </TextField>
          <div>
            <Label className="text-xs text-[color:var(--fg-muted)]">Difficulty</Label>
            <RadioGroup
              className="mt-2 flex flex-wrap gap-2"
              value={difficulty}
              onChange={(value: string) => setDifficulty(value as 'easy' | 'medium' | 'hard')}
            >
              {difficultyOptions.map((option) => (
                <Radio key={option.key} value={option.key} className="text-[color:var(--fg-muted)]">
                  {option.label}
                </Radio>
              ))}
            </RadioGroup>
          </div>
          <TextField value={focusTopic} onChange={(value: string) => setFocusTopic(value)}>
            <Label>Focus topic</Label>
            <Input placeholder="Optional" />
          </TextField>
          <div className="flex items-end">
            <Button
              className="w-full bg-sky-400/90 text-black"
              isDisabled={loading}
              onPress={handleGenerate}
            >
              {loading ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </div>
      </Card>

      {mode === 'flashcards' ? (
        generated?.flashcards?.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {generated.flashcards.map((card, index) => (
              <Card key={`${card.question}-${index}`} className="glass-panel border border-white/10 p-4">
                <Chip size="sm" className="bg-white/5 text-[color:var(--fg-muted)]">
                  {card.topic}
                </Chip>
                <div className="mt-3 text-sm font-semibold text-[color:var(--fg)]">
                  {card.question}
                </div>
                <div className="mt-2 text-sm text-[color:var(--fg-muted)]">{card.answer}</div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No flashcards yet"
            description="Generate flashcards from your notes to start reviewing."
          />
        )
      ) : generated?.quiz?.length ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[color:var(--fg)]">Quiz Preview</h2>
            <Button
              className="bg-violet-400/80 text-black"
              onPress={() => navigate(`/sets/${studySet.id}/study`)}
            >
              Start Quiz
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {generated.quiz.map((question, index) => (
              <Card key={`${question.prompt}-${index}`} className="glass-panel border border-white/10 p-4">
                <Chip size="sm" className="bg-white/5 text-[color:var(--fg-muted)]">
                  {question.topic} - {question.difficulty}
                </Chip>
                <div className="mt-3 text-sm font-semibold text-[color:var(--fg)]">
                  {question.prompt}
                </div>
                {question.type === 'mcq' && (
                  <ul className="mt-2 space-y-1 text-xs text-[color:var(--fg-muted)]">
                    {question.choices.map((choice) => (
                      <li key={choice}>- {choice}</li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No quiz generated"
          description="Generate quiz questions to start a study session."
        />
      )}
    </div>
  )
}
