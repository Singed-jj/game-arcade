export class ScreenShake {
  private target: HTMLElement
  private intensity = 0
  private animId = 0

  constructor(target: HTMLElement) {
    this.target = target
  }

  shake(intensity: number, durationMs = 200): void {
    this.intensity = intensity
    const start = performance.now()
    const anim = (now: number) => {
      const elapsed = now - start
      if (elapsed > durationMs) {
        this.target.style.transform = ''
        return
      }
      const decay = 1 - elapsed / durationMs
      const dx = (Math.random() - 0.5) * this.intensity * decay * 2
      const dy = (Math.random() - 0.5) * this.intensity * decay * 2
      this.target.style.transform = `translate(${dx}px, ${dy}px)`
      this.animId = requestAnimationFrame(anim)
    }
    this.animId = requestAnimationFrame(anim)
  }

  destroy(): void { cancelAnimationFrame(this.animId) }
}
