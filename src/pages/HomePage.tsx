import { Link } from 'react-router-dom'
import { Camera, Stethoscope, Leaf, BookOpen, Sparkles } from 'lucide-react'
import { getPlants } from '../lib/storage'

export default function HomePage() {
  const plants = getPlants()
  const needsAttention = plants.filter(p => p.healthStatus === 'needs-attention' || p.healthStatus === 'critical')

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-100 text-sage-700 text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          Your personal plant expert
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-sage-800 tracking-tight">
          Hello, plant parent 🌱
        </h1>
        <p className="text-sage-600 max-w-md mx-auto">
          Identify plants, spot problems early, track growth day by day, and get simple care advice — all in one calm place.
        </p>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-2 gap-3">
        <ActionCard
          to="/identify"
          icon={<Camera className="w-6 h-6" />}
          title="Identify"
          desc="Snap a photo → know your plant"
          color="bg-sage-500"
        />
        <ActionCard
          to="/diagnose"
          icon={<Stethoscope className="w-6 h-6" />}
          title="Plant Doctor"
          desc="Not looking well? Get help"
          color="bg-amber-600"
        />
        <ActionCard
          to="/plants"
          icon={<Leaf className="w-6 h-6" />}
          title="My Plants"
          desc={`${plants.length} plant${plants.length !== 1 ? 's' : ''} in your collection`}
          color="bg-emerald-600"
        />
        <ActionCard
          to="/journal"
          icon={<BookOpen className="w-6 h-6" />}
          title="Growth Journal"
          desc="Day-by-day photo log"
          color="bg-sky-600"
        />
      </section>

      {/* Attention banner */}
      {needsAttention.length > 0 && (
        <section className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <h2 className="font-semibold text-amber-800 mb-1">Needs your care</h2>
          <p className="text-sm text-amber-700 mb-3">
            {needsAttention.length} plant{needsAttention.length > 1 ? 's' : ''} could use attention.
          </p>
          <Link
            to="/plants"
            className="inline-flex items-center text-sm font-medium text-amber-800 underline underline-offset-2"
          >
            Check them →
          </Link>
        </section>
      )}

      {/* Tips */}
      <section className="rounded-2xl bg-white border border-sage-200 p-5 shadow-sm">
        <h2 className="font-semibold text-sage-800 mb-3">Gentle reminders</h2>
        <ul className="space-y-2 text-sm text-sage-700">
          <li>• Most houseplants prefer bright indirect light and dislike wet feet.</li>
          <li>• When in doubt, check the soil before watering.</li>
          <li>• A clear photo of leaves + soil helps the Plant Doctor a lot.</li>
          <li>• Consistency beats perfection — small regular care wins.</li>
        </ul>
      </section>
    </div>
  )
}

function ActionCard({
  to,
  icon,
  title,
  desc,
  color
}: {
  to: string
  icon: React.ReactNode
  title: string
  desc: string
  color: string
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-3 p-4 rounded-2xl bg-white border border-sage-200 shadow-sm hover:shadow-md hover:border-sage-300 transition"
    >
      <div className={`w-11 h-11 rounded-xl ${color} text-white flex items-center justify-center group-hover:scale-105 transition`}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-sage-800">{title}</h3>
        <p className="text-xs text-sage-600 mt-0.5 leading-snug">{desc}</p>
      </div>
    </Link>
  )
}
