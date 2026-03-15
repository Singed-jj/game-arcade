import type { Position } from '@/core/types'
import { BLOCK_COLORS, type BlockType, CELL_SIZE, BOARD_COLS, BOARD_ROWS } from '@/core/types'

interface Particle {
  x: number; y: number; vx: number; vy: number
  life: number; maxLife: number; size: number; color: string
  isStreak?: boolean  // 선형 스파크
  isChunk?: boolean   // 사각 잔해
}

// tick loop 안에서 매 프레임 draw하는 트윈 (rAF 경쟁 방지)
type TweenFn = (ctx: CanvasRenderingContext2D, now: number) => boolean

export class EffectsLayer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private particles: Particle[] = []
  private flashes: Array<{ x: number; y: number; radius: number; maxRadius: number; life: number }> = []
  private tweens: TweenFn[] = []  // tick-synchronized draw calls
  private animId = 0

  constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas')
    this.canvas.className = 'absolute inset-0 pointer-events-none z-30'
    this.canvas.width = container.clientWidth
    this.canvas.height = container.clientHeight
    container.appendChild(this.canvas)
    this.ctx = this.canvas.getContext('2d')!
    this.tick()
  }

  get boardOffsetX(): number { return (this.canvas.width - BOARD_COLS * CELL_SIZE) / 2 }
  get boardOffsetY(): number { return (this.canvas.height - BOARD_ROWS * CELL_SIZE) / 2 }
  get boardCenterX(): number { return this.canvas.width / 2 }
  get boardCenterY(): number { return this.canvas.height / 2 }

  spawnBlockPop(pos: Position, blockType: BlockType): void {
    const cx = this.boardOffsetX + pos.col * CELL_SIZE + CELL_SIZE / 2
    const cy = this.boardOffsetY + pos.row * CELL_SIZE + CELL_SIZE / 2
    const color = BLOCK_COLORS[blockType]
    const count = 8 + Math.floor(Math.random() * 5)
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3
      const speed = 2 + Math.random() * 3
      this.particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1, maxLife: 1, size: 3 + Math.random() * 2, color,
      })
    }
  }

  flash(color = 'rgba(255,255,255,0.3)'): void {
    this.ctx.fillStyle = color
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  shockwave(pos: Position): void {
    const cx = this.boardOffsetX + pos.col * CELL_SIZE + CELL_SIZE / 2
    const cy = this.boardOffsetY + pos.row * CELL_SIZE + CELL_SIZE / 2
    let radius = 0
    const maxRadius = CELL_SIZE * 2
    const draw = () => {
      radius += 8
      if (radius > maxRadius) return
      this.ctx.beginPath()
      this.ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      this.ctx.strokeStyle = `rgba(255,200,0,${1 - radius / maxRadius})`
      this.ctx.lineWidth = 3
      this.ctx.stroke()
      requestAnimationFrame(draw)
    }
    draw()
  }

  /** Royal Match TNT 스타일 폭탄 이펙트 — tick-synchronized */
  bombExplosion(pos: Position): Promise<void> {
    const cx = this.boardOffsetX + pos.col * CELL_SIZE + CELL_SIZE / 2
    const cy = this.boardOffsetY + pos.row * CELL_SIZE + CELL_SIZE / 2
    const now = performance.now()

    // 1) 파이어코어 트윈 (tick 안에서 draw)
    this.tweens.push(this.makeBombFireCoreTween(cx, cy, now))

    // 2) 쇼크웨이브 링 4개 (시간차 — 더 촘촘)
    for (let i = 0; i < 4; i++) {
      this.tweens.push(this.makeBombRingTween(cx, cy, i, now + i * 40))
    }

    // 3) 화이트 임팩트 플래시 (첫 160ms) — canvas 전체
    this.tweens.push((ctx, t) => {
      const elapsed = t - now
      if (elapsed > 160) return false
      const alpha = 0.75 * (1 - elapsed / 160)
      ctx.fillStyle = `rgba(255,255,220,${alpha})`
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
      return true
    })

    // 3b) 즉각 충격파 링 (t=0, 매우 빠른 대형 링)
    this.tweens.push(this.makeImpactRingTween(cx, cy, now))

    // 3c) 잔열 발광 애프터글로우 (300ms ~ 800ms)
    this.tweens.push((ctx, t) => {
      const elapsed = t - now - 300
      if (elapsed < 0) return true
      if (elapsed > 500) return false
      const alpha = 0.35 * (1 - elapsed / 500)
      const radius = CELL_SIZE * 2.5
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
      grad.addColorStop(0,   `rgba(255,180,40,${alpha})`)
      grad.addColorStop(0.5, `rgba(200,80,0,${alpha * 0.6})`)
      grad.addColorStop(1,   `rgba(120,30,0,0)`)
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fill()
      return true
    })

    // 3d) 2차 스파크 파동 (100ms 뒤)
    setTimeout(() => {
      const colors2 = ['#ffff99', '#ffee55', '#ffffff', '#ffcc22']
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.3
        const speed = 5 + Math.random() * 6
        this.particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          life: 0.3 + Math.random() * 0.2, maxLife: 0.5,
          size: 1 + Math.random() * 1.5,
          color: colors2[Math.floor(Math.random() * colors2.length)],
          isStreak: true,
        })
      }
    }, 100)

    // 4) 불꽃 파티클 (36개, 고속 — 모바일 성능 최적화)
    const fireColors = ['#ff6600', '#ff9900', '#ffcc00', '#ff4400', '#ff2200', '#ffee00', '#ff8800', '#ffdd00']
    for (let i = 0; i < 36; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 4 + Math.random() * 11
      const color = fireColors[Math.floor(Math.random() * fireColors.length)]
      this.particles.push({
        x: cx + (Math.random() - 0.5) * 16,
        y: cy + (Math.random() - 0.5) * 16,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 4,
        life: 0.65 + Math.random() * 0.55, maxLife: 1.2,
        size: 2 + Math.random() * 6, color,
      })
    }

    // 5) 연기 파티클 (12개, 큰 구체)
    const smokeColors = ['#665544', '#554433', '#443322', '#776655', '#997755']
    for (let i = 0; i < 12; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.0
      const speed = 0.6 + Math.random() * 2.5
      const color = smokeColors[Math.floor(Math.random() * smokeColors.length)]
      this.particles.push({
        x: cx + (Math.random() - 0.5) * 28,
        y: cy + (Math.random() - 0.5) * 14,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.8 + Math.random() * 0.5, maxLife: 1.3,
        size: 8 + Math.random() * 14, color,
      })
    }

    // 6) 스트리크 스파크 — 선형 (16방향)
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.15
      const speed = 9 + Math.random() * 9
      const color = Math.random() > 0.4 ? '#ffffff' : '#ffe966'
      this.particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.35 + Math.random() * 0.25, maxLife: 0.6,
        size: 1.5 + Math.random() * 1.5, color, isStreak: true,
      })
    }

    // 7) 데브리 청크 (블록 모양 잔해, 14개 — 바운스 포함)
    const chunkColors = ['#ff6600', '#ff9933', '#cc4400', '#ff3300', '#884400', '#ffaa22']
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 3 + Math.random() * 7
      const color = chunkColors[Math.floor(Math.random() * chunkColors.length)]
      this.particles.push({
        x: cx + (Math.random() - 0.5) * 14,
        y: cy + (Math.random() - 0.5) * 14,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        life: 0.55 + Math.random() * 0.45, maxLife: 1.0,
        size: 4 + Math.random() * 7, color, isChunk: true,
      })
    }

    return new Promise(resolve => setTimeout(resolve, 550))
  }

  private makeImpactRingTween(cx: number, cy: number, startTime: number): TweenFn {
    // t=0에서 즉각 팽창하는 초고속 흰 링 (충격파 느낌)
    let radius = CELL_SIZE * 0.2
    const maxRadius = CELL_SIZE * 4.5
    return (ctx, now) => {
      if (now < startTime) return true
      const progress = radius / maxRadius
      if (progress >= 1) return false
      radius += (maxRadius - radius) * 0.30 + 5
      const alpha = Math.max(0, (1 - progress) * 0.85)
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(255,255,200,${alpha})`
      ctx.lineWidth = (1 - progress) * 10 + 1
      ctx.stroke()
      return true
    }
  }

  private makeBombFireCoreTween(cx: number, cy: number, startTime: number): TweenFn {
    const duration = 320
    const maxR = CELL_SIZE * 3.0
    return (ctx, now) => {
      const t = Math.min(1, (now - startTime) / duration)
      if (t <= 0) return true
      const grow = t < 0.3 ? t / 0.3 : 1
      const fade = t < 0.3 ? 1 : 1 - (t - 0.3) / 0.7
      if (fade <= 0) return false
      const radius = maxR * grow
      if (radius < 1) return true
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
      grad.addColorStop(0,    `rgba(255,255,255,${fade})`)
      grad.addColorStop(0.15, `rgba(255,250,200,${fade})`)
      grad.addColorStop(0.35, `rgba(255,220,60,${fade * 0.95})`)
      grad.addColorStop(0.6,  `rgba(255,90,0,${fade * 0.8})`)
      grad.addColorStop(0.82, `rgba(160,15,0,${fade * 0.45})`)
      grad.addColorStop(1,    `rgba(80,0,0,0)`)
      ctx.globalAlpha = 1
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
      return t < 1
    }
  }

  private makeBombRingTween(cx: number, cy: number, index: number, startTime: number): TweenFn {
    const RING_COLORS: [number, number, number][] = [
      [255, 245, 150],
      [255, 200, 60],
      [255, 130, 20],
      [220, 70,  0],
    ]
    const [r, g, b] = RING_COLORS[index]
    const maxRadius = CELL_SIZE * (2.8 + index * 0.5)
    let radius = CELL_SIZE * 0.3
    return (ctx, now) => {
      if (now < startTime) return true
      const progress = radius / maxRadius
      if (progress >= 1) return false
      radius += (maxRadius - radius) * 0.22 + 3.5
      const alpha = (1 - progress) * 0.95
      const lineW = (1 - progress) * 7 + 1
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`
      ctx.lineWidth = lineW
      ctx.stroke()
      return true
    }
  }

  blockFlash(pos: Position): void {
    const cx = this.boardOffsetX + pos.col * CELL_SIZE + CELL_SIZE / 2
    const cy = this.boardOffsetY + pos.row * CELL_SIZE + CELL_SIZE / 2
    this.flashes.push({ x: cx, y: cy, radius: 4, maxRadius: 28, life: 1.0 })
  }

  private drawFlashes(): void {
    for (const f of this.flashes) {
      const r = f.maxRadius * (1 - f.life) + f.radius
      this.ctx.globalAlpha = f.life * 0.6
      this.ctx.fillStyle = 'white'
      this.ctx.beginPath()
      this.ctx.arc(f.x, f.y, r, 0, Math.PI * 2)
      this.ctx.fill()
      f.life -= 0.1
    }
    this.flashes = this.flashes.filter(f => f.life > 0)
    this.ctx.globalAlpha = 1
  }

  rocketBeam(startPos: Position, isHorizontal: boolean, onComplete: () => void): void {
    const offX = this.boardOffsetX
    const offY = this.boardOffsetY
    const boardW = BOARD_COLS * CELL_SIZE
    const boardH = BOARD_ROWS * CELL_SIZE

    let startX: number, startY: number, endX: number, endY: number
    if (isHorizontal) {
      startY = offY + startPos.row * CELL_SIZE + CELL_SIZE / 2
      startX = offX; endX = offX + boardW; endY = startY
    } else {
      startX = offX + startPos.col * CELL_SIZE + CELL_SIZE / 2
      startY = offY; endX = startX; endY = offY + boardH
    }

    const duration = 300
    const startTime = performance.now()
    let completed = false

    // tick-synchronized tween (clearRect 경쟁 방지)
    this.tweens.push((ctx, now) => {
      const progress = Math.min(1, (now - startTime) / duration)
      const curX = startX + (endX - startX) * progress
      const curY = startY + (endY - startY) * progress

      const grad = ctx.createLinearGradient(startX, startY, curX, curY)
      grad.addColorStop(0,   'rgba(255,200,50,0)')
      grad.addColorStop(0.7, 'rgba(255,200,50,0.8)')
      grad.addColorStop(1,   'rgba(255,255,255,1)')

      ctx.globalAlpha = 0.8
      ctx.fillStyle = grad
      if (isHorizontal) {
        ctx.fillRect(startX, startY - 6, curX - startX, 12)
      } else {
        ctx.fillRect(startX - 6, startY, 12, curY - startY)
      }
      ctx.globalAlpha = 1

      if (progress >= 1 && !completed) {
        completed = true
        onComplete()
        return false
      }
      return progress < 1
    })
  }

  rainbowSuckIn(positions: Position[], centerX: number, centerY: number): Promise<void> {
    const RAINBOW_PALETTE = ['#ff0080', '#ffd700', '#00e676', '#00b0ff', '#f97316']
    return new Promise(resolve => {
      const DURATION = 400
      positions.forEach((pos, i) => {
        const elCX = this.boardOffsetX + pos.col * CELL_SIZE + CELL_SIZE / 2
        const elCY = this.boardOffsetY + pos.row * CELL_SIZE + CELL_SIZE / 2
        const dX = centerX - elCX
        const dY = centerY - elCY
        const color = RAINBOW_PALETTE[i % RAINBOW_PALETTE.length]

        setTimeout(() => {
          for (let j = 0; j < 4; j++) {
            const angle = Math.atan2(dY, dX) + (Math.random() - 0.5) * 0.5
            const speed = Math.sqrt(dX * dX + dY * dY) / (DURATION / 16)
            this.particles.push({
              x: elCX, y: elCY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1, maxLife: 1, size: 3 + Math.random() * 2, color,
            })
          }
        }, i * 15)
      })
      setTimeout(resolve, DURATION + positions.length * 15)
    })
  }

  showScoreFloat(score: number, x: number, y: number): void {
    const el = document.createElement('div')
    el.textContent = `+${score}`
    el.className = 'animate-score-float absolute font-bold pointer-events-none z-40'
    el.style.cssText = `left:${x}px;top:${y}px;font-size:18px;color:#FFD600;text-shadow:0 2px 4px rgba(0,0,0,0.5);`
    this.canvas.parentElement?.appendChild(el)
    setTimeout(() => el.remove(), 500)
  }

  showText(text: string, x: number, y: number, fontSize: number, color: string): void {
    const el = document.createElement('div')
    el.textContent = text
    el.className = 'animate-cascade-text absolute font-bold pointer-events-none z-40'
    const baseStyle = `left:${x}px;top:${y}px;font-size:${fontSize}px;white-space:nowrap;`
    if (color === 'rainbow') {
      el.style.cssText = baseStyle + 'background:linear-gradient(90deg,#ff0080,#ff8c00,#ffd700,#00e676,#00b0ff,#e040fb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 8px rgba(255,200,0,0.8))'
    } else {
      el.style.cssText = baseStyle + `color:${color};text-shadow:0 2px 8px rgba(0,0,0,0.5), 0 0 16px ${color}`
    }
    this.canvas.parentElement?.appendChild(el)
    setTimeout(() => el.remove(), 800)
  }

  private tick = (): void => {
    const now = performance.now()
    const hasWork = this.particles.length > 0 || this.flashes.length > 0 || this.tweens.length > 0
    if (hasWork) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      // tweens (fire core, rings, full-screen flash) — draw FIRST (background layer)
      this.tweens = this.tweens.filter(fn => fn(this.ctx, now))
      this.ctx.globalAlpha = 1
      // point flashes
      this.drawFlashes()
      // particles
      this.particles = this.particles.filter(p => {
        p.life -= 0.028
        if (p.life <= 0) return false
        p.x += p.vx; p.y += p.vy
        p.vy += p.isChunk ? 0.25 : 0.12  // 청크는 더 무겁게 낙하
        const alpha = Math.max(0, p.life / p.maxLife)
        this.ctx.globalAlpha = alpha
        if (p.isStreak) {
          // 선형 스파크: 속도 방향으로 선 그리기
          const len = Math.sqrt(p.vx * p.vx + p.vy * p.vy) * 2.5
          this.ctx.strokeStyle = p.color
          this.ctx.lineWidth = p.size * alpha
          this.ctx.lineCap = 'round'
          this.ctx.beginPath()
          this.ctx.moveTo(p.x - p.vx * 2, p.y - p.vy * 2)
          this.ctx.lineTo(p.x + (p.vx / Math.sqrt(p.vx*p.vx+p.vy*p.vy)) * len, p.y + (p.vy / Math.sqrt(p.vx*p.vx+p.vy*p.vy)) * len)
          this.ctx.stroke()
        } else if (p.isChunk) {
          // 사각 잔해
          const s = p.size * alpha
          this.ctx.fillStyle = p.color
          this.ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s)
        } else {
          this.ctx.fillStyle = p.color
          this.ctx.beginPath()
          this.ctx.arc(p.x, p.y, Math.max(0.5, p.size * alpha), 0, Math.PI * 2)
          this.ctx.fill()
        }
        return true
      })
      this.ctx.globalAlpha = 1
    }
    this.animId = requestAnimationFrame(this.tick)
  }

  destroy(): void { cancelAnimationFrame(this.animId) }
}
