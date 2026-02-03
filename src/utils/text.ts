const stopWords = new Set([
  'the','and','or','but','with','without','about','into','from','that','this','those','these','there','their','they','them','you','your','for','are','was','were','been','has','have','had','will','would','can','could','should','may','might','a','an','in','on','of','to','as','at','by','is','it','its','be','if','we','our','us','not','no','yes','do','does','did','so','such','than','then','which','while','also','over','under',
])

export const chunkText = (text: string, maxChars = 2000, maxChunks = 4): string[] => {
  if (!text) return []
  const normalized = text.replace(/\r\n/g, '\n')
  const paragraphs = normalized.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  const chunks: string[] = []
  let current = ''

  for (const paragraph of paragraphs) {
    if ((current + '\n\n' + paragraph).length > maxChars) {
      if (current) {
        chunks.push(current)
        current = ''
      }
    }
    if (paragraph.length > maxChars) {
      chunks.push(paragraph.slice(0, maxChars))
    } else {
      current = current ? `${current}\n\n${paragraph}` : paragraph
    }
    if (chunks.length >= maxChunks) break
  }

  if (current && chunks.length < maxChunks) {
    chunks.push(current)
  }

  return chunks.slice(0, maxChunks)
}

export const extractHeadings = (text: string): string[] => {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('#'))
    .map((line) => line.replace(/^#+\s*/, ''))
}

export const extractKeywords = (text: string, limit = 8): string[] => {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word))
  const counts = new Map<string, number>()
  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word)
}

export const summarizeNotes = (text: string, maxChars = 4000): string => {
  const chunks = chunkText(text, 1200, 4)
  const summary = chunks.join('\n\n')
  return summary.length > maxChars ? `${summary.slice(0, maxChars)}...` : summary
}
