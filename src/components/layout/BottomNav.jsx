import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/',          label: 'Home',     icon: '🏠', end: true },
  { to: '/practice',  label: 'Cards',    icon: '🃏' },
  { to: '/quiz',      label: 'Quiz',     icon: '🎮' },
  { to: '/couples',   label: 'Together', icon: '🫶' },
  { to: '/progress',  label: 'Me',       icon: '⭐' },
]

export default function BottomNav() {
  return (
    <nav className="bg-white border-t-2 border-gray-100 px-2 py-2">
      <div className="flex justify-around items-center">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl min-w-0 transition-all ${
                isActive
                  ? 'text-terracotta-500'
                  : 'text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`text-2xl leading-none transition-transform ${
                    isActive ? 'scale-110' : ''
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`text-[10px] font-bold leading-none ${
                    isActive ? 'text-terracotta-500' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
