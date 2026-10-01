import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Trash2, BookOpen, Droplets } from 'lucide-react'
import { getPlants, deletePlant, updatePlant, addJournalEntry } from '../lib/storage'
import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import { useState } from 'react'

export default function PlantDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const plants = getPlants()
  const plant = plants.find(p => p.id === id)
  const [notes, setNotes] = useState(plant?.notes || '')

  if (!plant) {
    return (
      <div className="text-center py-20">
        <p className="text-sage-600">Plant not found</p>
        <Link to="/plants" className="text-sage-500 underline text-sm mt-2 inline-block">
          Back to collection
        </Link>
      </div>
    )
  }

  const handleDelete = () => {
    if (confirm(`Remove ${plant.name} from your collection?`)) {
      deletePlant(plant.id)
      navigate('/plants')
    }
  }

  const handleWatered = () => {
    updatePlant(plant.id, { lastWatered: new Date().toISOString() })
    addJournalEntry({
      id: uuidv4(),
      plantId: plant.id,
      date: new Date().toISOString(),
      careActions: ['watered'],
      notes: 'Marked as watered'
    })
    // force re-render by navigating
    navigate(0)
  }

  const saveNotes = () => {
    updatePlant(plant.id, { notes })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-sage-100">
          <ArrowLeft className="w-5 h-5 text-sage-600" />
        </button>
        <h1 className="text-xl font-bold text-sage-800 flex-1 truncate">{plant.name}</h1>
        <button onClick={handleDelete} className="p-2 rounded-full hover:bg-red-50 text-red-500">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {plant.imageUrl && (
        <div className="rounded-2xl overflow-hidden bg-sage-100">
          <img src={plant.imageUrl} alt={plant.name} className="w-full max-h-72 object-contain" />
        </div>
      )}

      {plant.scientificName && (
        <p className="text-center italic text-sage-500 -mt-2">{plant.scientificName}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleWatered}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-600 transition"
        >
          <Droplets className="w-5 h-5" />
          I watered it
        </button>
        <Link
          to="/journal"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sage-100 text-sage-700 font-medium hover:bg-sage-200 transition"
        >
          <BookOpen className="w-5 h-5" />
          Journal
        </Link>
      </div>

      {plant.lastWatered && (
        <p className="text-sm text-center text-sage-500">
          Last watered: {format(new Date(plant.lastWatered), 'MMM d, yyyy • h:mm a')}
        </p>
      )}

      {plant.care && (
        <div className="rounded-2xl bg-white border border-sage-200 p-5 space-y-3">
          <h2 className="font-semibold text-sage-800">Care guide</h2>
          <div className="grid gap-3 text-sm">
            <CareRow label="Light" value={plant.care.light} />
            <CareRow label="Water" value={plant.care.water} />
            {plant.care.humidity && <CareRow label="Humidity" value={plant.care.humidity} />}
            {plant.care.soil && <CareRow label="Soil" value={plant.care.soil} />}
            {plant.care.fertilizing && <CareRow label="Feeding" value={plant.care.fertilizing} />}
            {plant.care.pruning && <CareRow label="Pruning" value={plant.care.pruning} />}
            {plant.care.repotting && <CareRow label="Repotting" value={plant.care.repotting} />}
          </div>
          {plant.care.tips && plant.care.tips.length > 0 && (
            <div className="pt-2 border-t border-sage-100">
              <p className="text-xs font-medium text-sage-500 mb-1">Tips</p>
              <ul className="text-sm text-sage-700 space-y-1">
                {plant.care.tips.map((t, i) => (
                  <li key={i}>• {t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl bg-white border border-sage-200 p-5">
        <h2 className="font-semibold text-sage-800 mb-2">Notes</h2>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          onBlur={saveNotes}
          placeholder="Personal notes about this plant…"
          rows={3}
          className="w-full px-3 py-2 rounded-xl border border-sage-200 text-sm focus:ring-2 focus:ring-sage-400 outline-none resize-none"
        />
      </div>
    </div>
  )
}

function CareRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-sage-500 uppercase tracking-wide">{label}</p>
      <p className="text-sage-800">{value}</p>
    </div>
  )
}
