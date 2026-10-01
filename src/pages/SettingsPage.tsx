import { useState, useEffect } from 'react'
import { Key, Save, ExternalLink, Info } from 'lucide-react'
import { getSettings, saveSettings } from '../lib/storage'
import { AppSettings } from '../types'

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSettings(getSettings())
  }, [])

  const handleSave = () => {
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-sage-800">Settings</h1>
        <p className="text-sage-600 text-sm mt-1">Configure your free AI access</p>
      </div>

      <div className="rounded-2xl bg-white border border-sage-200 p-5 space-y-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-sage-100 text-sage-600">
            <Key className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-sage-800">OpenRouter API Key</h2>
            <p className="text-sm text-sage-600 mt-0.5">
              Completely free. Used only for plant identification and diagnosis.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-sage-700 mb-1">
            Your key (starts with sk-or-…)
          </label>
          <input
            type="password"
            value={settings.openRouterApiKey || ''}
            onChange={e => setSettings({ ...settings, openRouterApiKey: e.target.value })}
            placeholder="sk-or-v1-…"
            className="w-full px-4 py-2.5 rounded-xl border border-sage-200 focus:ring-2 focus:ring-sage-400 outline-none text-sm font-mono"
          />
        </div>

        <div className="rounded-xl bg-sage-50 border border-sage-200 p-4 text-sm text-sage-700 space-y-2">
          <div className="flex items-center gap-2 font-medium">
            <Info className="w-4 h-4" />
            How to get a free key
          </div>
          <ol className="list-decimal list-inside space-y-1 text-sage-600">
            <li>
              Go to{' '}
              <a
                href="https://openrouter.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sage-600 underline inline-flex items-center gap-0.5"
              >
                openrouter.ai <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>Sign up with Google / GitHub / email (free)</li>
            <li>Create an API key</li>
            <li>Paste it here and save</li>
          </ol>
          <p className="text-xs text-sage-500 pt-1">
            Free models (Gemini Flash, Llama Vision, etc.) have daily limits but are enough for personal use.
            Your key stays in your browser only — never sent to our servers.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-sage-700 mb-1">
            Preferred model (optional)
          </label>
          <select
            value={settings.preferredModel || ''}
            onChange={e => setSettings({ ...settings, preferredModel: e.target.value || undefined })}
            className="w-full px-4 py-2.5 rounded-xl border border-sage-200 bg-white text-sm"
          >
            <option value="">Default (auto free vision model)</option>
            <option value="google/gemma-4-31b-it:free">Gemma 4 31B (free, vision)</option>
            <option value="google/gemma-4-26b-a4b-it:free">Gemma 4 26B (free, vision)</option>
            <option value="qwen/qwen3.8-27b:free">Qwen3.8 27B (free, vision)</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-sage-500 text-white font-semibold hover:bg-sage-600 transition"
        >
          <Save className="w-5 h-5" />
          {saved ? 'Saved!' : 'Save settings'}
        </button>
      </div>

      <div className="rounded-2xl bg-cream-50 border border-sage-200 p-5 text-sm text-sage-600">
        <h3 className="font-semibold text-sage-800 mb-2">About Plantree</h3>
        <p>
          Plantree is a free, open-source personal plant companion. All your plants and journal entries
          stay on your device. AI features use your own free OpenRouter key.
        </p>
        <p className="mt-2">
          Built with ❤️ for plant parents everywhere.
        </p>
      </div>
    </div>
  )
}
