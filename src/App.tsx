import { Routes, Route, NavLink } from 'react-router-dom'
import { Leaf, Camera, Stethoscope, BookOpen, Settings, Home } from 'lucide-react'
import HomePage from './pages/HomePage'
import IdentifyPage from './pages/IdentifyPage'
import DiagnosePage from './pages/DiagnosePage'
import PlantsPage from './pages/PlantsPage'
import JournalPage from './pages/JournalPage'
import SettingsPage from './pages/SettingsPage'
import PlantDetailPage from './pages/PlantDetailPage'

function App() {
  return (
    <div className="flex flex-col min-h-dvh bg-cream-100">
      {/* Top header */}
      <header className="sticky top-0 z-40 bg-sage-500 text-white shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <Leaf className="w-6 h-6" />
            <span>Plantree</span>
          </NavLink>
          <NavLink to="/settings" className="p-2 rounded-full hover:bg-sage-600 transition">
            <Settings className="w-5 h-5" />
          </NavLink>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 pb-24">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/identify" element={<IdentifyPage />} />
          <Route path="/diagnose" element={<DiagnosePage />} />
          <Route path="/plants" element={<PlantsPage />} />
          <Route path="/plants/:id" element={<PlantDetailPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-sage-200 shadow-lg">
        <div className="max-w-3xl mx-auto flex justify-around py-2">
          <NavItem to="/" icon={<Home className="w-5 h-5" />} label="Home" />
          <NavItem to="/identify" icon={<Camera className="w-5 h-5" />} label="Identify" />
          <NavItem to="/diagnose" icon={<Stethoscope className="w-5 h-5" />} label="Doctor" />
          <NavItem to="/plants" icon={<Leaf className="w-5 h-5" />} label="My Plants" />
          <NavItem to="/journal" icon={<BookOpen className="w-5 h-5" />} label="Journal" />
        </div>
      </nav>
    </div>
  )
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
          isActive
            ? 'text-sage-600 bg-sage-100'
            : 'text-sage-500 hover:text-sage-700 hover:bg-sage-50'
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  )
}

export default App
