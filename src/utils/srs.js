export const RATINGS = { AGAIN: 'again', HARD: 'hard', GOOD: 'good', EASY: 'easy' }

export function createCard(vocabularyId) {
  return {
    vocabularyId,
    interval: 1,
    ease: 2.5,
    repetitions: 0,
    nextReview: todayISO(),
    correctCount: 0,
    incorrectCount: 0,
  }
}

export function rateCard(card, rating) {
  let { interval, ease, repetitions } = card

  if (rating === RATINGS.AGAIN) {
    interval = 1
    ease = Math.max(1.3, ease - 0.2)
    repetitions = 0
  } else if (rating === RATINGS.HARD) {
    interval = Math.max(1, Math.ceil(interval * 1.2))
    ease = Math.max(1.3, ease - 0.15)
    repetitions = repetitions + 1
  } else if (rating === RATINGS.GOOD) {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.ceil(interval * ease)
    repetitions = repetitions + 1
  } else if (rating === RATINGS.EASY) {
    if (repetitions === 0) interval = 4
    else interval = Math.ceil(interval * ease * 1.3)
    ease = Math.min(ease + 0.15, 4.0)
    repetitions = repetitions + 1
  }

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)
  nextReview.setHours(0, 0, 0, 0)

  const correctCount =
    rating === RATINGS.AGAIN
      ? card.correctCount
      : card.correctCount + 1

  const incorrectCount =
    rating === RATINGS.AGAIN
      ? card.incorrectCount + 1
      : card.incorrectCount

  return { ...card, interval, ease, repetitions, nextReview: nextReview.toISOString(), correctCount, incorrectCount }
}

export function isDue(card) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return new Date(card.nextReview) <= now
}

export function getDueCards(deck) {
  return Object.entries(deck)
    .filter(([, card]) => isDue(card))
    .map(([, card]) => card)
}

export function getNextReviewTime(deck) {
  const cards = Object.values(deck)
  if (cards.length === 0) return null
  const upcoming = cards
    .filter((c) => !isDue(c))
    .sort((a, b) => new Date(a.nextReview) - new Date(b.nextReview))
  return upcoming.length > 0 ? new Date(upcoming[0].nextReview) : null
}

function todayISO() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}
