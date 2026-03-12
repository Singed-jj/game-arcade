import { ToolType } from '@/core/types'
import { eventBus } from '@/state/event-bus'
import type { PieceManager } from '@/state/piece-manager'
import type { ToolManager } from '@/state/tool-manager'

const GACHA_POOL: { type: ToolType; weight: number }[] = [
  { type: ToolType.ROCKET, weight: 40 },
  { type: ToolType.BOMB, weight: 35 },
  { type: ToolType.RAINBOW, weight: 25 },
]

export class GachaScreen {
  constructor(container: HTMLElement, pieceManager: PieceManager, toolManager: ToolManager) {
    container.className = 'relative w-full h-dvh max-w-[375px] mx-auto flex flex-col items-center justify-center bg-gradient-to-b from-[#2a0a4e] to-[#0E0A28]'

    if (!pieceManager.useForGacha()) {
      eventBus.emit('screen:change', { screen: 'map' })
      return
    }

    const roll = Math.random() * 100
    let cumulative = 0
    let result = GACHA_POOL[0].type
    for (const item of GACHA_POOL) {
      cumulative += item.weight
      if (roll < cumulative) { result = item.type; break }
    }

    toolManager.addTool(result)

    const title = document.createElement('h2')
    title.textContent = '뽑기!'
    title.className = 'text-3xl font-bold text-purple-300 mb-8'
    container.appendChild(title)

    const resultBox = document.createElement('div')
    resultBox.className = 'w-32 h-32 rounded-2xl bg-purple-500/30 flex items-center justify-center text-6xl mb-6'
    const emoji = result === ToolType.ROCKET ? '🚀' : result === ToolType.BOMB ? '💣' : '🌈'
    resultBox.textContent = emoji
    container.appendChild(resultBox)

    const resultLabel = document.createElement('p')
    resultLabel.className = 'text-white font-bold text-xl mb-8'
    resultLabel.textContent = `${result === ToolType.ROCKET ? '로켓' : result === ToolType.BOMB ? '폭탄' : '무지개'} 획득!`
    container.appendChild(resultLabel)

    const okBtn = document.createElement('button')
    okBtn.textContent = '확인'
    okBtn.className = 'px-10 py-3 bg-purple-500 text-white font-bold rounded-full'
    okBtn.addEventListener('click', () => {
      eventBus.emit('screen:change', { screen: 'map' })
    })
    container.appendChild(okBtn)
  }
}
