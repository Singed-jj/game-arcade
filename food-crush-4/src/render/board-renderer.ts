import { Container, Graphics } from 'pixi.js'
import { gsap } from 'gsap'
import { initPixiApp } from './pixi-app'
import { BlockSprite } from './block-sprite'
import { BOARD_COLS, BOARD_ROWS, CELL_SIZE, EMPTY, type BoardGrid, type BlockType, type Position } from '@/core/types'
import { eventBus } from '@/state/event-bus'
import { soundManager } from '@/audio/sound-manager'

export class BoardRenderer {
  private domContainer: HTMLElement
  private pixiContainer: Container = new Container()
  private blocks: Map<string, BlockSprite> = new Map()
  private selectedPos: Position | null = null
  private inputLocked = false
  private toolMode = false

  private startPos: Position | null = null
  private startPixel: { x: number; y: number } | null = null
  private swapFired = false
  private pendingSwipeTo: Position | null = null

  private readonly boardWidth = BOARD_COLS * CELL_SIZE
  private readonly boardHeight = BOARD_ROWS * CELL_SIZE

  constructor(domContainer: HTMLElement) {
    this.domContainer = domContainer
  }

  async mount(): Promise<void> {
    const app = await initPixiApp(this.domContainer)
    app.stage.addChild(this.pixiContainer)
    this.setupBackground()
    this.updateBoardPosition()
    window.addEventListener('resize', () => this.updateBoardPosition())
    this.setupInput()
  }

  private updateBoardPosition(): void {
    const w = this.domContainer.clientWidth || 375
    const h = this.domContainer.clientHeight || 600
    this.pixiContainer.x = Math.max(0, (w - this.boardWidth) / 2)
    this.pixiContainer.y = Math.max(0, (h - this.boardHeight) / 2)
  }

  private setupBackground(): void {
    const bg = new Graphics()
    bg.roundRect(0, 0, this.boardWidth, this.boardHeight, 16)
    bg.fill({ color: 0x000000, alpha: 0.55 })
    this.pixiContainer.addChild(bg)
  }

  private key(col: number, row: number): string { return `${col},${row}` }

  renderBoard(board: BoardGrid, animated = false): void {
    this.blocks.forEach(b => b.destroy({ children: true }))
    this.blocks.clear()
    for (let col = 0; col < BOARD_COLS; col++) {
      for (let row = 0; row < BOARD_ROWS; row++) {
        if (board[col][row] === EMPTY) continue
        const sprite = new BlockSprite(board[col][row] as BlockType, { col, row })
        this.blocks.set(this.key(col, row), sprite)
        this.pixiContainer.addChild(sprite)
        if (animated) {
          const delay = row * 18 + col * 8
          sprite.spawnAnimate(delay)
        }
      }
    }
  }

  setToolMode(active: boolean): void {
    this.toolMode = active
    this.domContainer.style.cursor = active ? 'crosshair' : ''
    if (!active && this.selectedPos) {
      this.blocks.get(this.key(this.selectedPos.col, this.selectedPos.row))?.setSelected(false)
      this.selectedPos = null
    }
  }

  lockInput(): void { this.inputLocked = true }

  unlockInput(): void {
    if (this.selectedPos) {
      this.blocks.get(this.key(this.selectedPos.col, this.selectedPos.row))?.setSelected(false)
      this.selectedPos = null
    }
    this.inputLocked = false
  }

  private resetInput(): void {
    this.startPos = null
    this.startPixel = null
    this.swapFired = false
    this.pendingSwipeTo = null
  }

  private setupInput(): void {
    const SWIPE_THRESHOLD = CELL_SIZE / 3

    this.domContainer.addEventListener('pointerdown', (e) => {
      if (this.inputLocked) return
      this.startPos = this.posFromEvent(e)
      this.startPixel = { x: e.clientX, y: e.clientY }
      this.swapFired = false
      this.pendingSwipeTo = null
      this.domContainer.setPointerCapture(e.pointerId)
    })

    this.domContainer.addEventListener('pointermove', (e) => {
      if (this.inputLocked || !this.startPos || !this.startPixel || this.swapFired) return
      const dx = e.clientX - this.startPixel.x
      const dy = e.clientY - this.startPixel.y

      let direction: Position | null = null
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
        direction = { col: this.startPos.col + Math.sign(dx), row: this.startPos.row }
      } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > SWIPE_THRESHOLD) {
        direction = { col: this.startPos.col, row: this.startPos.row + Math.sign(dy) }
      }

      if (direction && direction.col >= 0 && direction.col < BOARD_COLS &&
          direction.row >= 0 && direction.row < BOARD_ROWS) {
        this.swapFired = true
        this.pendingSwipeTo = direction
      }
    })

    this.domContainer.addEventListener('pointerup', (e) => {
      if (this.inputLocked) {
        this.resetInput()
        return
      }
      if (!this.startPos) {
        this.resetInput()
        return
      }

      if (this.swapFired && this.pendingSwipeTo) {
        if (this.toolMode) {
          eventBus.emit('board:cell-tapped', { col: this.startPos.col, row: this.startPos.row })
        } else {
          eventBus.emit('board:swap-requested', { from: this.startPos, to: this.pendingSwipeTo })
        }
        this.resetInput()
        return
      }

      const endPos = this.posFromEvent(e)
      if (endPos && endPos.col === this.startPos.col && endPos.row === this.startPos.row) {
        // tap
        eventBus.emit('board:cell-tapped', { col: endPos.col, row: endPos.row })
        if (!this.toolMode) {
          if (this.selectedPos) {
            this.blocks.get(this.key(this.selectedPos.col, this.selectedPos.row))?.setSelected(false)
            const sdx = endPos.col - this.selectedPos.col
            const sdy = endPos.row - this.selectedPos.row
            if (Math.abs(sdx) + Math.abs(sdy) === 1) {
              eventBus.emit('board:swap-requested', { from: this.selectedPos, to: endPos })
            }
            this.selectedPos = null
          } else {
            this.selectedPos = endPos
            this.blocks.get(this.key(endPos.col, endPos.row))?.setSelected(true)
          }
        }
      }
      this.resetInput()
    })

    this.domContainer.addEventListener('pointercancel', () => {
      this.resetInput()
    })
  }

  private posFromEvent(e: PointerEvent): Position | null {
    const rect = this.domContainer.getBoundingClientRect()
    const offsetX = Math.max(0, (rect.width - this.boardWidth) / 2)
    const offsetY = Math.max(0, (rect.height - this.boardHeight) / 2)
    const col = Math.floor((e.clientX - rect.left - offsetX) / CELL_SIZE)
    const row = Math.floor((e.clientY - rect.top - offsetY) / CELL_SIZE)
    if (col < 0 || col >= BOARD_COLS || row < 0 || row >= BOARD_ROWS) return null
    return { col, row }
  }

  async animateSwap(from: Position, to: Position): Promise<void> {
    const a = this.blocks.get(this.key(from.col, from.row))
    const b = this.blocks.get(this.key(to.col, to.row))
    if (!a || !b) return

    soundManager.play('swap')

    this.blocks.set(this.key(from.col, from.row), b)
    this.blocks.set(this.key(to.col, to.row), a)
    a.pos = { col: to.col, row: to.row }
    b.pos = { col: from.col, row: from.row }

    await Promise.all([
      new Promise<void>(r => gsap.to(a, { x: a.pos.col * CELL_SIZE + 3, y: a.pos.row * CELL_SIZE + 3, duration: 0.16, onComplete: r })),
      new Promise<void>(r => gsap.to(b, { x: b.pos.col * CELL_SIZE + 3, y: b.pos.row * CELL_SIZE + 3, duration: 0.16, onComplete: r })),
    ])
  }

  startHint(from: Position, to: Position): void {
    this.blocks.get(this.key(from.col, from.row))?.startHint()
    this.blocks.get(this.key(to.col, to.row))?.startHint()
  }

  stopHint(): void {
    this.blocks.forEach(b => b.stopHint())
  }

  getBlock(col: number, row: number): BlockSprite | undefined {
    return this.blocks.get(this.key(col, row))
  }

  removeBlock(col: number, row: number): void {
    this.blocks.delete(this.key(col, row))
  }

  moveBlock(from: Position, to: Position): void {
    const sprite = this.blocks.get(this.key(from.col, from.row))
    if (!sprite) return
    this.blocks.delete(this.key(from.col, from.row))
    this.blocks.set(this.key(to.col, to.row), sprite)
  }

  addBlock(pos: Position, blockType: BlockType): BlockSprite {
    const sprite = new BlockSprite(blockType, pos)
    this.blocks.set(this.key(pos.col, pos.row), sprite)
    this.pixiContainer.addChild(sprite)
    return sprite
  }

  getBoardContainer(): Container { return this.pixiContainer }

  getBoardOffset(): { x: number; y: number } {
    const rect = this.domContainer.getBoundingClientRect()
    return {
      x: rect.left + Math.max(0, (rect.width - this.boardWidth) / 2),
      y: rect.top + Math.max(0, (rect.height - this.boardHeight) / 2),
    }
  }

  destroy(): void {
    this.blocks.forEach(b => b.destroy({ children: true }))
    this.pixiContainer.destroy({ children: true })
  }
}
