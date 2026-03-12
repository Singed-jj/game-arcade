import { BOARD_COLS, BOARD_ROWS, CELL_SIZE, type BoardGrid, type BlockType, type Position, EMPTY } from '@/core/types'
import { eventBus } from '@/state/event-bus'
import { BlockView } from './block-view'

export class BoardRenderer {
  private container: HTMLElement
  private boardEl: HTMLElement
  private blocks: Map<string, BlockView> = new Map()
  private selectedPos: Position | null = null
  private inputLocked = false

  constructor(container: HTMLElement) {
    this.container = container
    this.boardEl = document.createElement('div')
    this.boardEl.className = 'relative mx-auto'
    this.boardEl.style.width = `${BOARD_COLS * CELL_SIZE}px`
    this.boardEl.style.height = `${BOARD_ROWS * CELL_SIZE}px`
    this.boardEl.style.backgroundImage = 'url(/assets/ui/board-bg.png)'
    this.boardEl.style.backgroundSize = 'cover'
    container.appendChild(this.boardEl)
    this.setupInput()
  }

  private key(col: number, row: number): string { return `${col},${row}` }

  renderBoard(board: BoardGrid): void {
    this.blocks.forEach(b => b.destroy())
    this.blocks.clear()
    for (let col = 0; col < BOARD_COLS; col++) {
      for (let row = 0; row < BOARD_ROWS; row++) {
        if (board[col][row] === EMPTY) continue
        const view = new BlockView(board[col][row] as BlockType, { col, row })
        this.blocks.set(this.key(col, row), view)
        this.boardEl.appendChild(view.el)
      }
    }
  }

  lockInput(): void { this.inputLocked = true }
  unlockInput(): void { this.inputLocked = false; this.selectedPos = null }

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
        eventBus.emit('board:swap-requested', { from: startPos, to: endPos })
      } else if (dx === 0 && dy === 0) {
        if (this.selectedPos) {
          const sdx = endPos.col - this.selectedPos.col
          const sdy = endPos.row - this.selectedPos.row
          if (Math.abs(sdx) + Math.abs(sdy) === 1) {
            eventBus.emit('board:swap-requested', { from: this.selectedPos, to: endPos })
          }
          this.selectedPos = null
        } else {
          this.selectedPos = endPos
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

  getBlock(col: number, row: number): BlockView | undefined {
    return this.blocks.get(this.key(col, row))
  }

  getBoardElement(): HTMLElement { return this.boardEl }

  destroy(): void { this.blocks.forEach(b => b.destroy()); this.boardEl.remove() }
}
