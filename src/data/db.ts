import { get, set } from 'idb-keyval'
import { createSampleStudySet } from './sampleData'
import type { GeneratedContent, StudyAttempt, StudySet } from './types'

const SETS_KEY = 'study-sets'
const GENERATED_KEY = 'generated-content'
const ATTEMPTS_KEY = 'study-attempts'

export const ensureSampleData = async () => {
  const sets = await getStudySets()
  if (sets.length === 0) {
    const sample = createSampleStudySet()
    await set(SETS_KEY, [sample])
  }
}

export const getStudySets = async (): Promise<StudySet[]> => {
  const sets = (await get(SETS_KEY)) as StudySet[] | undefined
  return Array.isArray(sets) ? sets : []
}

export const getStudySet = async (id: string): Promise<StudySet | undefined> => {
  const sets = await getStudySets()
  return sets.find((set) => set.id === id)
}

export const saveStudySet = async (studySet: StudySet): Promise<void> => {
  const sets = await getStudySets()
  const updated = sets.some((set) => set.id === studySet.id)
    ? sets.map((set) => (set.id === studySet.id ? studySet : set))
    : [...sets, studySet]
  await set(SETS_KEY, updated)
}

export const deleteStudySet = async (id: string): Promise<void> => {
  const sets = await getStudySets()
  const updated = sets.filter((set) => set.id !== id)
  await set(SETS_KEY, updated)
  const generated = await getGeneratedContentMap()
  if (generated[id]) {
    delete generated[id]
    await set(GENERATED_KEY, generated)
  }
  const attempts = await getAttempts()
  const filteredAttempts = attempts.filter((attempt) => attempt.setId !== id)
  await set(ATTEMPTS_KEY, filteredAttempts)
}

const getGeneratedContentMap = async (): Promise<Record<string, GeneratedContent>> => {
  const generated = (await get(GENERATED_KEY)) as Record<string, GeneratedContent> | undefined
  return generated ?? {}
}

export const getGeneratedContent = async (setId: string): Promise<GeneratedContent | undefined> => {
  const generated = await getGeneratedContentMap()
  return generated[setId]
}

export const saveGeneratedContent = async (
  setId: string,
  content: GeneratedContent,
): Promise<void> => {
  const generated = await getGeneratedContentMap()
  generated[setId] = content
  await set(GENERATED_KEY, generated)
}

export const getAttempts = async (): Promise<StudyAttempt[]> => {
  const attempts = (await get(ATTEMPTS_KEY)) as StudyAttempt[] | undefined
  return Array.isArray(attempts) ? attempts : []
}

export const getAttempt = async (id: string): Promise<StudyAttempt | undefined> => {
  const attempts = await getAttempts()
  return attempts.find((attempt) => attempt.id === id)
}

export const saveAttempt = async (attempt: StudyAttempt): Promise<void> => {
  const attempts = await getAttempts()
  await set(ATTEMPTS_KEY, [...attempts, attempt])
}

export const resetAllData = async (): Promise<void> => {
  await set(SETS_KEY, [])
  await set(GENERATED_KEY, {})
  await set(ATTEMPTS_KEY, [])
  await ensureSampleData()
}
