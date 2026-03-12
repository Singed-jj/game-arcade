import { eventBus } from '@/state/event-bus'
import type { PieceManager } from '@/state/piece-manager'

export class ClearScreen {
  constructor(container: HTMLElement, pieceManager: PieceManager, data?: Record<string, unknown>) {
    const stars = (data?.stars as number) ?? 1
    const level = (data?.level as number) ?? 1

    container.className = 'relative w-full h-dvh max-w-[375px] mx-auto flex flex-col items-center justify-center bg-gradient-to-b from-[#1a0a3e] to-[#0E0A28]'

    const title = document.createElement('h2')
    title.textContent = '클리어!'
    title.className = 'text-3xl font-bold text-yellow-400 mb-6'
    container.appendChild(title)

    const starRow = document.createElement('div')
    starRow.className = 'flex gap-3 mb-6'
    for (let i = 0; i < 3; i++) {
      const img = document.createElement('img')
      img.src = i < stars ? '/assets/ui/star-full.png' : '/assets/ui/star-empty.png'
      img.className = 'w-12 h-12 animate-star-drop'
      img.style.animationDelay = `${i * 0.2}s`
      starRow.appendChild(img)
    }
    container.appendChild(starRow)

    const pieceInfo = document.createElement('div')
    pieceInfo.className = 'flex items-center gap-2 mb-8 text-white'
    const pieceImg = document.createElement('img')
    pieceImg.src = '/assets/ui/puzzle-piece.png'
    pieceImg.className = 'w-6 h-6'
    const pieceText = document.createElement('span')
    pieceText.textContent = `조각 +1 (${pieceManager.getPieces()}/5)`
    pieceInfo.appendChild(pieceImg)
    pieceInfo.appendChild(pieceText)
    container.appendChild(pieceInfo)

    const nextBtn = document.createElement('button')
    nextBtn.textContent = '다음 레벨'
    nextBtn.className = 'px-10 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-full'
    nextBtn.addEventListener('click', () => {
      eventBus.emit('screen:change', { screen: 'game', data: { level: level + 1 } })
    })
    container.appendChild(nextBtn)

    const mapBtn = document.createElement('button')
    mapBtn.textContent = '맵으로'
    mapBtn.className = 'mt-3 px-8 py-2 bg-white/20 text-white rounded-full'
    mapBtn.addEventListener('click', () => {
      eventBus.emit('screen:change', { screen: 'map' })
    })
    container.appendChild(mapBtn)
  }
}
