import { useState, useMemo } from 'react'
import { getProgress, addXP, logActivity, recordQuiz, recordAccuracy } from '../utils/storage.js'
import { getAllVocabulary, getVocabularyByLessonIds } from '../data/lessons.js'
import { XP_REWARDS } from '../utils/xp.js'

const QUIZ_TYPES = ['multiple-choice', 'fill-in-blank', 'matching']
const QUESTIONS_PER_QUIZ = 10

export default function Quiz() {
  const progress = getProgress()
  const completedLessons = progress.lessonsCompleted || []
  const availableVocab = useMemo(
    () => getVocabularyByLessonIds(completedLessons),
    [completedLessons.join(',')]
  )
  const allVocab = useMemo(() => getAllVocabulary(), [])

  const [phase, setPhase] = useState('select') // select | quiz | results
  const [quizType, setQuizType] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState([]) // {correct: bool}
  const [typedAnswer, setTypedAnswer] = useState('')
  const [answerState, setAnswerState] = useState(null) // null | 'correct' | 'wrong'
  const [selectedOption, setSelectedOption] = useState(null)
  const [matchSelected, setMatchSelected] = useState({ left: null, right: null })
  const [matchPairs, setMatchPairs] = useState([]) // {bembaId, englishId}
  const [matchedIds, setMatchedIds] = useState(new Set())

  function startQuiz(type) {
    const pool = availableVocab.length >= 6 ? availableVocab : allVocab
    let qs

    if (type === 'matching') {
      qs = [buildMatchingQuestion(pool)]
    } else {
      qs = buildQuestions(type, pool, QUESTIONS_PER_QUIZ, allVocab)
    }

    setQuizType(type)
    setQuestions(qs)
    setCurrentQ(0)
    setAnswers([])
    setTypedAnswer('')
    setAnswerState(null)
    setSelectedOption(null)
    setMatchSelected({ left: null, right: null })
    setMatchPairs([])
    setMatchedIds(new Set())
    setPhase('quiz')
  }

  function handleMultipleChoiceSelect(option) {
    if (answerState) return
    const q = questions[currentQ]
    const correct = option === q.correctAnswer
    setSelectedOption(option)
    setAnswerState(correct ? 'correct' : 'wrong')
    setAnswers((a) => [...a, { correct }])
  }

  function handleFillSubmit(e) {
    e?.preventDefault()
    if (answerState) return
    const q = questions[currentQ]
    const correct = typedAnswer.trim().toLowerCase() === q.correctAnswer.toLowerCase()
    setAnswerState(correct ? 'correct' : 'wrong')
    setAnswers((a) => [...a, { correct }])
  }

  function handleNext() {
    if (currentQ + 1 >= questions.length) {
      finishQuiz()
    } else {
      setCurrentQ((i) => i + 1)
      setAnswerState(null)
      setSelectedOption(null)
      setTypedAnswer('')
    }
  }

  function handleMatchClick(side, id) {
    if (matchedIds.has(id)) return
    const sel = { ...matchSelected, [side]: id }
    setMatchSelected(sel)

    if (sel.left && sel.right) {
      const leftVocab = questions[0].pairs.find((p) => p.id === sel.left)
      const rightVocab = questions[0].pairs.find((p) => p.id === sel.right)
      if (sel.left === sel.right) {
        setMatchedIds((prev) => new Set([...prev, sel.left]))
        setMatchPairs((p) => [...p, { id: sel.left, correct: true }])
        setAnswers((a) => [...a, { correct: true }])
      } else {
        setMatchPairs((p) => [...p, { leftId: sel.left, rightId: sel.right, correct: false }])
        setAnswers((a) => [...a, { correct: false }])
        setTimeout(() => setMatchPairs((p) => p.filter((x) => x.leftId !== sel.left || x.rightId !== sel.right)), 700)
      }
      setMatchSelected({ left: null, right: null })
    } else {
      setMatchSelected(sel)
    }
  }

  function finishQuiz() {
    const score = answers.filter((a) => a.correct).length
    const total = answers.length
    addXP(XP_REWARDS.QUIZ_COMPLETE)
    logActivity()
    recordQuiz(null, score, total)
    setPhase('results')
  }

  if (availableVocab.length < 4) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="font-serif text-3xl text-ink">Quiz</h1>
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="font-serif text-xl text-ink mb-2">Complete a lesson first</h2>
          <p className="text-ink/60 text-sm">
            You need at least one completed lesson to take a quiz.
          </p>
        </div>
      </div>
    )
  }

  if (phase === 'select') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-serif text-3xl text-ink">Quiz</h1>
          <p className="text-ink/60 text-sm mt-1">Test your Bemba knowledge</p>
        </div>

        <div className="space-y-3">
          <QuizTypeCard
            icon="🎯"
            title="Multiple Choice"
            description="See a Bemba word and pick the correct English meaning from 4 options."
            onClick={() => startQuiz('multiple-choice')}
          />
          <QuizTypeCard
            icon="✍️"
            title="Fill in the Blank"
            description="Type the Bemba word for a given English meaning."
            onClick={() => startQuiz('fill-in-blank')}
          />
          <QuizTypeCard
            icon="🔗"
            title="Matching"
            description="Match 6 Bemba words to their English meanings."
            onClick={() => startQuiz('matching')}
          />
        </div>
      </div>
    )
  }

  if (phase === 'results') {
    const score = answers.filter((a) => a.correct).length
    const total = answers.length
    const pct = Math.round((score / total) * 100)
    return (
      <div className="space-y-6 animate-fade-in text-center">
        <h1 className="font-serif text-3xl text-ink">Quiz Results</h1>
        <div className="text-6xl">{pct >= 80 ? '🌟' : pct >= 50 ? '💪' : '📖'}</div>
        <div className="bg-white/80 border border-terracotta-100 rounded-2xl p-8">
          <div className="text-6xl font-bold text-terracotta-500 mb-1">{pct}%</div>
          <p className="text-ink/60">{score} of {total} correct</p>
        </div>
        <div className="bg-gold-400/20 border border-gold-500/40 rounded-xl px-5 py-3 inline-block">
          <p className="text-gold-600 font-bold">+{XP_REWARDS.QUIZ_COMPLETE} XP</p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setPhase('select')}
            className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-cream font-semibold py-3 rounded-xl transition-colors"
          >
            Try another quiz
          </button>
        </div>
      </div>
    )
  }

  // Quiz in progress
  if (quizType === 'matching') {
    const q = questions[0]
    const allMatched = matchedIds.size === q.pairs.length
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl text-ink">Matching</h1>
          <button onClick={() => setPhase('select')} className="text-xs text-ink/40 hover:text-ink">
            Quit
          </button>
        </div>

        {allMatched ? (
          <div className="text-center py-6 space-y-4 animate-slide-up">
            <div className="text-5xl">🎉</div>
            <p className="font-serif text-xl text-ink">All matched!</p>
            <p className="text-ink/60 text-sm">
              {answers.filter((a) => a.correct).length} of {q.pairs.length} correct matches
            </p>
            <button
              onClick={finishQuiz}
              className="bg-forest-600 hover:bg-forest-700 text-cream font-semibold py-3 px-8 rounded-xl transition-colors"
            >
              See Results
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-ink/60">Match each Bemba word to its English meaning.</p>
            <div className="grid grid-cols-2 gap-3">
              {/* Bemba column */}
              <div className="space-y-2">
                <p className="text-xs text-ink/40 uppercase tracking-wider text-center mb-2">Bemba</p>
                {q.pairs.map((pair) => {
                  const isMatched = matchedIds.has(pair.id)
                  return (
                    <button
                      key={`left-${pair.id}`}
                      onClick={() => !isMatched && handleMatchClick('left', pair.id)}
                      disabled={isMatched}
                      className={`w-full px-3 py-3 rounded-xl text-sm font-medium border-2 transition-all text-center ${
                        isMatched
                          ? 'border-forest-300 bg-forest-50 text-forest-600 opacity-50'
                          : matchSelected.left === pair.id
                          ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700'
                          : 'border-ink/15 bg-white/80 text-ink hover:border-terracotta-300'
                      }`}
                    >
                      {pair.bemba}
                    </button>
                  )
                })}
              </div>

              {/* English column */}
              <div className="space-y-2">
                <p className="text-xs text-ink/40 uppercase tracking-wider text-center mb-2">English</p>
                {q.shuffledEnglish.map((pair) => {
                  const isMatched = matchedIds.has(pair.id)
                  return (
                    <button
                      key={`right-${pair.id}`}
                      onClick={() => !isMatched && handleMatchClick('right', pair.id)}
                      disabled={isMatched}
                      className={`w-full px-3 py-3 rounded-xl text-sm font-medium border-2 transition-all text-center ${
                        isMatched
                          ? 'border-forest-300 bg-forest-50 text-forest-600 opacity-50'
                          : matchSelected.right === pair.id
                          ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700'
                          : 'border-ink/15 bg-white/80 text-ink hover:border-terracotta-300'
                      }`}
                    >
                      {pair.english}
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // Multiple choice / fill-in-blank
  const q = questions[currentQ]
  if (!q) return null

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="bg-cream rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-terracotta-400 rounded-full transition-all"
              style={{ width: `${(currentQ / questions.length) * 100}%` }}
            />
          </div>
        </div>
        <span className="ml-3 text-xs text-ink/50 tabular-nums flex-shrink-0">
          {currentQ + 1}/{questions.length}
        </span>
        <button onClick={() => setPhase('select')} className="ml-3 text-xs text-ink/40 hover:text-ink">
          Quit
        </button>
      </div>

      {/* Question */}
      <div className="bg-white/80 border border-terracotta-100 rounded-2xl p-6">
        <p className="text-xs text-ink/40 uppercase tracking-wider mb-3">{q.prompt}</p>
        <p className="font-serif text-2xl text-ink">{q.question}</p>
        {q.phonetic && <p className="text-terracotta-500 text-sm italic mt-1">{q.phonetic}</p>}
      </div>

      {/* Multiple choice options */}
      {quizType === 'multiple-choice' && (
        <div className="space-y-2">
          {q.options.map((option) => {
            const isCorrect = option === q.correctAnswer
            const isSelected = option === selectedOption
            let cls = 'border-ink/15 bg-white/80 hover:border-terracotta-300 text-ink'
            if (answerState && isSelected && isCorrect) cls = 'border-forest-400 bg-forest-50 text-forest-700'
            if (answerState && isSelected && !isCorrect) cls = 'border-terracotta-500 bg-terracotta-50 text-terracotta-700'
            if (answerState && !isSelected && isCorrect) cls = 'border-forest-400 bg-forest-50 text-forest-700'

            return (
              <button
                key={option}
                onClick={() => handleMultipleChoiceSelect(option)}
                disabled={!!answerState}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-medium text-sm ${cls}`}
              >
                {option}
                {answerState && isCorrect && <span className="float-right">✓</span>}
                {answerState && isSelected && !isCorrect && <span className="float-right">✗</span>}
              </button>
            )
          })}
        </div>
      )}

      {/* Fill in the blank */}
      {quizType === 'fill-in-blank' && (
        <form onSubmit={handleFillSubmit} className="space-y-3">
          <input
            type="text"
            value={typedAnswer}
            onChange={(e) => setTypedAnswer(e.target.value)}
            placeholder="Type the Bemba word…"
            disabled={!!answerState}
            autoFocus
            className={`w-full px-4 py-3 rounded-xl border-2 bg-cream focus:outline-none text-ink text-base ${
              answerState === 'correct'
                ? 'border-forest-400'
                : answerState === 'wrong'
                ? 'border-terracotta-500'
                : 'border-terracotta-200 focus:border-terracotta-400'
            }`}
          />
          {answerState === 'wrong' && (
            <p className="text-terracotta-600 text-sm">
              Correct answer: <strong>{q.correctAnswer}</strong>
            </p>
          )}
          {!answerState && (
            <button
              type="submit"
              className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-cream font-semibold py-3 rounded-xl transition-colors"
            >
              Check
            </button>
          )}
        </form>
      )}

      {/* Feedback & Next */}
      {answerState && quizType !== 'matching' && (
        <div className="space-y-3 animate-slide-up">
          <div
            className={`rounded-xl px-5 py-3 border ${
              answerState === 'correct'
                ? 'bg-forest-50 border-forest-200 text-forest-700'
                : 'bg-terracotta-50 border-terracotta-200 text-terracotta-700'
            }`}
          >
            <p className="font-semibold text-sm">
              {answerState === 'correct' ? '✓ Correct! Mwabombeni!' : '✗ Not quite — keep going!'}
            </p>
          </div>
          <button
            onClick={handleNext}
            className="w-full bg-forest-600 hover:bg-forest-700 text-cream font-semibold py-3 rounded-xl transition-colors"
          >
            {currentQ + 1 >= questions.length ? 'See Results' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  )
}

function QuizTypeCard({ icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white/80 border border-terracotta-100 rounded-2xl p-5 hover:shadow-md hover:border-terracotta-300 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-terracotta-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-ink text-base mb-1">{title}</h3>
          <p className="text-ink/60 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </button>
  )
}

function buildQuestions(type, pool, count, allVocab) {
  const shuffled = shuffle([...pool])
  const selected = shuffled.slice(0, Math.min(count, shuffled.length))

  return selected.map((vocab) => {
    if (type === 'multiple-choice') {
      const distractors = shuffle(allVocab.filter((v) => v.id !== vocab.id))
        .slice(0, 3)
        .map((v) => v.english)
      const options = shuffle([vocab.english, ...distractors])
      return {
        prompt: 'What does this Bemba word mean?',
        question: vocab.bemba,
        phonetic: vocab.phonetic,
        options,
        correctAnswer: vocab.english,
      }
    } else {
      return {
        prompt: 'Type the Bemba word for:',
        question: vocab.english,
        phonetic: null,
        correctAnswer: vocab.bemba,
      }
    }
  })
}

function buildMatchingQuestion(pool) {
  const selected = shuffle([...pool]).slice(0, 6)
  return {
    pairs: selected.map((v) => ({ id: v.id, bemba: v.bemba, english: v.english })),
    shuffledEnglish: shuffle(selected.map((v) => ({ id: v.id, english: v.english }))),
  }
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
