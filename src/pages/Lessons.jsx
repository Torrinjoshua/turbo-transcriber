import { useNavigate } from 'react-router-dom'
import { getProgress } from '../utils/storage.js'
import { LESSONS } from '../data/lessons.js'

export default function Lessons() {
  const navigate = useNavigate()
  const progress = getProgress()
  const completedLessons = progress.lessonsCompleted || []

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl text-ink">Lessons</h1>
        <p className="text-ink/60 text-sm mt-1">
          {completedLessons.length} of {LESSONS.length} topics completed
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-cream rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full bg-terracotta-400 rounded-full transition-all"
          style={{ width: `${Math.round((completedLessons.length / LESSONS.length) * 100)}%` }}
        />
      </div>

      <div className="space-y-3">
        {LESSONS.map((lesson, idx) => {
          const isComplete = completedLessons.includes(lesson.id)
          const isLocked = idx > 0 && !completedLessons.includes(LESSONS[idx - 1].id)

          return (
            <button
              key={lesson.id}
              onClick={() => !isLocked && navigate(`/lessons/${lesson.id}`)}
              disabled={isLocked}
              className={`w-full text-left rounded-2xl border p-5 transition-all group ${
                isLocked
                  ? 'border-ink/10 bg-cream/50 opacity-50 cursor-not-allowed'
                  : isComplete
                  ? 'border-forest-200 bg-forest-50 hover:shadow-md'
                  : 'border-terracotta-200 bg-white/80 hover:shadow-md hover:border-terracotta-400'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                    isLocked
                      ? 'bg-ink/10'
                      : isComplete
                      ? 'bg-forest-100'
                      : 'bg-terracotta-100'
                  }`}
                >
                  {isLocked ? '🔒' : lesson.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-ink text-base">{lesson.title}</h3>
                    {isComplete && (
                      <span className="text-xs font-semibold text-forest-600 bg-forest-100 px-2.5 py-1 rounded-full flex-shrink-0">
                        ✓ Done
                      </span>
                    )}
                    {!isComplete && !isLocked && (
                      <span className="text-xs font-semibold text-terracotta-600 bg-terracotta-50 px-2.5 py-1 rounded-full flex-shrink-0">
                        +{lesson.xpReward} XP
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink/50 mt-0.5">
                    {lesson.vocabulary.length} vocabulary words
                  </p>
                  <p className="text-xs text-ink/60 mt-2 leading-relaxed line-clamp-2">
                    {lesson.culturalNote}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
