import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Stethoscope, Loader2, AlertTriangle } from 'lucide-react'
import { diagnosePlant } from '../lib/ai'
import { DiagnosisResult } from '../types'

export default function DiagnosePage() {
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [plantHint, setPlantHint] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

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
    }
    reader.readAsDataURL(file)
  }

  const onDiagnose = async () => {
    if (!preview) return
    setLoading(true)
    setError(null)
    try {
      const res = await diagnosePlant(preview, plantHint || undefined)
      setResult(res)
    } catch (e: any) {
      const msg = e.message || 'Something went wrong.'
      if (msg.includes('401') || msg.includes('User not found') || msg.includes('Invalid OpenRouter')) {
        setError('Invalid or expired OpenRouter key. Go to Settings, paste your new key, and Save.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const severityColor = (s: string) => {
    if (s === 'high') return 'bg-red-100 text-red-800 border-red-200'
    if (s === 'medium') return 'bg-amber-100 text-amber-800 border-amber-200'
    return 'bg-green-100 text-green-800 border-green-200'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-sage-800">Plant Doctor</h1>
        <p className="text-sage-600 text-sm mt-1">
          Upload a photo of the problem area. Get clear recovery steps.
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-sage-700">
          Optional: plant name (helps accuracy)
        </label>
        <input
          type="text"
          value={plantHint}
          onChange={e => setPlantHint(e.target.value)}
          placeholder="e.g. Monstera, Snake plant…"
          className="w-full px-4 py-2.5 rounded-xl border border-sage-200 bg-white focus:ring-2 focus:ring-sage-400 outline-none"
        />
      </div>

      {!preview ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-sage-300 rounded-2xl p-10 text-center cursor-pointer hover:border-sage-500 hover:bg-sage-50 transition"
        >
          <Stethoscope className="w-12 h-12 mx-auto text-sage-400 mb-3" />
          <p className="font-medium text-sage-700">Photo of the problem area</p>
          <p className="text-xs text-sage-500 mt-1">Close-up of leaves, spots, stems or soil works best</p>
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
            <img src={preview} alt="Problem area" className="w-full max-h-72 object-contain" />
            <button
              onClick={() => {
                setPreview(null)
                setResult(null)
              }}
              className="absolute top-3 right-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full"
            >
              Change
            </button>
          </div>

          {!result && (
            <button
              onClick={onDiagnose}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 disabled:opacity-60 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Diagnosing…
                </>
              ) : (
                <>
                  <Stethoscope className="w-5 h-5" />
                  Get diagnosis & recovery plan
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
        <div className="space-y-4">
          {result.issues?.map((issue, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-4 ${severityColor(issue.severity)}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <h3 className="font-semibold">{issue.name}</h3>
                <span className="text-xs uppercase font-medium ml-auto">{issue.severity}</span>
              </div>
              <p className="text-sm opacity-90">{issue.description}</p>
              {issue.causes && issue.causes.length > 0 && (
                <p className="text-xs mt-2 opacity-80">Possible causes: {issue.causes.join(', ')}</p>
              )}
            </div>
          ))}

          <div className="rounded-2xl bg-white border border-sage-200 p-5 shadow-sm">
            <h3 className="font-semibold text-sage-800 mb-3">Recovery steps</h3>
            <ol className="space-y-3">
              {result.recoverySteps?.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-sage-700">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sage-500 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {result.preventionTips && result.preventionTips.length > 0 && (
            <div className="rounded-2xl bg-sage-50 border border-sage-200 p-4">
              <h3 className="font-semibold text-sage-800 mb-2 text-sm">Prevention tips</h3>
              <ul className="text-sm text-sage-700 space-y-1">
                {result.preventionTips.map((t, i) => (
                  <li key={i}>• {t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
