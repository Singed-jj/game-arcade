// src/screens/game-screen.ts
import { BoardLogic, type CascadeStep } from '@/core/board-logic'
import { type Position, type BlockType, ToolType, CASCADE_CONFIG, PIECES_ON_CLEAR, BLOCK_EMOJIS, BLOCK_GRADIENTS } from '@/core/types'
import { getLevelConfig } from '@/core/level-data'
import { getRocketTargets, getBombTargets, getRainbowTargets } from '@/core/tool-effects'
import { eventBus } from '@/state/event-bus'
import { GameState } from '@/state/game-state'
import type { HeartManager } from '@/state/heart-manager'
import type { ToolManager } from '@/state/tool-manager'
import { BoardRenderer } from '@/render/board-renderer'
import { EffectsCanvas } from '@/render/effects-canvas'
import { ScreenShake } from '@/render/screen-shake'
import { HUD } from '@/ui/hud'
import { GameInfoBar } from '@/ui/game-info-bar'
import { ToolBar } from '@/ui/tool-bar'

export class GameScreen {
  private boardLogic!: BoardLogic
  private boardRenderer!: BoardRenderer
  private effects!: EffectsCanvas
  private shake!: ScreenShake
  private hud!: HUD
  private infoBar!: GameInfoBar
  private toolBar!: ToolBar
  private hintTimer: ReturnType<typeof setTimeout> | null = null

  constructor(
    private container: HTMLElement,
    private gameState: GameState,
    private heartManager: HeartManager,
    private toolManager: ToolManager,
    data?: Record<string, unknown>,
  ) {
    const level = (data?.level as number) ?? 1
    const config = getLevelConfig(level)

    if (!heartManager.useHeart()) {
      eventBus.emit('screen:change', { screen: 'map' })
      return
    }

    gameState.startLevel(config)
    this.boardLogic = new BoardLogic()
    this.boardLogic.initBoard()

    this.container.className = 'relative w-full h-dvh max-w-[375px] mx-auto overflow-hidden flex flex-col'
    this.container.style.backgroundImage = 'url(/assets/bg/game-bg.png)'
    this.container.style.backgroundSize = 'cover'
    this.addSparkleOverlay()

    this.hud = new HUD()
    this.hud.updateHearts(heartManager.getHearts())
    this.hud.setOnBack(() => this.showExitConfirm())
    this.container.appendChild(this.hud.el)

    this.infoBar = new GameInfoBar()
    this.infoBar.setLevel(config.moves, gameState.getGoals())
    this.container.appendChild(this.infoBar.el)

    const boardArea = document.createElement('div')
    boardArea.className = 'flex-1 flex items-center justify-center'
    boardArea.style.touchAction = 'none'
    this.container.appendChild(boardArea)

    this.boardRenderer = new BoardRenderer(boardArea)
    this.boardRenderer.renderBoard(this.boardLogic.getBoard())

    this.effects = new EffectsCanvas(boardArea)
    this.shake = new ScreenShake(boardArea)

    this.toolBar = new ToolBar()
    this.toolBar.el.classList.add('mt-auto')
    this.container.appendChild(this.toolBar.el)
    this.toolBar.syncWithManager(toolManager)

    this.showLevelIntro(config.level, gameState.getGoals())
  }

  private showExitConfirm(): void {
    const overlay = document.createElement('div')
    overlay.className = 'absolute inset-0 z-50 flex flex-col items-center justify-center'
    overlay.style.cssText = 'background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);'

    const box = document.createElement('div')
    box.className = 'bg-[#1a0a3e] rounded-3xl p-8 flex flex-col items-center gap-4 mx-6'
    box.style.boxShadow = '0 0 40px rgba(124,58,237,0.3)'

    const emoji = document.createElement('div')
    emoji.className = 'text-4xl mb-1'
    emoji.textContent = '🚪'
    box.appendChild(emoji)

    const title = document.createElement('div')
    title.className = 'text-white font-bold text-xl text-center'
    title.textContent = '레벨을 떠나시겠습니까?'
    box.appendChild(title)

    const sub = document.createElement('div')
    sub.className = 'text-white/50 text-sm text-center'
    sub.textContent = '진행 상황이 저장되지 않습니다'
    box.appendChild(sub)

    const btnRow = document.createElement('div')
    btnRow.className = 'flex gap-3 mt-2'

    const cancelBtn = document.createElement('button')
    cancelBtn.textContent = '계속하기'
    cancelBtn.className = 'px-6 py-3 bg-white/15 text-white rounded-full font-bold active:scale-95 transition-transform'
    cancelBtn.addEventListener('click', () => overlay.remove())

    const exitBtn = document.createElement('button')
    exitBtn.textContent = '나가기'
    exitBtn.className = 'px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full font-bold active:scale-95 transition-transform'
    exitBtn.addEventListener('click', () => {
      overlay.remove()
      eventBus.emit('screen:change', { screen: 'map' })
    })

    btnRow.appendChild(cancelBtn)
    btnRow.appendChild(exitBtn)
    box.appendChild(btnRow)
    overlay.appendChild(box)
    this.container.appendChild(overlay)
  }

  private showLevelIntro(level: number, goals: Map<BlockType, { current: number; target: number }>): void {
    const overlay = document.createElement('div')
    overlay.className = 'absolute inset-0 z-40 flex flex-col items-center justify-center'
    overlay.style.cssText = 'background: rgba(0,0,0,0.65); backdrop-filter: blur(4px);'

    const badge = document.createElement('div')
    badge.className = 'text-white/60 text-sm tracking-widest uppercase mb-2'
    badge.textContent = `LEVEL ${level}`
    overlay.appendChild(badge)

    const title = document.createElement('div')
    title.className = 'text-white font-bold text-4xl mb-6'
    title.textContent = `레벨 ${level}`
    title.style.textShadow = '0 0 20px rgba(255,200,0,0.6)'
    overlay.appendChild(title)

    const sep = document.createElement('div')
    sep.className = 'w-16 h-0.5 bg-white/30 mb-5'
    overlay.appendChild(sep)

    const goalsLabel = document.createElement('div')
    goalsLabel.className = 'text-white/50 text-xs uppercase tracking-wider mb-3'
    goalsLabel.textContent = '목표'
    overlay.appendChild(goalsLabel)

    const goalsRow = document.createElement('div')
    goalsRow.className = 'flex gap-4 mb-8'
    for (const [type, goal] of goals) {
      const item = document.createElement('div')
      item.className = 'flex flex-col items-center gap-2'

      const blockEl = document.createElement('div')
      blockEl.className = 'w-14 h-14 rounded-2xl flex items-center justify-center text-3xl'
      blockEl.style.background = BLOCK_GRADIENTS[type]
      blockEl.style.boxShadow = '0 3px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4)'
      blockEl.style.border = '1.5px solid rgba(255,255,255,0.3)'
      blockEl.textContent = BLOCK_EMOJIS[type]

      const count = document.createElement('span')
      count.className = 'text-white font-bold text-lg'
      count.textContent = `×${goal.target}`

      item.appendChild(blockEl)
      item.appendChild(count)
      goalsRow.appendChild(item)
    }
    overlay.appendChild(goalsRow)

    // Countdown dots
    const dotsRow = document.createElement('div')
    dotsRow.className = 'flex gap-2'
    const dots = [0, 1, 2].map(i => {
      const d = document.createElement('div')
      d.className = 'w-2 h-2 rounded-full bg-white/80'
      d.style.animation = `intro-dot 1.5s ${i * 0.2}s ease-in-out infinite`
      dotsRow.appendChild(d)
      return d
    })
    overlay.appendChild(dotsRow)
    void dots

    this.container.appendChild(overlay)

    // Add CSS for intro dot animation
    if (!document.getElementById('intro-styles')) {
      const style = document.createElement('style')
      style.id = 'intro-styles'
      style.textContent = `
        @keyframes intro-dot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes intro-fade-out {
          0% { opacity: 1; }
          100% { opacity: 0; pointer-events: none; }
        }
      `
      document.head.appendChild(style)
    }

    this.boardRenderer.lockInput()

    setTimeout(() => {
      overlay.style.animation = 'intro-fade-out 0.4s ease-out forwards'
      setTimeout(() => {
        overlay.remove()
        this.setupEventListeners()
      }, 400)
    }, 2000)
  }

  private setupEventListeners(): void {
    this.boardRenderer.unlockInput()
    eventBus.on('board:swap-requested', ({ from, to }) => this.handleSwap(from, to))
    eventBus.on('board:cell-tapped', ({ col, row }) => this.handleCellTap(col, row))
    eventBus.on('tool:selected', () => {
      const tool = this.toolBar.getSelectedTool()
      this.boardRenderer.setToolMode(tool !== null)
    })
    this.startHintTimer()
  }

  private async handleCellTap(col: number, row: number): Promise<void> {
    const tool = this.toolBar.getSelectedTool()
    if (!tool) return

    if (!this.toolManager.useTool(tool)) return

    this.boardRenderer.lockInput()
    this.stopHint()
    this.toolBar.clearSelection()
    this.boardRenderer.setToolMode(false)

    let targets: import('@/core/types').Position[]
    if (tool === ToolType.ROCKET) {
      const h = getRocketTargets(col, row, 'horizontal')
      const v = getRocketTargets(col, row, 'vertical')
      const seen = new Set<string>()
      targets = [...h, ...v].filter(p => {
        const k = `${p.col},${p.row}`
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
    } else if (tool === ToolType.BOMB) {
      targets = getBombTargets(col, row)
    } else {
      // rainbow: target block type at clicked cell
      const blockType = this.boardLogic.getBlock(col, row)
      if (blockType === -1) {
        this.boardRenderer.unlockInput()
        return
      }
      targets = getRainbowTargets(this.boardLogic.getBoard(), blockType as import('@/core/types').BlockType)
    }

    // Visual effect for tool use
    if (tool === ToolType.ROCKET) {
      this.shake.shake(3)
    } else if (tool === ToolType.BOMB) {
      this.shake.shake(5)
      this.effects.flash('rgba(255,140,0,0.25)')
    } else {
      this.effects.flash('rgba(180,0,255,0.2)')
    }

    // Count block types BEFORE removal
    const counts = new Map<import('@/core/types').BlockType, number>()
    for (const pos of targets) {
      const bt = this.boardLogic.getBlock(pos.col, pos.row)
      if (bt !== -1) {
        this.effects.spawnBlockPop(pos, bt as import('@/core/types').BlockType)
        counts.set(bt as import('@/core/types').BlockType, (counts.get(bt as import('@/core/types').BlockType) ?? 0) + 1)
      }
    }

    this.gameState.useMove()

    const cascades = this.boardLogic.removeCells(targets)

    // Also count cascade matches
    for (const cascade of cascades) {
      for (const match of cascade.matches) {
        counts.set(match.blockType, (counts.get(match.blockType) ?? 0) + match.cells.length)
      }
    }

    for (const [type, count] of counts) {
      this.gameState.addGoalProgress(type, count)
    }
    this.gameState.addScore(targets.length * 20)

    await new Promise(r => setTimeout(r, 400))

    this.boardRenderer.renderBoard(this.boardLogic.getBoard(), true)

    if (this.gameState.areAllGoalsMet()) {
      const stars = this.gameState.calculateStars()
      this.gameState.endLevel()
      setTimeout(() => {
        eventBus.emit('screen:change', {
          screen: 'clear',
          data: { stars, level: this.gameState.getLevel(), movesLeft: this.gameState.getRemainingMoves(), score: this.gameState.getScore() },
        })
      }, 1000)
    } else if (this.gameState.getRemainingMoves() <= 0) {
      this.gameState.endLevel()
      setTimeout(() => {
        const goalsList = Array.from(this.gameState.getGoals().entries()).map(
          ([k, v]) => ({ blockType: k as number, current: v.current, target: v.target })
        )
        eventBus.emit('screen:change', {
          screen: 'fail',
          data: { level: this.gameState.getLevel(), goals: goalsList },
        })
      }, 1000)
    } else {
      this.boardRenderer.unlockInput()
      this.startHintTimer()
    }
  }

  private startHintTimer(): void {
    this.stopHint()
    this.hintTimer = setTimeout(() => {
      if (!this.boardLogic.hasValidMoves()) {
        let attempts = 0
        do {
          this.boardLogic.shuffle()
          attempts++
        } while (!this.boardLogic.hasValidMoves() && attempts < 20)
        this.boardRenderer.renderBoard(this.boardLogic.getBoard())
        this.effects.showText('셔플!', this.effects.boardCenterX, this.effects.boardCenterY, 28, '#60a5fa')
        this.startHintTimer()
        return
      }
      const hint = this.boardLogic.findHintMove()
      if (hint) this.boardRenderer.startHint(hint.from, hint.to)
    }, 3000)
  }

  private stopHint(): void {
    if (this.hintTimer !== null) {
      clearTimeout(this.hintTimer)
      this.hintTimer = null
    }
    this.boardRenderer.stopHint()
  }

  private async handleSwap(from: Position, to: Position): Promise<void> {
    this.boardRenderer.lockInput()
    this.stopHint()

    await this.boardRenderer.animateSwap(from, to)
    const result = this.boardLogic.trySwap(from, to)

    if (!result.valid) {
      await this.boardRenderer.animateSwap(from, to) // swap back
      this.shake.shake(2)
      eventBus.emit('board:swap-invalid', { from, to })
      this.boardRenderer.unlockInput()
      this.startHintTimer()
      return
    }

    this.gameState.useMove()

    for (let i = 0; i < result.cascades.length; i++) {
      const step = result.cascades[i]
      await this.animateCascadeStep(step, i)
    }

    for (let ci = 0; ci < result.cascades.length; ci++) {
      const cascade = result.cascades[ci]
      const counts = new Map<BlockType, number>()
      let totalMatched = 0
      for (const match of cascade.matches) {
        const prev = counts.get(match.blockType) ?? 0
        counts.set(match.blockType, prev + match.cells.length)
        totalMatched += match.cells.length
      }
      for (const [type, count] of counts) {
        this.gameState.addGoalProgress(type, count)
      }
      const multiplier = ci === 0 ? 1 : 1 + ci * 0.5
      this.gameState.addScore(Math.round(totalMatched * 10 * multiplier))
    }

    this.boardRenderer.renderBoard(this.boardLogic.getBoard(), false)

    if (this.gameState.areAllGoalsMet()) {
      const stars = this.gameState.calculateStars()
      this.gameState.endLevel()
      eventBus.emit('game:level-complete', { stars, movesLeft: this.gameState.getRemainingMoves() })
      setTimeout(() => {
        eventBus.emit('screen:change', {
          screen: 'clear',
          data: { stars, level: this.gameState.getLevel(), movesLeft: this.gameState.getRemainingMoves(), score: this.gameState.getScore() },
        })
      }, 1000)
    } else if (this.gameState.getRemainingMoves() <= 0) {
      this.gameState.endLevel()
      eventBus.emit('game:level-failed')
      setTimeout(() => {
        const goalsList = Array.from(this.gameState.getGoals().entries()).map(
          ([k, v]) => ({ blockType: k as number, current: v.current, target: v.target })
        )
        eventBus.emit('screen:change', {
          screen: 'fail',
          data: { level: this.gameState.getLevel(), goals: goalsList },
        })
      }, 1000)
    } else {
      this.boardRenderer.unlockInput()
      this.startHintTimer()
    }
  }

  private addSparkleOverlay(): void {
    if (document.getElementById('game-sparkle-styles')) return
    const style = document.createElement('style')
    style.id = 'game-sparkle-styles'
    style.textContent = `
      @keyframes sparkle-float {
        0% { transform: translateY(0) scale(0); opacity: 0; }
        30% { opacity: 0.8; transform: translateY(-20px) scale(1); }
        100% { transform: translateY(-80px) scale(0.3); opacity: 0; }
      }
      .sparkle-dot {
        position: absolute;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgba(255,255,255,0.7);
        pointer-events: none;
        animation: sparkle-float linear infinite;
      }
    `
    document.head.appendChild(style)

    const overlay = document.createElement('div')
    overlay.className = 'absolute inset-0 pointer-events-none overflow-hidden'
    overlay.style.zIndex = '0'

    const positions = [
      [15, 70], [25, 45], [70, 60], [85, 35], [40, 80],
      [60, 25], [10, 55], [90, 70], [50, 90], [75, 50],
    ]
    positions.forEach(([left, top], i) => {
      const dot = document.createElement('div')
      dot.className = 'sparkle-dot'
      dot.style.left = `${left}%`
      dot.style.top = `${top}%`
      dot.style.animationDuration = `${3 + (i % 4)}s`
      dot.style.animationDelay = `${(i * 0.7) % 4}s`
      dot.style.background = ['rgba(255,220,100,0.6)', 'rgba(255,255,255,0.5)', 'rgba(255,180,100,0.6)'][i % 3]
      overlay.appendChild(dot)
    })

    // Insert as first child so it's behind everything
    this.container.insertBefore(overlay, this.container.firstChild)
  }

  private async animateCascadeStep(step: CascadeStep, cascadeIndex: number): Promise<void> {
    let totalMatched = 0

    // 1) 매칭된 블록 pop 애니메이션 + 파티클
    const popPromises: Promise<void>[] = []
    for (const match of step.matches) {
      for (const cell of match.cells) {
        this.effects.spawnBlockPop(cell, match.blockType)
        const view = this.boardRenderer.getBlock(cell.col, cell.row)
        if (view) popPromises.push(view.animatePop())
      }
      totalMatched += match.cells.length
    }
    await Promise.all(popPromises)

    // 매칭 블록을 blocks map에서 제거
    for (const match of step.matches) {
      for (const cell of match.cells) {
        this.boardRenderer.removeBlock(cell.col, cell.row)
      }
    }

    // 2) 낙하 애니메이션
    const dropPromises: Promise<void>[] = []
    for (const fall of step.falls) {
      const view = this.boardRenderer.getBlock(fall.from.col, fall.from.row)
      if (view) {
        this.boardRenderer.moveBlock(fall.from, fall.to)
        view.pos = fall.to
        view.updatePosition()
        dropPromises.push(view.animateDrop(fall.from.row))
      }
    }
    await Promise.all(dropPromises)

    // 3) 새 블록 spawn 애니메이션
    for (const s of step.spawned) {
      const view = this.boardRenderer.addBlock(s.pos, s.blockType)
      view.spawnAnimate()
    }

    // 4) 점수 float + cascade 텍스트
    const multiplier = cascadeIndex === 0 ? 1 : 1 + cascadeIndex * 0.5
    const scoreGain = Math.round(totalMatched * 10 * multiplier)
    this.effects.showScoreFloat(scoreGain, this.effects.boardCenterX, this.effects.boardCenterY - 30)

    const cascadeNum = cascadeIndex + 1
    if (cascadeNum >= 2 && cascadeNum < CASCADE_CONFIG.length) {
      const cfg = CASCADE_CONFIG[cascadeNum]
      this.effects.showText(cfg.text, this.effects.boardCenterX, this.effects.boardCenterY, cfg.fontSize, cfg.color)
      this.shake.shake(cfg.shakeIntensity)
    }

    // spawn 애니메이션 완료 대기 (0.22s)
    await new Promise(r => setTimeout(r, 250))
  }
}
