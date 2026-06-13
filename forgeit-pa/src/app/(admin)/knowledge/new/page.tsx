import { KbEditor } from '@/components/knowledge/KbEditor'

export default function NewKnowledgePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">New Knowledge Entry</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Add something the PA should know and use when answering questions.
        </p>
      </div>
      <KbEditor />
    </div>
  )
}
