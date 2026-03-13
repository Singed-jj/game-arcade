import { eventBus } from '@/state/event-bus'
import type { SaveData } from '@/state/save-manager'
import type { HeartManager } from '@/state/heart-manager'
import type { PieceManager } from '@/state/piece-manager'
import { HUD } from '@/ui/hud'
import stoneMapData from '@/assets/data/stone-map.json'

/** 레벨 노드 반지름 (px) — 고정값, 레벨별 오버라이드 가능 */
const DEFAULT_RADIUS = 9
const LEVEL_RADIUS_OVERRIDE: Record<number, number> = {}

interface StoneEntry {
  cx: number
  cy: number
}

interface StoneMapData {
  imageSize: { w: number; h: number }
  stones: StoneEntry[]
}

const stoneMap = stoneMapData as StoneMapData

/**
 * backgroundSize:contain + backgroundPosition:top center 조건에서
 * 이미지가 컨테이너에 렌더링될 때의 스케일과 오프셋을 계산한다.
 * contain → 이미지 전체가 잘리지 않게 표시, 남은 공간은 여백.
 */
function computeContainTransform(
  imgW: number,
  imgH: number,
  containerW: number,
  containerH: number,
): { scale: number; offsetX: number; offsetY: number } {
  const scale = Math.min(containerW / imgW, containerH / imgH)
  const renderedW = imgW * scale
  // backgroundPosition: top center → X는 중앙 정렬, Y는 0
  const offsetX = (containerW - renderedW) / 2
  const offsetY = 0
  return { scale, offsetX, offsetY }
}

/** 레벨 번호 → 화면 좌표(px) + 반지름(px) */
function getNodePosition(
  level: number,
  containerW: number,
  containerH: number,
): { left: number; top: number; radius: number } {
  // stones[0] = level 1, stones[1] = level 2, ...
  const stone = stoneMap.stones[level - 1]

  const { scale, offsetX, offsetY } = computeContainTransform(
    stoneMap.imageSize.w,
    stoneMap.imageSize.h,
    containerW,
    containerH,
  )

  if (!stone) {
    // fallback: JSON에 없는 레벨은 자동 생성 패턴
    const extra = level - stoneMap.stones.length
    return {
      left: extra % 2 === 1 ? containerW * 0.30 : containerW * 0.65,
      top: containerH * Math.min(0.92, 0.81 + extra * 0.05),
      radius: DEFAULT_RADIUS,
    }
  }

  const px = stone.cx * stoneMap.imageSize.w * scale + offsetX
  const py = stone.cy * stoneMap.imageSize.h * scale + offsetY
  const radius = LEVEL_RADIUS_OVERRIDE[level] ?? DEFAULT_RADIUS

  return { left: px, top: py, radius }
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
    container.style.backgroundSize = 'contain'
    container.style.backgroundPosition = 'top center'
    container.style.backgroundColor = '#4a7c2f'

    // --- 헤더 (반투명 배경 패널) ---
    const headerPanel = document.createElement('div')
    headerPanel.className = 'absolute top-0 left-0 right-0 z-20 bg-black/30 backdrop-blur-sm'
    headerPanel.style.paddingTop = 'var(--ticker-h)'
    const hud = new HUD(heartManager)
    hud.hideBack()
    hud.updateHearts(heartManager.getHearts())
    hud.updatePieces(pieceManager.getPieces())
    headerPanel.appendChild(hud.el)
    container.appendChild(headerPanel)

    const nodeContainer = document.createElement('div')
    nodeContainer.className = 'absolute inset-0'
    const maxVisible = Math.min(save.unlockedLevel + 3, 20)

    // 컨테이너 크기 취득 (DOM에 마운트된 후 실제 크기)
    const containerW = container.offsetWidth || 375
    const containerH = container.offsetHeight || window.innerHeight

    for (let level = 1; level <= maxVisible; level++) {
      const stars = save.levelStars[level] ?? 0
      const isUnlocked = level <= save.unlockedLevel
      const isCurrent = level === save.unlockedLevel
      const pos = getNodePosition(level, containerW, containerH)

      const diameter = pos.radius * 2
      const fontSize = Math.max(10, Math.round(pos.radius * 0.55))

      const node = document.createElement('button')
      node.style.width = `${diameter}px`
      node.style.height = `${diameter}px`
      node.style.fontSize = `${fontSize}px`
      node.className = 'rounded-full flex items-center justify-center font-bold transition-transform active:scale-90'

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
          node.innerHTML = `<span>${level}</span><span style="font-size:${Math.max(8, fontSize - 3)}px;margin-left:2px;opacity:0.9">✓</span>`
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
          s.style.fontSize = '11px'
          if (i < stars) {
            s.textContent = '⭐'
            s.style.filter = 'drop-shadow(0 1px 3px rgba(255,200,0,0.8))'
          } else {
            s.textContent = '☆'
            s.style.color = 'rgba(255,255,255,0.55)'
            s.style.fontSize = '10px'
          }
          starRow.appendChild(s)
        }
      }

      const wrap = document.createElement('div')
      wrap.className = 'absolute flex flex-col items-center'
      wrap.style.left = `${pos.left}px`
      wrap.style.top = `${pos.top}px`
      wrap.style.transform = 'translate(-50%, -50%)'

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
