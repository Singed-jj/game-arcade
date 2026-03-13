import { Container, Graphics, Text } from 'pixi.js'
import { gsap } from 'gsap'
import { CELL_SIZE, BLOCK_EMOJIS, type BlockType, type Position } from '@/core/types'

const BLOCK_BG_COLORS: Record<number, number> = {
  0: 0xfb923c, // CHICKEN
  1: 0xf87171, // COLA
  2: 0xfbbf24, // FRIES
  3: 0xb45309, // BURGER
  4: 0x4ade80, // PIZZA
}

export class BlockSprite extends Container {
  private bg: Graphics
  private emojiLabel: Text
  private hintTween: gsap.core.Tween | null = null

  constructor(public blockType: BlockType, public pos: Position) {
    super()
    const size = CELL_SIZE - 6

    this.bg = new Graphics()
    this.bg.roundRect(0, 0, size, size, 10)
    this.bg.fill({ color: BLOCK_BG_COLORS[blockType], alpha: 1 })
    this.addChild(this.bg)

    this.emojiLabel = new Text({
      text: BLOCK_EMOJIS[blockType],
      style: { fontSize: CELL_SIZE * 0.55 }
    })
    this.emojiLabel.anchor.set(0.5)
    this.emojiLabel.x = size / 2
    this.emojiLabel.y = size / 2
    this.addChild(this.emojiLabel)

    this.updatePosition()
  }

  updatePosition(): void {
    this.x = this.pos.col * CELL_SIZE + 3
    this.y = this.pos.row * CELL_SIZE + 3
  }

  animatePop(): Promise<void> {
    return new Promise(resolve => {
      gsap.to(this.scale, {
        x: 1.3, y: 1.3, duration: 0.08,
        onComplete: () => {
          gsap.to(this.scale, {
            x: 0, y: 0, duration: 0.1,
            onComplete: () => {
              if (!this.destroyed) this.destroy({ children: true })
              resolve()
            }
          })
        }
      })
    })
  }

  animateDrop(fromRow: number): Promise<void> {
    const targetY = this.pos.row * CELL_SIZE + 3
    const startY = fromRow * CELL_SIZE + 3
    this.y = startY
    return new Promise(resolve => {
      gsap.to(this, {
        y: targetY, duration: 0.18, ease: 'bounce.out',
        onComplete: resolve
      })
    })
  }

  spawnAnimate(delayMs = 0): void {
    this.scale.set(0)
    gsap.to(this.scale, {
      x: 1, y: 1, duration: 0.2, ease: 'back.out(1.7)',
      delay: delayMs / 1000
    })
  }

  startHint(): void {
    this.hintTween = gsap.to(this.scale, {
      x: 1.15, y: 1.15, duration: 0.4,
      yoyo: true, repeat: -1, ease: 'sine.inOut'
    })
  }

  stopHint(): void {
    this.hintTween?.kill()
    this.hintTween = null
    gsap.to(this.scale, { x: 1, y: 1, duration: 0.1 })
  }

  setSelected(selected: boolean): void {
    if (selected) {
      this.bg.tint = 0xffdd00
      gsap.to(this.scale, { x: 1.1, y: 1.1, duration: 0.1 })
    } else {
      this.bg.tint = 0xffffff
      gsap.to(this.scale, { x: 1, y: 1, duration: 0.1 })
      this.updatePosition()
    }
  }

  destroy(options?: Parameters<Container['destroy']>[0]): void {
    this.hintTween?.kill()
    super.destroy(options)
  }
}
