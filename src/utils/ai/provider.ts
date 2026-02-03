import type { Flashcard, QuizQuestion, Settings } from '../../data/types'
import { chunkText, summarizeNotes } from '../text'
import {
  generateOfflineExplanation,
  generateOfflineFlashcards,
  generateOfflineQuiz,
  type GenerationOptions,
} from './offline'
import { validateFlashcards, validateQuizQuestions } from './schemas'

export type AIProvider = {
  generateFlashcards: (notes: string, options: GenerationOptions) => Promise<Flashcard[]>
  generateQuiz: (notes: string, options: GenerationOptions) => Promise<QuizQuestion[]>
  explainAnswer: (
    question: QuizQuestion,
    userAnswer: string,
    correctAnswer: string,
    notesContext: string,
  ) => Promise<string>
}

const buildNotesContext = (notes: string) => {
  const chunks = chunkText(notes, 1800, 4)
  return chunks.join('\n\n')
}

const safeParseJson = (text: string): unknown => {
  try {
    return JSON.parse(text)
  } catch {
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    const arrayStart = text.indexOf('[')
    const arrayEnd = text.lastIndexOf(']')
    const hasArray = arrayStart !== -1 && arrayEnd !== -1
    const sliceStart = hasArray ? arrayStart : start
    const sliceEnd = hasArray ? arrayEnd : end
    if (sliceStart !== -1 && sliceEnd !== -1 && sliceEnd > sliceStart) {
      const snippet = text.slice(sliceStart, sliceEnd + 1)
      try {
        return JSON.parse(snippet)
      } catch {
        return null
      }
    }
    return null
  }
}

const extractResponsePayload = (data: unknown): unknown => {
  if (!data || typeof data !== 'object') return data
  const record = data as Record<string, unknown>
  if (Array.isArray(record)) return record
  if (record.choices && Array.isArray(record.choices)) {
    const first = record.choices[0] as Record<string, unknown> | undefined
    const message = first?.message as Record<string, unknown> | undefined
    const content = message?.content as string | undefined
    return content ?? record
  }
  if (record.output_text) return record.output_text
  if (record.result) return record.result
  return record
}

const callChatCompletion = async (
  settings: Settings,
  systemPrompt: string,
  userPrompt: string,
): Promise<unknown> => {
  const response = await fetch(settings.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(settings.apiKey ? { Authorization: `Bearer ${settings.apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: settings.model,
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  })
  if (!response.ok) {
    throw new Error(`AI request failed (${response.status})`)
  }
  const text = await response.text()
  const parsed = safeParseJson(text)
  const payload = extractResponsePayload(parsed ?? text)
  if (typeof payload === 'string') {
    return safeParseJson(payload) ?? payload
  }
  return payload
}

export const createAIProvider = (settings: Settings): AIProvider => {
  const canCallRemote = Boolean(settings.apiUrl && settings.apiKey)

  const generateFlashcards = async (notes: string, options: GenerationOptions) => {
    if (!canCallRemote) {
      return generateOfflineFlashcards(notes, options)
    }
    try {
      const notesContext = buildNotesContext(notes)
      const systemPrompt =
        'You are a study assistant. Respond with ONLY valid JSON. No markdown, no prose.'
      const userPrompt = [
        'Create flashcards from the notes.',
        `Return a JSON array of objects with keys: question, answer, topic.`,
        `Count: ${options.count}. Difficulty: ${options.difficulty}.`,
        options.focusTopic ? `Focus topic: ${options.focusTopic}.` : '',
        `Notes:\n${notesContext}`,
      ]
        .filter(Boolean)
        .join('\n')
      const payload = await callChatCompletion(settings, systemPrompt, userPrompt)
      const candidates =
        (payload as Record<string, unknown>)?.flashcards ??
        (payload as Record<string, unknown>)?.items ??
        payload
      const validated = validateFlashcards(candidates)
      return validated.length ? validated : generateOfflineFlashcards(notes, options)
    } catch {
      return generateOfflineFlashcards(notes, options)
    }
  }

  const generateQuiz = async (notes: string, options: GenerationOptions) => {
    if (!canCallRemote) {
      return generateOfflineQuiz(notes, options)
    }
    try {
      const notesContext = buildNotesContext(notes)
      const systemPrompt =
        'You are a study assistant. Respond with ONLY valid JSON. No markdown, no prose.'
      const userPrompt = [
        'Create quiz questions from the notes.',
        `Return a JSON array with keys: type (mcq|short), prompt, choices, answer, explanation, topic, difficulty.`,
        `Count: ${options.count}. Difficulty: ${options.difficulty}.`,
        options.focusTopic ? `Focus topic: ${options.focusTopic}.` : '',
        `Notes:\n${notesContext}`,
      ]
        .filter(Boolean)
        .join('\n')
      const payload = await callChatCompletion(settings, systemPrompt, userPrompt)
      const candidates =
        (payload as Record<string, unknown>)?.questions ??
        (payload as Record<string, unknown>)?.items ??
        payload
      const validated = validateQuizQuestions(candidates)
      return validated.length ? validated : generateOfflineQuiz(notes, options)
    } catch {
      return generateOfflineQuiz(notes, options)
    }
  }

  const explainAnswer = async (
    question: QuizQuestion,
    userAnswer: string,
    correctAnswer: string,
    notesContext: string,
  ) => {
    if (!canCallRemote) {
      return generateOfflineExplanation(question, userAnswer, correctAnswer, notesContext)
    }
    try {
      const systemPrompt =
        'You are a tutor. Respond with plain text explanation only (no markdown).'
      const userPrompt = [
        `Question: ${question.prompt}`,
        `Correct answer: ${correctAnswer}`,
        `User answer: ${userAnswer || 'No answer provided'}`,
        `Notes context: ${summarizeNotes(notesContext, 1000)}`,
        'Explain why the correct answer is correct and why the user answer is incorrect or incomplete.',
      ].join('\n')
      const payload = await callChatCompletion(settings, systemPrompt, userPrompt)
      if (typeof payload === 'string') {
        return payload
      }
      if (payload && typeof payload === 'object' && 'explanation' in payload) {
        return String((payload as Record<string, unknown>).explanation)
      }
      return generateOfflineExplanation(question, userAnswer, correctAnswer, notesContext)
    } catch {
      return generateOfflineExplanation(question, userAnswer, correctAnswer, notesContext)
    }
  }

  return { generateFlashcards, generateQuiz, explainAnswer }
}
