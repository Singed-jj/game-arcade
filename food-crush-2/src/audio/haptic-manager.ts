// src/audio/haptic-manager.ts
export type HapticEvent =
  | 'swap' | 'wrongSwap'
  | 'match' | 'cascade2' | 'cascade3' | 'cascade4plus'
  | 'rocket' | 'bomb' | 'rainbow'
  | 'clear' | 'fail' | 'star'

const VIBRATION_PATTERNS: Record<HapticEvent, number | number[]> = {
  swap:         10,
  wrongSwap:    [10, 50, 10],
  match:        15,
  cascade2:     20,
  cascade3:     [15, 30, 25],
  cascade4plus: [15, 20, 15, 20, 30],
  rocket:       [10, 10, 10, 10, 10, 10, 50],
  bomb:         [30, 0, 50],
  rainbow:      [10, 20, 10, 20, 10, 20, 80],
  clear:        [30, 50, 30, 50, 100],
  fail:         [50, 100, 30],
  star:         20,
}

const IOS_HAPTIC_MAP: Record<HapticEvent, string> = {
  swap: 'light',       wrongSwap: 'soft',    match: 'medium',
  cascade2: 'medium',  cascade3: 'heavy',    cascade4plus: 'rigid',
  rocket: 'rigid',     bomb: 'heavy',        rainbow: 'heavy',
  clear: 'heavy',      fail: 'medium',       star: 'medium',
}

export class HapticManager {
  private static _instance: HapticManager
  private enabled = true

  static getInstance(): HapticManager {
    if (!HapticManager._instance) HapticManager._instance = new HapticManager()
    return HapticManager._instance
  }

  trigger(event: HapticEvent): void {
    if (!this.enabled) return

    // iOS webkit bridge
    const webkit = (window as unknown as { webkit?: { messageHandlers?: { haptic?: { postMessage: (msg: string) => void } } } }).webkit
    if (webkit?.messageHandlers?.haptic) {
      webkit.messageHandlers.haptic.postMessage(IOS_HAPTIC_MAP[event])
      return
    }

    // Web Vibration API (Android)
    if (navigator.vibrate) {
      navigator.vibrate(VIBRATION_PATTERNS[event])
    }
  }

  setEnabled(v: boolean): void { this.enabled = v }
}

export const hapticManager = HapticManager.getInstance()
