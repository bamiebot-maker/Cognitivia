import type { StudySet } from './types'
import { createId } from '../utils/id'

export const createSampleStudySet = (): StudySet => {
  const now = new Date().toISOString()
  return {
    id: createId(),
    title: 'Intro to Cellular Biology',
    subject: 'Biology',
    notes:
      '# Cells and Energy\n' +
      'Cells are the basic unit of life. Organelles perform specialized functions.\n\n' +
      '## Key organelles\n' +
      '- Nucleus: stores genetic material (DNA).\n' +
      '- Mitochondria: generate ATP through cellular respiration.\n' +
      '- Ribosomes: build proteins from amino acids.\n\n' +
      '## Energy flow\n' +
      'Photosynthesis converts light energy to chemical energy in plants.\n' +
      'Cellular respiration breaks glucose to produce ATP.\n\n' +
      '### Vocabulary\n' +
      'ATP, enzymes, membrane, diffusion, osmosis.',
    createdAt: now,
    updatedAt: now,
  }
}
