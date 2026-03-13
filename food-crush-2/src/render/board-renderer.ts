import { BOARD_COLS, BOARD_ROWS, CELL_SIZE, type BoardGrid, type BlockType, type Position, EMPTY } from '@/core/types'
import { eventBus } from '@/state/event-bus'
import { BlockView } from './block-view'

export class BoardRenderer {
  private container: HTMLElement
  private boardEl: HTMLElement
  private blocks: Map<string, BlockView> = new Map()
  private selectedPos: Position | null = null
  private inputLocked = false
  private toolMode = false

  constructor(container: HTMLElement) {
    this.container = container
    this.boardEl = document.createElement('div')
    this.boardEl.className = 'relative mx-auto'
    this.boardEl.style.width = `${BOARD_COLS * CELL_SIZE}px`
    this.boardEl.style.height = `${BOARD_ROWS * CELL_SIZE}px`
    this.boardEl.style.background = 'rgba(0,0,0,0.55)'
    this.boardEl.style.borderRadius = '16px'
    this.boardEl.style.padding = '3px'
    this.boardEl.style.boxShadow = '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
    this.boardEl.style.backgroundImage = `repeating-linear-gradient(0deg, transparent, transparent ${CELL_SIZE - 1}px, rgba(255,255,255,0.10) ${CELL_SIZE - 1}px, rgba(255,255,255,0.10) ${CELL_SIZE}px), repeating-linear-gradient(90deg, transparent, transparent ${CELL_SIZE - 1}px, rgba(255,255,255,0.10) ${CELL_SIZE - 1}px, rgba(255,255,255,0.10) ${CELL_SIZE}px)`
    container.appendChild(this.boardEl)
    this.setupInput()
  }

  private key(col: number, row: number): string { return `${col},${row}` }

  renderBoard(board: BoardGrid, animated = false): void {
    this.blocks.forEach(b => b.destroy())
    this.blocks.clear()
    for (let col = 0; col < BOARD_COLS; col++) {
      for (let row = 0; row < BOARD_ROWS; row++) {
        if (board[col][row] === EMPTY) continue
        const view = new BlockView(board[col][row] as BlockType, { col, row })
        this.blocks.set(this.key(col, row), view)
        this.boardEl.appendChild(view.el)
        if (animated) {
          const delay = row * 18 + col * 8
          view.spawnAnimate(delay)
        }
      }
    }
  }

  setToolMode(active: boolean): void {
    this.toolMode = active
    this.boardEl.style.cursor = active ? 'crosshair' : ''
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

  private setupInput(): void {
    let startPos: Position | null = null

    this.boardEl.addEventListener('pointerdown', (e) => {
      if (this.inputLocked) return
      startPos = this.posFromEvent(e)
    })

    this.boardEl.addEventListener('pointerup', (e) => {
      if (this.inputLocked || !startPos) return
      const endPos = this.posFromEvent(e)
      if (!endPos) { startPos = null; return }

      const dx = endPos.col - startPos.col
      const dy = endPos.row - startPos.row

      if (Math.abs(dx) + Math.abs(dy) === 1) {
        if (this.toolMode) {
          eventBus.emit('board:cell-tapped', { col: startPos.col, row: startPos.row })
        } else {
          eventBus.emit('board:swap-requested', { from: startPos, to: endPos })
        }
      } else if (dx === 0 && dy === 0) {
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
      startPos = null
    })
  }

  private posFromEvent(e: PointerEvent): Position | null {
    const rect = this.boardEl.getBoundingClientRect()
    const col = Math.floor((e.clientX - rect.left) / CELL_SIZE)
    const row = Math.floor((e.clientY - rect.top) / CELL_SIZE)
    if (col < 0 || col >= BOARD_COLS || row < 0 || row >= BOARD_ROWS) return null
    return { col, row }
  }

  async animateSwap(from: Position, to: Position): Promise<void> {
    const a = this.blocks.get(this.key(from.col, from.row))
    const b = this.blocks.get(this.key(to.col, to.row))
    if (!a || !b) return

    this.blocks.set(this.key(from.col, from.row), b)
    this.blocks.set(this.key(to.col, to.row), a)
    a.pos = { col: to.col, row: to.row }
    b.pos = { col: from.col, row: from.row }
    a.updatePosition()
    b.updatePosition()

    await new Promise(r => setTimeout(r, 160))
  }

  startHint(from: Position, to: Position): void {
    this.blocks.get(this.key(from.col, from.row))?.startHint()
    this.blocks.get(this.key(to.col, to.row))?.startHint()
  }

  stopHint(): void {
    this.blocks.forEach(b => b.stopHint())
  }

  getBlock(col: number, row: number): BlockView | undefined {
    return this.blocks.get(this.key(col, row))
  }

  getBoardElement(): HTMLElement { return this.boardEl }

  destroy(): void { this.blocks.forEach(b => b.destroy()); this.boardEl.remove() }
}
