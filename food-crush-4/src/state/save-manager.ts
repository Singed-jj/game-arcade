const SAVE_KEY = 'food-crush-2-save'

export interface SaveData {
  unlockedLevel: number
  hearts: number
  heartsLastUsedAt: number
  pieces: number
  tools: Record<string, number>
  levelStars: Record<number, number>
}

const DEFAULT_SAVE: SaveData = {
  unlockedLevel: 1,
  hearts: 3,
  heartsLastUsedAt: 0,
  pieces: 0,
  tools: { rocket: 0, bomb: 0, rainbow: 0 },
  levelStars: {},
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return { ...DEFAULT_SAVE }
    return { ...DEFAULT_SAVE, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_SAVE }
  }
}

export function saveSave(data: SaveData): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data))
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY)
}
