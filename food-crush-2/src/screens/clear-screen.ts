import { PIECES_FOR_GACHA } from '@/core/types'
import { eventBus } from '@/state/event-bus'
import type { PieceManager } from '@/state/piece-manager'
import { soundManager } from '@/audio/sound-manager'
import { hapticManager } from '@/audio/haptic-manager'

export class ClearScreen {
  constructor(container: HTMLElement, pieceManager: PieceManager, data?: Record<string, unknown>) {
    const stars = (data?.stars as number) ?? 1
    const level = (data?.level as number) ?? 1
    const movesLeft = (data?.movesLeft as number) ?? 0

    container.className = 'relative w-full h-dvh max-w-[375px] mx-auto flex flex-col items-center justify-center overflow-hidden'
    container.style.backgroundImage = 'url(/assets/bg/game-bg.png)'
    container.style.backgroundSize = 'cover'
    container.style.paddingTop = 'var(--ticker-h)'

    // Dark overlay
    const overlay = document.createElement('div')
    overlay.className = 'absolute inset-0'
    overlay.style.background = 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(20,0,60,0.6) 100%)'
    container.appendChild(overlay)

    // Confetti dots (CSS-only)
    this.addConfetti(container)

    // Content card
    const card = document.createElement('div')
    card.className = 'relative z-10 flex flex-col items-center px-8 py-8 mx-6 rounded-3xl'
    card.style.background = 'linear-gradient(135deg, rgba(30,15,70,0.95) 0%, rgba(50,25,100,0.95) 100%)'
    card.style.boxShadow = '0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(250,200,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15)'
    card.style.border = '1px solid rgba(255,255,255,0.1)'

    // 레벨 배지
    const levelBadge = document.createElement('div')
    levelBadge.textContent = `레벨 ${level}`
    levelBadge.className = 'text-white/50 text-xs tracking-widest uppercase mb-3'
    card.appendChild(levelBadge)

    // 타이틀
    const title = document.createElement('h2')
    title.textContent = '레벨 클리어!'
    title.className = 'text-4xl font-bold text-yellow-300 mb-1'
    title.style.textShadow = '0 0 30px rgba(250,204,21,0.8), 0 2px 4px rgba(0,0,0,0.5)'
    title.style.animation = 'clear-title 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
    card.appendChild(title)

    // 별
    const starRow = document.createElement('div')
    starRow.className = 'flex gap-3 my-5'
    for (let i = 0; i < 3; i++) {
      const span = document.createElement('span')
      span.textContent = i < stars ? '⭐' : '☆'
      span.className = 'text-5xl'
      span.style.animationDelay = `${0.2 + i * 0.15}s`
      if (i < stars) {
        span.classList.add('animate-star-drop')
        span.style.filter = 'drop-shadow(0 0 8px rgba(255,200,0,0.8))'
        // 별 표시 타이밍에 맞춰 사운드 재생 (pitch 상승)
        const starIndex = i
        setTimeout(() => {
          soundManager.play('star', 1.0 + starIndex * 0.15, 0.5)
          hapticManager.trigger('star')
        }, (0.2 + i * 0.15) * 1000)
      } else {
        span.style.opacity = '0.25'
        span.style.filter = 'grayscale(1)'
      }
      starRow.appendChild(span)
    }
    card.appendChild(starRow)

    // 구분선
    const divider = document.createElement('div')
    divider.className = 'w-full h-px mb-5'
    divider.style.background = 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
    card.appendChild(divider)

    // 점수/이동 통계
    const statsRow = document.createElement('div')
    statsRow.className = 'flex gap-6 mb-5'

    const makeStat = (icon: string, value: string, label: string) => {
      const item = document.createElement('div')
      item.className = 'flex flex-col items-center'
      const ico = document.createElement('div')
      ico.className = 'text-2xl mb-1'
      ico.textContent = icon
      const val = document.createElement('div')
      val.className = 'text-white font-bold text-lg'
      val.textContent = value
      const lbl = document.createElement('div')
      lbl.className = 'text-white/40 text-[10px] uppercase tracking-wider'
      lbl.textContent = label
      item.appendChild(ico); item.appendChild(val); item.appendChild(lbl)
      return item
    }

    if (movesLeft > 0) statsRow.appendChild(makeStat('🔥', `+${movesLeft}`, '남은 이동'))
    card.appendChild(statsRow)

    // 조각 박스
    const currentPieces = pieceManager.getPieces()
    const isGachaReady = currentPieces >= PIECES_FOR_GACHA

    const pieceBox = document.createElement('div')
    pieceBox.className = 'w-full rounded-2xl px-4 py-4 mb-5 flex flex-col items-center gap-2'
    pieceBox.style.background = 'rgba(255,255,255,0.08)'
    pieceBox.style.border = '1px solid rgba(255,255,255,0.1)'

    const pieceHeader = document.createElement('div')
    pieceHeader.textContent = '\uD83C\uDF9F\uFE0F +1 조각 획득!'
    pieceHeader.className = 'text-white font-bold text-sm'
    pieceBox.appendChild(pieceHeader)

    // 도트 표시
    const dotRow = document.createElement('div')
    dotRow.className = 'flex gap-2'
    for (let i = 0; i < PIECES_FOR_GACHA; i++) {
      const dot = document.createElement('div')
      dot.className = 'w-4 h-4 rounded-full'
      if (i < currentPieces) {
        dot.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)'
        dot.style.boxShadow = '0 0 6px rgba(251,191,36,0.6)'
      } else {
        dot.style.background = 'rgba(255,255,255,0.15)'
      }
      dotRow.appendChild(dot)
    }
    pieceBox.appendChild(dotRow)

    const pieceStatus = document.createElement('div')
    pieceStatus.className = 'text-white/70 text-xs'
    if (isGachaReady) {
      pieceStatus.textContent = `\u2728 ${currentPieces}/${PIECES_FOR_GACHA} \u2014 뽑기 준비 완료!`
      pieceStatus.className = 'text-yellow-300 text-xs font-bold'
    } else {
      pieceStatus.textContent = `${currentPieces}/${PIECES_FOR_GACHA} \u2014 1개만 더!`
    }
    pieceBox.appendChild(pieceStatus)

    card.appendChild(pieceBox)

    // 버튼 영역
    if (isGachaReady) {
      // 뽑기 준비 완료: 금색 뽑기 버튼 + 유령 다음 레벨 버튼
      const gachaBtn = document.createElement('button')
      gachaBtn.textContent = '\u2728 공짜 쿠폰 뽑기!'
      gachaBtn.className = 'w-full py-4 font-bold rounded-2xl text-lg text-white transition-transform active:scale-95 mb-3'
      gachaBtn.style.background = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
      gachaBtn.style.boxShadow = '0 4px 20px rgba(251,191,36,0.5), 0 0 30px rgba(251,191,36,0.2)'
      gachaBtn.style.color = '#1a0a3e'
      gachaBtn.addEventListener('click', () => {
        eventBus.emit('screen:change', { screen: 'gacha' })
      })
      card.appendChild(gachaBtn)

      const nextGhostBtn = document.createElement('button')
      nextGhostBtn.textContent = '다음 레벨 먼저 \u25B6'
      nextGhostBtn.className = 'w-full py-3 rounded-2xl text-sm text-white/70 transition-transform active:scale-95 mb-3'
      nextGhostBtn.style.border = '1px solid rgba(255,255,255,0.2)'
      nextGhostBtn.style.background = 'transparent'
      nextGhostBtn.addEventListener('click', () => {
        eventBus.emit('screen:change', { screen: 'game', data: { level: level + 1 } })
      })
      card.appendChild(nextGhostBtn)
    } else {
      // 조각 미완성: 기존 다음 레벨 버튼
      const nextBtn = document.createElement('button')
      nextBtn.textContent = '다음 레벨 \u25B6'
      nextBtn.className = 'w-full py-4 font-bold rounded-2xl text-lg text-white transition-transform active:scale-95 mb-3'
      nextBtn.style.background = 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
      nextBtn.style.boxShadow = '0 4px 20px rgba(245,158,11,0.4)'
      nextBtn.addEventListener('click', () => {
        eventBus.emit('screen:change', { screen: 'game', data: { level: level + 1 } })
      })
      card.appendChild(nextBtn)
    }

    const mapBtn = document.createElement('button')
    mapBtn.textContent = '맵으로'
    mapBtn.className = 'w-full py-3 bg-white/10 text-white/70 rounded-2xl active:scale-95 transition-transform text-sm'
    mapBtn.addEventListener('click', () => {
      eventBus.emit('screen:change', { screen: 'map' })
    })
    card.appendChild(mapBtn)

    container.appendChild(card)

    // CSS animations
    if (!document.getElementById('clear-styles')) {
      const style = document.createElement('style')
      style.id = 'clear-styles'
      style.textContent = `
        @keyframes clear-title {
          0% { transform: scale(0.5) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(900px) rotate(720deg); opacity: 0.3; }
        }
        .confetti-dot {
          position: absolute;
          width: 8px; height: 8px;
          border-radius: 2px;
          pointer-events: none;
          animation: confetti-fall linear infinite;
        }
      `
      document.head.appendChild(style)
    }
  }

  private addConfetti(container: HTMLElement): void {
    const colors = ['#fbbf24', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b']
    for (let i = 0; i < 20; i++) {
      const dot = document.createElement('div')
      dot.className = 'confetti-dot'
      dot.style.left = `${Math.random() * 100}%`
      dot.style.top = `${-10 - Math.random() * 20}px`
      dot.style.background = colors[i % colors.length]
      dot.style.animationDuration = `${2 + Math.random() * 3}s`
      dot.style.animationDelay = `${Math.random() * 3}s`
      dot.style.width = `${4 + Math.random() * 8}px`
      dot.style.height = `${4 + Math.random() * 8}px`
      dot.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px'
      container.appendChild(dot)
    }
  }
}
