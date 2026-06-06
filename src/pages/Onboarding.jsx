import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveProfile, markOnboarded, saveProgress, getProgress, logActivity } from '../utils/storage.js'

const AVATARS = ['🦁', '🐘', '🦒', '🦓', '🐆', '🦏']

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('🦁')
  const [error, setError] = useState('')

  function handleNameNext(e) {
    e?.preventDefault()
    if (!name.trim()) { setError('Type your name first!'); return }
    setError('')
    setStep(1)
  }

  function handleFinish() {
    saveProfile({ name: name.trim(), avatar, dailyGoal: 10, createdAt: new Date().toISOString() })
    const p = getProgress()
    p.streak = 1
    p.lastStudyDate = new Date().toISOString().slice(0, 10)
    saveProgress(p)
    logActivity()
    markOnboarded()
    navigate('/', { replace: true })
  }

  return (
    <div className="phone-frame min-h-dvh textile-bg flex flex-col items-center justify-center px-6 py-10">
      {/* Step 0 — Name */}
      {step === 0 && (
        <div className="w-full text-center animate-fade-in space-y-6">
          <div className="animate-float text-8xl mb-2">🌿</div>
          <div>
            <h1 className="font-serif text-4xl font-bold text-forest-600">Mother Tongue</h1>
            <p className="text-terracotta-500 font-semibold mt-2 italic text-lg">
              Learn Bemba — the language of Zambia!
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-md p-6 text-left space-y-4">
            <label className="block font-bold text-ink text-lg">What's your name? 👋</label>
            <form onSubmit={handleNameNext}>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name…"
                className="w-full px-5 py-4 rounded-2xl border-2 border-terracotta-200 bg-cream focus:outline-none focus:border-terracotta-500 text-ink text-lg font-semibold"
                autoFocus
              />
              {error && <p className="text-terracotta-500 text-sm font-semibold mt-2">{error}</p>}
            </form>
            <button
              onClick={handleNameNext}
              className="w-full bg-terracotta-500 active:bg-terracotta-600 text-white font-bold py-4 rounded-2xl text-lg shadow-md transition-all active:scale-95"
            >
              Let's go! →
            </button>
          </div>
        </div>
      )}

      {/* Step 1 — Avatar */}
      {step === 1 && (
        <div className="w-full text-center animate-fade-in space-y-6">
          <div className="text-6xl">🎉</div>
          <div>
            <h2 className="font-serif text-3xl font-bold text-forest-600">Hi, {name}!</h2>
            <p className="text-ink/70 mt-2 text-base">Pick your learning buddy</p>
          </div>

          <div className="bg-white rounded-3xl shadow-md p-6 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {AVATARS.map(a => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`text-5xl py-4 rounded-2xl border-3 transition-all active:scale-95 ${
                    avatar === a
                      ? 'bg-terracotta-50 border-terracotta-500 scale-110 shadow-md'
                      : 'bg-cream border-transparent'
                  }`}
                  style={{ border: avatar === a ? '3px solid #c1440e' : '3px solid transparent' }}
                >
                  {a}
                </button>
              ))}
            </div>

            <div className="bg-forest-50 rounded-2xl p-4 text-left">
              <p className="text-forest-700 text-sm leading-relaxed font-medium">
                🌍 You're about to learn <strong>Icibemba</strong> — a beautiful language
                spoken by millions in Zambia. Every word connects you to your roots!
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="w-full bg-forest-600 active:bg-forest-700 text-white font-bold py-4 rounded-2xl text-lg shadow-md transition-all active:scale-95"
            >
              Start Learning! 🚀
            </button>
          </div>
        </div>
      )}

      {/* Step dots */}
      <div className="flex gap-2 mt-8">
        {[0, 1].map(i => (
          <div
            key={i}
            className={`rounded-full transition-all ${
              i === step ? 'w-8 h-2.5 bg-terracotta-500' : 'w-2.5 h-2.5 bg-terracotta-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
