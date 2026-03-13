import { BLOCK_EMOJIS, BLOCK_GRADIENTS, type BlockType } from '@/core/types'
import { eventBus } from '@/state/event-bus'

export class GameInfoBar {
  readonly el: HTMLElement
  private movesEl: HTMLElement
  private goalsEl: HTMLElement
  private scoreEl!: HTMLElement
  private scoreNumEl!: HTMLElement

  constructor() {
    this.el = document.createElement('div')
    this.el.className = 'flex items-center justify-between px-3 py-2 rounded-xl mx-2 mt-1 mb-1'
    this.el.style.background = 'linear-gradient(135deg, rgba(20,10,50,0.85) 0%, rgba(40,20,80,0.85) 100%)'
    this.el.style.backdropFilter = 'blur(8px)'
    this.el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px rgba(255,255,255,0.08)'

    const movesWrap = document.createElement('div')
    movesWrap.className = 'flex flex-col items-center min-w-[48px]'
    this.movesEl = document.createElement('div')
    this.movesEl.className = 'text-yellow-300 font-bold text-2xl text-center'
    const movesLabel = document.createElement('span')
    movesLabel.className = 'text-white text-[8px] opacity-60 uppercase tracking-wider'
    movesLabel.textContent = '이동'
    movesWrap.appendChild(this.movesEl)
    movesWrap.appendChild(movesLabel)
    this.el.appendChild(movesWrap)

    this.goalsEl = document.createElement('div')
    this.goalsEl.className = 'flex gap-3 pl-3 border-l border-white/20'
    this.el.appendChild(this.goalsEl)

    this.scoreEl = document.createElement('div')
    this.scoreEl.className = 'flex flex-col items-center min-w-[48px]'
    const scoreNum = document.createElement('div')
    scoreNum.className = 'text-yellow-300 font-bold text-lg text-center'
    scoreNum.textContent = '0'
    this.scoreNumEl = scoreNum
    const scoreLabel = document.createElement('span')
    scoreLabel.className = 'text-white text-[8px] opacity-60 uppercase tracking-wider'
    scoreLabel.textContent = '점수'
    this.scoreEl.appendChild(scoreNum)
    this.scoreEl.appendChild(scoreLabel)
    this.el.appendChild(this.scoreEl)

    eventBus.on('game:score-changed', ({ score }) => {
      this.scoreNumEl.textContent = String(score)
      this.scoreNumEl.style.animation = 'none'
      this.scoreNumEl.offsetHeight // force reflow
      this.scoreNumEl.style.animation = 'score-pop 0.3s ease-out'
    })

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
      const icon = document.createElement('div')
      icon.className = 'w-8 h-8 rounded-lg flex items-center justify-center text-xl'
      icon.style.background = BLOCK_GRADIENTS[type]
      icon.textContent = BLOCK_EMOJIS[type]
      const label = document.createElement('span')
      label.className = 'text-white text-xs'
      label.textContent = `${goal.current}/${goal.target}`
      wrap.appendChild(icon)
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
    const wrap = this.goalsEl.querySelector(`[data-block-type="${blockType}"]`) as HTMLElement | null
    if (!wrap) return
    const label = wrap.querySelector('span')
    if (!label) return
    const wasDone = label.textContent === '✓'
    const done = current >= target
    label.textContent = done ? '✓' : `${current}/${target}`
    label.className = done ? 'text-green-400 text-xs font-bold' : 'text-white text-xs'
    if (done && !wasDone) {
      wrap.style.animation = 'none'
      wrap.offsetHeight // force reflow
      wrap.style.animation = 'goal-complete 0.4s ease-out'
    }
  }
}
