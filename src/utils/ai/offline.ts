import type { Difficulty, Flashcard, QuizQuestion } from '../../data/types'
import { extractHeadings, extractKeywords, summarizeNotes } from '../text'

export type GenerationOptions = {
  count: number
  difficulty: Difficulty
  focusTopic?: string
}

const buildTopics = (notes: string, focusTopic?: string) => {
  const headings = extractHeadings(notes)
  const keywords = extractKeywords(notes)
  const topics = [...headings, ...keywords]
  if (focusTopic) {
    topics.unshift(focusTopic)
  }
  return topics.length ? topics : ['General Concepts']
}

const pickSentenceForTopic = (notes: string, topic: string) => {
  const sentences = notes
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
  const match =
    sentences.find((sentence) => sentence.toLowerCase().includes(topic.toLowerCase())) ??
    sentences[0]
  return match ?? `Review notes on ${topic}.`
}

export const generateOfflineFlashcards = (
  notes: string,
  options: GenerationOptions,
): Flashcard[] => {
  const topics = buildTopics(notes, options.focusTopic)
  const summary = summarizeNotes(notes, 1200)
  const cards: Flashcard[] = []
  for (let i = 0; i < options.count; i += 1) {
    const topic = topics[i % topics.length]
    const sentence = pickSentenceForTopic(summary, topic)
    cards.push({
      question: `What should you remember about ${topic}?`,
      answer: sentence,
      topic,
    })
  }
  return cards
}

export const generateOfflineQuiz = (notes: string, options: GenerationOptions): QuizQuestion[] => {
  const topics = buildTopics(notes, options.focusTopic)
  const keywords = extractKeywords(notes, 12)
  const summary = summarizeNotes(notes, 1600)
  const questions: QuizQuestion[] = []

  for (let i = 0; i < options.count; i += 1) {
    const topic = topics[i % topics.length]
    const sentence = pickSentenceForTopic(summary, topic)
    if (i % 2 === 0) {
      const correct = sentence
      const distractors = keywords
        .filter((word) => word.toLowerCase() !== topic.toLowerCase())
        .slice(0, 3)
        .map((word) => `It is closely related to ${word}.`)
      const choices = [correct, ...distractors].slice(0, 4)
      questions.push({
        type: 'mcq',
        prompt: `Which statement best matches ${topic}?`,
        choices: choices.length < 2 ? [correct, 'Review the notes for clarity.'] : choices,
        answer: correct,
        explanation: `The notes highlight: ${sentence}`,
        topic,
        difficulty: options.difficulty,
      })
    } else {
      questions.push({
        type: 'short',
        prompt: `Explain ${topic} in 2-3 sentences.`,
        choices: [],
        answer: sentence,
        explanation: `Use this idea from the notes: ${sentence}`,
        topic,
        difficulty: options.difficulty,
      })
    }
  }
  return questions
}

export const generateOfflineExplanation = (
  question: QuizQuestion,
  userAnswer: string,
  correctAnswer: string,
  notesContext: string,
): string => {
  const guidance = userAnswer
    ? `Your answer was: "${userAnswer}". Compare it to the key idea.`
    : 'Review the key idea below and try explaining it in your own words.'
  return [
    `Correct answer: ${correctAnswer}`,
    `Why: ${question.explanation || 'The notes point to this concept as the main idea.'}`,
    guidance,
    notesContext ? `Notes context: ${notesContext.slice(0, 220)}...` : '',
  ]
    .filter(Boolean)
    .join('\n')
}
