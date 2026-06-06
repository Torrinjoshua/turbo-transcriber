import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLessonById } from '../data/lessons.js'
import { addCardsToDeck, markLessonComplete, addXP, getProgress } from '../utils/storage.js'
import { XP_REWARDS } from '../utils/xp.js'

export default function LessonDetail() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const lesson = getLessonById(lessonId)
  const progress = getProgress()
  const alreadyComplete = (progress.lessonsCompleted || []).includes(lessonId)

  const [phase, setPhase] = useState('intro') // intro | cards | done
  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  if (!lesson) {
    return (
      <div className="text-center py-20">
        <p className="text-ink/50">Lesson not found.</p>
        <button onClick={() => navigate('/lessons')} className="mt-4 text-terracotta-500 underline text-sm">
          Back to lessons
        </button>
      </div>
    )
  }

  function handleComplete() {
    if (!alreadyComplete) {
      addCardsToDeck(lesson.vocabulary.map((v) => v.id))
      markLessonComplete(lesson.id)
      addXP(XP_REWARDS.LESSON_COMPLETE)
    }
    setPhase('done')
  }

  if (phase === 'intro') {
    return (
      <div className="space-y-6 animate-fade-in">
        <button
          onClick={() => navigate('/lessons')}
          className="flex items-center gap-1 text-sm text-ink/50 hover:text-ink transition-colors"
        >
          ← Back
        </button>

        <div className="text-center">
          <div className="text-6xl mb-4">{lesson.icon}</div>
          <h1 className="font-serif text-3xl text-ink mb-1">{lesson.title}</h1>
          <p className="text-ink/50 text-sm">{lesson.vocabulary.length} words · +{lesson.xpReward} XP</p>
        </div>

        <div className="bg-forest-50 border border-forest-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🌍</span>
            <h2 className="font-semibold text-forest-700 text-sm">Cultural Context</h2>
          </div>
          <p className="text-ink/80 text-sm leading-relaxed">{lesson.culturalNote}</p>
        </div>

        {alreadyComplete && (
          <div className="bg-forest-50 border border-forest-300 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-xl">✓</span>
            <p className="text-forest-700 text-sm font-medium">You've completed this lesson. Review it anytime.</p>
          </div>
        )}

        <button
          onClick={() => setPhase('cards')}
          className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-cream font-semibold py-4 rounded-xl transition-colors text-base"
        >
          {alreadyComplete ? 'Review Lesson' : 'Start Lesson'}
        </button>
      </div>
    )
  }

  if (phase === 'cards') {
    const card = lesson.vocabulary[cardIndex]
    const isLast = cardIndex === lesson.vocabulary.length - 1

    return (
      <div className="space-y-4 animate-fade-in">
        {/* Progress header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPhase('intro')}
            className="text-sm text-ink/50 hover:text-ink"
          >
            ←
          </button>
          <div className="flex-1 bg-cream rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-terracotta-400 rounded-full transition-all"
              style={{ width: `${((cardIndex + 1) / lesson.vocabulary.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-ink/50 tabular-nums">
            {cardIndex + 1}/{lesson.vocabulary.length}
          </span>
        </div>

        {/* Flash card */}
        <div
          className="card-flip cursor-pointer select-none"
          onClick={() => setFlipped((f) => !f)}
        >
          <div className={`card-flip-inner min-h-72 relative ${flipped ? 'flipped' : ''}`}>
            {/* Front */}
            <div className="card-face absolute inset-0 bg-white border border-terracotta-100 rounded-2xl shadow-sm flex flex-col items-center justify-center p-8 text-center">
              <p className="text-xs text-ink/40 uppercase tracking-widest mb-6">Icibemba</p>
              <p className="font-serif text-4xl text-ink font-bold mb-3">{card.bemba}</p>
              <p className="text-terracotta-500 text-base italic">{card.phonetic}</p>
              <p className="text-xs text-ink/30 mt-8">Tap to reveal</p>
            </div>

            {/* Back */}
            <div className="card-face card-back absolute inset-0 bg-forest-600 rounded-2xl shadow-sm flex flex-col items-center justify-center p-8 text-center">
              <p className="text-xs text-forest-300 uppercase tracking-widest mb-6">English</p>
              <p className="font-serif text-3xl text-cream font-bold mb-5">{card.english}</p>
              {card.exampleBemba && (
                <div className="bg-forest-700/60 rounded-xl px-5 py-3 mt-2 max-w-sm">
                  <p className="text-cream/90 text-sm italic mb-1">{card.exampleBemba}</p>
                  <p className="text-forest-300 text-xs">{card.exampleEnglish}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {cardIndex > 0 && (
            <button
              onClick={() => { setCardIndex((i) => i - 1); setFlipped(false) }}
              className="flex-1 border border-ink/20 text-ink/70 font-medium py-3 rounded-xl hover:bg-ink/5 transition-colors"
            >
              ← Previous
            </button>
          )}
          {!isLast ? (
            <button
              onClick={() => { setCardIndex((i) => i + 1); setFlipped(false) }}
              className="flex-1 bg-terracotta-500 hover:bg-terracotta-600 text-cream font-semibold py-3 rounded-xl transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex-1 bg-forest-600 hover:bg-forest-700 text-cream font-semibold py-3 rounded-xl transition-colors"
            >
              Complete Lesson ✓
            </button>
          )}
        </div>

        {/* Word list mini map */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {lesson.vocabulary.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCardIndex(i); setFlipped(false) }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === cardIndex ? 'bg-terracotta-500 scale-125' : i < cardIndex ? 'bg-forest-400' : 'bg-ink/15'
              }`}
            />
          ))}
        </div>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="text-center space-y-6 animate-fade-in py-8">
        <div className="text-6xl">🎉</div>
        <div>
          <h2 className="font-serif text-3xl text-ink mb-2">Mwabombeni!</h2>
          <p className="text-ink/60">Well done — lesson complete.</p>
        </div>
        {!alreadyComplete && (
          <div className="bg-gold-400/20 border border-gold-500/40 rounded-2xl p-5 inline-block">
            <p className="text-gold-600 font-bold text-lg">+{lesson.xpReward} XP</p>
            <p className="text-ink/60 text-xs mt-0.5">{lesson.vocabulary.length} words added to your deck</p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/practice')}
            className="w-full bg-forest-600 hover:bg-forest-700 text-cream font-semibold py-3 rounded-xl transition-colors"
          >
            🃏 Practice Flashcards
          </button>
          <button
            onClick={() => navigate('/lessons')}
            className="w-full border border-ink/20 text-ink font-medium py-3 rounded-xl hover:bg-ink/5 transition-colors"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    )
  }
}
