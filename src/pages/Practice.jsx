import { useState, useMemo } from 'react'
import { getDeck, saveDeck, addXP, logActivity } from '../utils/storage.js'
import { getDueCards, rateCard, getNextReviewTime, RATINGS } from '../utils/srs.js'
import { getAllVocabulary } from '../data/lessons.js'
import { XP_REWARDS } from '../utils/xp.js'

const CORRECT_MSG = ['Amazing! 🌟', 'You got it! 💪', 'Mwabombeni! 🎉', 'Superstar! ⭐', 'Brilliant! ✨']
const rand = arr => arr[Math.floor(Math.random() * arr.length)]

export default function Practice() {
  const allVocab  = useMemo(() => getAllVocabulary(), [])
  const vocabMap  = useMemo(() => Object.fromEntries(allVocab.map(v => [v.id, v])), [allVocab])

  const [deck, setDeck]         = useState(() => getDeck())
  const [queue]                 = useState(() => shuffle([...getDueCards(getDeck())]))
  const [idx, setIdx]           = useState(0)
  const [flipped, setFlipped]   = useState(false)
  const [sessionGood, setGood]  = useState(0)
  const [done, setDone]         = useState(false)

  const totalDue = queue.length
  const card     = queue[idx]
  const vocab    = card ? vocabMap[card.vocabularyId] : null

  function rate(rating) {
    const updated = rateCard(card, rating)
    const newDeck = { ...deck, [updated.vocabularyId]: updated }
    setDeck(newDeck)
    saveDeck(newDeck)
    logActivity()

    if (rating === RATINGS.GOOD || rating === RATINGS.EASY) {
      addXP(XP_REWARDS.FLASHCARD_GOOD)
      setGood(g => g + 1)
    }

    setFlipped(false)
    if (idx + 1 >= totalDue) setDone(true)
    else setIdx(i => i + 1)
  }

  /* Empty */
  if (totalDue === 0) {
    const next = getNextReviewTime(deck)
    const deckSize = Object.keys(deck).length
    return (
      <div className="min-h-dvh bg-cream flex flex-col">
        <div className="bg-white px-5 pt-12 pb-5 shadow-sm">
          <h1 className="font-serif text-2xl font-bold text-ink">Flashcards 🃏</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-5 pb-24">
          <div className="text-7xl animate-float">🎉</div>
          <h2 className="font-serif text-2xl font-bold text-ink">All caught up!</h2>
          {deckSize === 0
            ? <p className="text-ink/60">Finish a lesson first to get cards to practice!</p>
            : <>
                <p className="text-ink/60">No cards ready right now.</p>
                {next && (
                  <div className="bg-terracotta-50 border-2 border-terracotta-200 rounded-2xl px-5 py-3">
                    <p className="text-terracotta-700 font-bold text-sm">
                      ⏰ Come back {next.toLocaleDateString('en-GB', { weekday: 'long' })}!
                    </p>
                  </div>
                )}
              </>
          }
        </div>
      </div>
    )
  }

  /* Done */
  if (done) {
    const pct = Math.round((sessionGood / totalDue) * 100)
    return (
      <div className="min-h-dvh bg-cream flex flex-col items-center justify-center px-6 text-center space-y-6 pb-24">
        <div className="text-7xl">{pct >= 70 ? '🌟' : '💪'}</div>
        <h2 className="font-serif text-3xl font-bold text-ink">Practice done!</h2>
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-6 shadow-sm">
          <div className="text-5xl font-bold text-terracotta-500">{pct}%</div>
          <p className="text-ink/50 mt-1">{sessionGood} of {totalDue} remembered</p>
        </div>
        <div className="bg-gold-400/20 border-2 border-gold-400 rounded-2xl px-6 py-3">
          <p className="text-gold-600 font-bold">+{sessionGood * XP_REWARDS.FLASHCARD_GOOD} XP 🎊</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-terracotta-500 active:bg-terracotta-600 text-white font-bold py-4 rounded-3xl text-lg shadow-md transition-all active:scale-95"
        >
          Practice again!
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-cream flex flex-col">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-serif text-2xl font-bold text-ink">Flashcards 🃏</h1>
          <span className="text-sm font-bold text-ink/40">{idx + 1}/{totalDue}</span>
        </div>
        <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-terracotta-400 rounded-full transition-all"
            style={{ width: `${(idx / totalDue) * 100}%` }}
          />
        </div>
      </div>

      {/* Card flip */}
      <div className="flex-1 flex flex-col px-5 py-6 pb-28">
        <div
          className="card-flip flex-1 cursor-pointer select-none"
          onClick={() => setFlipped(f => !f)}
        >
          <div className={`card-flip-inner h-full relative ${flipped ? 'flipped' : ''}`} style={{ minHeight: 280 }}>
            {/* Front */}
            <div className="card-face absolute inset-0 bg-white border-2 border-gray-100 rounded-3xl shadow-md flex flex-col items-center justify-center p-8 text-center">
              <p className="text-xs text-ink/30 uppercase tracking-widest mb-6 font-bold">Icibemba</p>
              <p className="font-serif text-5xl font-bold text-ink mb-3">{vocab?.bemba}</p>
              <p className="text-terracotta-500 text-lg italic">{vocab?.phonetic}</p>
              <p className="text-xs text-ink/20 mt-8 font-semibold">TAP TO FLIP</p>
            </div>
            {/* Back */}
            <div className="card-face card-back absolute inset-0 bg-forest-600 rounded-3xl shadow-md flex flex-col items-center justify-center p-8 text-center">
              <p className="text-xs text-forest-300 uppercase tracking-widest mb-5 font-bold">English</p>
              <p className="font-serif text-4xl font-bold text-white mb-4">{vocab?.english}</p>
              {vocab?.exampleBemba && (
                <div className="bg-forest-700/60 rounded-2xl px-4 py-3 max-w-xs">
                  <p className="text-white/80 text-sm italic mb-1">{vocab.exampleBemba}</p>
                  <p className="text-forest-300 text-xs">{vocab.exampleEnglish}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rating buttons — only when flipped */}
        <div className={`mt-5 transition-all duration-300 ${flipped ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-4'}`}>
          <p className="text-center text-xs font-bold text-ink/30 uppercase tracking-wider mb-3">Did you remember it?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={e => { e.stopPropagation(); rate(RATINGS.AGAIN) }}
              className="bg-[#fde8e0] border-2 border-red-200 text-red-600 font-bold py-4 rounded-2xl text-base flex flex-col items-center gap-1 active:scale-95 transition-all shadow-sm"
            >
              <span className="text-2xl">🤔</span>
              Not yet
            </button>
            <button
              onClick={e => { e.stopPropagation(); rate(RATINGS.GOOD) }}
              className="bg-[#d7f5e3] border-2 border-green-300 text-green-700 font-bold py-4 rounded-2xl text-base flex flex-col items-center gap-1 active:scale-95 transition-all shadow-sm"
            >
              <span className="text-2xl">💪</span>
              I knew it!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
