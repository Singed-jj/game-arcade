import { eventBus } from '@/state/event-bus'
import type { HeartManager } from '@/state/heart-manager'

export class FailScreen {
  constructor(container: HTMLElement, heartManager: HeartManager, data?: Record<string, unknown>) {
    const level = (data?.level as number) ?? 1
    const hearts = heartManager.getHearts()

    container.className = 'relative w-full h-dvh max-w-[375px] mx-auto flex flex-col items-center justify-center overflow-hidden'
    container.style.backgroundImage = 'url(/assets/bg/game-bg.png)'
    container.style.backgroundSize = 'cover'

    // Dark overlay — red-tinted for fail mood
    const overlay = document.createElement('div')
    overlay.className = 'absolute inset-0'
    overlay.style.background = 'linear-gradient(180deg, rgba(60,0,0,0.5) 0%, rgba(10,0,30,0.75) 100%)'
    container.appendChild(overlay)

    // Broken pieces / debris particles
    this.addDebris(container)

    // Content card
    const card = document.createElement('div')
    card.className = 'relative z-10 flex flex-col items-center px-8 py-8 mx-6 rounded-3xl'
    card.style.background = 'linear-gradient(135deg, rgba(50,10,10,0.95) 0%, rgba(30,10,50,0.95) 100%)'
    card.style.boxShadow = '0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(200,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1)'
    card.style.border = '1px solid rgba(255,80,80,0.15)'

    // 레벨 배지
    const levelBadge = document.createElement('div')
    levelBadge.textContent = `레벨 ${level}`
    levelBadge.className = 'text-white/50 text-xs tracking-widest uppercase mb-3'
    card.appendChild(levelBadge)

    // 이모지 + 타이틀
    const titleRow = document.createElement('div')
    titleRow.className = 'flex flex-col items-center mb-2'

    const emoji = document.createElement('div')
    emoji.textContent = '💔'
    emoji.className = 'text-5xl mb-2'
    emoji.style.animation = 'fail-shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards'
    titleRow.appendChild(emoji)

    const title = document.createElement('h2')
    title.textContent = '실패...'
    title.className = 'text-4xl font-bold text-red-400 mb-1'
    title.style.textShadow = '0 0 30px rgba(248,113,113,0.6), 0 2px 4px rgba(0,0,0,0.5)'
    title.style.animation = 'fail-title 0.4s ease-out forwards'
    titleRow.appendChild(title)

    card.appendChild(titleRow)

    const subText = document.createElement('p')
    subText.textContent = '이동이 부족했어요'
    subText.className = 'text-white/50 text-sm mb-5'
    card.appendChild(subText)

    // 구분선
    const divider = document.createElement('div')
    divider.className = 'w-full h-px mb-5'
    divider.style.background = 'linear-gradient(90deg, transparent, rgba(255,80,80,0.25), transparent)'
    card.appendChild(divider)

    // Goal progress
    const goalsList = data?.goals as Array<{ blockType: number; current: number; target: number }> | undefined
    if (goalsList && goalsList.length > 0) {
      const BLOCK_EMOJIS_MAP: Record<number, string> = { 0: '🍗', 1: '🥤', 2: '🍟', 3: '🍔', 4: '🍕' }
      const goalsRow = document.createElement('div')
      goalsRow.className = 'flex gap-3 mb-5'

      for (const g of goalsList) {
        const item = document.createElement('div')
        item.className = 'flex flex-col items-center gap-1 px-3 py-2 rounded-xl'
        const done = g.current >= g.target
        item.style.background = done
          ? 'rgba(16,185,129,0.15)'
          : 'rgba(248,113,113,0.1)'
        item.style.border = `1px solid ${done ? 'rgba(16,185,129,0.3)' : 'rgba(248,113,113,0.2)'}`

        const em = document.createElement('span')
        em.textContent = BLOCK_EMOJIS_MAP[g.blockType] ?? '?'
        em.className = 'text-2xl'

        const prog = document.createElement('span')
        prog.textContent = done ? '✓' : `${g.current}/${g.target}`
        prog.className = done ? 'text-green-400 text-xs font-bold' : 'text-red-400 text-xs font-bold'

        item.appendChild(em)
        item.appendChild(prog)
        goalsRow.appendChild(item)
      }
      card.appendChild(goalsRow)
    }

    // 하트 표시
    const heartRow = document.createElement('div')
    heartRow.className = 'flex items-center gap-3 mb-5 px-4 py-3 rounded-2xl w-full justify-center'
    heartRow.style.background = 'rgba(255,255,255,0.06)'
    heartRow.style.border = '1px solid rgba(255,255,255,0.08)'

    const heartIcons = document.createElement('span')
    heartIcons.textContent = '❤️'.repeat(hearts) + '🤍'.repeat(Math.max(0, 3 - hearts))
    heartIcons.className = 'text-xl tracking-wide'

    const heartLabel = document.createElement('span')
    heartLabel.textContent = `하트 ${hearts}/3`
    heartLabel.className = 'text-white/60 text-sm'

    heartRow.appendChild(heartIcons)
    heartRow.appendChild(heartLabel)
    card.appendChild(heartRow)

    // 회복 타이머
    if (hearts < 3) {
      const recoveryTimer = document.createElement('p')
      recoveryTimer.className = 'text-white/35 text-xs mb-4 text-center'
      const updateTimer = () => {
        const ms = heartManager.getRecoveryTimeMs()
        const totalSec = Math.ceil(ms / 1000)
        const min = Math.floor(totalSec / 60)
        const sec = totalSec % 60
        recoveryTimer.textContent = `다음 하트까지 ${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
      }
      updateTimer()
      const timerInterval = setInterval(updateTimer, 1000)
      const cleanup = () => { clearInterval(timerInterval); eventBus.off('screen:change', cleanup) }
      eventBus.on('screen:change', cleanup)
      card.appendChild(recoveryTimer)
    }

    // 다시 도전 버튼
    const retryBtn = document.createElement('button')
    retryBtn.textContent = hearts > 0 ? '다시 도전 🔄' : '❤️ 부족'
    retryBtn.className = 'w-full py-4 font-bold rounded-2xl text-lg text-white transition-transform active:scale-95 mb-3'
    if (hearts > 0) {
      retryBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)'
      retryBtn.style.boxShadow = '0 4px 20px rgba(239,68,68,0.4)'
      retryBtn.addEventListener('click', () => {
        eventBus.emit('screen:change', { screen: 'game', data: { level } })
      })
    } else {
      retryBtn.style.background = 'rgba(255,255,255,0.1)'
      retryBtn.style.color = 'rgba(255,255,255,0.4)'
      retryBtn.style.cursor = 'not-allowed'
    }
    card.appendChild(retryBtn)

    const mapBtn = document.createElement('button')
    mapBtn.textContent = '맵으로'
    mapBtn.className = 'w-full py-3 bg-white/10 text-white/70 rounded-2xl active:scale-95 transition-transform text-sm'
    mapBtn.addEventListener('click', () => {
      eventBus.emit('screen:change', { screen: 'map' })
    })
    card.appendChild(mapBtn)

    container.appendChild(card)

    // CSS animations
    if (!document.getElementById('fail-styles')) {
      const style = document.createElement('style')
      style.id = 'fail-styles'
      style.textContent = `
        @keyframes fail-title {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fail-shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          20% { transform: translateX(-4px) rotate(-8deg); }
          40% { transform: translateX(4px) rotate(8deg); }
          60% { transform: translateX(-3px) rotate(-5deg); }
          80% { transform: translateX(3px) rotate(5deg); }
        }
        @keyframes debris-fall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 0.8; }
          100% { transform: translateY(900px) rotate(${Math.random() > 0.5 ? 360 : -360}deg); opacity: 0; }
        }
        .debris-piece {
          position: absolute;
          pointer-events: none;
          animation: debris-fall linear infinite;
        }
      `
      document.head.appendChild(style)
    }
  }

  private addDebris(container: HTMLElement): void {
    const shapes = ['💔', '✖️', '⭐']
    for (let i = 0; i < 12; i++) {
      const piece = document.createElement('div')
      piece.className = 'debris-piece'
      piece.style.left = `${Math.random() * 100}%`
      piece.style.top = `${-10 - Math.random() * 20}px`
      piece.style.fontSize = `${8 + Math.random() * 10}px`
      piece.style.opacity = String(0.15 + Math.random() * 0.25)
      piece.textContent = shapes[i % shapes.length]
      piece.style.animationDuration = `${3 + Math.random() * 4}s`
      piece.style.animationDelay = `${Math.random() * 4}s`
      container.appendChild(piece)
    }
  }
}
