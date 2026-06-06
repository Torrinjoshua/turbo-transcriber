import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveProfile, markOnboarded, saveProgress, getProgress } from '../utils/storage.js'
import { logActivity } from '../utils/storage.js'

const DAILY_GOALS = [
  { minutes: 5, label: '5 min', description: 'A gentle start' },
  { minutes: 10, label: '10 min', description: 'Steady growth' },
  { minutes: 15, label: '15 min', description: 'Full immersion' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [dailyGoal, setDailyGoal] = useState(10)
  const [error, setError] = useState('')

  function handleNameSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    setError('')
    setStep(1)
  }

  function handleGoalSubmit() {
    setStep(2)
  }

  function handleFinish() {
    saveProfile({ name: name.trim(), dailyGoal, createdAt: new Date().toISOString() })
    const progress = getProgress()
    progress.streak = 1
    progress.lastStudyDate = new Date().toISOString().slice(0, 10)
    saveProgress(progress)
    logActivity()
    markOnboarded()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-dvh textile-bg flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {step === 0 && (
          <div className="animate-fade-in">
            {/* Hero */}
            <div className="text-center mb-10">
              <div className="text-7xl mb-4">🌿</div>
              <h1 className="font-serif text-4xl font-bold text-forest-600 mb-3">Mother Tongue</h1>
              <p className="text-terracotta-500 text-lg font-medium italic mb-6">
                Reclaim your roots. One word at a time.
              </p>
              <p className="text-ink/70 text-sm leading-relaxed max-w-sm mx-auto">
                A language learning app built for the Zambian diaspora — helping families reconnect with
                Icibemba, the language of their roots.
              </p>
            </div>

            {/* Name form */}
            <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-terracotta-100 p-6">
              <h2 className="font-serif text-xl text-ink mb-1">What shall we call you?</h2>
              <p className="text-sm text-ink/60 mb-5">Your name in our home.</p>
              <form onSubmit={handleNameSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name…"
                    className="w-full px-4 py-3 rounded-xl border border-terracotta-200 bg-cream focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-ink text-base"
                    autoFocus
                  />
                  {error && <p className="text-terracotta-500 text-xs mt-1">{error}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-cream font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Continue
                </button>
              </form>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🕐</div>
              <h2 className="font-serif text-3xl text-forest-600 mb-2">Set your daily goal</h2>
              <p className="text-ink/60 text-sm">
                Consistent practice — even just a few minutes — builds lasting fluency.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {DAILY_GOALS.map((goal) => (
                <button
                  key={goal.minutes}
                  onClick={() => setDailyGoal(goal.minutes)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all ${
                    dailyGoal === goal.minutes
                      ? 'border-terracotta-500 bg-terracotta-50'
                      : 'border-terracotta-100 bg-white/80 hover:border-terracotta-300'
                  }`}
                >
                  <div className="text-left">
                    <span className="font-semibold text-ink text-base">{goal.label} / day</span>
                    <p className="text-xs text-ink/50">{goal.description}</p>
                  </div>
                  {dailyGoal === goal.minutes && (
                    <span className="text-terracotta-500 text-xl">✓</span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleGoalSubmit}
              className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-cream font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in text-center">
            <div className="text-6xl mb-6">🌍</div>
            <h2 className="font-serif text-3xl text-forest-600 mb-4">
              Mwaiseni, {name}!
            </h2>
            <p className="text-terracotta-600 font-medium italic mb-6">Welcome.</p>
            <div className="bg-white/80 backdrop-blur rounded-2xl border border-terracotta-100 p-6 mb-8 text-left">
              <p className="text-ink/80 text-sm leading-relaxed mb-4">
                Icibemba is not just a language — it is a living connection to your heritage, your elders,
                and the land of Zambia. Every word you learn is a thread woven back into the fabric of
                who you are.
              </p>
              <p className="text-ink/80 text-sm leading-relaxed">
                This app is your guide. Start with greetings, build through family and food, and let the
                language grow in you the way it once grew in those who came before you.
              </p>
            </div>
            <div className="bg-forest-50 rounded-xl p-4 mb-6 border border-forest-200">
              <p className="text-forest-700 text-sm font-medium">
                🎯 Your goal: <strong>{dailyGoal} minutes</strong> per day
              </p>
            </div>
            <button
              onClick={handleFinish}
              className="w-full bg-forest-600 hover:bg-forest-700 text-cream font-semibold py-4 px-6 rounded-xl transition-colors text-base"
            >
              Begin My Journey
            </button>
          </div>
        )}

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-8 bg-terracotta-500' : 'w-2 bg-terracotta-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
