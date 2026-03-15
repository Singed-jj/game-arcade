// src/screens/game-screen.ts
import { BoardLogic, type CascadeStep } from '@/core/board-logic'
import { type Position, type BlockType, type BoardGrid, ToolType, BLOCK_EMOJIS, BLOCK_GRADIENTS, CELL_SIZE, BOARD_COLS, BOARD_ROWS } from '@/core/types'
import { getLevelConfig } from '@/core/level-data'
import { getRocketTargets, getBombTargets, getRainbowTargets } from '@/core/tool-effects'
import { eventBus } from '@/state/event-bus'
import { GameState } from '@/state/game-state'
import type { HeartManager } from '@/state/heart-manager'
import type { ToolManager } from '@/state/tool-manager'
import { Text as PixiText } from 'pixi.js'
import { BoardRenderer } from '@/render/board-renderer'
import { EffectsLayer } from '@/render/effects-layer'
import { HUD } from '@/ui/hud'
import { GameInfoBar } from '@/ui/game-info-bar'
import { ToolBar } from '@/ui/tool-bar'
import { soundManager } from '@/audio/sound-manager'
import { hapticManager } from '@/audio/haptic-manager'
import type { HapticEvent } from '@/audio/haptic-manager'

const PAUSE_STATE_KEY = 'fc2-pause-state'

interface PauseState {
  level: number
  grid: (string | null)[][]
  movesLeft: number
  goalProgress: Record<string, number>
}

export class GameScreen {
  private boardLogic!: BoardLogic
  private boardRenderer!: BoardRenderer
  private effects!: EffectsLayer
  private shake!: { shake: (intensity: number, duration?: number) => void }
  private hud!: HUD
  private infoBar!: GameInfoBar
  private toolBar!: ToolBar
  private hintTimer: ReturnType<typeof setTimeout> | null = null
  private urgentOverlay: HTMLElement | null = null
  private eventCleanups: Array<() => void> = []

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
      eventBus.emit('screen:change', { screen: 'no-hearts' })
      return
    }

    gameState.startLevel(config)
    this.boardLogic = new BoardLogic()
    this.boardLogic.initBoard()

    // 일시정지 상태 복구
    this.restorePauseState(level)

    this.container.className = 'relative w-full h-dvh max-w-[375px] mx-auto overflow-hidden flex flex-col'
    this.container.style.backgroundImage = 'url(/assets/bg/game-bg.png)'
    this.container.style.backgroundSize = 'cover'
    this.container.style.paddingTop = 'var(--ticker-h)'
    this.addSparkleOverlay()

    this.hud = new HUD(heartManager)
    this.hud.updateHearts(heartManager.getHearts())
    this.hud.setOnBack(() => this.showExitConfirm())
    this.container.appendChild(this.hud.el)

    // 일시정지 버튼을 HUD에 삽입 (뒤로가기 버튼 옆)
    const pauseBtn = document.createElement('button')
    pauseBtn.textContent = '⏸'
    pauseBtn.className = 'text-white/90 text-lg font-bold w-8 h-8 flex items-center justify-center active:scale-90 transition-transform rounded-full'
    pauseBtn.style.background = 'rgba(255,255,255,0.12)'
    pauseBtn.addEventListener('click', () => this.showPauseOverlay())
    // 뒤로가기 버튼(첫 번째 자식) 다음에 삽입
    const firstChild = this.hud.el.children[0]
    if (firstChild && firstChild.nextSibling) {
      this.hud.el.insertBefore(pauseBtn, firstChild.nextSibling)
    } else {
      this.hud.el.appendChild(pauseBtn)
    }

    this.infoBar = new GameInfoBar()
    this.infoBar.setLevel(config.moves, gameState.getGoals())
    this.container.appendChild(this.infoBar.el)

    const boardArea = document.createElement('div')
    boardArea.className = 'flex-1 flex items-center justify-center relative'
    boardArea.style.touchAction = 'none'
    this.container.appendChild(boardArea)

    this.boardRenderer = new BoardRenderer(boardArea)
    this.effects = new EffectsLayer(boardArea)
    this.shake = {
      shake: (intensity: number, duration = 200) => {
        boardArea.style.transform = `translate(${intensity}px, 0)`
        setTimeout(() => { boardArea.style.transform = '' }, duration)
      }
    }

    this.toolBar = new ToolBar()
    this.toolBar.el.classList.add('mt-auto')
    this.container.appendChild(this.toolBar.el)
    this.toolBar.syncWithManager(toolManager)

    // mount() 완료 후 renderBoard + showLevelIntro 순서 보장
    this.boardRenderer.mount().then(() => {
      this.boardRenderer.renderBoard(this.boardLogic.getBoard())
      this.showLevelIntro(config.level, gameState.getGoals())
    })
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

    const onSwap = ({ from, to }: { from: Position; to: Position }) => this.handleSwap(from, to)
    const onCellTap = ({ col, row }: { col: number; row: number }) => this.handleCellTap(col, row)
    const onToolSelected = () => {
      const tool = this.toolBar.getSelectedTool()
      this.boardRenderer.setToolMode(tool !== null)
    }
    const onUrgentMode = ({ urgent }: { urgent: boolean }) => this.setUrgentOverlay(urgent)

    eventBus.on('board:swap-requested', onSwap)
    eventBus.on('board:cell-tapped', onCellTap)
    eventBus.on('tool:selected', onToolSelected)
    eventBus.on('game:urgent-mode', onUrgentMode)

    this.eventCleanups.push(
      () => eventBus.off('board:swap-requested', onSwap),
      () => eventBus.off('board:cell-tapped', onCellTap),
      () => eventBus.off('tool:selected', onToolSelected),
      () => eventBus.off('game:urgent-mode', onUrgentMode),
    )

    this.startHintTimer()
  }

  destroy(): void {
    this.stopHint()
    for (const cleanup of this.eventCleanups) cleanup()
    this.eventCleanups = []
  }

  private setUrgentOverlay(urgent: boolean): void {
    if (urgent && !this.urgentOverlay) {
      const overlay = document.createElement('div')
      overlay.className = 'absolute inset-0 pointer-events-none'
      overlay.style.cssText = 'background: rgba(180,0,0,0.12); z-index: 1; animation: urgent-pulse 1s ease-in-out infinite;'
      this.urgentOverlay = overlay
      this.container.appendChild(overlay)

      if (!document.getElementById('urgent-styles')) {
        const style = document.createElement('style')
        style.id = 'urgent-styles'
        style.textContent = `
          @keyframes urgent-pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
        `
        document.head.appendChild(style)
      }
    } else if (!urgent && this.urgentOverlay) {
      this.urgentOverlay.remove()
      this.urgentOverlay = null
    }
  }

  private showRocketDirectionPicker(): Promise<'horizontal' | 'vertical' | null> {
    return new Promise(resolve => {
      const overlay = document.createElement('div')
      overlay.className = 'absolute inset-0 z-50 flex items-center justify-center'
      overlay.style.background = 'rgba(0,0,0,0.55)'

      const box = document.createElement('div')
      box.className = 'flex flex-col items-center gap-4 px-8 py-6 rounded-3xl mx-6'
      box.style.background = 'rgba(20,8,60,0.97)'
      box.style.boxShadow = '0 0 40px rgba(249,115,22,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
      box.style.border = '1px solid rgba(249,115,22,0.25)'

      const title = document.createElement('div')
      title.textContent = '🚀 방향을 선택하세요'
      title.className = 'text-white font-bold text-base'
      box.appendChild(title)

      const btnRow = document.createElement('div')
      btnRow.className = 'flex gap-4'

      const hBtn = document.createElement('button')
      hBtn.innerHTML = '<div class="text-2xl">↔</div><div class="text-xs mt-1">가로 줄</div>'
      hBtn.className = 'flex flex-col items-center px-7 py-4 rounded-2xl text-white font-bold active:scale-95 transition-transform'
      hBtn.style.background = 'linear-gradient(135deg, #f97316, #ea580c)'
      hBtn.style.boxShadow = '0 4px 16px rgba(249,115,22,0.4)'
      hBtn.addEventListener('click', () => { overlay.remove(); resolve('horizontal') })

      const vBtn = document.createElement('button')
      vBtn.innerHTML = '<div class="text-2xl">↕</div><div class="text-xs mt-1">세로 줄</div>'
      vBtn.className = 'flex flex-col items-center px-7 py-4 rounded-2xl text-white font-bold active:scale-95 transition-transform'
      vBtn.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)'
      vBtn.style.boxShadow = '0 4px 16px rgba(59,130,246,0.4)'
      vBtn.addEventListener('click', () => { overlay.remove(); resolve('vertical') })

      btnRow.appendChild(hBtn)
      btnRow.appendChild(vBtn)
      box.appendChild(btnRow)

      const cancelBtn = document.createElement('button')
      cancelBtn.textContent = '취소'
      cancelBtn.className = 'text-white/40 text-xs'
      cancelBtn.style.cssText = 'background:none;border:none;cursor:pointer;'
      cancelBtn.addEventListener('click', () => { overlay.remove(); resolve(null) })
      box.appendChild(cancelBtn)

      overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); resolve(null) } })
      overlay.appendChild(box)
      this.container.appendChild(overlay)
    })
  }

  private async handleCellTap(col: number, row: number): Promise<void> {
    const tool = this.toolBar.getSelectedTool()
    if (!tool) return

    this.boardRenderer.lockInput()
    this.stopHint()

    let direction: 'horizontal' | 'vertical' | undefined
    if (tool === ToolType.ROCKET) {
      this.boardRenderer.unlockInput()
      const picked = await this.showRocketDirectionPicker()
      if (picked === null) {
        // 취소: 선택 해제 후 복귀
        this.toolBar.clearSelection()
        this.boardRenderer.setToolMode(false)
        this.boardRenderer.unlockInput()
        this.startHintTimer()
        return
      }
      direction = picked
      this.boardRenderer.lockInput()
    }

    // 무지개: useTool 전에 빈 셀 검사 (빈 셀 탭 시 도구 소모 방지)
    if (tool === ToolType.RAINBOW) {
      const blockType = this.boardLogic.getBlock(col, row)
      if (blockType === -1) {
        this.toolBar.clearSelection()
        this.boardRenderer.setToolMode(false)
        this.boardRenderer.unlockInput()
        this.startHintTimer()
        return
      }
    }

    if (!this.toolManager.useTool(tool)) {
      this.toolBar.clearSelection()
      this.boardRenderer.setToolMode(false)
      this.boardRenderer.unlockInput()
      return
    }

    this.toolBar.clearSelection()
    this.boardRenderer.setToolMode(false)

    let targets: import('@/core/types').Position[]
    if (tool === ToolType.ROCKET) {
      targets = getRocketTargets(col, row, direction!)
    } else if (tool === ToolType.BOMB) {
      targets = getBombTargets(col, row)
    } else {
      // 무지개: 탭한 셀과 같은 타입의 블록 전부 제거
      const blockType = this.boardLogic.getBlock(col, row) as import('@/core/types').BlockType
      targets = getRainbowTargets(this.boardLogic.getBoard(), blockType)
    }

    // Visual effect + sound for tool use
    if (tool === ToolType.ROCKET) {
      soundManager.play('rocket')
      hapticManager.trigger('rocket')
      this.shake.shake(3)
      await this.animateRocketLaunch(col, row, direction!, targets)
    } else if (tool === ToolType.BOMB) {
      soundManager.play('bomb', 1.0, 1.0)
      hapticManager.trigger('bomb')
      this.shake.shake(6)
      this.effects.flash('rgba(255,180,0,0.35)')
      await this.effects.bombExplosion({ col, row })
    } else {
      soundManager.play('rainbow', 1.0, 1.5)
      hapticManager.trigger('rainbow')
      if (targets.length > 0) {
        await this.effects.rainbowSuckIn(
          targets,
          this.effects.boardCenterX,
          this.effects.boardCenterY
        )
        this.effects.flash('rgba(180,0,255,0.3)')
        this.shake.shake(6, 300)
      }
    }

    // Count block types BEFORE removal
    const counts = new Map<import('@/core/types').BlockType, number>()
    for (const pos of targets) {
      const bt = this.boardLogic.getBlock(pos.col, pos.row)
      if (bt !== -1) {
        if (tool !== ToolType.ROCKET) {
          this.effects.spawnBlockPop(pos, bt as import('@/core/types').BlockType)
        }
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

    await new Promise(r => setTimeout(r, tool === ToolType.ROCKET ? 100 : 400))

    this.boardRenderer.renderBoard(this.boardLogic.getBoard(), true)

    if (this.gameState.areAllGoalsMet()) {
      const stars = this.gameState.calculateStars()
      this.gameState.endLevel()
      soundManager.play('clear', 1.0, 2.0)
      hapticManager.trigger('clear')
      await this.sweepRemainingBlocks()
      setTimeout(() => {
        eventBus.emit('screen:change', {
          screen: 'clear',
          data: { stars, level: this.gameState.getLevel(), movesLeft: this.gameState.getRemainingMoves(), score: this.gameState.getScore() },
        })
      }, 1000)
    } else if (this.gameState.getRemainingMoves() <= 0) {
      this.gameState.endLevel()
      soundManager.play('fail', 1.0, 2.0)
      hapticManager.trigger('fail')
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

  private async animateRocketLaunch(
    col: number,
    row: number,
    direction: 'horizontal' | 'vertical',
    targets: Position[],
  ): Promise<void> {
    const CELL_DUR = 45   // ms per cell
    const boardContainer = this.boardRenderer.getBoardContainer()
    const isHoriz = direction === 'horizontal'

    const directions = isHoriz
      ? [{ dc: -1, dr: 0, rotDeg: 180 }, { dc: 1, dr: 0, rotDeg: 0 }]
      : [{ dc: 0, dr: -1, rotDeg: 270 }, { dc: 0, dr: 1, rotDeg: 90 }]

    const startX = col * CELL_SIZE + CELL_SIZE / 2
    const startY = row * CELL_SIZE + CELL_SIZE / 2

    const getDistance = (p: Position) =>
      isHoriz ? Math.abs(p.col - col) : Math.abs(p.row - row)

    const maxDist = targets.length > 0 ? Math.max(...targets.map(getDistance)) : 0

    // 발동 셀 즉시 팝
    const originView = this.boardRenderer.getBlock(col, row)
    if (originView) {
      const bt = this.boardLogic.getBlock(col, row)
      if (bt !== -1) this.effects.spawnBlockPop({ col, row }, bt as BlockType)
      this.boardRenderer.removeBlock(col, row)
      void originView.animatePop()
    }

    const spritePromises = directions.map(({ dc, dr, rotDeg }) => {
      const rocketSprite = new PixiText({ text: '🚀', style: { fontSize: 28 } })
      rocketSprite.anchor.set(0.5)
      rocketSprite.x = startX
      rocketSprite.y = startY
      rocketSprite.rotation = (rotDeg * Math.PI) / 180
      boardContainer.addChild(rocketSprite)

      return new Promise<void>(resolve => {
        let dist = 0
        const step = () => {
          dist++
          const nx = startX + dc * dist * CELL_SIZE
          const ny = startY + dr * dist * CELL_SIZE
          rocketSprite.x = nx
          rocketSprite.y = ny

          const tc = col + dc * dist
          const tr = row + dr * dist
          const view = this.boardRenderer.getBlock(tc, tr)
          if (view) {
            const bt = this.boardLogic.getBlock(tc, tr)
            if (bt !== -1) this.effects.spawnBlockPop({ col: tc, row: tr }, bt as BlockType)
            this.boardRenderer.removeBlock(tc, tr)
            void view.animatePop()
          }

          if (dist > maxDist + 1) {
            if (!rocketSprite.destroyed) rocketSprite.destroy()
            resolve()
            return
          }
          setTimeout(step, CELL_DUR)
        }
        setTimeout(step, CELL_DUR)
      })
    })

    await Promise.all(spritePromises)
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

    hapticManager.trigger('swap')
    await this.boardRenderer.animateSwap(from, to)
    const result = this.boardLogic.trySwap(from, to)

    if (!result.valid) {
      await this.boardRenderer.animateSwap(from, to) // swap back
      this.shake.shake(2)
      hapticManager.trigger('wrongSwap')
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
      soundManager.play('clear', 1.0, 2.0)
      hapticManager.trigger('clear')
      eventBus.emit('game:level-complete', { stars, movesLeft: this.gameState.getRemainingMoves() })
      await this.sweepRemainingBlocks()
      setTimeout(() => {
        eventBus.emit('screen:change', {
          screen: 'clear',
          data: { stars, level: this.gameState.getLevel(), movesLeft: this.gameState.getRemainingMoves(), score: this.gameState.getScore() },
        })
      }, 1000)
    } else if (this.gameState.getRemainingMoves() <= 0) {
      this.gameState.endLevel()
      soundManager.play('fail', 1.0, 2.0)
      hapticManager.trigger('fail')
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

  private savePauseState(): void {
    const grid = this.boardLogic.getBoard()
    const serializedGrid: (string | null)[][] = grid.map(col =>
      col.map(cell => (cell === -1 ? null : String(cell)))
    )
    const goals = this.gameState.getGoals()
    const goalProgress: Record<string, number> = {}
    for (const [type, goal] of goals) {
      goalProgress[String(type)] = goal.current
    }
    const state: PauseState = {
      level: this.gameState.getLevel(),
      grid: serializedGrid,
      movesLeft: this.gameState.getRemainingMoves(),
      goalProgress,
    }
    localStorage.setItem(PAUSE_STATE_KEY, JSON.stringify(state))
  }

  private clearPauseState(): void {
    localStorage.removeItem(PAUSE_STATE_KEY)
  }

  private restorePauseState(currentLevel: number): void {
    const raw = localStorage.getItem(PAUSE_STATE_KEY)
    if (!raw) return
    try {
      const state: PauseState = JSON.parse(raw)
      if (state.level !== currentLevel) {
        this.clearPauseState()
        return
      }
      // grid 복구
      const restoredGrid: BoardGrid = state.grid.map(col =>
        col.map(cell => (cell === null ? -1 : Number(cell)))
      ) as BoardGrid
      this.boardLogic.setBoard(restoredGrid)

      // movesLeft 복구
      this.gameState.setRemainingMoves(state.movesLeft)

      // goalProgress 복구
      for (const [typeStr, current] of Object.entries(state.goalProgress)) {
        this.gameState.setGoalProgress(Number(typeStr) as BlockType, current as number)
      }
    } catch {
      this.clearPauseState()
    }
  }

  private showPauseOverlay(): void {
    this.boardRenderer.lockInput()
    this.stopHint()
    this.savePauseState()

    const overlay = document.createElement('div')
    overlay.className = 'absolute inset-0 z-50 flex flex-col items-center justify-center'
    overlay.style.cssText = 'background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);'

    const box = document.createElement('div')
    box.className = 'bg-[#1a0a3e] rounded-3xl p-8 flex flex-col items-center gap-4 mx-6'
    box.style.boxShadow = '0 0 40px rgba(124,58,237,0.3)'

    const title = document.createElement('div')
    title.className = 'text-white font-bold text-xl text-center'
    title.textContent = '\u23F8 일시정지'
    box.appendChild(title)

    const info = document.createElement('div')
    info.className = 'text-white/60 text-sm text-center'
    info.textContent = `레벨 ${this.gameState.getLevel()} \xB7 남은 이동: ${this.gameState.getRemainingMoves()}회`
    box.appendChild(info)

    const btnRow = document.createElement('div')
    btnRow.className = 'flex gap-3 mt-2'

    const resumeBtn = document.createElement('button')
    resumeBtn.textContent = '\u25B6 이어하기'
    resumeBtn.className = 'px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full font-bold active:scale-95 transition-transform'
    resumeBtn.addEventListener('click', () => {
      overlay.remove()
      this.clearPauseState()
      this.boardRenderer.unlockInput()
      this.startHintTimer()
    })

    const mapBtn = document.createElement('button')
    mapBtn.textContent = '\u2190 맵으로'
    mapBtn.className = 'px-6 py-3 bg-white/15 text-white rounded-full font-bold active:scale-95 transition-transform'
    mapBtn.addEventListener('click', () => {
      overlay.remove()
      eventBus.emit('screen:change', { screen: 'map' })
    })

    btnRow.appendChild(resumeBtn)
    btnRow.appendChild(mapBtn)
    box.appendChild(btnRow)
    overlay.appendChild(box)
    this.container.appendChild(overlay)
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

    // 1) 매칭된 블록 pop 애니메이션 + 파티클 + 사운드
    const popPromises: Promise<void>[] = []
    soundManager.play('block-pop', 1.0 + cascadeIndex * 0.1)
    const hapticEvents: HapticEvent[] = ['match', 'cascade2', 'cascade3', 'cascade4plus']
    hapticManager.trigger(hapticEvents[Math.min(cascadeIndex, 3)])
    for (const match of step.matches) {
      for (const cell of match.cells) {
        this.effects.spawnBlockPop(cell, match.blockType)
        this.effects.blockFlash(cell)
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
    if (cascadeIndex >= 1) {
      const TEXTS = ['', 'Good!', 'Great!!', 'Amazing!!!', 'INCREDIBLE!!!!']
      const COLORS = ['', 'white', '#FFD600', '#FF9A3C', '#FF0080']
      const SIZES = [0, 24, 32, 40, 48]
      const SHAKES = [0, 2, 4, 6, 8]
      const idx = Math.min(cascadeIndex, 4)

      this.effects.showText(
        TEXTS[idx],
        this.effects.boardCenterX,
        this.effects.boardCenterY,
        SIZES[idx],
        COLORS[idx],
      )
      this.shake.shake(SHAKES[idx], 200 + idx * 25)

      if (cascadeIndex >= 2) {
        this.effects.flash('rgba(255,255,255,0.15)')
      }
    }

    if (step.matches.length > 0 && step.matches[0].cells.length > 0) {
      const firstCell = step.matches[0].cells[0]
      const px = this.effects.boardOffsetX + firstCell.col * CELL_SIZE + CELL_SIZE / 2
      const py = this.effects.boardOffsetY + firstCell.row * CELL_SIZE
      const totalMatchedForScore = step.matches.reduce((sum, m) => sum + m.cells.length, 0)
      const score = totalMatchedForScore * 10 * (cascadeIndex === 0 ? 1 : 1 + cascadeIndex * 0.5)
      this.effects.showScoreFloat(Math.round(score), px, py)
    }

    // spawn 애니메이션 완료 대기 (0.22s)
    await new Promise(r => setTimeout(r, 250))
  }

  private async sweepRemainingBlocks(): Promise<void> {
    const board = this.boardLogic.getBoard()
    const SWEEP_DELAY = 80  // ms per row

    for (let row = 0; row < BOARD_ROWS; row++) {
      await new Promise(r => setTimeout(r, SWEEP_DELAY))
      for (let col = 0; col < BOARD_COLS; col++) {
        const blockType = board[col]?.[row]
        if (blockType !== undefined && blockType !== -1) {
          const view = this.boardRenderer.getBlock(col, row)
          if (view) {
            this.effects.spawnBlockPop({ col, row }, blockType as BlockType)
            void view.animatePop()
          }
        }
      }
    }
    await new Promise(r => setTimeout(r, 300))
  }
}
