import { ToolType } from '@/core/types'
import { eventBus } from '@/state/event-bus'
import type { PieceManager } from '@/state/piece-manager'
import type { ToolManager } from '@/state/tool-manager'

const GACHA_POOL: { type: ToolType; weight: number }[] = [
  { type: ToolType.ROCKET, weight: 40 },
  { type: ToolType.BOMB, weight: 35 },
  { type: ToolType.RAINBOW, weight: 25 },
]

const RARITY: Record<ToolType, { label: string; emoji: string; name: string; color: string; glow: string; stars: number }> = {
  [ToolType.ROCKET]: {
    label: 'COMMON',
    emoji: '🚀',
    name: '로켓',
    color: 'from-blue-500 to-cyan-400',
    glow: 'rgba(59,130,246,0.6)',
    stars: 2,
  },
  [ToolType.BOMB]: {
    label: 'RARE',
    emoji: '💣',
    name: '폭탄',
    color: 'from-orange-500 to-red-400',
    glow: 'rgba(249,115,22,0.6)',
    stars: 3,
  },
  [ToolType.RAINBOW]: {
    label: 'EPIC',
    emoji: '🌈',
    name: '무지개',
    color: 'from-purple-500 to-pink-400',
    glow: 'rgba(168,85,247,0.6)',
    stars: 5,
  },
}

export class GachaScreen {
  constructor(container: HTMLElement, pieceManager: PieceManager, toolManager: ToolManager) {
    container.className = 'relative w-full h-dvh max-w-[375px] mx-auto flex flex-col items-center justify-center overflow-hidden'
    container.style.background = 'linear-gradient(180deg, #1a0533 0%, #0E0A28 100%)'

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
    const rarity = RARITY[result]

    // Background sparkles
    const sparkleContainer = document.createElement('div')
    sparkleContainer.className = 'absolute inset-0 pointer-events-none'
    for (let i = 0; i < 20; i++) {
      const spark = document.createElement('div')
      const size = 2 + Math.random() * 4
      spark.style.cssText = `
        position: absolute;
        width: ${size}px; height: ${size}px;
        border-radius: 50%;
        background: white;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: 0;
        animation: sparkle-float ${1.5 + Math.random() * 2}s ${Math.random() * 2}s infinite ease-in-out;
      `
      sparkleContainer.appendChild(spark)
    }
    container.appendChild(sparkleContainer)

    const title = document.createElement('h2')
    title.textContent = '뽑기!'
    title.className = 'text-3xl font-bold text-purple-300 mb-8 opacity-0'
    title.style.animation = 'fade-in-up 0.5s 0.2s forwards'
    container.appendChild(title)

    // Mystery box phase → reveal phase
    const boxWrapper = document.createElement('div')
    boxWrapper.className = 'relative flex flex-col items-center'

    const mysteryBox = document.createElement('div')
    mysteryBox.className = 'w-36 h-36 rounded-3xl flex items-center justify-center text-7xl mb-2'
    mysteryBox.style.cssText = `
      background: linear-gradient(135deg, #4c1d95, #7c3aed);
      box-shadow: 0 0 30px rgba(124,58,237,0.5);
      animation: mystery-shake 0.3s 0.5s 4 ease-in-out;
    `
    mysteryBox.textContent = '❓'

    const gradientColors: Record<ToolType, string> = {
      [ToolType.ROCKET]: 'linear-gradient(135deg, #3b82f6, #22d3ee)',
      [ToolType.BOMB]: 'linear-gradient(135deg, #f97316, #ef4444)',
      [ToolType.RAINBOW]: 'linear-gradient(135deg, #a855f7, #ec4899)',
    }
    const resultBox = document.createElement('div')
    resultBox.className = 'w-36 h-36 rounded-3xl flex items-center justify-center text-7xl mb-2 hidden'
    resultBox.style.background = gradientColors[result]
    resultBox.style.boxShadow = `0 0 40px ${rarity.glow}, inset 0 1px 0 rgba(255,255,255,0.3)`
    resultBox.textContent = rarity.emoji

    boxWrapper.appendChild(mysteryBox)
    boxWrapper.appendChild(resultBox)
    container.appendChild(boxWrapper)

    // Rarity badge (hidden initially)
    const rarityBadge = document.createElement('div')
    rarityBadge.textContent = rarity.label
    rarityBadge.className = `text-xs font-bold tracking-widest px-3 py-1 rounded-full mb-2 opacity-0 bg-gradient-to-r ${rarity.color} text-white`
    container.appendChild(rarityBadge)

    // Stars row (hidden initially)
    const starsRow = document.createElement('div')
    starsRow.className = 'flex gap-1 mb-4 opacity-0'
    for (let i = 0; i < 5; i++) {
      const s = document.createElement('span')
      s.textContent = i < rarity.stars ? '⭐' : '☆'
      s.className = i < rarity.stars ? 'text-lg' : 'text-lg opacity-20'
      starsRow.appendChild(s)
    }
    container.appendChild(starsRow)

    const resultLabel = document.createElement('p')
    resultLabel.className = 'text-white font-bold text-2xl mb-8 opacity-0'
    resultLabel.textContent = `${rarity.name} 획득!`
    container.appendChild(resultLabel)

    const okBtn = document.createElement('button')
    okBtn.textContent = '확인'
    okBtn.className = 'px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full text-lg shadow-lg active:scale-95 transition-transform opacity-0'
    okBtn.addEventListener('click', () => {
      eventBus.emit('screen:change', { screen: 'map' })
    })
    container.appendChild(okBtn)

    // Inject CSS animations
    if (!document.getElementById('gacha-styles')) {
      const style = document.createElement('style')
      style.id = 'gacha-styles'
      style.textContent = `
        @keyframes mystery-shake {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-8deg) scale(1.05); }
          75% { transform: rotate(8deg) scale(1.05); }
        }
        @keyframes reveal-pop {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          70% { transform: scale(1.2) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes sparkle-float {
          0%, 100% { opacity: 0; transform: translateY(0) scale(0.5); }
          50% { opacity: 0.8; transform: translateY(-20px) scale(1); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes badge-appear {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `
      document.head.appendChild(style)
    }

    // Reveal sequence after shake animation (4 * 0.3s + 0.5s delay = 1.7s)
    setTimeout(() => {
      mysteryBox.classList.add('hidden')
      resultBox.classList.remove('hidden')
      resultBox.style.animation = 'reveal-pop 0.5s ease-out forwards'

      setTimeout(() => {
        rarityBadge.style.animation = 'badge-appear 0.3s ease-out forwards'
        starsRow.style.animation = 'badge-appear 0.3s 0.1s ease-out forwards'
        resultLabel.style.animation = 'badge-appear 0.3s 0.2s ease-out forwards'
        okBtn.style.animation = 'badge-appear 0.3s 0.4s ease-out forwards'
      }, 400)
    }, 1700)
  }
}
