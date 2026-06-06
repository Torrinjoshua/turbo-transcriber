import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: '🏠', end: true },
  { to: '/lessons', label: 'Lessons', icon: '📚' },
  { to: '/practice', label: 'Practice', icon: '🃏' },
  { to: '/quiz', label: 'Quiz', icon: '🧠' },
  { to: '/couples', label: 'Couples', icon: '🫶' },
  { to: '/progress', label: 'Progress', icon: '📊' },
  { to: '/pronunciation', label: 'Sounds', icon: '🔊' },
]

export default function BottomNav() {
  return (
    <nav className="bg-forest-600 border-t border-forest-700 px-2 py-1 safe-area-pb">
      <div className="flex justify-around items-center">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg min-w-0 transition-all ${
                isActive ? 'text-terracotta-400' : 'text-forest-300'
              }`
            }
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-[9px] font-medium leading-none">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
