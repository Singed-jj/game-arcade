import { MAX_HEARTS, PIECES_FOR_GACHA } from '@/core/types'
import { eventBus } from '@/state/event-bus'
import type { HeartManager } from '@/state/heart-manager'

export class HUD {
  readonly el: HTMLElement
  private heartEls: HTMLElement[] = []
  private pieceDotsEl: HTMLElement
  private pieceCountEl: HTMLElement
  private recoveryTimerEl: HTMLElement
  private recoveryInterval: ReturnType<typeof setInterval> | null = null
  private heartManager: HeartManager | null = null
  private currentHeartCount = MAX_HEARTS
  private homeBtnEl!: HTMLElement
  setOnBack!: (fn: (() => void) | null) => void

  constructor(heartManager?: HeartManager) {
    this.heartManager = heartManager ?? null

    this.el = document.createElement('div')
    this.el.className = 'flex items-center justify-between px-3 py-2'
    this.el.style.background = 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 100%)'

    // 뒤로가기 버튼
    this.homeBtnEl = document.createElement('button')
    this.homeBtnEl.textContent = '←'
    this.homeBtnEl.className = 'text-white/90 text-xl font-bold w-8 h-8 flex items-center justify-center active:scale-90 transition-transform rounded-full'
    this.homeBtnEl.style.background = 'rgba(255,255,255,0.12)'
    let onBack: (() => void) | null = null
    this.homeBtnEl.addEventListener('click', () => {
      if (onBack) onBack()
      else eventBus.emit('screen:change', { screen: 'map' })
    })
    this.el.appendChild(this.homeBtnEl)
    this.setOnBack = (fn: (() => void) | null) => { onBack = fn }

    // 로고
    const logo = document.createElement('span')
    logo.textContent = '푸드크러시'
    logo.className = 'text-white/90 font-bold text-sm tracking-wide'
    this.el.appendChild(logo)

    // 하트 + 조각 그룹
    const rightGroup = document.createElement('div')
    rightGroup.className = 'flex items-center gap-2'

    // 하트 영역 (하트 + 회복 타이머)
    const heartArea = document.createElement('div')
    heartArea.className = 'flex flex-col items-center'

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
    heartArea.appendChild(heartBox)

    // 회복 타이머 텍스트
    this.recoveryTimerEl = document.createElement('span')
    this.recoveryTimerEl.className = 'text-xs text-white/60'
    this.recoveryTimerEl.style.display = 'none'
    heartArea.appendChild(this.recoveryTimerEl)

    rightGroup.appendChild(heartArea)

    // 구분선
    const sep = document.createElement('div')
    sep.className = 'w-px h-4 bg-white/20'
    rightGroup.appendChild(sep)

    // 조각 영역 (도트 + 카운터)
    const pieceArea = document.createElement('div')
    pieceArea.className = 'flex flex-col items-center'

    // 조각 도트 (별 아이콘)
    this.pieceDotsEl = document.createElement('div')
    this.pieceDotsEl.className = 'flex gap-0.5 items-center'
    pieceArea.appendChild(this.pieceDotsEl)

    // 조각 숫자 카운터
    this.pieceCountEl = document.createElement('span')
    this.pieceCountEl.className = 'text-xs text-white/70'
    this.pieceCountEl.textContent = `0/${PIECES_FOR_GACHA}`
    pieceArea.appendChild(this.pieceCountEl)

    rightGroup.appendChild(pieceArea)

    this.el.appendChild(rightGroup)

    eventBus.on('heart:changed', ({ current }) => this.updateHearts(current))
    eventBus.on('piece:changed', ({ current }) => this.updatePieces(current))

    // 화면 전환 시 인터벌 정리
    eventBus.on('screen:change', () => this.stopRecoveryTimer())
  }

  updateHearts(count: number): void {
    this.currentHeartCount = count
    this.heartEls.forEach((el, i) => {
      const filled = i < count
      el.textContent = filled ? '❤️' : '🤍'
      el.style.opacity = filled ? '1' : '0.5'
      el.style.transform = filled ? 'scale(1)' : 'scale(0.85)'
    })
    // 하트 3개 미만이면 회복 타이머 시작
    if (count < MAX_HEARTS && this.heartManager) {
      this.startRecoveryTimer()
    } else {
      this.stopRecoveryTimer()
    }
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
    // 숫자 카운터 업데이트
    this.pieceCountEl.textContent = `${count}/${PIECES_FOR_GACHA}`
  }

  hideBack(): void { this.homeBtnEl.style.visibility = 'hidden' }
  showBack(): void { this.homeBtnEl.style.visibility = '' }

  private startRecoveryTimer(): void {
    if (this.recoveryInterval) return
    this.recoveryTimerEl.style.display = ''
    this.updateRecoveryDisplay()
    this.recoveryInterval = setInterval(() => this.updateRecoveryDisplay(), 1000)
  }

  private stopRecoveryTimer(): void {
    if (this.recoveryInterval) {
      clearInterval(this.recoveryInterval)
      this.recoveryInterval = null
    }
    this.recoveryTimerEl.style.display = 'none'
  }

  private updateRecoveryDisplay(): void {
    if (!this.heartManager) return
    const ms = this.heartManager.getRecoveryTimeMs()
    if (ms <= 0) {
      this.stopRecoveryTimer()
      return
    }
    const totalSec = Math.ceil(ms / 1000)
    const min = Math.floor(totalSec / 60)
    const sec = totalSec % 60
    const mm = String(min).padStart(2, '0')
    const ss = String(sec).padStart(2, '0')
    this.recoveryTimerEl.textContent = `\u{1F550} ${mm}:${ss}`
  }
}
