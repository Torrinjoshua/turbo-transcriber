import { useState, useMemo } from 'react'
import { getCouplesSettings, saveCouplesSettings, addXP, getProgress, logActivity } from '../utils/storage.js'
import { getAllVocabulary, getVocabularyByLessonIds } from '../data/lessons.js'
import { XP_REWARDS } from '../utils/xp.js'

const ROUNDS = 10

export default function CouplesMode() {
  const progress = getProgress()
  const completedLessons = progress.lessonsCompleted || []
  const vocab = useMemo(() => {
    const v = getVocabularyByLessonIds(completedLessons)
    return v.length >= 4 ? v : getAllVocabulary()
  }, [completedLessons.join(',')])

  const [settings, setSettings] = useState(() => getCouplesSettings())
  const [editingNames, setEditingNames] = useState(false)
  const [phase, setPhase] = useState('setup') // setup | game | done
  const [scores, setScores] = useState({ 1: 0, 2: 0 })
  const [round, setRound] = useState(1)
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [question, setQuestion] = useState(null)
  const [options, setOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [answerState, setAnswerState] = useState(null)

  function saveNames(p1, p2) {
    const s = { player1: p1 || 'Player 1', player2: p2 || 'Player 2' }
    setSettings(s)
    saveCouplesSettings(s)
    setEditingNames(false)
  }

  function startGame() {
    setScores({ 1: 0, 2: 0 })
    setRound(1)
    setCurrentPlayer(1)
    setPhase('game')
    nextQuestion(1)
  }

  function nextQuestion(player) {
    const pool = shuffle([...vocab])
    const chosen = pool[0]
    const distractors = pool.slice(1, 4).map((v) => v.english)
    const opts = shuffle([chosen.english, ...distractors])
    setQuestion(chosen)
    setOptions(opts)
    setSelectedOption(null)
    setAnswerState(null)
    setCurrentPlayer(player)
  }

  function handleSelect(option) {
    if (answerState) return
    setSelectedOption(option)
    const correct = option === question.english
    setAnswerState(correct ? 'correct' : 'wrong')
    if (correct) {
      setScores((s) => ({ ...s, [currentPlayer]: s[currentPlayer] + 1 }))
    }
  }

  function handleNext() {
    const nextRound = round + 1
    if (nextRound > ROUNDS) {
      logActivity()
      const winner = scores[1] > scores[2] ? 1 : scores[2] > scores[1] ? 2 : 0
      if (winner > 0) addXP(XP_REWARDS.COUPLES_WIN)
      setPhase('done')
      return
    }
    setRound(nextRound)
    const nextPlayer = currentPlayer === 1 ? 2 : 1
    nextQuestion(nextPlayer)
  }

  const playerName = (n) => (n === 1 ? settings.player1 : settings.player2)

  if (phase === 'setup') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-serif text-3xl text-ink">Couples Mode</h1>
          <p className="text-ink/60 text-sm mt-1">Study Bemba together</p>
        </div>

        <div className="bg-terracotta-50 border border-terracotta-200 rounded-2xl p-5">
          <p className="text-ink/80 text-sm leading-relaxed">
            Take turns answering questions from your shared vocabulary pool. Each player answers 5
            questions across 10 rounds. Celebrate together — this isn't about winning, it's about
            learning side by side.
          </p>
        </div>

        {/* Player names */}
        {editingNames ? (
          <NameEditor
            initial={{ p1: settings.player1, p2: settings.player2 }}
            onSave={saveNames}
            onCancel={() => setEditingNames(false)}
          />
        ) : (
          <div className="bg-white/80 border border-terracotta-100 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-ink">Players</h2>
              <button
                onClick={() => setEditingNames(true)}
                className="text-xs text-terracotta-500 hover:text-terracotta-700 font-medium"
              >
                Edit names
              </button>
            </div>
            <div className="flex gap-3">
              <PlayerBadge name={settings.player1} number={1} />
              <div className="flex items-center text-ink/30 font-serif text-lg">vs</div>
              <PlayerBadge name={settings.player2} number={2} />
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-ink/50 mb-5">{ROUNDS} rounds · Multiple choice</p>
          <button
            onClick={startGame}
            className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-cream font-semibold py-4 rounded-xl transition-colors text-base"
          >
            Start Game
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'done') {
    const p1score = scores[1]
    const p2score = scores[2]
    const winner =
      p1score > p2score ? settings.player1 : p2score > p1score ? settings.player2 : null
    return (
      <div className="text-center space-y-6 animate-fade-in">
        <h1 className="font-serif text-3xl text-ink">Game Over!</h1>
        <div className="text-6xl">{winner ? '🏆' : '🤝'}</div>
        {winner ? (
          <div>
            <h2 className="font-serif text-2xl text-terracotta-600 mb-1">{winner} wins!</h2>
            <p className="text-ink/60 text-sm">Mwabombeni — well played!</p>
          </div>
        ) : (
          <div>
            <h2 className="font-serif text-2xl text-forest-600 mb-1">It's a tie!</h2>
            <p className="text-ink/60 text-sm">Perfectly balanced — you're both doing great.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <ScoreCard name={settings.player1} score={p1score} total={ROUNDS / 2} won={p1score > p2score} />
          <ScoreCard name={settings.player2} score={p2score} total={ROUNDS / 2} won={p2score > p1score} />
        </div>

        {winner && (
          <div className="bg-gold-400/20 border border-gold-500/40 rounded-xl px-5 py-3 inline-block">
            <p className="text-gold-600 font-bold">+{XP_REWARDS.COUPLES_WIN} XP</p>
          </div>
        )}

        <button
          onClick={() => {
            setPhase('setup')
            setScores({ 1: 0, 2: 0 })
          }}
          className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-cream font-semibold py-3 rounded-xl transition-colors"
        >
          Play again
        </button>
      </div>
    )
  }

  // Game in progress
  const currentName = playerName(currentPlayer)
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Score board */}
      <div className="grid grid-cols-3 items-center">
        <PlayerScore
          name={settings.player1}
          score={scores[1]}
          active={currentPlayer === 1}
        />
        <div className="text-center text-ink/40 font-serif text-sm">
          Round {round}/{ROUNDS}
        </div>
        <PlayerScore
          name={settings.player2}
          score={scores[2]}
          active={currentPlayer === 2}
          right
        />
      </div>

      {/* Turn indicator */}
      <div className={`text-center py-3 rounded-xl ${currentPlayer === 1 ? 'bg-terracotta-100' : 'bg-forest-100'}`}>
        <p className="font-semibold text-sm text-ink">
          {currentName}'s turn
        </p>
      </div>

      {/* Question */}
      {question && (
        <>
          <div className="bg-white/80 border border-terracotta-100 rounded-2xl p-6 text-center">
            <p className="text-xs text-ink/40 uppercase tracking-wider mb-3">What does this mean?</p>
            <p className="font-serif text-4xl text-ink font-bold mb-2">{question.bemba}</p>
            <p className="text-terracotta-500 text-base italic">{question.phonetic}</p>
          </div>

          <div className="space-y-2">
            {options.map((option) => {
              const isCorrect = option === question.english
              const isSelected = option === selectedOption
              let cls = 'border-ink/15 bg-white/80 hover:border-terracotta-300 text-ink'
              if (answerState && isSelected && isCorrect) cls = 'border-forest-400 bg-forest-50 text-forest-700'
              if (answerState && isSelected && !isCorrect) cls = 'border-terracotta-500 bg-terracotta-50 text-terracotta-700'
              if (answerState && !isSelected && isCorrect) cls = 'border-forest-400 bg-forest-50 text-forest-700'

              return (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  disabled={!!answerState}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium text-sm transition-all ${cls}`}
                >
                  {option}
                  {answerState && isCorrect && <span className="float-right">✓</span>}
                  {answerState && isSelected && !isCorrect && <span className="float-right">✗</span>}
                </button>
              )
            })}
          </div>

          {answerState && (
            <div className="space-y-3 animate-slide-up">
              <div
                className={`rounded-xl px-5 py-3 border text-sm font-semibold ${
                  answerState === 'correct'
                    ? 'bg-forest-50 border-forest-200 text-forest-700'
                    : 'bg-terracotta-50 border-terracotta-200 text-terracotta-700'
                }`}
              >
                {answerState === 'correct' ? `✓ Correct, ${currentName}!` : `✗ The answer was: ${question.english}`}
              </div>
              <button
                onClick={handleNext}
                className="w-full bg-forest-600 hover:bg-forest-700 text-cream font-semibold py-3 rounded-xl transition-colors"
              >
                {round >= ROUNDS ? 'See Final Results' : `${playerName(currentPlayer === 1 ? 2 : 1)}'s Turn →`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function PlayerBadge({ name, number }) {
  const color = number === 1 ? 'bg-terracotta-100 text-terracotta-700' : 'bg-forest-100 text-forest-700'
  return (
    <div className={`flex-1 rounded-xl px-4 py-3 ${color} text-center`}>
      <p className="font-semibold text-sm truncate">{name}</p>
      <p className="text-xs opacity-60">Player {number}</p>
    </div>
  )
}

function PlayerScore({ name, score, active, right }) {
  return (
    <div className={`text-${right ? 'right' : 'left'}`}>
      <p className={`text-xs font-medium truncate ${active ? 'text-terracotta-600' : 'text-ink/40'}`}>
        {name}
      </p>
      <p className={`text-3xl font-bold ${active ? 'text-terracotta-500' : 'text-ink/40'}`}>
        {score}
      </p>
    </div>
  )
}

function ScoreCard({ name, score, total, won }) {
  return (
    <div
      className={`rounded-2xl border p-5 text-center ${
        won ? 'border-gold-500 bg-gold-400/10' : 'border-ink/10 bg-cream'
      }`}
    >
      {won && <div className="text-xl mb-1">🏆</div>}
      <p className="font-semibold text-ink text-sm truncate mb-1">{name}</p>
      <p className="text-3xl font-bold text-terracotta-500">{score}</p>
      <p className="text-xs text-ink/40">of {total}</p>
    </div>
  )
}

function NameEditor({ initial, onSave, onCancel }) {
  const [p1, setP1] = useState(initial.p1)
  const [p2, setP2] = useState(initial.p2)
  return (
    <div className="bg-white/80 border border-terracotta-100 rounded-2xl p-5 space-y-4">
      <h2 className="font-semibold text-ink">Edit player names</h2>
      <input
        value={p1}
        onChange={(e) => setP1(e.target.value)}
        placeholder="Player 1 name"
        className="w-full px-4 py-2.5 rounded-xl border border-terracotta-200 bg-cream focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-sm"
      />
      <input
        value={p2}
        onChange={(e) => setP2(e.target.value)}
        placeholder="Player 2 name"
        className="w-full px-4 py-2.5 rounded-xl border border-terracotta-200 bg-cream focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-sm"
      />
      <div className="flex gap-3">
        <button
          onClick={() => onSave(p1, p2)}
          className="flex-1 bg-terracotta-500 hover:bg-terracotta-600 text-cream font-semibold py-2.5 rounded-xl transition-colors text-sm"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex-1 border border-ink/20 text-ink font-medium py-2.5 rounded-xl hover:bg-ink/5 transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
