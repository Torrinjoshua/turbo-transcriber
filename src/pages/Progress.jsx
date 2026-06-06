import { useNavigate } from 'react-router-dom'
import { getProfile, getProgress, getDeck, getActivityLog, getAllLessonStars } from '../utils/storage.js'
import { getLevel, getNextLevel, getProgressToNextLevel, LEVELS } from '../utils/xp.js'
import { LESSONS } from '../data/lessons.js'

export default function Progress() {
  const navigate = useNavigate()
  const profile  = getProfile()
  const progress = getProgress()
  const deck     = getDeck()
  const activityLog  = getActivityLog()
  const lessonStars  = getAllLessonStars()

  const xp   = progress.xp || 0
  const streak = progress.streak || 0
  const completedLessons = progress.lessonsCompleted || []
  const level      = getLevel(xp)
  const nextLevel  = getNextLevel(xp)
  const levelPct   = getProgressToNextLevel(xp)
  const learnedWords = Object.keys(deck).length
  const totalWords   = LESSONS.reduce((s, l) => s + l.vocabulary.length, 0)
  const totalStars   = Object.values(lessonStars).reduce((s, v) => s + v, 0)
  const maxStars     = LESSONS.length * 3
  const heatmap      = buildHeatmap(activityLog)

  return (
    <div className="flex flex-col min-h-dvh bg-cream">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{profile.avatar || '🦁'}</span>
          <div>
            <h1 className="font-bold text-xl text-ink">{profile.name}</h1>
            <p className="text-terracotta-500 text-sm font-semibold">{level.name} · {level.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 pb-28">
        {/* Level card */}
        <div className="bg-forest-600 rounded-3xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between mb-1">
            <p className="text-forest-300 text-xs uppercase tracking-wider font-bold">Level</p>
            <span className="text-2xl">🏅</span>
          </div>
          <h2 className="font-serif text-3xl font-bold">{level.name}</h2>
          <p className="text-forest-300 text-sm italic mt-1">{level.description}</p>

          <div className="mt-4">
            <div className="bg-forest-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gold-400 rounded-full transition-all duration-700"
                style={{ width: `${levelPct}%` }}
              />
            </div>
            {nextLevel && (
              <div className="flex justify-between text-xs text-forest-300 mt-1.5">
                <span>{xp} XP</span>
                <span>Next: {nextLevel.name} at {nextLevel.min} XP</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <BigStat icon="🔥" value={streak} label="Day streak" bg="bg-orange-50" border="border-orange-200" color="text-orange-500" />
          <BigStat icon="⭐" value={xp}     label="Total XP"   bg="bg-gold-50"   border="border-gold-300"  color="text-gold-600" />
          <BigStat icon="🌟" value={`${totalStars}/${maxStars}`} label="Stars earned"
            bg="bg-yellow-50" border="border-yellow-200" color="text-yellow-600" />
          <BigStat icon="📖" value={learnedWords} label="Words learned"
            bg="bg-forest-50" border="border-forest-200" color="text-forest-600" />
        </div>

        {/* Vocabulary bar */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-5 shadow-sm">
          <div className="flex justify-between items-baseline mb-3">
            <h2 className="font-bold text-ink text-base">Words learned</h2>
            <span className="text-sm text-ink/40 font-bold">{learnedWords}/{totalWords}</span>
          </div>
          <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-terracotta-400 rounded-full transition-all"
              style={{ width: totalWords > 0 ? `${Math.round((learnedWords / totalWords) * 100)}%` : '0%' }}
            />
          </div>
        </div>

        {/* Lessons with stars */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-ink text-base mb-4">Lesson Stars</h2>
          <div className="space-y-3">
            {LESSONS.map((lesson, idx) => {
              const done   = completedLessons.includes(lesson.id)
              const locked = idx > 0 && !completedLessons.includes(LESSONS[idx - 1].id)
              const stars  = lessonStars[lesson.id] || 0
              return (
                <div key={lesson.id} className="flex items-center gap-3">
                  <span className="text-xl">{locked ? '🔒' : lesson.icon}</span>
                  <p className={`flex-1 text-sm font-semibold truncate ${locked ? 'text-gray-300' : 'text-ink'}`}>
                    {lesson.title}
                  </p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map(s => (
                      <span key={s} className={`text-base ${done && s <= stars ? 'text-gold-500' : 'text-gray-200'}`}>★</span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Activity heatmap */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-ink text-base mb-4">Last 30 days 🗓️</h2>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
            {heatmap.map(day => (
              <div
                key={day.date}
                title={day.date}
                className={`aspect-square rounded-md ${day.active ? 'bg-terracotta-400' : 'bg-gray-100'}`}
              />
            ))}
          </div>
          <p className="text-xs text-ink/40 mt-3 font-medium">
            {heatmap.filter(d => d.active).length} active days 💪
          </p>
        </div>

        {/* Level path */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-ink text-base mb-4">Your level journey</h2>
          <div className="space-y-3">
            {LEVELS.map(lvl => {
              const reached  = xp >= lvl.min
              const isCurrent = xp >= lvl.min && xp <= lvl.max
              return (
                <div key={lvl.name} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    isCurrent ? 'bg-gold-400 text-white' : reached ? 'bg-forest-500 text-white' : 'bg-gray-100 text-gray-300'
                  }`}>
                    {isCurrent ? '★' : reached ? '✓' : '○'}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${reached ? 'text-ink' : 'text-gray-300'}`}>{lvl.name}</p>
                    <p className={`text-xs ${reached ? 'text-ink/50' : 'text-gray-300'}`}>
                      {lvl.subtitle} · {lvl.max === Infinity ? `${lvl.min}+` : `${lvl.min}–${lvl.max}`} XP
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pronunciation link */}
        <button
          onClick={() => navigate('/pronunciation')}
          className="w-full bg-forest-50 border-2 border-forest-200 rounded-3xl p-4 flex items-center gap-4 active:scale-95 transition-transform"
        >
          <span className="text-3xl">🔊</span>
          <div className="text-left">
            <p className="font-bold text-forest-700">Pronunciation Guide</p>
            <p className="text-xs text-forest-600/60">Learn how Bemba sounds</p>
          </div>
          <span className="ml-auto text-forest-400 font-bold">→</span>
        </button>
      </div>
    </div>
  )
}

function BigStat({ icon, value, label, bg, border, color }) {
  return (
    <div className={`${bg} border-2 ${border} rounded-3xl p-4 shadow-sm`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-ink/50 font-semibold mt-0.5">{label}</div>
    </div>
  )
}

function buildHeatmap(log) {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({ date: d.toISOString().slice(0, 10), active: !!log[d.toISOString().slice(0, 10)] })
  }
  return days
}
