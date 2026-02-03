export type Difficulty = 'easy' | 'medium' | 'hard'

export type StudySet = {
  id: string
  title: string
  subject?: string
  notes: string
  createdAt: string
  updatedAt: string
}

export type Flashcard = {
  question: string
  answer: string
  topic: string
}

export type QuizQuestion = {
  type: 'mcq' | 'short'
  prompt: string
  choices: string[]
  answer: string
  explanation: string
  topic: string
  difficulty: Difficulty
}

export type GeneratedContent = {
  setId: string
  flashcards: Flashcard[]
  quiz: QuizQuestion[]
  updatedAt: string
}

export type AttemptResult = {
  question: QuizQuestion
  userAnswer: string
  correct: boolean
}

export type StudyAttempt = {
  id: string
  setId: string
  createdAt: string
  total: number
  correct: number
  results: AttemptResult[]
  topicsMissed: string[]
}

export type Settings = {
  theme: 'dark' | 'light'
  difficulty: Difficulty
  apiKey: string
  apiUrl: string
  model: string
}
