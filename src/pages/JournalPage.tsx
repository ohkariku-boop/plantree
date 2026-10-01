import { useState, useRef } from 'react'
import { BookOpen, Plus, Camera, Loader2 } from 'lucide-react'
import { getJournal, getPlants, addJournalEntry } from '../lib/storage'
import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

export default function JournalPage() {
  const [entries] = useState(() => getJournal())
  const plants = getPlants()
  const [showForm, setShowForm] = useState(false)
  const [selectedPlant, setSelectedPlant] = useState('')
  const [notes, setNotes] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const plantMap = Object.fromEntries(plants.map(p => [p.id, p]))

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const saveEntry = () => {
    if (!selectedPlant) return
    setSaving(true)
    addJournalEntry({
      id: uuidv4(),
      plantId: selectedPlant,
      date: new Date().toISOString(),
      imageUrl: preview || undefined,
      notes: notes || undefined
    })
    setShowForm(false)
    setPreview(null)
    setNotes('')
    setSelectedPlant('')
    setSaving(false)
    window.location.reload() // simple refresh for now
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">Growth Journal</h1>
          <p className="text-sage-600 text-sm mt-1">Day-by-day photo log of your plants</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sage-500 text-white text-sm font-medium hover:bg-sage-600"
        >
          <Plus className="w-4 h-4" />
          Entry
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl bg-white border border-sage-200 p-5 space-y-4 shadow-sm">
          <h2 className="font-semibold text-sage-800">New journal entry</h2>
          
          <div>
            <label className="text-sm font-medium text-sage-700">Plant</label>
            <select
              value={selectedPlant}
              onChange={e => setSelectedPlant(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-sage-200 bg-white"
            >
              <option value="">Select a plant…</option>
              {plants.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-sage-700">Photo (optional)</label>
            {preview ? (
              <div className="mt-1 relative">
                <img src={preview} alt="Entry" className="w-full max-h-48 object-contain rounded-xl" />
                <button
                  onClick={() => setPreview(null)}
                  className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="mt-1 w-full py-8 border-2 border-dashed border-sage-300 rounded-xl text-sage-500 hover:border-sage-400"
              >
                <Camera className="w-8 h-8 mx-auto mb-1" />
                <span className="text-sm">Add photo</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-sage-700">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="How is it looking today?"
              className="mt-1 w-full px-3 py-2 rounded-xl border border-sage-200 text-sm resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-xl border border-sage-200 text-sage-700"
            >
              Cancel
            </button>
            <button
              onClick={saveEntry}
              disabled={!selectedPlant || saving}
              className="flex-1 py-2.5 rounded-xl bg-sage-500 text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save entry'}
            </button>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-sage-200">
          <BookOpen className="w-12 h-12 mx-auto text-sage-300 mb-3" />
          <p className="text-sage-600 font-medium">No journal entries yet</p>
          <p className="text-sm text-sage-500 mt-1">Add your first growth photo or note</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => {
            const plant = plantMap[entry.plantId]
            return (
              <div key={entry.id} className="rounded-2xl bg-white border border-sage-200 overflow-hidden shadow-sm">
                {entry.imageUrl && (
                  <img src={entry.imageUrl} alt="Journal" className="w-full max-h-56 object-cover" />
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between text-xs text-sage-500 mb-1">
                    <span className="font-medium text-sage-700">{plant?.name || 'Unknown plant'}</span>
                    <span>{format(new Date(entry.date), 'MMM d, yyyy')}</span>
                  </div>
                  {entry.notes && <p className="text-sm text-sage-700">{entry.notes}</p>}
                  {entry.careActions && entry.careActions.length > 0 && (
                    <p className="text-xs text-sage-500 mt-1">
                      Actions: {entry.careActions.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
