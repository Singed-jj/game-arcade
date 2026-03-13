// src/audio/sound-manager.ts
export type SoundName = 'block-pop' | 'swap' | 'rocket' | 'bomb' | 'rainbow' | 'clear' | 'fail' | 'star'

export class SoundManager {
  private static _instance: SoundManager
  private ctx: AudioContext | null = null
  private buffers = new Map<SoundName, AudioBuffer>()
  private enabled = true

  static getInstance(): SoundManager {
    if (!SoundManager._instance) SoundManager._instance = new SoundManager()
    return SoundManager._instance
  }

  async preload(): Promise<void> {
    try {
      this.ctx = new AudioContext()
      const fileNames: SoundName[] = ['block-pop', 'swap', 'rocket', 'bomb', 'rainbow', 'clear', 'fail', 'star']
      await Promise.allSettled(fileNames.map(name => this.loadSound(name)))
      // bomb 파일 로드 실패 시 합성음 fallback
      if (!this.buffers.has('bomb')) {
        this.buffers.set('bomb', this.synthesizeBomb())
      }
    } catch (e) {
      console.warn('SoundManager: preload failed', e)
    }
  }

  private async loadSound(name: SoundName): Promise<void> {
    if (!this.ctx) return
    try {
      const res = await fetch(`/audio/${name}.mp3`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = await res.arrayBuffer()
      const decoded = await this.ctx.decodeAudioData(buf)
      this.buffers.set(name, decoded)
    } catch (e) {
      console.warn(`SoundManager: failed to load ${name}`, e)
    }
  }

  /** Web Audio API로 폭탄 효과음 합성 (짧은 폭발음) */
  private synthesizeBomb(): AudioBuffer {
    const ctx = this.ctx!
    const sampleRate = ctx.sampleRate
    const duration = 0.35
    const length = Math.floor(sampleRate * duration)
    const buffer = ctx.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      // 화이트 노이즈 기반 폭발음 + 급격한 감쇠
      const noise = (Math.random() * 2 - 1)
      const envelope = Math.exp(-t * 12) // 빠른 감쇠
      const lowFreq = Math.sin(2 * Math.PI * 60 * t) * Math.exp(-t * 8) // 저주파 쿵
      data[i] = (noise * 0.6 + lowFreq * 0.4) * envelope
    }

    return buffer
  }

  play(name: SoundName, pitchMultiplier = 1.0, maxDurationSec?: number): void {
    if (!this.enabled || !this.ctx || !this.buffers.has(name)) return
    try {
      // AudioContext가 suspended 상태면 resume
      if (this.ctx.state === 'suspended') this.ctx.resume()
      const source = this.ctx.createBufferSource()
      source.buffer = this.buffers.get(name)!
      source.playbackRate.value = pitchMultiplier
      source.connect(this.ctx.destination)
      source.start(0)
      // 파일이 너무 길 경우 강제 종료 (예: star.mp3 22초 → 0.5초로 제한)
      if (maxDurationSec !== undefined && maxDurationSec > 0) {
        source.stop(this.ctx.currentTime + maxDurationSec / pitchMultiplier)
      }
    } catch {
      // 무시 (사운드 실패는 게임에 영향 없음)
    }
  }

  setEnabled(v: boolean): void { this.enabled = v }
  isEnabled(): boolean { return this.enabled }
}

export const soundManager = SoundManager.getInstance()
