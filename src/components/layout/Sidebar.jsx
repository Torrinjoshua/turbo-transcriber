import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: '🏠', end: true },
  { to: '/lessons', label: 'Lessons', icon: '📚' },
  { to: '/practice', label: 'Practice', icon: '🃏' },
  { to: '/quiz', label: 'Quiz', icon: '🧠' },
  { to: '/couples', label: 'Couples', icon: '🫶' },
  { to: '/progress', label: 'Progress', icon: '📊' },
  { to: '/pronunciation', label: 'Pronunciation', icon: '🔊' },
]

export default function Sidebar() {
  return (
    <div className="flex flex-col h-full bg-forest-600 text-cream">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-forest-700">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌿</span>
          <div>
            <h1 className="font-serif text-xl font-bold text-cream leading-tight">Mother Tongue</h1>
            <p className="text-xs text-forest-200 mt-0.5">Learn Bemba</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-terracotta-500 text-cream shadow-md'
                  : 'text-forest-200 hover:bg-forest-700 hover:text-cream'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer tagline */}
      <div className="px-6 py-5 border-t border-forest-700">
        <p className="text-xs text-forest-300 italic leading-relaxed">
          "Reclaim your roots.<br />One word at a time."
        </p>
      </div>
    </div>
  )
}
