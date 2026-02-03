import { Button, Card, TextArea } from '@heroui/react'
import { useRef } from 'react'

type NotesEditorProps = {
  value: string
  onChange: (next: string) => void
}

export const NotesEditor = ({ value, onChange }: NotesEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const text = await file.text()
    onChange(text)
    event.target.value = ''
  }

  return (
    <Card className="glass-panel border border-white/10 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-[color:var(--fg)]">Notes Editor</div>
          <div className="text-xs text-[color:var(--fg-muted)]">
            Paste or import your notes. Autosaves.
          </div>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            className="hidden"
            onChange={handleFile}
          />
          <Button
            size="sm"
            className="bg-white/10 text-[color:var(--fg)]"
            onPress={() => fileInputRef.current?.click()}
          >
            Import .txt/.md
          </Button>
        </div>
      </div>
      <TextArea
        className="mt-4"
        rows={12}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste your study notes here..."
      />
    </Card>
  )
}
