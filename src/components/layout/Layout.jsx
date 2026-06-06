import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav.jsx'

export default function Layout() {
  const location = useLocation()
  // Hide bottom nav during active lesson exercises
  const inLesson = /^\/lessons\/lesson-/.test(location.pathname)

  return (
    <div className="phone-frame flex flex-col">
      {/* Scrollable content */}
      <main className={`flex-1 overflow-y-auto ${inLesson ? 'pb-0' : 'pb-24'}`}>
        <Outlet />
      </main>

      {/* Bottom nav — hidden inside active lesson */}
      {!inLesson && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
          <BottomNav />
        </div>
      )}
    </div>
  )
}
