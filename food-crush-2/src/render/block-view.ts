import { BLOCK_EMOJIS, BLOCK_GRADIENTS, CELL_SIZE, type BlockType, type Position } from '@/core/types'

export class BlockView {
  readonly el: HTMLElement
  private emojiEl: HTMLElement

  constructor(public blockType: BlockType, public pos: Position) {
    this.el = document.createElement('div')
    this.el.className = 'absolute transition-transform duration-150 ease-out rounded-xl shadow-lg flex items-center justify-center'
    this.el.style.width = `${CELL_SIZE - 6}px`
    this.el.style.height = `${CELL_SIZE - 6}px`
    this.el.style.background = BLOCK_GRADIENTS[blockType]
    this.el.style.border = '1.5px solid rgba(255,255,255,0.4)'
    this.el.style.boxShadow = '0 3px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.2)'
    this.el.style.willChange = 'transform'
    this.el.style.contain = 'layout style'
    this.el.style.left = '0'
    this.el.style.top = '0'
    this.updatePosition()

    // 광택 하이라이트 (3D 느낌)
    const shine = document.createElement('div')
    shine.style.cssText = 'position:absolute;top:2px;left:2px;right:2px;height:45%;border-radius:8px 8px 50% 50%;background:linear-gradient(180deg,rgba(255,255,255,0.40) 0%,rgba(255,255,255,0.05) 100%);pointer-events:none;'
    this.el.appendChild(shine)

    this.emojiEl = document.createElement('span')
    this.emojiEl.textContent = BLOCK_EMOJIS[blockType]
    this.emojiEl.style.fontSize = `${CELL_SIZE * 0.60}px`
    this.emojiEl.style.lineHeight = '1'
    this.emojiEl.style.userSelect = 'none'
    this.emojiEl.style.pointerEvents = 'none'
    this.emojiEl.style.position = 'relative'
    this.emojiEl.style.zIndex = '1'
    this.el.appendChild(this.emojiEl)
  }

  updatePosition(): void {
    const x = this.pos.col * CELL_SIZE + 3
    const y = this.pos.row * CELL_SIZE + 3
    this.el.style.setProperty('--block-x', `${x}px`)
    this.el.style.setProperty('--block-y', `${y}px`)
    this.el.style.transform = `translate(${x}px, ${y}px)`
  }

  animatePop(): Promise<void> {
    return new Promise(resolve => {
      this.el.classList.add('animate-block-pop')
      this.el.addEventListener('animationend', () => {
        this.el.remove()
        resolve()
      }, { once: true })
    })
  }

  animateDrop(fromRow: number): Promise<void> {
    const distance = (this.pos.row - fromRow) * CELL_SIZE
    const x = this.pos.col * CELL_SIZE + 3
    const y = this.pos.row * CELL_SIZE + 3
    this.el.style.setProperty('--block-x', `${x}px`)
    this.el.style.setProperty('--block-y', `${y}px`)
    this.el.style.setProperty('--drop-distance', `-${distance}px`)
    this.el.classList.add('animate-block-drop')
    return new Promise(resolve => {
      this.el.addEventListener('animationend', () => {
        this.el.classList.remove('animate-block-drop')
        resolve()
      }, { once: true })
    })
  }

  spawnAnimate(delayMs = 0): void {
    this.el.style.animationDelay = delayMs > 0 ? `${delayMs}ms` : ''
    this.el.classList.add('animate-block-spawn')
    this.el.addEventListener('animationend', () => {
      this.el.classList.remove('animate-block-spawn')
      this.el.style.animationDelay = ''
    }, { once: true })
  }

  startHint(): void { this.el.classList.add('animate-hint') }
  stopHint(): void { this.el.classList.remove('animate-hint') }

  setSelected(selected: boolean): void {
    this.el.style.outline = selected ? '3px solid rgba(255,255,255,0.9)' : ''
    this.el.style.outlineOffset = '1px'
    this.el.style.zIndex = selected ? '10' : ''
    this.el.style.filter = selected ? 'brightness(1.3)' : ''
  }

  destroy(): void { this.el.remove() }
}
