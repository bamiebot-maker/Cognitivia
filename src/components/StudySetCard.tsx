import { Button, Card, Chip } from '@heroui/react'
import type { StudySet } from '../data/types'

type StudySetCardProps = {
  studySet: StudySet
  onEdit: () => void
  onGenerate: () => void
  onStudy: () => void
  onDelete: () => void
}

export const StudySetCard = ({ studySet, onEdit, onGenerate, onStudy, onDelete }: StudySetCardProps) => {
  return (
    <Card className="glass-panel flex flex-col gap-4 border border-white/10 p-5 text-[color:var(--fg)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{studySet.title}</div>
          <div className="text-sm text-[color:var(--fg-muted)]">
            {studySet.subject || 'General Studies'}
          </div>
        </div>
        <Chip size="sm" className="border border-white/15 bg-white/5 text-[color:var(--fg-muted)]">
          Updated {new Date(studySet.updatedAt).toLocaleDateString()}
        </Chip>
      </div>
      <div className="text-xs text-[color:var(--fg-muted)]">
        {studySet.notes ? `${studySet.notes.slice(0, 140)}...` : 'No notes yet.'}
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        <Button size="sm" className="bg-white/10 text-[color:var(--fg)]" onPress={onEdit}>
          Edit Notes
        </Button>
        <Button size="sm" className="bg-sky-400/80 text-black" onPress={onGenerate}>
          Generate
        </Button>
        <Button size="sm" className="bg-violet-400/80 text-black" onPress={onStudy}>
          Study
        </Button>
        <Button size="sm" className="bg-rose-500/70 text-white" onPress={onDelete}>
          Delete
        </Button>
      </div>
    </Card>
  )
}
