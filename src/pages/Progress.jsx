import { getProfile, getProgress, getDeck, getActivityLog } from '../utils/storage.js'
import { getLevel, getNextLevel, getProgressToNextLevel, LEVELS } from '../utils/xp.js'
import { LESSONS } from '../data/lessons.js'

export default function Progress() {
  const profile = getProfile()
  const progress = getProgress()
  const deck = getDeck()
  const activityLog = getActivityLog()

  const xp = progress.xp || 0
  const streak = progress.streak || 0
  const completedLessons = progress.lessonsCompleted || []
  const level = getLevel(xp)
  const nextLevel = getNextLevel(xp)
  const levelPct = getProgressToNextLevel(xp)
  const learnedWords = Object.keys(deck).length
  const totalWords = LESSONS.reduce((sum, l) => sum + l.vocabulary.length, 0)

  const quizHistory = progress.quizHistory || []
  const overallAccuracy = quizHistory.length
    ? Math.round((quizHistory.reduce((s, q) => s + (q.score / q.total), 0) / quizHistory.length) * 100)
    : null

  const heatmapDays = buildHeatmap(activityLog)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl text-ink">Progress</h1>
        <p className="text-ink/60 text-sm mt-1">{profile.name}'s journey</p>
      </div>

      {/* Level card */}
      <div className="bg-forest-600 text-cream rounded-2xl p-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(255,255,255,0.3) 12px, rgba(255,255,255,0.3) 13px)`,
          }}
        />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-forest-300 text-xs uppercase tracking-wider mb-1">Current level</p>
            <h2 className="font-serif text-3xl font-bold">{level.name}</h2>
            <p className="text-forest-300 text-sm">{level.subtitle}</p>
            <p className="text-forest-200 text-xs mt-2 italic leading-relaxed max-w-xs">{level.description}</p>
          </div>
          <div className="text-5xl">🏅</div>
        </div>

        {/* Level progress */}
        <div className="relative mt-5">
          <div className="bg-forest-700 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-gold-400 rounded-full transition-all duration-700"
              style={{ width: `${levelPct}%` }}
            />
          </div>
          {nextLevel && (
            <div className="flex justify-between text-xs text-forest-300 mt-1.5">
              <span>{xp} XP</span>
              <span>→ {nextLevel.name} at {nextLevel.min} XP</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="🔥" value={streak} label="Day streak" color="text-terracotta-500" />
        <StatCard icon="⭐" value={xp} label="Total XP" color="text-gold-500" />
        <StatCard icon="📖" value={learnedWords} label="Words in deck" color="text-forest-500" />
        <StatCard
          icon="✓"
          value={`${completedLessons.length}/${LESSONS.length}`}
          label="Lessons done"
          color="text-forest-600"
        />
      </div>

      {/* Accuracy */}
      {overallAccuracy !== null && (
        <div className="bg-white/80 border border-terracotta-100 rounded-2xl p-5">
          <h2 className="font-semibold text-ink mb-4">Quiz accuracy</h2>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-terracotta-500">{overallAccuracy}%</div>
            <div>
              <p className="text-ink/60 text-sm">{quizHistory.length} quizzes taken</p>
            </div>
          </div>
        </div>
      )}

      {/* Vocabulary progress */}
      <div className="bg-white/80 border border-terracotta-100 rounded-2xl p-5">
        <div className="flex justify-between items-baseline mb-3">
          <h2 className="font-semibold text-ink">Vocabulary mastered</h2>
          <span className="text-sm text-ink/50">{learnedWords}/{totalWords}</span>
        </div>
        <div className="bg-cream rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-terracotta-400 rounded-full transition-all"
            style={{ width: totalWords > 0 ? `${Math.round((learnedWords / totalWords) * 100)}%` : '0%' }}
          />
        </div>
      </div>

      {/* Per-lesson progress */}
      <div className="bg-white/80 border border-terracotta-100 rounded-2xl p-5">
        <h2 className="font-semibold text-ink mb-4">Lessons</h2>
        <div className="space-y-3">
          {LESSONS.map((lesson, idx) => {
            const done = completedLessons.includes(lesson.id)
            const locked = idx > 0 && !completedLessons.includes(LESSONS[idx - 1].id)
            return (
              <div key={lesson.id} className="flex items-center gap-3">
                <span className="text-lg">{locked ? '🔒' : lesson.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${locked ? 'text-ink/30' : 'text-ink'}`}>
                    {lesson.title}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    done
                      ? 'bg-forest-100 text-forest-700'
                      : locked
                      ? 'bg-cream text-ink/25'
                      : 'bg-terracotta-50 text-terracotta-500'
                  }`}
                >
                  {done ? '✓ Done' : locked ? 'Locked' : 'Not started'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Activity heatmap */}
      <div className="bg-white/80 border border-terracotta-100 rounded-2xl p-5">
        <h2 className="font-semibold text-ink mb-4">Last 30 days</h2>
        <div className="flex flex-wrap gap-1.5">
          {heatmapDays.map((day) => (
            <div
              key={day.date}
              title={day.date}
              className={`w-7 h-7 rounded-md ${
                day.active ? 'bg-terracotta-400' : 'bg-cream border border-terracotta-100'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-ink/40 mt-3">
          {heatmapDays.filter((d) => d.active).length} active days this month
        </p>
      </div>

      {/* Level path */}
      <div className="bg-white/80 border border-terracotta-100 rounded-2xl p-5">
        <h2 className="font-semibold text-ink mb-4">Level journey</h2>
        <div className="space-y-3">
          {LEVELS.map((lvl) => {
            const reached = xp >= lvl.min
            const current = xp >= lvl.min && xp <= lvl.max
            return (
              <div key={lvl.name} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                    current ? 'bg-gold-400 text-white' : reached ? 'bg-forest-500 text-white' : 'bg-cream border border-ink/15 text-ink/30'
                  }`}
                >
                  {current ? '★' : reached ? '✓' : '○'}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${reached ? 'text-ink' : 'text-ink/30'}`}>
                    {lvl.name}
                  </p>
                  <p className={`text-xs ${reached ? 'text-ink/50' : 'text-ink/25'}`}>
                    {lvl.subtitle} · {lvl.max === Infinity ? `${lvl.min}+` : `${lvl.min}–${lvl.max}`} XP
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, value, label, color }) {
  return (
    <div className="bg-white/80 border border-terracotta-100 rounded-2xl p-5">
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-ink/50 mt-0.5">{label}</div>
    </div>
  )
}

function buildHeatmap(log) {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    days.push({ date: dateStr, active: !!log[dateStr] })
  }
  return days
}
