import { useState, useRef } from 'react'
import { Camera, Upload, Loader2, Check, Plus, Leaf } from 'lucide-react'
import { identifyPlant } from '../lib/ai'
import { addPlant } from '../lib/storage'
import { IdentificationResult } from '../types'
import { v4 as uuidv4 } from 'uuid'
import { useNavigate, Link } from 'react-router-dom'

export default function IdentifyPage() {
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<IdentificationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [plantName, setPlantName] = useState('')
  const [saved, setSaved] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
      setResult(null)
      setError(null)
      setSaved(false)
      setSavedId(null)
      setPlantName('')
    }
    reader.readAsDataURL(file)
  }

  const onIdentify = async () => {
    if (!preview) return
    setLoading(true)
    setError(null)
    try {
      const res = await identifyPlant(preview)
      setResult(res)
      setPlantName(res.name || '')
    } catch (e: any) {
      const msg = e.message || 'Something went wrong.'
      if (msg.includes('401') || msg.includes('User not found')) {
        setError('Invalid or expired OpenRouter key. Go to Settings, paste your new key, and Save.')
      } else {
        setError(msg + ' — Check your OpenRouter key in Settings.')
      }
    } finally {
      setLoading(false)
    }
  }

  const saveToCollection = () => {
    if (!result || !preview) return
    const name = plantName.trim() || result.name || 'My plant'
    const plant = {
      id: uuidv4(),
      name,
      scientificName: result.scientificName,
      commonNames: result.commonNames,
      imageUrl: preview,
      addedAt: new Date().toISOString(),
      care: result.care,
      healthStatus: 'healthy' as const
    }
    addPlant(plant)
    setSaved(true)
    setSavedId(plant.id)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-sage-800">Identify a plant</h1>
        <p className="text-sage-600 text-sm mt-1">
          Take or upload a clear photo of the leaves, stem or whole plant.
        </p>
      </div>

      {!preview ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-sage-300 rounded-2xl p-10 text-center cursor-pointer hover:border-sage-500 hover:bg-sage-50 transition"
        >
          <Camera className="w-12 h-12 mx-auto text-sage-400 mb-3" />
          <p className="font-medium text-sage-700">Tap to take or choose a photo</p>
          <p className="text-xs text-sage-500 mt-1">Camera or Photo Library • best with good light</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-sage-100">
            <img src={preview} alt="Plant preview" className="w-full max-h-80 object-contain" />
            <button
              onClick={() => {
                setPreview(null)
                setResult(null)
                setSaved(false)
              }}
              className="absolute top-3 right-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full"
            >
              Change
            </button>
          </div>

          {!result && (
            <button
              onClick={onIdentify}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-sage-500 text-white font-semibold hover:bg-sage-600 disabled:opacity-60 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Identifying…
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Identify this plant
                </>
              )}
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm p-4 space-y-2">
          <p>{error}</p>
          <Link to="/settings" className="inline-block font-medium underline underline-offset-2">
            Open Settings →
          </Link>
        </div>
      )}

      {result && (
        <div className="rounded-2xl bg-white border border-sage-200 shadow-sm overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-sage-500 uppercase tracking-wide">Plant name</label>
                <input
                  type="text"
                  value={plantName}
                  onChange={e => setPlantName(e.target.value)}
                  className="mt-1 w-full text-xl font-bold text-sage-800 bg-transparent border-b border-sage-200 focus:border-sage-500 outline-none py-1"
                  placeholder="Name this plant"
                />
                {result.scientificName && (
                  <p className="text-sm italic text-sage-500 mt-1">{result.scientificName}</p>
                )}
                <p className="text-xs text-sage-500 mt-1">
                  Confidence: {Math.round((result.confidence || 0) * 100)}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center text-sage-600 flex-shrink-0">
                <Check className="w-5 h-5" />
              </div>
            </div>

            {result.description && (
              <p className="text-sm text-sage-700">{result.description}</p>
            )}

            {result.care && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <CareItem label="Light" value={result.care.light} />
                <CareItem label="Water" value={result.care.water} />
                {result.care.humidity && <CareItem label="Humidity" value={result.care.humidity} />}
                {result.care.soil && <CareItem label="Soil" value={result.care.soil} />}
              </div>
            )}

            {result.care?.tips && result.care.tips.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-sage-700 mb-1">Tips</h3>
                <ul className="text-sm text-sage-600 space-y-1">
                  {result.care.tips.map((t, i) => (
                    <li key={i}>• {t}</li>
                  ))}
                </ul>
              </div>
            )}

            {saved ? (
              <div className="space-y-2">
                <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-100 text-emerald-800 font-semibold">
                  <Check className="w-5 h-5" />
                  Saved to My Plants
                </div>
                <button
                  onClick={() => savedId && navigate(`/plants/${savedId}`)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-sage-500 text-white font-semibold hover:bg-sage-600 transition"
                >
                  <Leaf className="w-5 h-5" />
                  View plant
                </button>
              </div>
            ) : (
              <button
                onClick={saveToCollection}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-sage-500 text-white font-semibold hover:bg-sage-600 transition shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Save plant
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function CareItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-sage-50 p-3">
      <p className="text-xs font-medium text-sage-500 uppercase tracking-wide">{label}</p>
      <p className="text-sage-800 mt-0.5">{value}</p>
    </div>
  )
}
