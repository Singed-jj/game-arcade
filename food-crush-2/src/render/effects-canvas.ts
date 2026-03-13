import { BLOCK_COLORS, type BlockType, type Position, CELL_SIZE, BOARD_COLS, BOARD_ROWS } from '@/core/types'

interface Particle {
  x: number; y: number; vx: number; vy: number
  life: number; maxLife: number; size: number; color: string
}

export class EffectsCanvas {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private particles: Particle[] = []
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

  private boardOffsetX(): number { return (this.canvas.width - BOARD_COLS * CELL_SIZE) / 2 }
  private boardOffsetY(): number { return (this.canvas.height - BOARD_ROWS * CELL_SIZE) / 2 }

  spawnBlockPop(pos: Position, blockType: BlockType): void {
    const cx = this.boardOffsetX() + pos.col * CELL_SIZE + CELL_SIZE / 2
    const cy = this.boardOffsetY() + pos.row * CELL_SIZE + CELL_SIZE / 2
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
    const cx = this.boardOffsetX() + pos.col * CELL_SIZE + CELL_SIZE / 2
    const cy = this.boardOffsetY() + pos.row * CELL_SIZE + CELL_SIZE / 2
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

  get boardCenterX(): number { return this.boardOffsetX() + BOARD_COLS * CELL_SIZE / 2 }
  get boardCenterY(): number { return this.boardOffsetY() + BOARD_ROWS * CELL_SIZE / 2 }

  showScoreFloat(score: number, x: number, y: number): void {
    const el = document.createElement('div')
    el.textContent = `+${score}`
    el.className = 'animate-score-float absolute font-bold pointer-events-none z-40'
    el.style.cssText = `left:${x}px;top:${y}px;font-size:18px;transform:translateX(-50%);color:#FFD600;text-shadow:0 2px 4px rgba(0,0,0,0.5);`
    this.canvas.parentElement?.appendChild(el)
    setTimeout(() => el.remove(), 500)
  }

  showText(text: string, x: number, y: number, fontSize: number, color: string): void {
    const el = document.createElement('div')
    el.textContent = text
    el.className = 'animate-cascade-text absolute font-bold pointer-events-none z-40'
    const baseStyle = `left:${x}px;top:${y}px;font-size:${fontSize}px;transform:translateX(-50%);white-space:nowrap;`
    if (color === 'rainbow') {
      el.style.cssText = baseStyle + 'background:linear-gradient(90deg,#ff0080,#ff8c00,#ffd700,#00e676,#00b0ff,#e040fb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 8px rgba(255,200,0,0.8))'
    } else {
      el.style.cssText = baseStyle + `color:${color};text-shadow:0 2px 8px rgba(0,0,0,0.5), 0 0 16px ${color}`
    }
    this.canvas.parentElement?.appendChild(el)
    setTimeout(() => el.remove(), 800)
  }

  private tick = (): void => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.particles = this.particles.filter(p => {
      p.life -= 0.03
      if (p.life <= 0) return false
      p.x += p.vx; p.y += p.vy; p.vy += 0.1
      this.ctx.globalAlpha = p.life / p.maxLife
      this.ctx.fillStyle = p.color
      this.ctx.beginPath()
      this.ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2)
      this.ctx.fill()
      return true
    })
    this.ctx.globalAlpha = 1
    this.animId = requestAnimationFrame(this.tick)
  }

  destroy(): void { cancelAnimationFrame(this.animId) }
}
