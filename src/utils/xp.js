export const LEVELS = [
  { min: 0, max: 99, name: 'Mwana', subtitle: 'Child', description: 'Every journey begins with a first word.' },
  { min: 100, max: 249, name: 'Umusunga', subtitle: 'Youth', description: 'You are finding your voice.' },
  { min: 250, max: 499, name: 'Umuntu', subtitle: 'Person', description: 'You are becoming whole in the language.' },
  { min: 500, max: 999, name: 'Mwine', subtitle: 'Owner', description: 'The words are becoming yours.' },
  { min: 1000, max: 1999, name: "Ng'anga", subtitle: 'Healer / Wise One', description: 'Your roots run deep.' },
  { min: 2000, max: Infinity, name: 'Mulopwe', subtitle: 'Chief / Leader', description: 'You carry the language forward.' },
]

export const XP_REWARDS = {
  LESSON_COMPLETE: 20,
  FLASHCARD_GOOD: 2,
  QUIZ_COMPLETE: 15,
  COUPLES_WIN: 25,
}

export function getLevel(xp) {
  return LEVELS.find((l) => xp >= l.min && xp <= l.max) || LEVELS[LEVELS.length - 1]
}

export function getNextLevel(xp) {
  const idx = LEVELS.findIndex((l) => xp >= l.min && xp <= l.max)
  return LEVELS[idx + 1] || null
}

export function getProgressToNextLevel(xp) {
  const current = getLevel(xp)
  if (current.max === Infinity) return 100
  const range = current.max - current.min + 1
  const earned = xp - current.min
  return Math.min(100, Math.round((earned / range) * 100))
}
