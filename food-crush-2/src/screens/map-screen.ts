import { eventBus } from '@/state/event-bus'
import type { SaveData } from '@/state/save-manager'
import type { HeartManager } from '@/state/heart-manager'
import type { PieceManager } from '@/state/piece-manager'
import { HUD } from '@/ui/hud'

/** Pre-calculated positions matching the S-curve path in stage-map.png (% based) */
const NODE_POSITIONS: Array<{ left: string; top: string }> = [
  { left: '27%', top: '57%' },   // Level 1: 피자 가게 앞 돌다리
  { left: '48%', top: '36%' },   // Level 2: 연못 굴곡 돌다리
  { left: '70%', top: '48%' },   // Level 3: 우측 버거 가게 앞
  { left: '55%', top: '67%' },   // Level 4: 연못 아래 돌다리
  { left: '35%', top: '81%' },   // Level 5: 하단 돌다리
]

function getNodePosition(level: number): { left: string; top: string } {
  if (level <= NODE_POSITIONS.length) {
    return NODE_POSITIONS[level - 1]
  }
  const extra = level - NODE_POSITIONS.length
  return {
    left: extra % 2 === 1 ? '30%' : '65%',
    top: `${Math.min(92, 81 + extra * 5)}%`,
  }
}

export class MapScreen {
  constructor(
    container: HTMLElement,
    save: SaveData,
    heartManager: HeartManager,
    pieceManager: PieceManager,
  ) {
    container.className = 'relative w-full h-dvh max-w-[375px] mx-auto overflow-hidden'
    container.style.backgroundImage = 'url(/assets/bg/stage-map.png)'
    container.style.backgroundSize = 'cover'
    container.style.backgroundPosition = 'top center'

    // --- 헤더 (반투명 배경 패널) ---
    const headerPanel = document.createElement('div')
    headerPanel.className = 'absolute top-0 left-0 right-0 z-20 bg-black/30 backdrop-blur-sm'
    headerPanel.style.paddingTop = 'var(--ticker-h)'
    const hud = new HUD(heartManager)
    hud.updateHearts(heartManager.getHearts())
    hud.updatePieces(pieceManager.getPieces())
    headerPanel.appendChild(hud.el)
    container.appendChild(headerPanel)

    const nodeContainer = document.createElement('div')
    nodeContainer.className = 'absolute inset-0'
    const maxVisible = save.unlockedLevel + 3

    for (let level = 1; level <= maxVisible; level++) {
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
        // 잠금 레벨: 🔒 표시
        node.style.background = 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
        node.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.3)'
        node.style.color = 'rgba(255,255,255,0.5)'
        node.textContent = '🔒'
        node.disabled = true
      }

      if (isUnlocked) {
        node.addEventListener('click', () => {
          if (heartManager.getHearts() <= 0) {
            eventBus.emit('screen:change', { screen: 'no-hearts' })
            return
          }
          eventBus.emit('screen:change', { screen: 'game', data: { level } })
        })
      }

      // 별 표시 (잠금 레벨에는 별 미표시)
      const starRow = document.createElement('div')
      starRow.className = 'flex gap-0.5 mt-1 justify-center'
      if (isUnlocked) {
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
      }

      const wrap = document.createElement('div')
      wrap.className = 'absolute flex flex-col items-center'
      wrap.style.left = pos.left
      wrap.style.top = pos.top
      wrap.style.transform = 'translateX(-50%)'

      // 현재 레벨: "플레이!" 태그 + 🐥 마스콧
      if (isCurrent) {
        const playTag = document.createElement('div')
        playTag.textContent = '플레이!'
        playTag.className = 'text-xs font-bold text-white px-2 py-0.5 rounded-full mb-1'
        playTag.style.background = 'linear-gradient(135deg, #f97316, #ea580c)'
        playTag.style.boxShadow = '0 2px 8px rgba(249,115,22,0.5)'
        playTag.style.whiteSpace = 'nowrap'
        wrap.appendChild(playTag)

        const nodeRow = document.createElement('div')
        nodeRow.className = 'flex items-center gap-1'
        nodeRow.appendChild(node)
        const mascot = document.createElement('span')
        mascot.textContent = '🐥'
        mascot.style.fontSize = '20px'
        mascot.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
        nodeRow.appendChild(mascot)
        wrap.appendChild(nodeRow)
      } else {
        wrap.appendChild(node)
      }

      wrap.appendChild(starRow)
      nodeContainer.appendChild(wrap)
    }

    container.appendChild(nodeContainer)

    // --- 아이템 버튼 (오른쪽 하단 고정) ---
    const itemBtn = document.createElement('button')
    itemBtn.innerHTML = '🎒<span class="text-xs block">아이템</span>'
    itemBtn.className = 'absolute bottom-20 right-3 w-14 h-14 rounded-full bg-purple-600 text-white flex flex-col items-center justify-center font-bold shadow-lg active:scale-90 transition-transform z-10'
    itemBtn.style.boxShadow = '0 4px 16px rgba(147,51,234,0.5)'
    itemBtn.addEventListener('click', () => {
      eventBus.emit('screen:change', { screen: 'inventory' })
    })
    container.appendChild(itemBtn)

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
