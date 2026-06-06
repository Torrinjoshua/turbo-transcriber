import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLessonById, getAllVocabulary } from '../data/lessons.js'
import {
  addCardsToDeck, markLessonComplete, addXP, logActivity, saveLessonStars
} from '../utils/storage.js'
import { XP_REWARDS } from '../utils/xp.js'

const ENCOURAGE_CORRECT = ['Mwabombeni! 🎉', 'Amazing! ⭐', 'You got it! 💪', 'Superstar! 🌟', 'Perfect! ✨']
const ENCOURAGE_WRONG   = ['Almost there! 💙', 'Keep going! 🤗', 'You can do it! 💫', "Don't give up! 🌱"]

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)] }

/* ─── Exercise builder ──────────────────────────────────────────────── */
function buildExercises(vocab, allVocab) {
  const s = shuffle([...vocab])
  const pool = allVocab.length >= 8 ? allVocab : vocab

  const intro1 = s.slice(0, 4)
  const quiz1  = shuffle([...intro1])
  const intro2 = s.slice(4, 8)
  const quiz2  = shuffle([...intro2])
  const matchW = shuffle([...s]).slice(0, 4)
  const review = shuffle([...s]).slice(0, 2)

  const exs = []

  intro1.forEach(v => exs.push({ type: 'intro', vocab: v }))
  quiz1.forEach(v  => exs.push({ type: 'mc', vocab: v, dir: 'b2e',
    correct: v.english, options: shuffle([v.english, ...distract(v, pool, 'english')]) }))

  if (intro2.length) {
    intro2.forEach(v => exs.push({ type: 'intro', vocab: v }))
    quiz2.forEach(v  => exs.push({ type: 'mc', vocab: v, dir: 'b2e',
      correct: v.english, options: shuffle([v.english, ...distract(v, pool, 'english')]) }))
  }

  exs.push({ type: 'match', words: matchW })

  review.forEach(v => exs.push({ type: 'mc', vocab: v, dir: 'e2b',
    correct: v.bemba, options: shuffle([v.bemba, ...distract(v, pool, 'bemba')]) }))

  return exs
}

function distract(vocab, pool, field) {
  return shuffle(pool.filter(v => v.id !== vocab.id)).slice(0, 3).map(v => v[field])
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/* ─── Main component ────────────────────────────────────────────────── */
export default function LessonDetail() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const lesson = getLessonById(lessonId)
  const allVocab = useMemo(() => getAllVocabulary(), [])

  const [phase, setPhase] = useState('start') // start | running | complete
  const [exercises] = useState(() => lesson ? buildExercises(lesson.vocabulary, allVocab) : [])
  const [exIdx, setExIdx] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [answered, setAnswered] = useState(null) // { isCorrect, selected }
  const [correct, setCorrect] = useState(0)
  const [matchState, setMatchState] = useState({ sel: null, matched: new Set(), wrong: null })
  const [completeMsg] = useState(() => rand(ENCOURAGE_CORRECT))

  if (!lesson) return (
    <div className="p-8 text-center">
      <p className="text-ink/50">Lesson not found.</p>
      <button onClick={() => navigate('/')} className="mt-4 text-terracotta-500 underline">← Home</button>
    </div>
  )

  const ex = exercises[exIdx]
  const total = exercises.length
  const stars = hearts === 3 ? 3 : hearts >= 1 ? 2 : 1

  /* ── answer MC ── */
  function answerMC(option) {
    if (answered) return
    const ok = option === ex.correct
    if (!ok) setHearts(h => Math.max(0, h - 1))
    setAnswered({ isCorrect: ok, selected: option })
    if (ok) setCorrect(c => c + 1)
  }

  /* ── continue after feedback ── */
  function next() {
    setAnswered(null)
    if (exIdx + 1 >= total) finish()
    else setExIdx(i => i + 1)
  }

  /* ── advance intro card ── */
  function advanceIntro() {
    if (exIdx + 1 >= total) finish()
    else setExIdx(i => i + 1)
  }

  /* ── match tap ── */
  function tapMatch(side, id) {
    if (matchState.matched.has(id)) return
    const sel = matchState.sel

    if (!sel) { setMatchState(s => ({ ...s, sel: { side, id } })); return }
    if (sel.side === side) { setMatchState(s => ({ ...s, sel: { side, id } })); return }

    if (sel.id === id) {
      // Correct pair
      const newMatched = new Set([...matchState.matched, id])
      setMatchState({ sel: null, matched: newMatched, wrong: null })
      if (newMatched.size === ex.words.length) {
        setTimeout(() => {
          if (exIdx + 1 >= total) finish()
          else setExIdx(i => i + 1)
          setMatchState({ sel: null, matched: new Set(), wrong: null })
        }, 600)
      }
    } else {
      // Wrong pair
      setMatchState(s => ({ ...s, wrong: { a: sel.id, b: id }, sel: null }))
      setHearts(h => Math.max(0, h - 1))
      setTimeout(() => setMatchState(s => ({ ...s, wrong: null })), 700)
    }
  }

  /* ── finish lesson ── */
  function finish() {
    addCardsToDeck(lesson.vocabulary.map(v => v.id))
    markLessonComplete(lesson.id)
    addXP(XP_REWARDS.LESSON_COMPLETE)
    saveLessonStars(lesson.id, stars)
    logActivity()
    setPhase('complete')
  }

  /* ═══════════════════════════════════════════════
     PHASE: START
  ═══════════════════════════════════════════════ */
  if (phase === 'start') {
    return (
      <div className="min-h-dvh bg-cream flex flex-col">
        {/* Back */}
        <div className="px-5 pt-12 pb-3">
          <button onClick={() => navigate('/')} className="text-ink/40 text-2xl leading-none">←</button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-5">
          <div className="text-8xl animate-float">{lesson.icon}</div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-ink">{lesson.title}</h1>
            <p className="text-ink/50 mt-1">{lesson.vocabulary.length} words · +{lesson.xpReward} XP</p>
          </div>

          <div className="bg-forest-50 border-2 border-forest-200 rounded-3xl p-5 text-left max-w-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🌍</span>
              <span className="font-bold text-forest-700 text-sm">Did you know?</span>
            </div>
            <p className="text-forest-800 text-sm leading-relaxed">{lesson.culturalNote}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-ink/50">
            <span>❤️ ❤️ ❤️</span>
            <span>3 hearts to start</span>
          </div>
        </div>

        <div className="px-6 pb-8">
          <button
            onClick={() => setPhase('running')}
            className="w-full bg-terracotta-500 active:bg-terracotta-600 text-white font-bold py-5 rounded-3xl text-xl shadow-lg transition-all active:scale-95"
          >
            Start! 🚀
          </button>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════
     PHASE: COMPLETE
  ═══════════════════════════════════════════════ */
  if (phase === 'complete') {
    return (
      <div className="min-h-dvh bg-cream flex flex-col items-center justify-center px-6 text-center space-y-6">
        <div className="text-7xl animate-bounce-in">🎊</div>
        <h1 className="font-serif text-4xl font-bold text-ink">Lesson Done!</h1>
        <p className="text-terracotta-500 font-bold text-xl italic">{completeMsg}</p>

        {/* Stars */}
        <div className="flex gap-3 animate-pop">
          {[1, 2, 3].map(s => (
            <span
              key={s}
              className={`text-5xl transition-all ${s <= stars ? 'animate-star' : 'opacity-25'}`}
              style={{ animationDelay: `${(s - 1) * 0.15}s` }}
            >
              ⭐
            </span>
          ))}
        </div>

        {/* XP badge */}
        <div className="bg-gold-400/20 border-2 border-gold-400 rounded-2xl px-8 py-4 animate-pop">
          <p className="text-3xl font-bold text-gold-600">+{lesson.xpReward} XP</p>
          <p className="text-ink/50 text-sm mt-0.5">{lesson.vocabulary.length} new words added!</p>
        </div>

        {/* Hearts remaining */}
        <p className="text-base">
          {Array.from({ length: 3 }, (_, i) => (
            <span key={i}>{i < hearts ? '❤️' : '🖤'}</span>
          ))}
        </p>

        <div className="w-full space-y-3 pt-2">
          <button
            onClick={() => navigate('/practice')}
            className="w-full bg-forest-600 active:bg-forest-700 text-white font-bold py-4 rounded-3xl text-lg shadow-md transition-all active:scale-95"
          >
            🃏 Practice cards
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-white border-2 border-gray-200 text-ink font-bold py-4 rounded-3xl text-lg transition-all active:scale-95"
          >
            🏠 Back to path
          </button>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════
     PHASE: RUNNING
  ═══════════════════════════════════════════════ */
  return (
    <div className="min-h-dvh bg-cream flex flex-col">
      {/* ─ Top bar ─ */}
      <div className="px-5 pt-12 pb-4 bg-white shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 text-2xl leading-none flex-shrink-0"
          >
            ✕
          </button>

          {/* Progress bar */}
          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-terracotta-400 rounded-full transition-all duration-500"
              style={{ width: `${(exIdx / total) * 100}%` }}
            />
          </div>

          {/* Hearts */}
          <div className="flex gap-0.5 flex-shrink-0">
            {Array.from({ length: 3 }, (_, i) => (
              <span key={i} className="text-lg">{i < hearts ? '❤️' : '🖤'}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ─ Exercise area ─ */}
      <div className="flex-1 flex flex-col px-5 py-5 overflow-y-auto">
        {ex?.type === 'intro' && <IntroCard vocab={ex.vocab} onNext={advanceIntro} />}
        {ex?.type === 'mc'    && (
          <MCExercise
            exercise={ex}
            answered={answered}
            onAnswer={answerMC}
          />
        )}
        {ex?.type === 'match' && (
          <MatchExercise
            words={ex.words}
            matchState={matchState}
            onTap={tapMatch}
          />
        )}
      </div>

      {/* ─ Feedback panel (slides up after MC answer) ─ */}
      {answered && (
        <div
          className={`animate-slide-up-fast px-5 py-5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex-shrink-0 ${
            answered.isCorrect ? 'bg-[#d7f5e3]' : 'bg-[#fde8e0]'
          }`}
        >
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">{answered.isCorrect ? '✅' : '❌'}</span>
            <div>
              <p className={`font-bold text-lg ${answered.isCorrect ? 'text-green-700' : 'text-red-600'}`}>
                {answered.isCorrect ? rand(ENCOURAGE_CORRECT) : rand(ENCOURAGE_WRONG)}
              </p>
              {!answered.isCorrect && (
                <p className="text-sm text-red-700 mt-0.5">
                  Correct answer: <strong>{ex.correct}</strong>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={next}
            className={`w-full font-bold py-4 rounded-3xl text-lg shadow-md transition-all active:scale-95 text-white ${
              answered.isCorrect
                ? 'bg-green-500 active:bg-green-600'
                : 'bg-terracotta-500 active:bg-terracotta-600'
            }`}
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Intro card: just shows the word, no question
───────────────────────────────────────────── */
function IntroCard({ vocab, onNext }) {
  return (
    <div className="flex-1 flex flex-col">
      <p className="text-ink/50 font-bold text-sm uppercase tracking-widest mb-5">New word! ✨</p>

      <div className="bg-forest-600 rounded-3xl p-8 text-center text-white shadow-lg flex-1 flex flex-col items-center justify-center space-y-3 mb-6">
        <p className="text-xs text-forest-300 uppercase tracking-widest">Icibemba</p>
        <p className="font-serif text-5xl font-bold">{vocab.bemba}</p>
        <p className="text-forest-300 text-lg italic">{vocab.phonetic}</p>
        <div className="w-12 h-0.5 bg-forest-400 rounded" />
        <p className="font-serif text-3xl text-cream font-semibold">{vocab.english}</p>
        {vocab.exampleBemba && (
          <div className="bg-forest-700/60 rounded-2xl px-4 py-3 mt-2 max-w-xs">
            <p className="text-sm text-cream/80 italic">{vocab.exampleBemba}</p>
            <p className="text-xs text-forest-300 mt-1">{vocab.exampleEnglish}</p>
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        className="w-full bg-terracotta-500 active:bg-terracotta-600 text-white font-bold py-5 rounded-3xl text-xl shadow-md transition-all active:scale-95"
      >
        Got it! →
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Multiple choice exercise
───────────────────────────────────────────── */
function MCExercise({ exercise, answered, onAnswer }) {
  const { vocab, dir, options, correct } = exercise
  const prompt = dir === 'b2e' ? 'What does this mean?' : 'How do you say this in Bemba?'
  const question = dir === 'b2e' ? vocab.bemba : vocab.english
  const phonetic  = dir === 'b2e' ? vocab.phonetic : null

  return (
    <div className="flex-1 flex flex-col">
      <p className="text-ink/50 font-bold text-sm uppercase tracking-widest mb-4">{prompt}</p>

      {/* Question card */}
      <div className="bg-white rounded-3xl p-7 text-center shadow-sm border-2 border-gray-100 mb-6 flex-shrink-0">
        <p className="font-serif text-4xl font-bold text-ink leading-tight">{question}</p>
        {phonetic && <p className="text-terracotta-500 text-base italic mt-2">{phonetic}</p>}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3 flex-1">
        {options.map(option => {
          const isSelected = answered?.selected === option
          const isCorrect  = option === correct

          let cls = 'bg-white border-2 border-gray-200 text-ink'
          if (answered) {
            if (isCorrect)            cls = 'bg-[#d7f5e3] border-2 border-green-400 text-green-800'
            else if (isSelected)      cls = 'bg-[#fde8e0] border-2 border-red-400 text-red-700 animate-shake'
          }

          return (
            <button
              key={option}
              onClick={() => onAnswer(option)}
              disabled={!!answered}
              className={`w-full ${cls} font-bold py-4 px-5 rounded-2xl text-base text-left shadow-sm transition-all active:scale-95 flex items-center justify-between`}
            >
              <span>{option}</span>
              {answered && isCorrect  && <span className="text-xl">✅</span>}
              {answered && isSelected && !isCorrect && <span className="text-xl">❌</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Match exercise: tap pairs
───────────────────────────────────────────── */
function MatchExercise({ words, matchState, onTap }) {
  const { sel, matched, wrong } = matchState
  const bembaItems   = words.map(w => ({ id: w.id, text: w.bemba,    side: 'bemba' }))
  const englishItems = useMemo(() => shuffle(words.map(w => ({ id: w.id, text: w.english, side: 'english' }))), [words])

  function btnClass(item) {
    const { side, id } = item
    if (matched.has(id)) return 'bg-[#d7f5e3] border-2 border-green-400 text-green-700 opacity-60'
    if (wrong && (wrong.a === id || wrong.b === id)) return 'bg-[#fde8e0] border-2 border-red-400 text-red-700 animate-shake'
    if (sel?.id === id) return 'bg-terracotta-100 border-2 border-terracotta-500 text-terracotta-700 scale-105 shadow-md'
    return 'bg-white border-2 border-gray-200 text-ink hover:border-terracotta-300'
  }

  return (
    <div className="flex-1 flex flex-col">
      <p className="text-ink/50 font-bold text-sm uppercase tracking-widest mb-2">Tap the pairs!</p>
      <p className="text-ink/40 text-xs mb-5">Match each Bemba word to its English meaning</p>

      <div className="grid grid-cols-2 gap-3 flex-1">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-center text-ink/40 uppercase">Bemba</p>
          {bembaItems.map(item => (
            <button
              key={item.id}
              onClick={() => onTap('bemba', item.id)}
              disabled={matched.has(item.id)}
              className={`${btnClass(item)} rounded-2xl px-3 py-3 font-bold text-sm text-center shadow-sm transition-all active:scale-95 min-h-[56px] flex items-center justify-center`}
            >
              {item.text}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-center text-ink/40 uppercase">English</p>
          {englishItems.map(item => (
            <button
              key={item.id}
              onClick={() => onTap('english', item.id)}
              disabled={matched.has(item.id)}
              className={`${btnClass(item)} rounded-2xl px-3 py-3 font-bold text-sm text-center shadow-sm transition-all active:scale-95 min-h-[56px] flex items-center justify-center`}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
