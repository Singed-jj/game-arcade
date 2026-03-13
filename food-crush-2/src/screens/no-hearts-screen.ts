// src/screens/no-hearts-screen.ts
import { eventBus } from '@/state/event-bus'
import type { HeartManager } from '@/state/heart-manager'
import type { PieceManager } from '@/state/piece-manager'

export class NoHeartsScreen {
  constructor(container: HTMLElement, heartManager: HeartManager, pieceManager: PieceManager) {
    container.className = 'relative w-full h-dvh max-w-[375px] mx-auto flex flex-col items-center justify-center overflow-hidden'
    container.style.background = 'linear-gradient(180deg, #1a0a3e 0%, #0e0820 100%)'
    container.style.paddingTop = 'var(--ticker-h)'

    const cleanups: (() => void)[] = []

    // --- 배경 파티클 (하트 테마) ---
    for (let i = 0; i < 10; i++) {
      const p = document.createElement('div')
      p.textContent = '💔'
      p.style.cssText = `position:absolute;pointer-events:none;left:${Math.random() * 100}%;top:${-10 - Math.random() * 20}px;font-size:${8 + Math.random() * 8}px;opacity:${0.08 + Math.random() * 0.12};animation:nh-fall ${4 + Math.random() * 4}s linear ${Math.random() * 4}s infinite;`
      container.appendChild(p)
    }

    // --- 메인 카드 ---
    const card = document.createElement('div')
    card.className = 'relative z-10 flex flex-col items-center px-6 py-7 mx-4 rounded-3xl w-full max-w-[320px]'
    card.style.background = 'linear-gradient(135deg, rgba(30,10,60,0.97) 0%, rgba(15,5,40,0.97) 100%)'
    card.style.boxShadow = '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)'
    card.style.border = '1px solid rgba(150,80,255,0.15)'

    // 공감 이모지 + 타이틀
    const topEmoji = document.createElement('div')
    topEmoji.textContent = '💔'
    topEmoji.className = 'text-5xl mb-3'
    card.appendChild(topEmoji)

    const title = document.createElement('h2')
    title.textContent = '하트가 없어요'
    title.className = 'text-2xl font-bold text-white mb-1'
    card.appendChild(title)

    const sub = document.createElement('p')
    sub.textContent = '하트를 채우고 다시 도전해요!'
    sub.className = 'text-white/50 text-sm mb-5'
    card.appendChild(sub)

    // 빈 하트 표시
    const heartsRow = document.createElement('div')
    heartsRow.className = 'flex items-center gap-2 mb-2'
    const heartIcons = document.createElement('span')
    heartIcons.textContent = '🤍🤍🤍'
    heartIcons.className = 'text-2xl tracking-wider opacity-40'
    const heartLabel = document.createElement('span')
    heartLabel.className = 'text-red-400 text-sm font-bold'
    heartLabel.textContent = '0/3'
    heartsRow.appendChild(heartIcons)
    heartsRow.appendChild(heartLabel)
    card.appendChild(heartsRow)

    // 회복 타이머
    const timer = document.createElement('p')
    timer.className = 'text-amber-400/80 text-sm font-bold mb-5'
    const updateTimer = () => {
      const ms = heartManager.getRecoveryTimeMs()
      const totalSec = Math.ceil(ms / 1000)
      const min = Math.floor(totalSec / 60)
      const sec = totalSec % 60
      timer.textContent = `다음 하트까지 ${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    }
    updateTimer()
    const timerInterval = setInterval(updateTimer, 1000)
    cleanups.push(() => clearInterval(timerInterval))
    card.appendChild(timer)

    // 구분선
    const divider = document.createElement('div')
    divider.className = 'w-full h-px mb-5'
    divider.style.background = 'linear-gradient(90deg, transparent, rgba(150,80,255,0.3), transparent)'
    card.appendChild(divider)

    // 1순위: 주문 CTA
    const orderBtn = document.createElement('button')
    orderBtn.className = 'w-full py-4 font-bold rounded-2xl text-base text-white transition-transform active:scale-95 mb-3'
    orderBtn.style.background = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
    orderBtn.style.boxShadow = '0 4px 20px rgba(249,115,22,0.5)'
    const orderTop = document.createElement('div')
    orderTop.textContent = '🛵 주문하고 공짜 쿠폰 뽑기'
    orderTop.className = 'font-bold text-base'
    const orderSub = document.createElement('div')
    orderSub.textContent = '❤️ 즉시 3개 회복 + 🎟️ 뽑기 조각 3개'
    orderSub.className = 'text-xs opacity-80 mt-0.5'
    orderBtn.appendChild(orderTop)
    orderBtn.appendChild(orderSub)
    orderBtn.addEventListener('click', () => {
      heartManager.refillAll()
      pieceManager.addPieces(3)
      const t = document.createElement('div')
      t.textContent = '❤️❤️❤️ 하트 3개 회복! 🎟️ 조각 3개 지급!'
      t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(20,120,40,0.95);color:white;padding:10px 20px;border-radius:12px;font-size:13px;font-weight:bold;z-index:9999;white-space:nowrap;'
      document.body.appendChild(t)
      setTimeout(() => {
        t.remove()
        eventBus.emit('screen:change', { screen: 'map' })
      }, 1500)
    })
    card.appendChild(orderBtn)

    // 2순위: 친구 링크 공유
    const shareBlock = document.createElement('div')
    shareBlock.className = 'w-full rounded-2xl p-4 mb-3 cursor-pointer active:scale-95 transition-transform'
    shareBlock.style.background = 'rgba(255,255,255,0.07)'
    shareBlock.style.border = '1px solid rgba(255,255,255,0.12)'

    const shareTop = document.createElement('div')
    shareTop.textContent = '👥 친구에게 링크 공유하기'
    shareTop.className = 'text-white font-bold text-sm mb-2 text-center'
    shareBlock.appendChild(shareTop)

    const chips = document.createElement('div')
    chips.className = 'flex gap-2 justify-center mb-1'
    for (const c of ['❤️ 하트 +1', '🎟️ 조각 +1']) {
      const chip = document.createElement('span')
      chip.textContent = c
      chip.className = 'text-xs px-2 py-0.5 rounded-full font-bold'
      chip.style.background = 'rgba(255,255,255,0.12)'
      chip.style.color = 'rgba(255,255,255,0.9)'
      chips.appendChild(chip)
    }
    shareBlock.appendChild(chips)

    const shareEasy = document.createElement('div')
    shareEasy.textContent = '친구가 링크를 클릭만 해도 받아요!'
    shareEasy.className = 'text-white/40 text-xs text-center'
    shareBlock.appendChild(shareEasy)

    shareBlock.addEventListener('click', () => {
      heartManager.addHeart(1)
      pieceManager.addPieces(1)
      const t = document.createElement('div')
      t.textContent = '❤️ 하트 +1 · 🎟️ 조각 +1 받았어요!'
      t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(20,100,180,0.95);color:white;padding:10px 20px;border-radius:12px;font-size:13px;font-weight:bold;z-index:9999;white-space:nowrap;'
      document.body.appendChild(t)
      setTimeout(() => {
        t.remove()
        eventBus.emit('screen:change', { screen: 'map' })
      }, 1500)
    })
    card.appendChild(shareBlock)

    // 3순위: 기다릴게요 텍스트 링크
    const waitBtn = document.createElement('button')
    waitBtn.textContent = '⏰ 기다릴게요 (20분마다 1개)'
    waitBtn.className = 'text-white/40 text-xs underline underline-offset-2 mb-4'
    waitBtn.style.cssText = 'background:none;border:none;cursor:pointer;'
    waitBtn.addEventListener('click', () => {
      eventBus.emit('screen:change', { screen: 'map' })
    })
    card.appendChild(waitBtn)

    // 레벨 선택으로 링크
    const backLink = document.createElement('button')
    backLink.textContent = '← 레벨 선택으로'
    backLink.className = 'text-white/40 text-sm underline underline-offset-2'
    backLink.style.cssText = 'background:none;border:none;cursor:pointer;'
    backLink.addEventListener('click', () => {
      eventBus.emit('screen:change', { screen: 'map' })
    })
    card.appendChild(backLink)

    container.appendChild(card)

    // 화면 전환 시 타이머 cleanup
    const cleanupAll = () => {
      for (const fn of cleanups) fn()
      eventBus.off('screen:change', cleanupAll)
    }
    eventBus.on('screen:change', cleanupAll)

    // CSS 애니메이션
    if (!document.getElementById('no-hearts-styles')) {
      const style = document.createElement('style')
      style.id = 'no-hearts-styles'
      style.textContent = `
        @keyframes nh-fall {
          0%   { transform: translateY(0)     rotate(0deg);   opacity: 0.12; }
          100% { transform: translateY(900px) rotate(180deg); opacity: 0; }
        }
      `
      document.head.appendChild(style)
    }
  }
}
