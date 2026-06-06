import { useState } from 'react'
import { PRONUNCIATION_RULES } from '../data/pronunciation.js'

export default function Pronunciation() {
  const [activeSection, setActiveSection] = useState(PRONUNCIATION_RULES[0].id)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl text-ink">Pronunciation Guide</h1>
        <p className="text-ink/60 text-sm mt-1">How to sound like a native speaker</p>
      </div>

      {/* Intro */}
      <div className="bg-forest-50 border border-forest-200 rounded-2xl p-5">
        <p className="text-ink/80 text-sm leading-relaxed">
          Icibemba is a phonetically consistent language — unlike English, what you see is (largely) what you
          say. Once you learn the core sounds, you can read and pronounce any Bemba word with confidence.
          Take your time with each section and practice the examples out loud.
        </p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 lg:mx-0 lg:px-0">
        {PRONUNCIATION_RULES.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeSection === section.id
                ? 'bg-terracotta-500 text-cream'
                : 'bg-white/80 border border-terracotta-100 text-ink hover:border-terracotta-300'
            }`}
          >
            {section.title.split(' — ')[0]}
          </button>
        ))}
      </div>

      {/* Active section */}
      {PRONUNCIATION_RULES.filter((s) => s.id === activeSection).map((section) => (
        <div key={section.id} className="space-y-4 animate-fade-in">
          <div className="bg-white/80 border border-terracotta-100 rounded-2xl p-5">
            <h2 className="font-serif text-xl text-ink mb-2">{section.title}</h2>
            <p className="text-ink/70 text-sm leading-relaxed">{section.description}</p>
          </div>

          {section.rules.map((rule, idx) => (
            <div key={idx} className="bg-white/80 border border-terracotta-100 rounded-2xl overflow-hidden">
              {/* Sound header */}
              <div className="bg-terracotta-500 px-5 py-4">
                <p className="text-cream font-bold text-xl font-serif tracking-wide">{rule.sound}</p>
              </div>

              {/* Description */}
              <div className="px-5 py-4 border-b border-terracotta-50">
                <p className="text-ink/80 text-sm leading-relaxed">{rule.description}</p>
              </div>

              {/* Examples */}
              <div className="px-5 py-4">
                <p className="text-xs text-ink/40 uppercase tracking-wider mb-3">Examples</p>
                <ul className="space-y-2">
                  {rule.examples.map((ex, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-terracotta-400 mt-0.5 flex-shrink-0">•</span>
                      <span className="text-ink/80 text-sm">{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Quick reference card */}
      <div className="bg-forest-600 text-cream rounded-2xl p-5">
        <h2 className="font-serif text-lg mb-4">Quick Reference</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['a', 'Like "father"'],
            ['e', 'Like "café"'],
            ['i', 'Like "meet"'],
            ['o', 'Like "go"'],
            ['u', 'Like "moon"'],
            ["ng'", 'Nasal + stop'],
            ['sh', 'Like "shoe"'],
            ['c', 'Like "church"'],
            ['bw', 'B + W blend'],
            ['fw', 'F + W blend'],
          ].map(([sound, meaning]) => (
            <div key={sound} className="flex items-center gap-3">
              <span className="font-bold font-serif text-gold-400 w-8 flex-shrink-0">{sound}</span>
              <span className="text-forest-200 text-xs">{meaning}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cultural note */}
      <div className="bg-terracotta-50 border border-terracotta-200 rounded-2xl p-5">
        <p className="text-ink/80 text-sm leading-relaxed italic">
          "The best way to learn a language is not from a book but from the mouths of those who live it.
          If you have elders, grandparents, or family in Zambia — call them. Let them speak. Let your
          ear absorb the music of Icibemba before your mind tries to understand it."
        </p>
      </div>
    </div>
  )
}
