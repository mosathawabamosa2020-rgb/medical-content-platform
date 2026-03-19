import type { GenerateContentInput } from '../contracts/api'

const PROFANITY = ['damn', 'shit', 'fuck']
const POLICY_SENSITIVE = ['self harm', 'bomb', 'bioweapon', 'hate speech']
const INJECTION_PATTERNS = [/ignore previous instructions/i, /system prompt/i, /developer mode/i]

const MAX_CONTEXT_SECTIONS = 12
const MAX_CONTEXT_CHARS = 14_000
const MAX_OUTPUT_CHARS = 2_000

type ScientificKey = 'definition' | 'workingPrinciple' | 'components' | 'advantages' | 'limitations' | 'useCases'
type ContextItem = { text: string; referenceId: string }

const CATEGORY_RULES: Array<{ key: ScientificKey; patterns: RegExp[] }> = [
  { key: 'definition', patterns: [/definition|is a|defined as|describes/i] },
  { key: 'workingPrinciple', patterns: [/works by|mechanism|principle|operates/i] },
  { key: 'components', patterns: [/component|includes|consists of|module|sensor/i] },
  { key: 'advantages', patterns: [/advantage|benefit|improve|reduce/i] },
  { key: 'limitations', patterns: [/limitation|risk|drawback|contraindication|warning/i] },
  { key: 'useCases', patterns: [/use case|used for|indicated|application|clinical/i] },
]

function normalizeTopic(topic: string) {
  return topic.replace(/\s+/g, ' ').trim().toLowerCase()
}

function safetyValidate(topic: string): { ok: boolean; code?: string } {
  const text = normalizeTopic(topic)
  if (PROFANITY.some((w) => text.includes(w))) return { ok: false, code: 'profanity_rejected' }
  if (POLICY_SENSITIVE.some((w) => text.includes(w))) return { ok: false, code: 'policy_sensitive_topic' }
  return { ok: true }
}

function sanitizeContext(text: string): string {
  let out = text
  for (const p of INJECTION_PATTERNS) out = out.replace(p, '')
  return out.replace(/\s+/g, ' ').trim()
}

function assembleContext(results: Array<{ snippet: string; reference: { id: string } }>) {
  const selected: ContextItem[] = []
  const seenRef = new Map<string, number>()
  let usedChars = 0
  for (const item of results) {
    if (selected.length >= MAX_CONTEXT_SECTIONS) break
    const refCount = seenRef.get(item.reference.id) || 0
    // Cross-reference diversity guard: max 3 snippets/reference
    if (refCount >= 3) continue
    const clean = sanitizeContext(item.snippet)
    if (!clean) continue
    if (usedChars + clean.length > MAX_CONTEXT_CHARS) break
    seenRef.set(item.reference.id, refCount + 1)
    selected.push({ text: clean, referenceId: item.reference.id })
    usedChars += clean.length
  }
  return selected
}

function hashTagsFromTopic(topic: string) {
  const parts = normalizeTopic(topic).split(/\s+/).slice(0, 4)
  return parts.map((p) => `#${p.replace(/[^a-z0-9\u0600-\u06FF]/gi, '')}`).filter(Boolean)
}

function classifyScientificBlocks(context: ContextItem[]) {
  const defaultRefs = Array.from(new Set(context.slice(0, 2).map((x) => x.referenceId)))
  const byKey: Record<ScientificKey, ContextItem[]> = {
    definition: [],
    workingPrinciple: [],
    components: [],
    advantages: [],
    limitations: [],
    useCases: [],
  }

  for (const item of context) {
    const text = item.text
    let matched = false
    for (const rule of CATEGORY_RULES) {
      if (rule.patterns.some((p) => p.test(text))) {
        byKey[rule.key].push(item)
        matched = true
        break
      }
    }
    if (!matched) byKey.definition.push(item)
  }

  const pick = (arr: ContextItem[], fallback: string) => {
    const first = arr[0]
    if (!first) return { text: fallback, referenceIds: defaultRefs }
    const refs = Array.from(new Set(arr.slice(0, 2).map((x) => x.referenceId)))
    return { text: first.text.slice(0, 260), referenceIds: refs }
  }
  return {
    definition: pick(byKey.definition, 'Definition pending further verified evidence.'),
    workingPrinciple: pick(byKey.workingPrinciple, 'Working principle requires additional validated context.'),
    components: pick(byKey.components, 'Core components were not explicitly identified in the selected context.'),
    advantages: pick(byKey.advantages, 'Advantages not explicitly available in selected verified snippets.'),
    limitations: pick(byKey.limitations, 'Limitations not explicitly available in selected verified snippets.'),
    useCases: pick(byKey.useCases, 'Use cases require additional verified references for precision.'),
  }
}

function buildReelScript(topic: string, scientific: ReturnType<typeof classifyScientificBlocks>) {
  const hook = `0-5s Hook: What makes ${topic} scientifically reliable in clinical workflows?`
  const explanationA = `5-20s Explanation: ${scientific.definition.text}`
  const explanationB = `20-35s Explanation: ${scientific.workingPrinciple.text}`
  const insight = `35-45s Key Insight: ${scientific.advantages.text} Limitation note: ${scientific.limitations.text}`
  const cta = `45-60s CTA: Review verified references before applying ${topic} in practice.`
  return {
    durationSec: 60,
    text: [hook, explanationA, explanationB, insight, cta].join('\n'),
    breakdown: [
      { at: '00:00', text: hook, referenceIds: scientific.definition.referenceIds },
      { at: '00:05', text: explanationA, referenceIds: scientific.definition.referenceIds },
      { at: '00:20', text: explanationB, referenceIds: scientific.workingPrinciple.referenceIds },
      { at: '00:35', text: insight, referenceIds: [...scientific.advantages.referenceIds, ...scientific.limitations.referenceIds] },
      { at: '00:45', text: cta, referenceIds: scientific.useCases.referenceIds },
    ],
  }
}

async function fetchPublicDomainImage(topic: string): Promise<string | null> {
  try {
    const q = encodeURIComponent(topic)
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json&origin=*`
    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) return null
    const data: any = await res.json()
    const pages = data?.query?.pages ? Object.values(data.query.pages) : []
    for (const page of pages as any[]) {
      const img = page?.imageinfo?.[0]?.url
      if (typeof img === 'string' && img.length > 0) return img
    }
    return null
  } catch {
    return null
  }
}

function buildImagePrompt(topic: string, scientific: ReturnType<typeof classifyScientificBlocks>) {
  return [
    `Professional scientific illustration of ${topic}.`,
    'Technical medical-device accuracy, real scale proportions.',
    `Visible components: ${scientific.components.text}`,
    'Setting: modern laboratory/clinical engineering workstation.',
    'Lighting: realistic neutral white, high detail, no artistic stylization.',
    `Mechanism hint: ${scientific.workingPrinciple.text}`,
  ].join(' ')
}

export async function buildGeneratedContent(
  input: GenerateContentInput,
  retrievalResults: Array<{ snippet: string; reference: { id: string; title: string | null } }>
) {
  const safety = safetyValidate(input.topic)
  if (!safety.ok) {
    return {
      failureCode: safety.code,
      contentType: input.contentType || 'generic',
      script: '',
      caption: '',
      hashtags: [] as string[],
      voiceoverText: '',
      references: [] as string[],
      imageSourceUrl: null as string | null,
      imagePrompt: null as string | null,
      reel: null as null | { durationSec: number; text: string; breakdown: Array<{ at: string; text: string; referenceIds: string[] }> },
      citationTrace: [] as Array<{ paragraph: string; referenceIds: string[] }>,
    }
  }

  const context = assembleContext(retrievalResults)
  const contextText = context.map((x) => x.text).join(' ')
  const hashtags = hashTagsFromTopic(input.topic)
  const scientific = classifyScientificBlocks(context)
  const contentType = input.contentType || 'scientific_device'
  const platformLabel = input.platform.toUpperCase()

  let script = ''
  let caption = ''
  let voiceoverText = ''
  let reel: null | { durationSec: number; text: string; breakdown: Array<{ at: string; text: string; referenceIds: string[] }> } = null
  let imageSourceUrl: string | null = null
  let imagePrompt: string | null = null
  const citationTrace: Array<{ paragraph: string; referenceIds: string[] }> = []

  if (contentType === 'scientific_device') {
    script = [
      `Definition: ${scientific.definition.text}`,
      `Working Principle: ${scientific.workingPrinciple.text}`,
      `Components: ${scientific.components.text}`,
      `Advantages: ${scientific.advantages.text}`,
      `Limitations: ${scientific.limitations.text}`,
      `Use Cases: ${scientific.useCases.text}`,
    ].join('\n\n')
    caption = `[${platformLabel}] ${input.topic}\nDefinition: ${scientific.definition.text}\nUse case: ${scientific.useCases.text}`
    voiceoverText = `Today we explain ${input.topic}. ${scientific.definition.text}. It works by ${scientific.workingPrinciple.text}. Key limitation: ${scientific.limitations.text}.`
    reel = input.includeReel ? buildReelScript(input.topic, scientific) : null
    citationTrace.push(
      { paragraph: 'Definition', referenceIds: scientific.definition.referenceIds },
      { paragraph: 'Working Principle', referenceIds: scientific.workingPrinciple.referenceIds },
      { paragraph: 'Components', referenceIds: scientific.components.referenceIds },
      { paragraph: 'Advantages', referenceIds: scientific.advantages.referenceIds },
      { paragraph: 'Limitations', referenceIds: scientific.limitations.referenceIds },
      { paragraph: 'Use Cases', referenceIds: scientific.useCases.referenceIds }
    )

    imageSourceUrl = await fetchPublicDomainImage(input.topic)
    if (!imageSourceUrl) {
      imagePrompt = buildImagePrompt(input.topic, scientific)
    }
  } else {
    const shortContext = contextText.slice(0, 600)
    script = `Hook: ${input.topic}\n\nKey insight: ${shortContext}\n\nAction: Apply this evidence in practice.`
    caption = `[${platformLabel}] ${input.topic} - Evidence-based summary in a ${input.tone} tone.`
    voiceoverText = `Today we discuss ${input.topic}. ${shortContext}. This guidance is based on verified references.`
  }

  return {
    failureCode: null as string | null,
    contentType,
    script: script.slice(0, MAX_OUTPUT_CHARS),
    caption: caption.slice(0, 700),
    hashtags: hashtags.slice(0, 10),
    voiceoverText: voiceoverText.slice(0, MAX_OUTPUT_CHARS),
    references: Array.from(new Set(retrievalResults.map((r) => r.reference.id))).slice(0, 8),
    imageSourceUrl,
    imagePrompt,
    reel,
    citationTrace: citationTrace.filter((c) => c.referenceIds.length > 0),
  }
}
