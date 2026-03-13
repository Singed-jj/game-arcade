import { ToolType } from '@/core/types'
import type { GachaResult, GachaResultType } from '@/core/types'
import { eventBus } from '@/state/event-bus'
import type { PieceManager } from '@/state/piece-manager'
import type { ToolManager } from '@/state/tool-manager'

/** 릴 아이템 배열 (반복 순환) */
const REEL_ITEMS = ['🚀', '💣', '🎟', '🚀', '🍗', '💣', '🌈']

/** GachaResultType -> 릴에서 정지할 이모지 */
function getTargetEmoji(result: GachaResult): string {
  switch (result.type) {
    case 'tool1':
      return result.tools?.[0] === 'BOMB' ? '💣' : '🚀'
    case 'tool3':
      return '🎟'
    case 'coupon1000':
    case 'coupon2000':
      return '🎟'
    case 'chicken':
      return '🍗'
  }
}

/** 릴 셀 높이 */
const CELL_HEIGHT = 60
/** 보이는 영역 높이 */
const VISIBLE_HEIGHT = 288

function showToast(msg: string): void {
  const t = document.createElement('div')
  t.textContent = msg
  Object.assign(t.style, {
    position: 'fixed', bottom: '80px', left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.85)', color: 'white',
    padding: '8px 16px', borderRadius: '8px',
    fontSize: '13px', zIndex: '9999',
  })
  document.body.appendChild(t)
  setTimeout(() => t.remove(), 2000)
}

export class GachaScreen {
  constructor(container: HTMLElement, pieceManager: PieceManager, toolManager: ToolManager) {
    container.className = 'relative w-full h-dvh max-w-[375px] mx-auto flex flex-col items-center overflow-hidden'
    container.style.background = 'linear-gradient(180deg, #1a0533 0%, #0E0A28 100%)'

    const result = pieceManager.useForGacha()
    if (!result) {
      eventBus.emit('screen:change', { screen: 'map' })
      return
    }

    this.injectStyles()
    this.buildReelScreen(container, result, toolManager)
  }

  private buildReelScreen(container: HTMLElement, result: GachaResult, toolManager: ToolManager): void {
    // ── 마스콧 + 타이틀 ──
    const header = document.createElement('div')
    header.className = 'flex items-center gap-2 mt-12 mb-6'
    header.innerHTML = '<span style="font-size:40px">🐥</span><span class="text-white text-lg font-bold">두근두근... 뭐가 나올까?</span>'
    container.appendChild(header)

    // ── 릴 영역 ──
    const reelWrapper = document.createElement('div')
    reelWrapper.className = 'relative'
    reelWrapper.style.cssText = `
      width: calc(100% - 48px);
      height: ${VISIBLE_HEIGHT}px;
      overflow: hidden;
      border-radius: 16px;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.2);
    `

    // 릴 스트립
    const reelStrip = document.createElement('div')
    reelStrip.style.cssText = 'position: absolute; left: 0; right: 0; will-change: transform;'

    // 릴 아이템 충분히 반복 (70개)
    const totalCells = REEL_ITEMS.length * 10
    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('div')
      cell.style.cssText = `
        height: ${CELL_HEIGHT}px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 36px;
        color: white;
        border-bottom: 1px solid rgba(255,255,255,0.05);
      `
      cell.textContent = REEL_ITEMS[i % REEL_ITEMS.length]
      reelStrip.appendChild(cell)
    }
    reelWrapper.appendChild(reelStrip)

    // ── 하이라이트 프레임 (정중앙) ──
    const highlightY = (VISIBLE_HEIGHT - CELL_HEIGHT) / 2
    const highlight = document.createElement('div')
    highlight.style.cssText = `
      position: absolute;
      left: 8px; right: 8px;
      top: ${highlightY}px;
      height: ${CELL_HEIGHT}px;
      border: 2px solid #FFD700;
      border-radius: 8px;
      background: rgba(255,215,0,0.08);
      pointer-events: none;
      z-index: 2;
    `
    reelWrapper.appendChild(highlight)

    // 상단/하단 그라데이션 페이드
    const fadeTop = document.createElement('div')
    fadeTop.style.cssText = 'position:absolute;top:0;left:0;right:0;height:60px;background:linear-gradient(180deg,#1a0533,transparent);pointer-events:none;z-index:1;'
    const fadeBottom = document.createElement('div')
    fadeBottom.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:60px;background:linear-gradient(0deg,#0E0A28,transparent);pointer-events:none;z-index:1;'
    reelWrapper.appendChild(fadeTop)
    reelWrapper.appendChild(fadeBottom)

    container.appendChild(reelWrapper)

    // ── 결과 오버레이 (처음에 숨김) ──
    const resultOverlay = document.createElement('div')
    resultOverlay.style.cssText = `
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(14,10,40,0.95);
      opacity: 0;
      transition: opacity 0.5s ease;
      pointer-events: none;
      z-index: 10;
      padding: 24px;
    `
    container.appendChild(resultOverlay)

    // ── 릴 애니메이션 시작 ──
    this.animateReel(reelStrip, result, toolManager, resultOverlay)
  }

  private animateReel(
    reelStrip: HTMLElement,
    result: GachaResult,
    toolManager: ToolManager,
    resultOverlay: HTMLElement,
  ): void {
    const targetEmoji = getTargetEmoji(result)
    // 릴 배열에서 targetEmoji 위치 찾기
    let targetIndexInReel = REEL_ITEMS.indexOf(targetEmoji)
    if (targetIndexInReel < 0) targetIndexInReel = 0

    // 하이라이트 프레임 중앙 Y 좌표
    const highlightCenterY = (VISIBLE_HEIGHT - CELL_HEIGHT) / 2

    // 5바퀴 + 타겟 인덱스
    const fullRotations = 5
    let finalCellIndex = fullRotations * REEL_ITEMS.length + targetIndexInReel

    // ── Near-miss 로직 (30% 확률) ──
    // 결과가 치킨이 아닐 때, 30%로 🍗가 하이라이트 직전/직후 셀에 오도록 조정
    if (result.type !== 'chicken' && Math.random() < 0.3) {
      const chickenIdx = REEL_ITEMS.indexOf('🍗') // 4
      const direction = Math.random() < 0.5 ? 1 : -1
      // 치킨이 하이라이트 기준 direction 위치에 오려면:
      // 중앙 셀 = finalCellIndex, 치킨 = finalCellIndex + direction
      // 즉 finalCellIndex + direction 위치의 릴 아이템이 🍗여야 함
      // (finalCellIndex + direction) % REEL_ITEMS.length === chickenIdx
      // finalCellIndex = chickenIdx - direction (mod REEL_ITEMS.length) + fullRotations * REEL_ITEMS.length
      const nearMissCenter = ((chickenIdx - direction) % REEL_ITEMS.length + REEL_ITEMS.length) % REEL_ITEMS.length
      // 중앙 셀의 이모지가 원래 targetEmoji와 같은지 확인
      if (REEL_ITEMS[nearMissCenter] === targetEmoji) {
        finalCellIndex = fullRotations * REEL_ITEMS.length + nearMissCenter
      }
    }

    // 최종 Y 위치: finalCellIndex 셀이 하이라이트 중앙에 오도록
    const finalY = -(finalCellIndex * CELL_HEIGHT - highlightCenterY)

    // 애니메이션 타이밍
    const FAST_DURATION = 1500   // 0~1.5초: 빠른 스크롤
    const SLOW_DURATION = 1500   // 1.5~3.0초: 감속
    const TOTAL_DURATION = FAST_DURATION + SLOW_DURATION
    const PAUSE_BEFORE_RESULT = 1000 // 정지 후 1초 대기

    // 빠른 스크롤 단계 종료 지점 (전체 거리의 ~70%)
    const totalDistance = Math.abs(finalY)
    const fastEndY = -(totalDistance * 0.7)

    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime

      let currentY: number

      if (elapsed < FAST_DURATION) {
        // Phase 1: 빠른 스크롤 (linear)
        const progress = elapsed / FAST_DURATION
        currentY = fastEndY * progress
      } else if (elapsed < TOTAL_DURATION) {
        // Phase 2: 감속 (easeOutCubic)
        const slowElapsed = elapsed - FAST_DURATION
        const progress = slowElapsed / SLOW_DURATION
        const eased = 1 - Math.pow(1 - progress, 3)
        currentY = fastEndY + (finalY - fastEndY) * eased
      } else {
        // 정지
        reelStrip.style.transform = `translateY(${finalY}px)`

        setTimeout(() => {
          this.showResult(resultOverlay, result, toolManager)
        }, PAUSE_BEFORE_RESULT)
        return
      }

      reelStrip.style.transform = `translateY(${currentY}px)`
      requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }

  private showResult(overlay: HTMLElement, result: GachaResult, toolManager: ToolManager): void {
    overlay.innerHTML = ''
    overlay.style.opacity = '1'
    overlay.style.pointerEvents = 'auto'

    const rocketCount = toolManager.getCount(ToolType.ROCKET)
    const bombCount = toolManager.getCount(ToolType.BOMB)
    const rainbowCount = toolManager.getCount(ToolType.RAINBOW)
    const inventoryLine = `현재 보유: 🚀\u00D7${rocketCount}  💣\u00D7${bombCount}  🌈\u00D7${rainbowCount}`

    switch (result.type) {
      case 'tool1': {
        const isBomb = result.tools?.[0] === 'BOMB'
        const toolEmoji = isBomb ? '💣' : '🚀'
        const toolName = isBomb ? '폭탄' : '로켓'
        const desc = isBomb
          ? '주변 3\u00D73 블록을 한 번에 제거해요!'
          : '가로 또는 세로 한 줄을 한 번에 제거해요!'
        this.addText(overlay, `${toolEmoji} ${toolName} 획득!`, 'text-2xl font-bold text-white mb-2')
        this.addText(overlay, desc, 'text-sm text-gray-300 mb-4')
        this.addText(overlay, inventoryLine, 'text-sm text-yellow-300 mb-8')
        this.addButton(overlay, '확인', () => {
          eventBus.emit('screen:change', { screen: 'map' })
        })
        break
      }
      case 'tool3': {
        this.addText(overlay, '🎰 대박! 도구 3개 획득!', 'text-2xl font-bold text-white mb-2')
        this.addText(overlay, '🚀\u00D71  💣\u00D71  🌈\u00D71', 'text-lg text-white mb-4')
        this.addText(overlay, inventoryLine, 'text-sm text-yellow-300 mb-8')
        this.addButton(overlay, '확인', () => {
          eventBus.emit('screen:change', { screen: 'map' })
        })
        break
      }
      case 'coupon1000': {
        this.buildCouponResult(overlay, '1,000원 할인 쿠폰')
        break
      }
      case 'coupon2000': {
        this.buildCouponResult(overlay, '2,000원 할인 쿠폰')
        break
      }
      case 'chicken': {
        this.addText(overlay, '🍗 1인 치킨 당첨!!!', 'text-2xl font-bold text-white mb-2')
        this.addText(overlay, '1인 치킨 쿠폰 (10,000원 상당)', 'text-base text-white mb-1')
        this.addText(overlay, '두잇 앱 주문 시 사용 \u00B7 \u23F0 24시간 유효', 'text-sm text-gray-400 mb-6')
        this.addButton(overlay, '🛒 지금 바로 주문하기', () => {
          showToast('현재 구현중인 화면입니다')
        }, 'from-yellow-500 to-orange-500')
        this.addButton(overlay, '나중에 쓸게요', () => {
          eventBus.emit('screen:change', { screen: 'map' })
        }, 'from-gray-600 to-gray-700', 'mt-3')
        break
      }
    }
  }

  private buildCouponResult(overlay: HTMLElement, couponName: string): void {
    this.addText(overlay, '🎉 축하해요!', 'text-2xl font-bold text-white mb-2')
    this.addText(overlay, couponName, 'text-xl font-bold text-yellow-300 mb-1')
    this.addText(overlay, '두잇 앱 주문 시 사용 \u00B7 \u23F0 24시간 유효', 'text-sm text-gray-400 mb-6')
    this.addButton(overlay, '🛒 지금 바로 주문하기', () => {
      showToast('현재 구현중인 화면입니다')
    }, 'from-yellow-500 to-orange-500')
    this.addButton(overlay, '나중에 쓸게요', () => {
      eventBus.emit('screen:change', { screen: 'map' })
    }, 'from-gray-600 to-gray-700', 'mt-3')
  }

  private addText(parent: HTMLElement, text: string, className: string): void {
    const el = document.createElement('div')
    el.textContent = text
    el.className = className
    parent.appendChild(el)
  }

  private addButton(
    parent: HTMLElement,
    text: string,
    onClick: () => void,
    gradient = 'from-purple-500 to-pink-500',
    extraClass = '',
  ): void {
    const btn = document.createElement('button')
    btn.textContent = text
    btn.className = `w-64 py-3 bg-gradient-to-r ${gradient} text-white font-bold rounded-full text-base shadow-lg active:scale-95 transition-transform ${extraClass}`
    btn.addEventListener('click', onClick)
    parent.appendChild(btn)
  }

  private injectStyles(): void {
    if (document.getElementById('gacha-styles')) return
    const style = document.createElement('style')
    style.id = 'gacha-styles'
    style.textContent = `
      @keyframes gacha-fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `
    document.head.appendChild(style)
  }
}
