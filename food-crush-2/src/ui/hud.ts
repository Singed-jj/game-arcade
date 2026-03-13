import { MAX_HEARTS, PIECES_FOR_GACHA } from '@/core/types'
import { eventBus } from '@/state/event-bus'

export class HUD {
  readonly el: HTMLElement
  private heartEls: HTMLElement[] = []
  private pieceDotsEl: HTMLElement
  setOnBack!: (fn: (() => void) | null) => void

  constructor() {
    this.el = document.createElement('div')
    this.el.className = 'flex items-center justify-between px-3 py-2'
    this.el.style.background = 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 100%)'

    // 뒤로가기 버튼
    const homeBtn = document.createElement('button')
    homeBtn.textContent = '←'
    homeBtn.className = 'text-white/90 text-xl font-bold w-8 h-8 flex items-center justify-center active:scale-90 transition-transform rounded-full'
    homeBtn.style.background = 'rgba(255,255,255,0.12)'
    let onBack: (() => void) | null = null
    homeBtn.addEventListener('click', () => {
      if (onBack) onBack()
      else eventBus.emit('screen:change', { screen: 'map' })
    })
    this.el.appendChild(homeBtn)
    this.setOnBack = (fn: (() => void) | null) => { onBack = fn }

    // 로고
    const logo = document.createElement('span')
    logo.textContent = '푸드크러시'
    logo.className = 'text-white/90 font-bold text-sm tracking-wide'
    this.el.appendChild(logo)

    // 하트 + 조각 그룹
    const rightGroup = document.createElement('div')
    rightGroup.className = 'flex items-center gap-2'

    // 하트 박스
    const heartBox = document.createElement('div')
    heartBox.className = 'flex gap-0.5 items-center'
    for (let i = 0; i < MAX_HEARTS; i++) {
      const span = document.createElement('span')
      span.className = 'transition-all duration-200'
      span.style.fontSize = '20px'
      span.textContent = '❤️'
      this.heartEls.push(span)
      heartBox.appendChild(span)
    }
    rightGroup.appendChild(heartBox)

    // 구분선
    const sep = document.createElement('div')
    sep.className = 'w-px h-4 bg-white/20'
    rightGroup.appendChild(sep)

    // 조각 도트 (별 아이콘)
    this.pieceDotsEl = document.createElement('div')
    this.pieceDotsEl.className = 'flex gap-0.5 items-center'
    rightGroup.appendChild(this.pieceDotsEl)

    this.el.appendChild(rightGroup)

    eventBus.on('heart:changed', ({ current }) => this.updateHearts(current))
    eventBus.on('piece:changed', ({ current }) => this.updatePieces(current))
  }

  updateHearts(count: number): void {
    this.heartEls.forEach((el, i) => {
      const filled = i < count
      el.textContent = filled ? '❤️' : '🤍'
      el.style.opacity = filled ? '1' : '0.5'
      el.style.transform = filled ? 'scale(1)' : 'scale(0.85)'
    })
  }

  updatePieces(count: number): void {
    this.pieceDotsEl.innerHTML = ''
    for (let i = 0; i < PIECES_FOR_GACHA; i++) {
      const dot = document.createElement('div')
      dot.style.width = '8px'
      dot.style.height = '8px'
      dot.style.borderRadius = '50%'
      dot.style.transition = 'all 0.2s'
      if (i < count) {
        dot.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)'
        dot.style.boxShadow = '0 0 4px rgba(251,191,36,0.6)'
      } else {
        dot.style.background = 'rgba(255,255,255,0.2)'
      }
      this.pieceDotsEl.appendChild(dot)
    }
  }
}
