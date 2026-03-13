import { eventBus } from '@/state/event-bus'
import type { SaveData } from '@/state/save-manager'
import type { HeartManager } from '@/state/heart-manager'
import type { PieceManager } from '@/state/piece-manager'
import { HUD } from '@/ui/hud'

/** Pre-calculated positions matching the S-curve path in stage-map.png (375px viewport) */
const NODE_POSITIONS: Array<{ left: string; top: string }> = [
  { left: '27%', top: '380px' },   // Level 1: bottom-left pizza shop
  { left: '48%', top: '240px' },   // Level 2: pond bend
  { left: '70%', top: '320px' },   // Level 3: right side path
  { left: '55%', top: '450px' },   // Level 4: below pond
  { left: '35%', top: '540px' },   // Level 5: lower path
]

function getNodePosition(level: number): { left: string; top: string } {
  if (level <= NODE_POSITIONS.length) {
    return NODE_POSITIONS[level - 1]
  }
  // Level 6+: continue along path, alternating left/right with ~100px vertical spacing
  const extra = level - NODE_POSITIONS.length
  const baseTop = 540 + extra * 100
  const isLeft = extra % 2 === 1
  return {
    left: isLeft ? '30%' : '65%',
    top: `${baseTop}px`,
  }
}

function getMapHeight(maxLevel: number): number {
  if (maxLevel <= 5) return 700
  const extra = maxLevel - 5
  return 700 + extra * 100
}

export class MapScreen {
  constructor(
    container: HTMLElement,
    save: SaveData,
    heartManager: HeartManager,
    pieceManager: PieceManager,
  ) {
    container.className = 'relative w-full h-dvh max-w-[375px] mx-auto overflow-hidden flex flex-col'
    container.style.backgroundImage = 'url(/assets/bg/stage-map.png)'
    container.style.backgroundSize = 'cover'

    // --- 헤더 (반투명 배경 패널) ---
    const headerPanel = document.createElement('div')
    headerPanel.className = 'bg-black/30 backdrop-blur-sm'
    const hud = new HUD()
    hud.updateHearts(heartManager.getHearts())
    hud.updatePieces(pieceManager.getPieces())
    headerPanel.appendChild(hud.el)
    container.appendChild(headerPanel)

    // --- 스크롤 영역 ---
    const scrollArea = document.createElement('div')
    scrollArea.className = 'flex-1 overflow-y-auto'

    const nodeContainer = document.createElement('div')
    nodeContainer.className = 'relative w-full'
    nodeContainer.style.minHeight = `${getMapHeight(save.unlockedLevel)}px`

    for (let level = 1; level <= save.unlockedLevel; level++) {
      const stars = save.levelStars[level] ?? 0
      const isUnlocked = level <= save.unlockedLevel
      const isCurrent = level === save.unlockedLevel
      const pos = getNodePosition(level)

      const node = document.createElement('button')
      node.className = 'w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition-transform active:scale-90'

      if (isCurrent) {
        node.style.background = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
        node.style.boxShadow = '0 4px 20px rgba(245,158,11,0.6), 0 0 0 3px #fff, 0 0 0 5px rgba(245,158,11,0.4), inset 0 1px 0 rgba(255,255,255,0.4)'
        node.style.color = 'white'
        node.style.animation = 'map-pulse 1.8s ease-in-out infinite'
        node.textContent = String(level)
      } else if (isUnlocked) {
        node.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
        node.style.boxShadow = '0 4px 12px rgba(34,197,94,0.4), 0 0 0 2.5px rgba(255,255,255,0.8), inset 0 1px 0 rgba(255,255,255,0.3)'
        node.style.color = 'white'
        if (stars > 0) {
          node.innerHTML = `<span class="text-base">${level}</span><span style="font-size:9px;margin-left:2px;opacity:0.9">✓</span>`
        } else {
          node.textContent = String(level)
        }
      } else {
        node.style.background = 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
        node.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.3)'
        node.style.color = 'rgba(255,255,255,0.5)'
        node.textContent = String(level)
      }

      if (isUnlocked) {
        node.addEventListener('click', () => {
          if (heartManager.getHearts() <= 0) {
            const toast = document.createElement('div')
            toast.textContent = '하트가 없어요! 💔'
            toast.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-3 rounded-full text-sm font-bold z-50'
            document.body.appendChild(toast)
            setTimeout(() => toast.remove(), 2000)
            return
          }
          eventBus.emit('screen:change', { screen: 'game', data: { level } })
        })
      }

      // 별 표시
      const starRow = document.createElement('div')
      starRow.className = 'flex gap-0.5 mt-1 justify-center'
      for (let i = 0; i < 3; i++) {
        const s = document.createElement('span')
        s.style.fontSize = '12px'
        if (i < stars) {
          s.textContent = '⭐'
          s.style.filter = 'drop-shadow(0 1px 3px rgba(255,200,0,0.8))'
        } else {
          s.textContent = '☆'
          s.style.color = 'rgba(255,255,255,0.55)'
          s.style.fontSize = '11px'
        }
        starRow.appendChild(s)
      }

      const wrap = document.createElement('div')
      wrap.className = 'absolute flex flex-col items-center'
      wrap.style.left = pos.left
      wrap.style.top = pos.top
      wrap.style.transform = 'translateX(-50%)'
      wrap.appendChild(node)
      wrap.appendChild(starRow)
      nodeContainer.appendChild(wrap)
    }

    scrollArea.appendChild(nodeContainer)

    // --- 스크롤 힌트 (레벨 > 5일 때) ---
    if (save.unlockedLevel > 5) {
      const hint = document.createElement('p')
      hint.textContent = '↕ 스크롤하여 레벨 탐색'
      hint.className = 'text-white/40 text-xs text-center mt-6 mb-2'
      scrollArea.appendChild(hint)
    }

    container.appendChild(scrollArea)

    if (pieceManager.canGacha()) {
      const gachaBtn = document.createElement('button')
      gachaBtn.textContent = '✨ 뽑기 가능!'
      gachaBtn.className = 'mx-auto mb-4 px-8 py-3 text-white font-bold rounded-full text-base active:scale-95 transition-transform'
      gachaBtn.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
      gachaBtn.style.boxShadow = '0 4px 20px rgba(139,92,246,0.5), 0 0 0 2px rgba(255,255,255,0.6)'
      gachaBtn.style.animation = 'map-pulse 2s ease-in-out infinite'
      gachaBtn.addEventListener('click', () => {
        eventBus.emit('screen:change', { screen: 'gacha' })
      })
      container.appendChild(gachaBtn)
    }

    // map-pulse animation
    if (!document.getElementById('map-styles')) {
      const style = document.createElement('style')
      style.id = 'map-styles'
      style.textContent = `
        @keyframes map-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
      `
      document.head.appendChild(style)
    }
  }
}
