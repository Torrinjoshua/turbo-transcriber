import { useState, useMemo } from 'react'
import { getProgress, addXP, logActivity, recordQuiz } from '../utils/storage.js'
import { getAllVocabulary, getVocabularyByLessonIds } from '../data/lessons.js'
import { XP_REWARDS } from '../utils/xp.js'

const QUIZ_LEN = 8
const CORRECT_MSG = ['Amazing! 🌟', 'You got it! 🎉', 'Mwabombeni! 💪', 'Superstar! ⭐']
const WRONG_MSG   = ['Almost! Try again 💙', 'Not quite — keep going! 🤗', 'You can do it! 💫']
const rand = arr => arr[Math.floor(Math.random() * arr.length)]

export default function Quiz() {
  const progress = getProgress()
  const completedLessons = progress.lessonsCompleted || []
  const available = useMemo(() => {
    const v = getVocabularyByLessonIds(completedLessons)
    return v.length >= 4 ? v : getAllVocabulary()
  }, [completedLessons.join(',')])
  const allVocab = useMemo(() => getAllVocabulary(), [])

  const [phase, setPhase]       = useState('select')
  const [quizType, setQuizType] = useState(null)
  const [questions, setQs]      = useState([])
  const [qIdx, setQIdx]         = useState(0)
  const [answered, setAnswered] = useState(null)
  const [score, setScore]       = useState(0)
  const [typedAns, setTyped]    = useState('')
  // match state
  const [matchSel, setMatchSel]     = useState(null)
  const [matchMatched, setMatched]  = useState(new Set())
  const [matchWrong, setMatchWrong] = useState(null)
  const [matchScore, setMatchScore] = useState(0)

  function startQuiz(type) {
    const pool = available.length >= 4 ? available : allVocab
    let qs
    if (type === 'match') {
      const words = shuffle([...pool]).slice(0, 6)
      qs = [{ type: 'match', words, shuffled: shuffle([...words]) }]
    } else {
      qs = buildMCQuestions(type, pool, allVocab, QUIZ_LEN)
    }
    setQs(qs); setQuizType(type); setQIdx(0)
    setAnswered(null); setScore(0); setTyped('')
    setMatchSel(null); setMatched(new Set()); setMatchWrong(null); setMatchScore(0)
    setPhase('quiz')
  }

  function answerMC(option) {
    if (answered) return
    const ok = option === questions[qIdx].correct
    setAnswered({ isCorrect: ok, selected: option })
    if (ok) setScore(s => s + 1)
  }

  function submitFill(e) {
    e?.preventDefault()
    if (answered) return
    const ok = typedAns.trim().toLowerCase() === questions[qIdx].correct.toLowerCase()
    setAnswered({ isCorrect: ok })
    if (ok) setScore(s => s + 1)
  }

  function nextQ() {
    setAnswered(null); setTyped('')
    if (qIdx + 1 >= questions.length) finish(score + (answered?.isCorrect ? 0 : 0))
    else setQIdx(i => i + 1)
  }

  function tapMatch(side, id) {
    if (matchMatched.has(id)) return
    if (!matchSel) { setMatchSel({ side, id }); return }
    if (matchSel.side === side) { setMatchSel({ side, id }); return }
    if (matchSel.id === id) {
      const nm = new Set([...matchMatched, id])
      setMatched(nm); setMatchSel(null); setMatchScore(s => s + 1)
      if (nm.size === questions[0].words.length) setTimeout(() => finishMatch(matchScore + 1), 600)
    } else {
      setMatchWrong({ a: matchSel.id, b: id }); setMatchSel(null)
      setTimeout(() => setMatchWrong(null), 700)
    }
  }

  function finishMatch(finalScore) {
    addXP(XP_REWARDS.QUIZ_COMPLETE); logActivity()
    recordQuiz(null, finalScore, questions[0].words.length)
    setScore(finalScore); setPhase('results')
  }

  function finish(finalScore) {
    addXP(XP_REWARDS.QUIZ_COMPLETE); logActivity()
    recordQuiz(null, finalScore, questions.length)
    setPhase('results')
  }

  if (completedLessons.length === 0 && available.length < 4) {
    return (
      <div className="min-h-dvh bg-cream flex flex-col">
        <div className="bg-white px-5 pt-12 pb-5 shadow-sm">
          <h1 className="font-serif text-2xl font-bold text-ink">Quiz 🎮</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pb-24 space-y-4">
          <div className="text-6xl">📚</div>
          <h2 className="font-serif text-xl font-bold text-ink">Finish a lesson first!</h2>
          <p className="text-ink/60">Complete a lesson to unlock quizzes.</p>
        </div>
      </div>
    )
  }

  if (phase === 'select') return (
    <div className="min-h-dvh bg-cream flex flex-col">
      <div className="bg-white px-5 pt-12 pb-5 shadow-sm">
        <h1 className="font-serif text-2xl font-bold text-ink">Quiz 🎮</h1>
        <p className="text-ink/50 text-sm mt-0.5">Test what you've learned!</p>
      </div>
      <div className="flex-1 px-5 py-6 space-y-3 pb-28">
        <QuizCard icon="🎯" title="Multiple Choice" desc="See a Bemba word — pick the right meaning!" onClick={() => startQuiz('mc')} color="bg-terracotta-500" />
        <QuizCard icon="✍️" title="Fill in the Blank" desc="See the English — type the Bemba word!" onClick={() => startQuiz('fill')} color="bg-forest-600" />
        <QuizCard icon="🔗" title="Matching Game" desc="Match 6 Bemba words to their English meanings!" onClick={() => startQuiz('match')} color="bg-gold-500" textColor="text-ink" />
      </div>
    </div>
  )

  if (phase === 'results') {
    const total = quizType === 'match' ? questions[0].words.length : questions.length
    const pct = Math.round((score / total) * 100)
    return (
      <div className="min-h-dvh bg-cream flex flex-col items-center justify-center px-6 text-center space-y-6 pb-24">
        <div className="text-7xl">{pct >= 70 ? '🌟' : '💪'}</div>
        <h2 className="font-serif text-3xl font-bold text-ink">Quiz done!</h2>
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-6 shadow-sm w-full">
          <div className="text-5xl font-bold text-terracotta-500">{pct}%</div>
          <p className="text-ink/50 mt-1">{score} of {total} correct</p>
        </div>
        <div className="bg-gold-400/20 border-2 border-gold-400 rounded-2xl px-6 py-3">
          <p className="text-gold-600 font-bold">+{XP_REWARDS.QUIZ_COMPLETE} XP 🎊</p>
        </div>
        <button
          onClick={() => setPhase('select')}
          className="w-full bg-terracotta-500 active:bg-terracotta-600 text-white font-bold py-4 rounded-3xl text-lg shadow-md transition-all active:scale-95"
        >
          Play again!
        </button>
      </div>
    )
  }

  /* ── Matching quiz ── */
  if (quizType === 'match' && phase === 'quiz') {
    const q = questions[0]
    const allMatchedDone = matchMatched.size === q.words.length
    return (
      <div className="min-h-dvh bg-cream flex flex-col">
        <div className="bg-white px-5 pt-12 pb-4 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setPhase('select')} className="text-gray-400 text-2xl">✕</button>
            <h2 className="font-bold text-ink">Matching Game 🔗</h2>
            <div />
          </div>
        </div>

        {allMatchedDone ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-5 pb-24">
            <div className="text-6xl animate-bounce-in">🎊</div>
            <h2 className="font-serif text-2xl font-bold text-ink">All matched!</h2>
            <button onClick={() => finishMatch(matchScore)} className="w-full bg-green-500 text-white font-bold py-4 rounded-3xl text-lg shadow-md active:scale-95 transition-all">
              See results!
            </button>
          </div>
        ) : (
          <div className="flex-1 px-5 py-5 pb-28 overflow-y-auto">
            <p className="text-xs font-bold text-ink/40 uppercase tracking-wider mb-4">
              {q.words.length - matchMatched.size} pairs left
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <p className="text-xs font-bold text-center text-ink/40 uppercase">Bemba</p>
                {q.words.map(w => {
                  const id = w.id
                  let cls = 'bg-white border-2 border-gray-200 text-ink'
                  if (matchMatched.has(id)) cls = 'bg-[#d7f5e3] border-2 border-green-300 text-green-700 opacity-50'
                  else if (matchWrong && (matchWrong.a === id || matchWrong.b === id)) cls = 'bg-[#fde8e0] border-2 border-red-300 text-red-600 animate-shake'
                  else if (matchSel?.id === id) cls = 'bg-terracotta-50 border-2 border-terracotta-500 text-terracotta-700 scale-105'
                  return (
                    <button key={`b-${id}`} onClick={() => !matchMatched.has(id) && tapMatch('bemba', id)}
                      disabled={matchMatched.has(id)}
                      className={`${cls} rounded-2xl px-3 py-3 font-bold text-sm text-center shadow-sm w-full transition-all active:scale-95 min-h-[52px] flex items-center justify-center`}>
                      {w.bemba}
                    </button>
                  )
                })}
              </div>
              <div className="space-y-3">
                <p className="text-xs font-bold text-center text-ink/40 uppercase">English</p>
                {q.shuffled.map(w => {
                  const id = w.id
                  let cls = 'bg-white border-2 border-gray-200 text-ink'
                  if (matchMatched.has(id)) cls = 'bg-[#d7f5e3] border-2 border-green-300 text-green-700 opacity-50'
                  else if (matchWrong && (matchWrong.a === id || matchWrong.b === id)) cls = 'bg-[#fde8e0] border-2 border-red-300 text-red-600 animate-shake'
                  else if (matchSel?.id === id) cls = 'bg-terracotta-50 border-2 border-terracotta-500 text-terracotta-700 scale-105'
                  return (
                    <button key={`e-${id}`} onClick={() => !matchMatched.has(id) && tapMatch('english', id)}
                      disabled={matchMatched.has(id)}
                      className={`${cls} rounded-2xl px-3 py-3 font-bold text-sm text-center shadow-sm w-full transition-all active:scale-95 min-h-[52px] flex items-center justify-center`}>
                      {w.english}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ── MC / Fill quiz ── */
  const q = questions[qIdx]
  if (!q) return null
  const totalQ = questions.length

  return (
    <div className="min-h-dvh bg-cream flex flex-col">
      <div className="bg-white px-5 pt-12 pb-4 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => setPhase('select')} className="text-gray-400 text-2xl flex-shrink-0">✕</button>
          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
            <div className="h-full bg-terracotta-400 rounded-full transition-all" style={{ width: `${(qIdx / totalQ) * 100}%` }} />
          </div>
          <span className="text-sm font-bold text-ink/40 flex-shrink-0">{qIdx + 1}/{totalQ}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-5 py-5 overflow-y-auto">
        {/* Question */}
        <p className="text-ink/40 font-bold text-xs uppercase tracking-widest mb-3">{q.prompt}</p>
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-6 text-center shadow-sm mb-5 flex-shrink-0">
          <p className="font-serif text-3xl font-bold text-ink">{q.question}</p>
          {q.phonetic && <p className="text-terracotta-500 italic mt-1">{q.phonetic}</p>}
        </div>

        {/* MC options */}
        {quizType === 'mc' && (
          <div className="space-y-3 flex-1">
            {q.options.map(opt => {
              let cls = 'bg-white border-2 border-gray-200 text-ink'
              if (answered) {
                if (opt === q.correct)                     cls = 'bg-[#d7f5e3] border-2 border-green-400 text-green-800'
                else if (answered.selected === opt)        cls = 'bg-[#fde8e0] border-2 border-red-400 text-red-700 animate-shake'
              }
              return (
                <button key={opt} onClick={() => answerMC(opt)} disabled={!!answered}
                  className={`${cls} w-full font-bold py-4 px-5 rounded-2xl text-base text-left shadow-sm active:scale-95 transition-all flex justify-between items-center`}>
                  <span>{opt}</span>
                  {answered && opt === q.correct && <span>✅</span>}
                  {answered && answered.selected === opt && opt !== q.correct && <span>❌</span>}
                </button>
              )
            })}
          </div>
        )}

        {/* Fill in blank */}
        {quizType === 'fill' && (
          <form onSubmit={submitFill} className="flex-1 flex flex-col gap-3">
            <input
              type="text"
              value={typedAns}
              onChange={e => setTyped(e.target.value)}
              placeholder="Type the Bemba word…"
              disabled={!!answered}
              autoFocus
              className={`w-full px-5 py-4 rounded-2xl border-2 bg-white focus:outline-none text-ink text-lg font-bold ${
                answered?.isCorrect === true  ? 'border-green-400' :
                answered?.isCorrect === false ? 'border-red-400'   : 'border-gray-200 focus:border-terracotta-400'
              }`}
            />
            {answered?.isCorrect === false && (
              <p className="text-red-600 font-bold text-sm">Answer: <strong>{q.correct}</strong></p>
            )}
            {!answered && (
              <button type="submit"
                className="w-full bg-terracotta-500 active:bg-terracotta-600 text-white font-bold py-4 rounded-3xl text-lg shadow-md active:scale-95 transition-all">
                Check! ✓
              </button>
            )}
          </form>
        )}
      </div>

      {/* Feedback panel */}
      {answered && (
        <div className={`animate-slide-up-fast px-5 py-5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex-shrink-0 ${
          answered.isCorrect ? 'bg-[#d7f5e3]' : 'bg-[#fde8e0]'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{answered.isCorrect ? '✅' : '❌'}</span>
            <p className={`font-bold text-lg ${answered.isCorrect ? 'text-green-700' : 'text-red-600'}`}>
              {answered.isCorrect ? rand(CORRECT_MSG) : rand(WRONG_MSG)}
            </p>
          </div>
          <button onClick={() => qIdx + 1 >= totalQ ? finish(score) : nextQ()}
            className={`w-full font-bold py-4 rounded-3xl text-lg shadow-md active:scale-95 transition-all text-white ${
              answered.isCorrect ? 'bg-green-500 active:bg-green-600' : 'bg-terracotta-500 active:bg-terracotta-600'
            }`}>
            {qIdx + 1 >= totalQ ? 'See results! 🎊' : 'Continue →'}
          </button>
        </div>
      )}
    </div>
  )
}

function QuizCard({ icon, title, desc, onClick, color, textColor = 'text-white' }) {
  return (
    <button onClick={onClick}
      className={`${color} ${textColor} w-full rounded-3xl p-5 text-left shadow-md active:scale-95 transition-all`}>
      <div className="flex items-center gap-4">
        <div className="text-4xl">{icon}</div>
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-sm opacity-80">{desc}</p>
        </div>
      </div>
    </button>
  )
}

function buildMCQuestions(type, pool, allVocab, count) {
  return shuffle([...pool]).slice(0, count).map(vocab => {
    if (type === 'mc') {
      const opts = shuffle([vocab.english, ...shuffle(allVocab.filter(v => v.id !== vocab.id)).slice(0, 3).map(v => v.english)])
      return { prompt: 'What does this mean?', question: vocab.bemba, phonetic: vocab.phonetic, options: opts, correct: vocab.english }
    } else {
      return { prompt: 'Type the Bemba word for:', question: vocab.english, phonetic: null, correct: vocab.bemba }
    }
  })
}

function shuffle(a) {
  const arr = [...a]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
