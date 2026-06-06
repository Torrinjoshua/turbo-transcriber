import { useNavigate } from 'react-router-dom'
import { getProfile, getProgress, getDeck } from '../utils/storage.js'
import { getLevel, getProgressToNextLevel } from '../utils/xp.js'
import { getDueCards } from '../utils/srs.js'
import { LESSONS } from '../data/lessons.js'

const GREETINGS = ['Mwaiseni', 'Muli shani?', 'Icalo!', 'Pangeni!']

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Home() {
  const navigate = useNavigate()
  const profile = getProfile()
  const progress = getProgress()
  const deck = getDeck()
  const dueCards = getDueCards(deck)
  const level = getLevel(progress.xp || 0)
  const levelProgress = getProgressToNextLevel(progress.xp || 0)
  const completedLessons = progress.lessonsCompleted || []
  const totalWords = LESSONS.reduce((sum, l) => sum + l.vocabulary.length, 0)
  const learnedWords = Object.keys(deck).length

  const bembaGreeting = GREETINGS[new Date().getDay() % GREETINGS.length]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header greeting */}
      <div className="bg-forest-600 text-cream rounded-2xl px-6 py-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 11px)`,
          }}
        />
        <p className="text-forest-200 text-sm font-medium mb-1 relative">{getGreeting()}</p>
        <h1 className="font-serif text-2xl font-bold relative">{profile.name}</h1>
        <p className="text-forest-200 text-sm mt-1 italic relative">{bembaGreeting}</p>

        {/* Stats row */}
        <div className="flex gap-4 mt-5 relative">
          <div className="text-center">
            <div className="text-2xl font-bold text-gold-400">{progress.streak || 0}</div>
            <div className="text-xs text-forest-300">day streak</div>
          </div>
          <div className="w-px bg-forest-500" />
          <div className="text-center">
            <div className="text-2xl font-bold text-gold-400">{progress.xp || 0}</div>
            <div className="text-xs text-forest-300">XP total</div>
          </div>
          <div className="w-px bg-forest-500" />
          <div className="text-center">
            <div className="text-2xl font-bold text-gold-400">{dueCards.length}</div>
            <div className="text-xs text-forest-300">cards due</div>
          </div>
        </div>
      </div>

      {/* Level badge */}
      <div className="bg-white/70 border border-gold-500/30 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs text-gold-600 font-semibold uppercase tracking-wider">Current Level</span>
            <h2 className="font-serif text-xl text-ink mt-0.5">{level.name}</h2>
            <p className="text-xs text-ink/50">{level.subtitle}</p>
          </div>
          <div className="text-4xl">🏅</div>
        </div>
        <div className="bg-cream rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full transition-all duration-500"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
        <p className="text-xs text-ink/40 mt-1.5">{levelProgress}% to next level</p>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-serif text-lg text-ink mb-3">Study now</h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction
            icon="📚"
            title="Start Lesson"
            subtitle={`${completedLessons.length}/${LESSONS.length} done`}
            color="bg-terracotta-500"
            onClick={() => navigate('/lessons')}
          />
          <QuickAction
            icon="🃏"
            title="Flashcards"
            subtitle={`${dueCards.length} due today`}
            color="bg-forest-600"
            onClick={() => navigate('/practice')}
            badge={dueCards.length > 0 ? dueCards.length : null}
          />
          <QuickAction
            icon="🧠"
            title="Take a Quiz"
            subtitle="Test your knowledge"
            color="bg-gold-500"
            textColor="text-ink"
            onClick={() => navigate('/quiz')}
          />
          <QuickAction
            icon="🫶"
            title="Couples Mode"
            subtitle="Study together"
            color="bg-terracotta-200"
            textColor="text-terracotta-800"
            onClick={() => navigate('/couples')}
          />
        </div>
      </div>

      {/* Vocabulary progress */}
      <div className="bg-white/70 border border-terracotta-100 rounded-2xl p-5">
        <div className="flex justify-between items-baseline mb-3">
          <h2 className="font-serif text-lg text-ink">Vocabulary</h2>
          <span className="text-sm text-ink/50">{learnedWords} / {totalWords} words</span>
        </div>
        <div className="bg-cream rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-terracotta-400 rounded-full transition-all duration-500"
            style={{ width: totalWords > 0 ? `${Math.round((learnedWords / totalWords) * 100)}%` : '0%' }}
          />
        </div>
        <p className="text-xs text-ink/40 mt-1.5">
          {totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0}% of all vocabulary in your deck
        </p>
      </div>

      {/* Lesson map */}
      <div>
        <h2 className="font-serif text-lg text-ink mb-3">Lessons</h2>
        <div className="space-y-2">
          {LESSONS.map((lesson, idx) => {
            const isComplete = completedLessons.includes(lesson.id)
            const isLocked = idx > 0 && !completedLessons.includes(LESSONS[idx - 1].id)
            return (
              <button
                key={lesson.id}
                onClick={() => !isLocked && navigate(`/lessons/${lesson.id}`)}
                disabled={isLocked}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all text-left ${
                  isLocked
                    ? 'border-ink/10 bg-cream/50 opacity-40 cursor-not-allowed'
                    : isComplete
                    ? 'border-forest-200 bg-forest-50 hover:bg-forest-100'
                    : 'border-terracotta-200 bg-white/80 hover:bg-terracotta-50'
                }`}
              >
                <span className="text-2xl">{isLocked ? '🔒' : lesson.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isLocked ? 'text-ink/40' : 'text-ink'}`}>
                    {lesson.title}
                  </p>
                  <p className="text-xs text-ink/40">{lesson.vocabulary.length} words</p>
                </div>
                {isComplete && <span className="text-forest-500 text-sm font-semibold">✓</span>}
                {!isComplete && !isLocked && (
                  <span className="text-terracotta-400 text-sm">→</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function QuickAction({ icon, title, subtitle, color, textColor = 'text-cream', onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`${color} ${textColor} relative rounded-2xl p-4 text-left transition-transform active:scale-95 shadow-sm`}
    >
      {badge != null && badge > 0 && (
        <span className="absolute top-2 right-2 bg-cream text-terracotta-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </span>
      )}
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-semibold text-sm leading-tight">{title}</div>
      <div className="text-xs opacity-75 mt-0.5">{subtitle}</div>
    </button>
  )
}
