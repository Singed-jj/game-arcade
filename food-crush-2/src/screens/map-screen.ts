import { eventBus } from '@/state/event-bus'
import type { SaveData } from '@/state/save-manager'
import type { HeartManager } from '@/state/heart-manager'
import type { PieceManager } from '@/state/piece-manager'
import { HUD } from '@/ui/hud'

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

    const hud = new HUD()
    hud.updateHearts(heartManager.getHearts())
    hud.updatePieces(pieceManager.getPieces())
    container.appendChild(hud.el)

    const scrollArea = document.createElement('div')
    scrollArea.className = 'flex-1 overflow-y-auto px-4 py-8'
    const nodeContainer = document.createElement('div')
    nodeContainer.className = 'flex flex-col items-center gap-6'

    for (let level = save.unlockedLevel; level >= 1; level--) {
      const node = document.createElement('button')
      const stars = save.levelStars[level] ?? 0
      const isUnlocked = level <= save.unlockedLevel
      const isCurrent = level === save.unlockedLevel

      node.className = `w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg ${
        isCurrent ? 'bg-yellow-400 text-white animate-glow' :
        isUnlocked ? 'bg-green-500 text-white' :
        'bg-gray-600 text-gray-400'
      }`
      node.textContent = String(level)

      if (isUnlocked) {
        node.addEventListener('click', () => {
          eventBus.emit('screen:change', { screen: 'game', data: { level } })
        })
      }

      if (stars > 0) {
        const starRow = document.createElement('div')
        starRow.className = 'flex gap-0.5 mt-1'
        for (let i = 0; i < 3; i++) {
          const s = document.createElement('img')
          s.src = i < stars ? '/assets/ui/star-full.png' : '/assets/ui/star-empty.png'
          s.className = 'w-3 h-3'
          starRow.appendChild(s)
        }
        const wrap = document.createElement('div')
        wrap.className = 'flex flex-col items-center'
        wrap.appendChild(node)
        wrap.appendChild(starRow)
        nodeContainer.appendChild(wrap)
      } else {
        nodeContainer.appendChild(node)
      }
    }

    scrollArea.appendChild(nodeContainer)
    container.appendChild(scrollArea)

    if (pieceManager.canGacha()) {
      const gachaBtn = document.createElement('button')
      gachaBtn.textContent = '뽑기!'
      gachaBtn.className = 'mx-auto mb-4 px-8 py-3 bg-purple-500 text-white font-bold rounded-full'
      gachaBtn.addEventListener('click', () => {
        eventBus.emit('screen:change', { screen: 'gacha' })
      })
      container.appendChild(gachaBtn)
    }
  }
}
