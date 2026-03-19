export type ChunkType =
  | 'DEFINITION'
  | 'OPERATING_PRINCIPLE'
  | 'COMPONENTS'
  | 'MAINTENANCE'
  | 'FAULTS'
  | 'HAZARDS'
  | 'CALIBRATION'
  | 'SAFETY_WARNING'
  | 'CLINICAL_USE'
  | 'CONTRAINDICATION'
  | 'GENERAL'

const KEYWORDS: Array<{ type: ChunkType; pattern: RegExp }> = [
  { type: 'SAFETY_WARNING', pattern: /\b(warning|caution|danger|hazard)\b/i },
  { type: 'CALIBRATION', pattern: /\b(calibration|calibrate)\b/i },
  { type: 'MAINTENANCE', pattern: /\b(maintenance|service interval|cleaning)\b/i },
  { type: 'FAULTS', pattern: /\b(fault|error code|malfunction|failure)\b/i },
  { type: 'COMPONENTS', pattern: /\b(component|module|assembly|part)\b/i },
  { type: 'OPERATING_PRINCIPLE', pattern: /\b(principle|mechanism|how it works|workflow)\b/i },
  { type: 'CLINICAL_USE', pattern: /\b(clinical use|indication|intended use)\b/i },
  { type: 'CONTRAINDICATION', pattern: /\b(contraindication|do not use|avoid in)\b/i },
  { type: 'DEFINITION', pattern: /\b(is defined as|definition|refers to)\b/i },
]

export function classifyChunk(content: string): ChunkType {
  for (const rule of KEYWORDS) {
    if (rule.pattern.test(content)) return rule.type
  }
  return 'GENERAL'
}

