import fs from 'fs'
import path from 'path'

export type PlatformSettings = {
  general: {
    platformName: string
    defaultLanguage: 'ar' | 'en'
  }
  processing: {
    retrievalTopKDefault: number
    retrievalProbeDefault: number
  }
  ai: {
    openSourceMode: boolean
    providerHint: string
  }
  updatedAt: string
}

export type PlatformSettingsPatch = {
  general?: Partial<PlatformSettings['general']>
  processing?: Partial<PlatformSettings['processing']>
  ai?: Partial<PlatformSettings['ai']>
}

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'platform-settings.json')

function defaultSettings(): PlatformSettings {
  return {
    general: {
      platformName: 'Medical Content Platform',
      defaultLanguage: 'ar',
    },
    processing: {
      retrievalTopKDefault: 5,
      retrievalProbeDefault: 10,
    },
    ai: {
      openSourceMode: true,
      providerHint: 'local-or-openai',
    },
    updatedAt: new Date().toISOString(),
  }
}

function ensureParentDir() {
  const dir = path.dirname(SETTINGS_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

export function loadSettings(): PlatformSettings {
  ensureParentDir()
  if (!fs.existsSync(SETTINGS_PATH)) {
    const d = defaultSettings()
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(d, null, 2), 'utf8')
    return d
  }
  try {
    const raw = fs.readFileSync(SETTINGS_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    return {
      ...defaultSettings(),
      ...parsed,
      general: { ...defaultSettings().general, ...(parsed.general || {}) },
      processing: { ...defaultSettings().processing, ...(parsed.processing || {}) },
      ai: { ...defaultSettings().ai, ...(parsed.ai || {}) },
    }
  } catch {
    const d = defaultSettings()
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(d, null, 2), 'utf8')
    return d
  }
}

export function saveSettings(next: PlatformSettingsPatch): PlatformSettings {
  ensureParentDir()
  const current = loadSettings()
  const merged: PlatformSettings = {
    ...current,
    ...next,
    general: { ...current.general, ...(next.general || {}) },
    processing: { ...current.processing, ...(next.processing || {}) },
    ai: { ...current.ai, ...(next.ai || {}) },
    updatedAt: new Date().toISOString(),
  }
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(merged, null, 2), 'utf8')
  return merged
}
