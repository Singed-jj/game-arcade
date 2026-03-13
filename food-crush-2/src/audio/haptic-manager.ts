// src/audio/haptic-manager.ts
export type HapticEvent =
  | 'swap' | 'wrongSwap'
  | 'match' | 'cascade2' | 'cascade3' | 'cascade4plus'
  | 'rocket' | 'bomb' | 'rainbow'
  | 'clear' | 'fail' | 'star'

const VIBRATION_PATTERNS: Record<HapticEvent, number | number[]> = {
  swap:         30,
  wrongSwap:    [30, 60, 30],
  match:        30,
  cascade2:     40,
  cascade3:     [30, 40, 40],
  cascade4plus: [30, 20, 30, 20, 50],
  rocket:       [30, 15, 30, 15, 30, 15, 80],
  bomb:         [50, 0, 80],
  rainbow:      [30, 20, 30, 20, 30, 20, 100],
  clear:        [50, 60, 50, 60, 120],
  fail:         [80, 120, 50],
  star:         40,
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
      const result = navigator.vibrate(VIBRATION_PATTERNS[event])
      console.debug(`[haptic] ${event} → vibrate() = ${result}`)
    } else {
      console.debug('[haptic] navigator.vibrate not available')
    }
  }

  setEnabled(v: boolean): void { this.enabled = v }
}

export const hapticManager = HapticManager.getInstance()
