import { BLOCK_IMAGES, type BlockType } from '@/core/types'
import { eventBus } from '@/state/event-bus'

export class GameInfoBar {
  readonly el: HTMLElement
  private movesEl: HTMLElement
  private goalsEl: HTMLElement

  constructor() {
    this.el = document.createElement('div')
    this.el.className = 'flex items-center justify-between px-3 py-2 bg-black/30 rounded-lg mx-2'

    this.movesEl = document.createElement('div')
    this.movesEl.className = 'text-white font-bold text-2xl text-center min-w-[48px]'
    this.el.appendChild(this.movesEl)

    this.goalsEl = document.createElement('div')
    this.goalsEl.className = 'flex gap-3'
    this.el.appendChild(this.goalsEl)

    eventBus.on('game:move-used', ({ remaining }) => this.updateMoves(remaining))
    eventBus.on('game:goal-progress', ({ blockType, current, target }) => {
      this.updateGoal(blockType, current, target)
    })
  }

  setLevel(moves: number, goals: Map<BlockType, { current: number; target: number }>): void {
    this.updateMoves(moves)
    this.goalsEl.innerHTML = ''
    for (const [type, goal] of goals) {
      const wrap = document.createElement('div')
      wrap.className = 'flex flex-col items-center'
      wrap.dataset.blockType = String(type)
      const img = document.createElement('img')
      img.src = BLOCK_IMAGES[type]
      img.className = 'w-8 h-8'
      const label = document.createElement('span')
      label.className = 'text-white text-xs'
      label.textContent = `${goal.current}/${goal.target}`
      wrap.appendChild(img)
      wrap.appendChild(label)
      this.goalsEl.appendChild(wrap)
    }
  }

  updateMoves(remaining: number): void {
    this.movesEl.textContent = String(remaining)
    this.movesEl.className = remaining <= 3
      ? 'text-red-400 font-bold text-2xl text-center min-w-[48px] animate-bomb-shake'
      : 'text-white font-bold text-2xl text-center min-w-[48px]'
  }

  private updateGoal(blockType: BlockType, current: number, target: number): void {
    const wrap = this.goalsEl.querySelector(`[data-block-type="${blockType}"]`)
    if (!wrap) return
    const label = wrap.querySelector('span')
    if (label) label.textContent = `${current}/${target}`
  }
}
