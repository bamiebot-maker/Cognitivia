import { z } from 'zod'
import type { Flashcard, QuizQuestion } from '../../data/types'

const flashcardSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  topic: z.string().min(1),
})

const quizQuestionSchema = z.object({
  type: z.enum(['mcq', 'short']),
  prompt: z.string().min(1),
  choices: z.array(z.string()).default([]),
  answer: z.string().min(1),
  explanation: z.string().min(1),
  topic: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
})

export const validateFlashcards = (input: unknown): Flashcard[] => {
  const result = z.array(flashcardSchema).safeParse(input)
  return result.success ? result.data : []
}

export const validateQuizQuestions = (input: unknown): QuizQuestion[] => {
  const result = z.array(quizQuestionSchema).safeParse(input)
  if (!result.success) {
    return []
  }
  return result.data.map((item) => ({
    ...item,
    choices: item.type === 'short' ? [] : item.choices,
  }))
}
