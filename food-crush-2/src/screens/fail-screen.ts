import { eventBus } from '@/state/event-bus'
import type { HeartManager } from '@/state/heart-manager'

function showToast(message: string): void {
  const toast = document.createElement('div')
  toast.textContent = message
  toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:8px 16px;border-radius:8px;font-size:13px;z-index:9999;'
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 2000)
}

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
    card.className = 'relative z-10 flex flex-col items-center px-6 py-6 mx-4 rounded-3xl'
    card.style.background = 'linear-gradient(135deg, rgba(50,10,10,0.95) 0%, rgba(30,10,50,0.95) 100%)'
    card.style.boxShadow = '0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(200,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1)'
    card.style.border = '1px solid rgba(255,80,80,0.15)'

    // 레벨 배지
    const levelBadge = document.createElement('div')
    levelBadge.textContent = `레벨 ${level}`
    levelBadge.className = 'text-white/50 text-xs tracking-widest uppercase mb-2'
    card.appendChild(levelBadge)

    // 이모지 + 타이틀
    const titleRow = document.createElement('div')
    titleRow.className = 'flex flex-col items-center mb-1'

    const emoji = document.createElement('div')
    emoji.textContent = '😢'
    emoji.className = 'text-5xl mb-2'
    emoji.style.animation = 'fail-shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards'
    titleRow.appendChild(emoji)

    const title = document.createElement('h2')
    title.textContent = '아깝다!'
    title.className = 'text-4xl font-bold text-red-400 mb-1'
    title.style.textShadow = '0 0 30px rgba(248,113,113,0.6), 0 2px 4px rgba(0,0,0,0.5)'
    title.style.animation = 'fail-title 0.4s ease-out forwards'
    titleRow.appendChild(title)

    card.appendChild(titleRow)

    // 부제
    const subText = document.createElement('p')
    subText.textContent = '조금만 더였는데...'
    subText.className = 'text-white/70 text-sm mb-4'
    card.appendChild(subText)

    // 구분선
    const divider = document.createElement('div')
    divider.className = 'w-full h-px mb-4'
    divider.style.background = 'linear-gradient(90deg, transparent, rgba(255,80,80,0.25), transparent)'
    card.appendChild(divider)

    // Goal progress
    const goalsList = data?.goals as Array<{ blockType: number; current: number; target: number }> | undefined
    if (goalsList && goalsList.length > 0) {
      const BLOCK_EMOJIS_MAP: Record<number, string> = { 0: '🍗', 1: '🥤', 2: '🍟', 3: '🍔', 4: '🍕' }
      const goalsRow = document.createElement('div')
      goalsRow.className = 'flex gap-3 mb-4'

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
    heartRow.className = 'flex items-center gap-3 mb-4 px-4 py-2 rounded-2xl w-full justify-center'
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
    const cleanups: (() => void)[] = []

    if (hearts < 3) {
      const recoveryTimer = document.createElement('p')
      recoveryTimer.className = 'text-white/35 text-xs mb-3 text-center'
      const updateTimer = () => {
        const ms = heartManager.getRecoveryTimeMs()
        const totalSec = Math.ceil(ms / 1000)
        const min = Math.floor(totalSec / 60)
        const sec = totalSec % 60
        recoveryTimer.textContent = `다음 하트까지 ${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
      }
      updateTimer()
      const timerInterval = setInterval(updateTimer, 1000)
      cleanups.push(() => clearInterval(timerInterval))
      card.appendChild(recoveryTimer)
    }

    // 아이템 쇼케이스 (3칸 카드)
    const showcaseRow = document.createElement('div')
    showcaseRow.className = 'grid grid-cols-3 gap-2 w-full mb-3'

    const items = [
      { emoji: '🚀', name: '로켓', line1: '가로·세로', line2: '한 줄 제거' },
      { emoji: '💣', name: '폭탄', line1: '3×3 범위', line2: '폭발' },
      { emoji: '🌈', name: '무지개', line1: '같은 종류', line2: '전부 제거' },
    ]

    for (const it of items) {
      const itemCard = document.createElement('div')
      itemCard.className = 'flex flex-col items-center py-2 px-1 rounded-xl'
      itemCard.style.background = 'rgba(255,255,255,0.08)'
      itemCard.style.border = '1px solid rgba(255,255,255,0.1)'

      const itemEmoji = document.createElement('span')
      itemEmoji.textContent = it.emoji
      itemEmoji.className = 'text-2xl mb-1'
      itemCard.appendChild(itemEmoji)

      const itemName = document.createElement('span')
      itemName.textContent = it.name
      itemName.className = 'text-white text-xs font-bold mb-0.5'
      itemCard.appendChild(itemName)

      const itemLine1 = document.createElement('span')
      itemLine1.textContent = it.line1
      itemLine1.className = 'text-white/50 text-[10px] leading-tight'
      itemCard.appendChild(itemLine1)

      const itemLine2 = document.createElement('span')
      itemLine2.textContent = it.line2
      itemLine2.className = 'text-white/50 text-[10px] leading-tight'
      itemCard.appendChild(itemLine2)

      showcaseRow.appendChild(itemCard)
    }
    card.appendChild(showcaseRow)

    // 치킨 쿠폰 배지
    const couponBadge = document.createElement('div')
    couponBadge.textContent = '🍗 치킨 쿠폰도 뽑힐 수 있어요!'
    couponBadge.className = 'text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 text-center'
    couponBadge.style.background = 'linear-gradient(135deg, #f97316, #ea580c)'
    card.appendChild(couponBadge)

    // [🛒 주문하고 뽑기] 버튼 (1순위)
    const orderBtn = document.createElement('button')
    orderBtn.textContent = '🛒 주문하고 뽑기'
    orderBtn.className = 'w-full py-4 font-bold rounded-2xl text-lg text-white transition-transform active:scale-95 mb-2'
    orderBtn.style.background = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
    orderBtn.style.boxShadow = '0 4px 20px rgba(249,115,22,0.5)'
    orderBtn.addEventListener('click', () => {
      showToast('현재 구현중인 화면입니다')
    })
    card.appendChild(orderBtn)

    // [🔄 재도전] 버튼 — 하트 있을 때만 표시
    if (hearts > 0) {
      const retryBtn = document.createElement('button')
      retryBtn.textContent = '🔄 재도전'
      retryBtn.className = 'w-full py-3 font-bold rounded-2xl text-base text-white transition-transform active:scale-95 mb-2'
      retryBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)'
      retryBtn.style.boxShadow = '0 4px 20px rgba(239,68,68,0.3)'
      retryBtn.addEventListener('click', () => {
        eventBus.emit('screen:change', { screen: 'game', data: { level } })
      })
      card.appendChild(retryBtn)
    }

    // 맵으로 버튼
    const mapBtn = document.createElement('button')
    mapBtn.textContent = '맵으로'
    mapBtn.className = 'w-full py-3 bg-white/10 text-white/70 rounded-2xl active:scale-95 transition-transform text-sm'
    mapBtn.addEventListener('click', () => {
      eventBus.emit('screen:change', { screen: 'map' })
    })
    card.appendChild(mapBtn)

    container.appendChild(card)

    // 하트 0일 때 인라인 팝업 오버레이
    if (hearts === 0) {
      const popupOverlay = document.createElement('div')
      popupOverlay.className = 'absolute inset-0 z-20 flex items-center justify-center'
      popupOverlay.style.background = 'rgba(0,0,0,0.6)'

      const popup = document.createElement('div')
      popup.className = 'flex flex-col items-center px-6 py-6 mx-6 rounded-3xl w-full max-w-[320px]'
      popup.style.background = 'linear-gradient(135deg, rgba(40,10,10,0.98) 0%, rgba(20,5,40,0.98) 100%)'
      popup.style.boxShadow = '0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)'
      popup.style.border = '1px solid rgba(255,80,80,0.2)'

      // 팝업 타이틀
      const popupTitle = document.createElement('h3')
      popupTitle.textContent = '💔 하트가 없어요'
      popupTitle.className = 'text-xl font-bold text-red-400 mb-3'
      popup.appendChild(popupTitle)

      // 회색 하트
      const grayHearts = document.createElement('div')
      grayHearts.textContent = '🤍🤍🤍'
      grayHearts.className = 'text-2xl mb-2 tracking-wider'
      popup.appendChild(grayHearts)

      // 타이머
      const popupTimer = document.createElement('p')
      popupTimer.className = 'text-white/50 text-sm mb-5'
      const updatePopupTimer = () => {
        const ms = heartManager.getRecoveryTimeMs()
        const totalSec = Math.ceil(ms / 1000)
        const min = Math.floor(totalSec / 60)
        const sec = totalSec % 60
        popupTimer.textContent = `다음 하트까지 ${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
      }
      updatePopupTimer()
      const popupTimerInterval = setInterval(updatePopupTimer, 1000)
      cleanups.push(() => clearInterval(popupTimerInterval))
      popup.appendChild(popupTimer)

      // [🛒 주문하고 회복] 버튼
      const popupOrderBtn = document.createElement('button')
      popupOrderBtn.textContent = '🛒 주문하고 회복'
      popupOrderBtn.className = 'w-full py-3 font-bold rounded-2xl text-base text-white transition-transform active:scale-95 mb-3'
      popupOrderBtn.style.background = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
      popupOrderBtn.style.boxShadow = '0 4px 20px rgba(249,115,22,0.4)'
      popupOrderBtn.addEventListener('click', () => {
        showToast('현재 구현중인 화면입니다')
      })
      popup.appendChild(popupOrderBtn)

      // [👥 친구 링크 공유] 버튼
      const shareBtn = document.createElement('button')
      shareBtn.textContent = '👥 친구 링크 공유'
      shareBtn.className = 'w-full py-3 font-bold rounded-2xl text-base text-white transition-transform active:scale-95 mb-1'
      shareBtn.style.background = 'rgba(255,255,255,0.12)'
      shareBtn.style.border = '1px solid rgba(255,255,255,0.15)'
      shareBtn.addEventListener('click', () => {
        showToast('현재 구현중인 화면입니다')
      })
      popup.appendChild(shareBtn)

      // 공유 설명
      const shareDesc = document.createElement('p')
      shareDesc.textContent = '친구가 클릭하면 ❤️+1 · 🎟️+1'
      shareDesc.className = 'text-white/40 text-xs mb-5'
      popup.appendChild(shareDesc)

      // ⏰ 기다릴게요 텍스트 링크
      const waitLink = document.createElement('button')
      waitLink.textContent = '⏰ 기다릴게요'
      waitLink.className = 'text-white/40 text-sm underline underline-offset-2 hover:text-white/60 transition-colors'
      waitLink.style.background = 'none'
      waitLink.style.border = 'none'
      waitLink.style.cursor = 'pointer'
      waitLink.addEventListener('click', () => {
        popupOverlay.remove()
      })
      popup.appendChild(waitLink)

      popupOverlay.appendChild(popup)
      container.appendChild(popupOverlay)
    }

    // 화면 전환 시 모든 타이머 cleanup
    const cleanupAll = () => {
      for (const fn of cleanups) fn()
      eventBus.off('screen:change', cleanupAll)
    }
    eventBus.on('screen:change', cleanupAll)

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
