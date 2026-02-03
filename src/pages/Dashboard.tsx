import { Button, Card } from '@heroui/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { StudySetCard } from '../components/StudySetCard'
import { deleteStudySet, getStudySets, saveStudySet } from '../data/db'
import type { StudySet } from '../data/types'
import { useToasts } from '../context/ToastContext'
import { createId } from '../utils/id'

export const Dashboard = () => {
  const [sets, setSets] = useState<StudySet[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { pushToast } = useToasts()

  const loadSets = async () => {
    setLoading(true)
    const data = await getStudySets()
    const sorted = [...data].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    setSets(sorted)
    setLoading(false)
  }

  useEffect(() => {
    loadSets()
  }, [])

  const handleCreate = async () => {
    const now = new Date().toISOString()
    const newSet: StudySet = {
      id: createId(),
      title: 'New Study Set',
      subject: '',
      notes: '',
      createdAt: now,
      updatedAt: now,
    }
    await saveStudySet(newSet)
    pushToast({ title: 'Study set created', tone: 'success' })
    navigate(`/sets/${newSet.id}/edit`)
  }

  const handleDelete = async (studySet: StudySet) => {
    const confirmed = window.confirm(`Delete "${studySet.title}"? This cannot be undone.`)
    if (!confirmed) return
    await deleteStudySet(studySet.id)
    pushToast({ title: 'Study set deleted', tone: 'warning' })
    loadSets()
  }

  return (
    <div className="space-y-8">
      <section className="relative grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="dashboard-backdrop">
          <div className="dashboard-orb orb-one" />
          <div className="dashboard-orb orb-two" />
          <div className="dashboard-orb orb-three" />
        </div>
        <Card className="glass-panel relative z-10 border border-white/10 p-6">
          <div className="text-sm uppercase tracking-[0.3em] text-[color:var(--fg-soft)]">
            Cognitivia
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-[color:var(--fg)]">
            Organize notes, generate quizzes, and track mastery.
          </h1>
          <p className="mt-3 text-sm text-[color:var(--fg-muted)]">
            Build study sets from class notes, then run practice sessions with AI or offline
            generation.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="bg-sky-400/90 text-black" onPress={handleCreate}>
              Create Study Set
            </Button>
            <Button className="bg-white/10 text-[color:var(--fg)]" variant="ghost" onPress={loadSets}>
              Refresh
            </Button>
          </div>
        </Card>
        <Card className="glass-panel relative z-10 border border-white/10 p-6">
          <div className="text-sm font-semibold text-[color:var(--fg)]">Quick Tips</div>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--fg-muted)]">
            <li>- Import .txt or .md files to speed up note entry.</li>
            <li>- Generate flashcards and quizzes tailored to focus topics.</li>
            <li>- Review weak topics after each session.</li>
          </ul>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[color:var(--fg)]">Your Study Sets</h2>
          <Button className="bg-white/10 text-[color:var(--fg)]" size="sm" onPress={handleCreate}>
            New Set
          </Button>
        </div>
        {loading ? (
          <Card className="glass-panel border border-white/10 p-6 text-[color:var(--fg-muted)]">
            Loading...
          </Card>
        ) : sets.length === 0 ? (
          <EmptyState
            title="No study sets yet"
            description="Create your first study set to start generating flashcards and quizzes."
            actionLabel="Create Study Set"
            onAction={handleCreate}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sets.map((studySet) => (
              <StudySetCard
                key={studySet.id}
                studySet={studySet}
                onEdit={() => navigate(`/sets/${studySet.id}/edit`)}
                onGenerate={() => navigate(`/sets/${studySet.id}/generate`)}
                onStudy={() => navigate(`/sets/${studySet.id}/study`)}
                onDelete={() => handleDelete(studySet)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
