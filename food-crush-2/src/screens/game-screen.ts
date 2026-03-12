// src/screens/game-screen.ts
import { BoardLogic, type CascadeStep } from '@/core/board-logic'
import { type Position, type BlockType, CASCADE_CONFIG, PIECES_ON_CLEAR } from '@/core/types'
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

    this.hud = new HUD()
    this.container.appendChild(this.hud.el)

    this.infoBar = new GameInfoBar()
    this.infoBar.setLevel(config.moves, gameState.getGoals())
    this.container.appendChild(this.infoBar.el)

    const boardArea = document.createElement('div')
    boardArea.className = 'flex-1 flex items-center justify-center relative'
    this.container.appendChild(boardArea)

    this.boardRenderer = new BoardRenderer(boardArea)
    this.boardRenderer.renderBoard(this.boardLogic.getBoard())

    this.effects = new EffectsCanvas(boardArea)
    this.shake = new ScreenShake(boardArea)

    this.toolBar = new ToolBar()
    this.container.appendChild(this.toolBar.el)

    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    eventBus.on('board:swap-requested', ({ from, to }) => this.handleSwap(from, to))
  }

  private async handleSwap(from: Position, to: Position): Promise<void> {
    this.boardRenderer.lockInput()
    const result = this.boardLogic.trySwap(from, to)

    if (!result.valid) {
      eventBus.emit('board:swap-invalid', { from, to })
      this.boardRenderer.unlockInput()
      return
    }

    this.gameState.useMove()

    for (let i = 0; i < result.cascades.length; i++) {
      const step = result.cascades[i]
      await this.animateCascadeStep(step, i)
    }

    for (const cascade of result.cascades) {
      const counts = new Map<BlockType, number>()
      for (const match of cascade.matches) {
        const prev = counts.get(match.blockType) ?? 0
        counts.set(match.blockType, prev + match.cells.length)
      }
      for (const [type, count] of counts) {
        this.gameState.addGoalProgress(type, count)
      }
    }

    this.boardRenderer.renderBoard(this.boardLogic.getBoard())

    if (this.gameState.areAllGoalsMet()) {
      const stars = this.gameState.calculateStars()
      this.gameState.endLevel()
      eventBus.emit('game:level-complete', { stars, movesLeft: this.gameState.getRemainingMoves() })
      setTimeout(() => {
        eventBus.emit('screen:change', {
          screen: 'clear',
          data: { stars, level: this.gameState.getLevel() },
        })
      }, 1000)
    } else if (this.gameState.getRemainingMoves() <= 0) {
      this.gameState.endLevel()
      eventBus.emit('game:level-failed')
      setTimeout(() => {
        eventBus.emit('screen:change', {
          screen: 'fail',
          data: { level: this.gameState.getLevel() },
        })
      }, 1000)
    } else {
      this.boardRenderer.unlockInput()
    }
  }

  private async animateCascadeStep(step: CascadeStep, cascadeIndex: number): Promise<void> {
    for (const match of step.matches) {
      for (const cell of match.cells) {
        this.effects.spawnBlockPop(cell, match.blockType)
      }
    }

    const cascadeNum = cascadeIndex + 1
    if (cascadeNum >= 2 && cascadeNum < CASCADE_CONFIG.length) {
      const cfg = CASCADE_CONFIG[cascadeNum]
      this.effects.showText(cfg.text, 150, 200, cfg.fontSize, cfg.color)
      this.shake.shake(cfg.shakeIntensity)
    }

    await new Promise(r => setTimeout(r, 500))
  }
}
