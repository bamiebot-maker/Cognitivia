import { Button, Card, Input, Label, TextField } from '@heroui/react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { NotesEditor } from '../components/NotesEditor'
import { getStudySet, saveStudySet } from '../data/db'
import type { StudySet } from '../data/types'
import { useToasts } from '../context/ToastContext'

export const StudySetEditor = () => {
  const { setId } = useParams()
  const [studySet, setStudySet] = useState<StudySet | null>(null)
  const [status, setStatus] = useState('Loading...')
  const hasLoaded = useRef(false)
  const navigate = useNavigate()
  const { pushToast } = useToasts()

  useEffect(() => {
    const load = async () => {
      if (!setId) return
      const set = await getStudySet(setId)
      if (set) {
        setStudySet(set)
        setStatus('Saved')
        hasLoaded.current = true
      } else {
        setStatus('Not found')
      }
    }
    load()
  }, [setId])

  useEffect(() => {
    if (!studySet || !hasLoaded.current) return
    setStatus('Saving...')
    const timeout = setTimeout(async () => {
      const updated = { ...studySet, updatedAt: new Date().toISOString() }
      await saveStudySet(updated)
      setStudySet(updated)
      setStatus('Saved')
    }, 600)
    return () => clearTimeout(timeout)
  }, [studySet?.title, studySet?.subject, studySet?.notes])

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
          <div className="text-sm uppercase tracking-[0.3em] text-[color:var(--fg-soft)]">
            Study Set
          </div>
          <h1 className="text-2xl font-semibold text-[color:var(--fg)]">Edit Notes</h1>
          <div className="text-xs text-[color:var(--fg-soft)]">{status}</div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-sky-400/90 text-black"
            onPress={() => navigate(`/sets/${studySet.id}/generate`)}
          >
            Generate
          </Button>
          <Button
            size="sm"
            className="bg-white/10 text-[color:var(--fg)]"
            onPress={() => {
              pushToast({ title: 'Notes saved', tone: 'success' })
              navigate('/')
            }}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      <Card className="glass-panel border border-white/10 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            value={studySet.title}
            onChange={(value: string) => setStudySet({ ...studySet, title: value })}
          >
            <Label>Title</Label>
            <Input />
          </TextField>
          <TextField
            value={studySet.subject ?? ''}
            onChange={(value: string) => setStudySet({ ...studySet, subject: value })}
          >
            <Label>Subject</Label>
            <Input />
          </TextField>
        </div>
      </Card>

      <NotesEditor
        value={studySet.notes}
        onChange={(value) => setStudySet({ ...studySet, notes: value })}
      />
    </div>
  )
}
