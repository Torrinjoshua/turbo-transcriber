import { useNavigate } from 'react-router-dom'
import { getProfile, getProgress, getDeck, getAllLessonStars } from '../utils/storage.js'
import { getLevel } from '../utils/xp.js'
import { getDueCards } from '../utils/srs.js'
import { LESSONS } from '../data/lessons.js'

export default function Home() {
  const navigate = useNavigate()
  const profile = getProfile()
  const progress = getProgress()
  const deck = getDeck()
  const dueCards = getDueCards(deck)
  const lessonStars = getAllLessonStars()
  const level = getLevel(progress.xp || 0)
  const completedLessons = progress.lessonsCompleted || []

  const firstIncomplete = LESSONS.findIndex(
    (l, i) => !completedLessons.includes(l.id) && (i === 0 || completedLessons.includes(LESSONS[i - 1].id))
  )

  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      {/* Top bar */}
      <div className="bg-white px-5 pt-12 pb-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{profile.avatar || '🦁'}</span>
            <div>
              <p className="font-bold text-ink text-base leading-tight">{profile.name}</p>
              <p className="text-xs text-terracotta-500 font-semibold">{level.name}</p>
            </div>
          </div>

          {/* Stats pills */}
          <div className="flex gap-2">
            <StatPill icon="🔥" value={progress.streak || 0} label="streak" />
            <StatPill icon="⭐" value={progress.xp || 0} label="XP" />
          </div>
        </div>

        {/* Due cards banner */}
        {dueCards.length > 0 && (
          <button
            onClick={() => navigate('/practice')}
            className="mt-3 w-full bg-terracotta-50 border-2 border-terracotta-300 rounded-2xl px-4 py-2.5 flex items-center gap-3 active:scale-95 transition-transform"
          >
            <span className="text-xl">🃏</span>
            <div className="text-left flex-1">
              <p className="text-terracotta-700 font-bold text-sm">
                {dueCards.length} card{dueCards.length !== 1 ? 's' : ''} ready to review!
              </p>
            </div>
            <span className="bg-terracotta-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              Go
            </span>
          </button>
        )}
      </div>

      {/* Lesson path */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <h2 className="font-serif text-xl text-ink font-bold mb-6 text-center">Your Learning Path</h2>

        <div className="relative">
          {/* Vertical connecting line */}
          <div
            className="absolute left-1/2 top-10 bottom-10 w-1 -translate-x-1/2 rounded-full"
            style={{ background: 'repeating-linear-gradient(to bottom, #d1c4b0 0px, #d1c4b0 8px, transparent 8px, transparent 14px)' }}
          />

          <div className="space-y-4 relative">
            {LESSONS.map((lesson, idx) => {
              const isComplete = completedLessons.includes(lesson.id)
              const isLocked = idx > 0 && !completedLessons.includes(LESSONS[idx - 1].id)
              const isCurrent = idx === firstIncomplete
              const stars = lessonStars[lesson.id] || 0

              // Alternating left/right offset
              const offset = idx % 2 === 0 ? '-translate-x-6' : 'translate-x-6'

              return (
                <div key={lesson.id} className={`flex flex-col items-center transform ${offset}`}>
                  {/* Lesson circle */}
                  <button
                    onClick={() => !isLocked && navigate(`/lessons/${lesson.id}`)}
                    disabled={isLocked}
                    className={`
                      relative w-20 h-20 rounded-full flex flex-col items-center justify-center
                      shadow-lg transition-all active:scale-90 select-none
                      ${isComplete
                        ? 'bg-forest-600 text-white shadow-forest-200'
                        : isCurrent
                        ? 'bg-terracotta-500 text-white animate-pulse-ring'
                        : isLocked
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-terracotta-400 text-white'}
                    `}
                  >
                    <span className="text-3xl">{isLocked ? '🔒' : lesson.icon}</span>
                  </button>

                  {/* Stars */}
                  {isComplete && (
                    <div className="flex gap-0.5 mt-1.5 animate-bounce-in">
                      {[1, 2, 3].map(s => (
                        <span key={s} className={`text-base ${s <= stars ? 'text-gold-500' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Label */}
                  {!isLocked && (
                    <p className={`text-xs font-bold mt-1 text-center max-w-[90px] leading-tight ${
                      isComplete ? 'text-forest-600' : isCurrent ? 'text-terracotta-600' : 'text-ink/50'
                    }`}>
                      {lesson.title}
                    </p>
                  )}

                  {/* "Start here" badge */}
                  {isCurrent && (
                    <div className="mt-1.5 bg-terracotta-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      START HERE
                    </div>
                  )}
                </div>
              )
            })}

            {/* End of path */}
            <div className="flex flex-col items-center py-4">
              <div className="w-16 h-16 rounded-full bg-gold-400/20 border-2 border-gold-400 flex items-center justify-center text-3xl">
                🏆
              </div>
              <p className="text-xs font-bold text-gold-600 mt-1.5">Mulopwe!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatPill({ icon, value, label }) {
  return (
    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
      <span className="text-base">{icon}</span>
      <span className="font-bold text-ink text-sm">{value}</span>
    </div>
  )
}
