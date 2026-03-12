import { BLOCK_IMAGES, CELL_SIZE, type BlockType, type Position } from '@/core/types'

export class BlockView {
  readonly el: HTMLElement
  private img: HTMLImageElement

  constructor(public blockType: BlockType, public pos: Position) {
    this.el = document.createElement('div')
    this.el.className = 'absolute transition-all duration-150 ease-out'
    this.el.style.width = `${CELL_SIZE - 4}px`
    this.el.style.height = `${CELL_SIZE - 4}px`
    this.updatePosition()

    this.img = document.createElement('img')
    this.img.src = BLOCK_IMAGES[blockType]
    this.img.className = 'w-full h-full object-contain'
    this.img.draggable = false
    this.el.appendChild(this.img)
  }

  updatePosition(): void {
    this.el.style.left = `${this.pos.col * CELL_SIZE + 2}px`
    this.el.style.top = `${this.pos.row * CELL_SIZE + 2}px`
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
    this.el.style.setProperty('--drop-distance', `-${distance}px`)
    this.el.classList.add('animate-block-drop')
    return new Promise(resolve => {
      this.el.addEventListener('animationend', () => {
        this.el.classList.remove('animate-block-drop')
        resolve()
      }, { once: true })
    })
  }

  startHint(): void { this.el.classList.add('animate-hint') }
  stopHint(): void { this.el.classList.remove('animate-hint') }

  setSelected(selected: boolean): void {
    this.el.style.outline = selected ? '2px solid white' : ''
  }

  destroy(): void { this.el.remove() }
}
