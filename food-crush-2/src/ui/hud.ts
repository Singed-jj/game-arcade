import { MAX_HEARTS, PIECES_FOR_GACHA } from '@/core/types'
import { eventBus } from '@/state/event-bus'

export class HUD {
  readonly el: HTMLElement
  private heartEls: HTMLElement[] = []
  private pieceDotsEl: HTMLElement

  constructor() {
    this.el = document.createElement('div')
    this.el.className = 'flex items-center justify-between px-4 py-2'

    const logo = document.createElement('span')
    logo.textContent = '푸드크러시'
    logo.className = 'text-white font-bold text-sm'
    this.el.appendChild(logo)

    const heartBox = document.createElement('div')
    heartBox.className = 'flex gap-1'
    for (let i = 0; i < MAX_HEARTS; i++) {
      const img = document.createElement('img')
      img.src = '/assets/ui/heart-full.png'
      img.className = 'w-6 h-6'
      this.heartEls.push(img)
      heartBox.appendChild(img)
    }
    this.el.appendChild(heartBox)

    this.pieceDotsEl = document.createElement('div')
    this.pieceDotsEl.className = 'flex gap-0.5'
    this.el.appendChild(this.pieceDotsEl)

    eventBus.on('heart:changed', ({ current }) => this.updateHearts(current))
    eventBus.on('piece:changed', ({ current }) => this.updatePieces(current))
  }

  updateHearts(count: number): void {
    this.heartEls.forEach((el, i) => {
      (el as HTMLImageElement).src = i < count ? '/assets/ui/heart-full.png' : '/assets/ui/heart-empty.png'
    })
  }

  updatePieces(count: number): void {
    this.pieceDotsEl.innerHTML = ''
    for (let i = 0; i < PIECES_FOR_GACHA; i++) {
      const dot = document.createElement('div')
      dot.className = `w-2 h-2 rounded-full ${i < count ? 'bg-yellow-400' : 'bg-gray-600'}`
      this.pieceDotsEl.appendChild(dot)
    }
  }
}
