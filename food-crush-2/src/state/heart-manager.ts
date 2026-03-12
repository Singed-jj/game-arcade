import { MAX_HEARTS, HEART_RECOVERY_MS } from '@/core/types'
import { eventBus } from './event-bus'

export class HeartManager {
  private hearts = MAX_HEARTS
  private lastUsedAt = 0
  private recoveryTimer: ReturnType<typeof setInterval> | null = null

  getHearts(): number { return this.hearts }

  useHeart(): boolean {
    if (this.hearts <= 0) {
      eventBus.emit('heart:empty')
      return false
    }
    this.hearts--
    this.lastUsedAt = Date.now()
    eventBus.emit('heart:changed', { current: this.hearts, max: MAX_HEARTS })
    if (this.hearts < MAX_HEARTS) this.startRecovery()
    return true
  }

  refillAll(): void {
    this.hearts = MAX_HEARTS
    this.stopRecovery()
    eventBus.emit('heart:changed', { current: this.hearts, max: MAX_HEARTS })
  }

  addHeart(count = 1): void {
    this.hearts = Math.min(MAX_HEARTS, this.hearts + count)
    eventBus.emit('heart:changed', { current: this.hearts, max: MAX_HEARTS })
    if (this.hearts >= MAX_HEARTS) this.stopRecovery()
  }

  getRecoveryTimeMs(): number {
    if (this.hearts >= MAX_HEARTS) return 0
    const elapsed = Date.now() - this.lastUsedAt
    return Math.max(0, HEART_RECOVERY_MS - elapsed)
  }

  private startRecovery(): void {
    if (this.recoveryTimer) return
    this.recoveryTimer = setInterval(() => {
      if (this.hearts < MAX_HEARTS) {
        this.addHeart()
        eventBus.emit('heart:recovered')
      }
      if (this.hearts >= MAX_HEARTS) this.stopRecovery()
    }, HEART_RECOVERY_MS)
  }

  private stopRecovery(): void {
    if (this.recoveryTimer) {
      clearInterval(this.recoveryTimer)
      this.recoveryTimer = null
    }
  }

  loadState(hearts: number, lastUsedAt: number): void {
    this.hearts = hearts
    this.lastUsedAt = lastUsedAt
    if (this.hearts < MAX_HEARTS && lastUsedAt > 0) {
      const elapsed = Date.now() - lastUsedAt
      const recovered = Math.floor(elapsed / HEART_RECOVERY_MS)
      if (recovered > 0) {
        this.hearts = Math.min(MAX_HEARTS, this.hearts + recovered)
        this.lastUsedAt = Date.now() - (elapsed % HEART_RECOVERY_MS)
      }
    }
    eventBus.emit('heart:changed', { current: this.hearts, max: MAX_HEARTS })
    if (this.hearts < MAX_HEARTS) this.startRecovery()
  }

  getLastUsedAt(): number { return this.lastUsedAt }

  destroy(): void { this.stopRecovery() }
}
