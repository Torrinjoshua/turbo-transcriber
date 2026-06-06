import { createCard } from './srs.js'

const KEYS = {
  PROFILE: 'mt_profile',
  PROGRESS: 'mt_progress',
  DECK: 'mt_deck',
  ACTIVITY: 'mt_activity',
  COUPLES: 'mt_couples',
  ONBOARDED: 'mt_onboarded',
}

function get(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export function isOnboarded() {
  return !!localStorage.getItem(KEYS.ONBOARDED)
}

export function markOnboarded() {
  localStorage.setItem(KEYS.ONBOARDED, '1')
}

export function getProfile() {
  return get(KEYS.PROFILE, { name: 'Learner', dailyGoal: 10, createdAt: new Date().toISOString() })
}

export function saveProfile(profile) {
  set(KEYS.PROFILE, profile)
}

export function getProgress() {
  return get(KEYS.PROGRESS, {
    xp: 0,
    streak: 0,
    lastStudyDate: null,
    lessonsCompleted: [],
    quizHistory: [],
    topicAccuracy: {},
  })
}

export function saveProgress(progress) {
  set(KEYS.PROGRESS, progress)
}

export function addXP(amount) {
  const p = getProgress()
  p.xp = (p.xp || 0) + amount
  updateStreak(p)
  saveProgress(p)
  return p
}

export function updateStreak(progress) {
  const today = todayString()
  if (progress.lastStudyDate === today) return
  if (progress.lastStudyDate === yesterdayString()) {
    progress.streak = (progress.streak || 0) + 1
  } else {
    progress.streak = 1
  }
  progress.lastStudyDate = today
}

export function markLessonComplete(lessonId) {
  const p = getProgress()
  if (!p.lessonsCompleted.includes(lessonId)) {
    p.lessonsCompleted.push(lessonId)
  }
  updateStreak(p)
  saveProgress(p)
}

export function recordQuiz(lessonId, score, total) {
  const p = getProgress()
  p.quizHistory = p.quizHistory || []
  p.quizHistory.push({ date: new Date().toISOString(), lessonId, score, total })
  if (p.quizHistory.length > 100) p.quizHistory = p.quizHistory.slice(-100)
  saveProgress(p)
}

export function getDeck() {
  return get(KEYS.DECK, {})
}

export function saveDeck(deck) {
  set(KEYS.DECK, deck)
}

export function addCardsToDeck(vocabularyIds) {
  const deck = getDeck()
  vocabularyIds.forEach((id) => {
    if (!deck[id]) deck[id] = createCard(id)
  })
  saveDeck(deck)
  return deck
}

export function updateCard(card) {
  const deck = getDeck()
  deck[card.vocabularyId] = card
  saveDeck(deck)
}

export function getActivityLog() {
  return get(KEYS.ACTIVITY, {})
}

export function logActivity() {
  const log = getActivityLog()
  log[todayString()] = true
  set(KEYS.ACTIVITY, log)
}

export function getCouplesSettings() {
  return get(KEYS.COUPLES, { player1: 'Player 1', player2: 'Player 2' })
}

export function saveCouplesSettings(settings) {
  set(KEYS.COUPLES, settings)
}

export function getAccuracyByTopic(lessonId) {
  const p = getProgress()
  return (p.topicAccuracy || {})[lessonId] || { correct: 0, total: 0 }
}

export function recordAccuracy(lessonId, correct, total) {
  const p = getProgress()
  p.topicAccuracy = p.topicAccuracy || {}
  const prev = p.topicAccuracy[lessonId] || { correct: 0, total: 0 }
  p.topicAccuracy[lessonId] = { correct: prev.correct + correct, total: prev.total + total }
  saveProgress(p)
}

export function saveLessonStars(lessonId, stars) {
  const p = getProgress()
  p.lessonStars = p.lessonStars || {}
  if ((p.lessonStars[lessonId] || 0) < stars) {
    p.lessonStars[lessonId] = stars
  }
  saveProgress(p)
}

export function getLessonStars(lessonId) {
  const p = getProgress()
  return (p.lessonStars || {})[lessonId] || 0
}

export function getAllLessonStars() {
  const p = getProgress()
  return p.lessonStars || {}
}

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayString() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}
