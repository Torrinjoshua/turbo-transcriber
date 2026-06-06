import { useState, useMemo } from 'react'
import { getDeck, saveDeck, addXP, logActivity } from '../utils/storage.js'
import { getDueCards, rateCard, getNextReviewTime, RATINGS } from '../utils/srs.js'
import { getAllVocabulary } from '../data/lessons.js'
import { XP_REWARDS } from '../utils/xp.js'

const RATING_CONFIG = [
  { key: RATINGS.AGAIN, label: 'Again', emoji: '🔁', color: 'border-terracotta-400 text-terracotta-600 hover:bg-terracotta-50' },
  { key: RATINGS.HARD, label: 'Hard', emoji: '😓', color: 'border-orange-400 text-orange-600 hover:bg-orange-50' },
  { key: RATINGS.GOOD, label: 'Good', emoji: '👍', color: 'border-forest-400 text-forest-600 hover:bg-forest-50' },
  { key: RATINGS.EASY, label: 'Easy', emoji: '⚡', color: 'border-gold-500 text-gold-600 hover:bg-gold-50' },
]

export default function Practice() {
  const allVocab = useMemo(() => getAllVocabulary(), [])
  const vocabMap = useMemo(() => Object.fromEntries(allVocab.map((v) => [v.id, v])), [allVocab])

  const [deck, setDeck] = useState(() => getDeck())
  const [sessionCards, setSessionCards] = useState(() => {
    const due = getDueCards(getDeck())
    return shuffle([...due])
  })
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [showBemba, setShowBemba] = useState(true)
  const [sessionDone, setSessionDone] = useState(0)
  const [sessionCorrect, setSessionCorrect] = useState(0)

  const totalDue = sessionCards.length
  const currentCard = sessionCards[currentIdx]
  const vocab = currentCard ? vocabMap[currentCard.vocabularyId] : null

  function handleRate(rating) {
    const updated = rateCard(currentCard, rating)
    const newDeck = { ...deck, [updated.vocabularyId]: updated }
    setDeck(newDeck)
    saveDeck(newDeck)
    logActivity()

    if (rating === RATINGS.GOOD || rating === RATINGS.EASY) {
      addXP(XP_REWARDS.FLASHCARD_GOOD)
      setSessionCorrect((c) => c + 1)
    }

    setSessionDone((d) => d + 1)
    setFlipped(false)

    if (currentIdx + 1 >= sessionCards.length) {
      setCurrentIdx(sessionCards.length) // signals session end
    } else {
      setCurrentIdx((i) => i + 1)
      setShowBemba((prev) => (Math.random() > 0.5 ? !prev : prev))
    }
  }

  // Empty state
  if (totalDue === 0) {
    const nextReview = getNextReviewTime(deck)
    const deckSize = Object.keys(deck).length
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="font-serif text-3xl text-ink">Flashcards</h1>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="font-serif text-2xl text-ink mb-2">You're all caught up!</h2>
          {deckSize === 0 ? (
            <p className="text-ink/60 text-sm">Complete a lesson to add cards to your deck.</p>
          ) : (
            <>
              <p className="text-ink/60 text-sm mb-2">No cards due right now.</p>
              {nextReview && (
                <p className="text-terracotta-500 text-sm font-medium">
                  Next review: {nextReview.toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  // Session complete
  if (currentIdx >= totalDue) {
    const pct = Math.round((sessionCorrect / totalDue) * 100)
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="font-serif text-3xl text-ink">Flashcards</h1>
        <div className="text-center py-8 space-y-5">
          <div className="text-6xl">{pct >= 80 ? '🌟' : pct >= 50 ? '💪' : '🔄'}</div>
          <h2 className="font-serif text-2xl text-ink">Session complete</h2>
          <div className="bg-white/80 border border-terracotta-100 rounded-2xl p-6 inline-block">
            <div className="text-5xl font-bold text-terracotta-500">{pct}%</div>
            <p className="text-ink/60 text-sm mt-1">
              {sessionCorrect} of {totalDue} cards rated Good or Easy
            </p>
          </div>
          <div className="bg-gold-400/20 border border-gold-500/40 rounded-xl px-5 py-3 inline-block">
            <p className="text-gold-600 font-bold">+{sessionCorrect * XP_REWARDS.FLASHCARD_GOOD} XP earned</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="block w-full max-w-xs mx-auto bg-terracotta-500 hover:bg-terracotta-600 text-cream font-semibold py-3 rounded-xl transition-colors"
          >
            Practice again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-ink">Flashcards</h1>
        <span className="text-xs text-ink/50 tabular-nums">
          {currentIdx + 1} / {totalDue}
        </span>
      </div>

      {/* Progress */}
      <div className="bg-cream rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-terracotta-400 rounded-full transition-all"
          style={{ width: `${((currentIdx) / totalDue) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="card-flip cursor-pointer" onClick={() => setFlipped((f) => !f)}>
        <div className={`card-flip-inner min-h-72 relative ${flipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div className="card-face absolute inset-0 bg-white border border-terracotta-100 rounded-2xl shadow-sm flex flex-col items-center justify-center p-8 text-center">
            <p className="text-xs text-ink/40 uppercase tracking-widest mb-6">
              {showBemba ? 'Icibemba' : 'English'}
            </p>
            {showBemba ? (
              <>
                <p className="font-serif text-4xl text-ink font-bold mb-3">{vocab?.bemba}</p>
                <p className="text-terracotta-500 text-base italic">{vocab?.phonetic}</p>
              </>
            ) : (
              <p className="font-serif text-3xl text-ink font-bold">{vocab?.english}</p>
            )}
            <p className="text-xs text-ink/30 mt-8">Tap to flip</p>
          </div>

          {/* Back */}
          <div className="card-face card-back absolute inset-0 bg-forest-600 rounded-2xl shadow-sm flex flex-col items-center justify-center p-8 text-center">
            <p className="text-xs text-forest-300 uppercase tracking-widest mb-6">
              {showBemba ? 'English' : 'Icibemba'}
            </p>
            {showBemba ? (
              <p className="font-serif text-3xl text-cream font-bold mb-5">{vocab?.english}</p>
            ) : (
              <>
                <p className="font-serif text-3xl text-cream font-bold mb-2">{vocab?.bemba}</p>
                <p className="text-forest-300 text-base italic mb-5">{vocab?.phonetic}</p>
              </>
            )}
            {vocab?.exampleBemba && (
              <div className="bg-forest-700/60 rounded-xl px-5 py-3 max-w-sm">
                <p className="text-cream/90 text-sm italic mb-1">{vocab.exampleBemba}</p>
                <p className="text-forest-300 text-xs">{vocab.exampleEnglish}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating buttons (only when flipped) */}
      <div
        className={`transition-all duration-300 ${
          flipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <p className="text-center text-xs text-ink/40 mb-3">How well did you know this?</p>
        <div className="grid grid-cols-4 gap-2">
          {RATING_CONFIG.map((r) => (
            <button
              key={r.key}
              onClick={(e) => { e.stopPropagation(); handleRate(r.key) }}
              className={`border-2 rounded-xl py-3 px-2 font-semibold text-xs flex flex-col items-center gap-1 transition-all ${r.color}`}
            >
              <span className="text-lg">{r.emoji}</span>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Session stats */}
      <div className="flex justify-center gap-6 text-center pt-2">
        <div>
          <div className="text-lg font-bold text-forest-600">{sessionDone}</div>
          <div className="text-xs text-ink/40">reviewed</div>
        </div>
        <div>
          <div className="text-lg font-bold text-terracotta-500">{totalDue - currentIdx}</div>
          <div className="text-xs text-ink/40">remaining</div>
        </div>
      </div>
    </div>
  )
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
