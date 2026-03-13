// src/core/board-logic.ts
import {
  type BoardGrid, type Position, type MatchResult, type FallMove,
  BlockType, BOARD_COLS, BOARD_ROWS, BLOCK_TYPES_COUNT, EMPTY,
} from './types'
import { findMatches } from './match-detector'
import { applyGravity, fillEmpty } from './gravity-handler'

export interface SwapResult {
  valid: boolean
  matches: MatchResult[]
  cascadeCount: number
  cascades: CascadeStep[]
}

export interface CascadeStep {
  matches: MatchResult[]
  falls: FallMove[]
  spawned: { pos: Position; blockType: BlockType }[]
}

export class BoardLogic {
  private board: BoardGrid = []

  initBoard(): void {
    this.board = Array.from({ length: BOARD_COLS }, () =>
      Array.from({ length: BOARD_ROWS }, () => EMPTY)
    )

    for (let col = 0; col < BOARD_COLS; col++) {
      for (let row = 0; row < BOARD_ROWS; row++) {
        let type: BlockType
        do {
          type = Math.floor(Math.random() * BLOCK_TYPES_COUNT) as BlockType
        } while (this.wouldMatch(col, row, type))
        this.board[col][row] = type
      }
    }
  }

  private wouldMatch(col: number, row: number, type: BlockType): boolean {
    if (col >= 2 && this.board[col - 1][row] === type && this.board[col - 2][row] === type) return true
    if (row >= 2 && this.board[col][row - 1] === type && this.board[col][row - 2] === type) return true
    return false
  }

  getBoard(): BoardGrid {
    return this.board
  }

  getBlock(col: number, row: number): BlockType | -1 {
    if (col < 0 || col >= BOARD_COLS || row < 0 || row >= BOARD_ROWS) return EMPTY
    return this.board[col][row]
  }

  trySwap(from: Position, to: Position): SwapResult {
    const dx = Math.abs(from.col - to.col)
    const dy = Math.abs(from.row - to.row)
    if (dx + dy !== 1) return { valid: false, matches: [], cascadeCount: 0, cascades: [] }
    if (this.getBlock(from.col, from.row) === EMPTY || this.getBlock(to.col, to.row) === EMPTY) {
      return { valid: false, matches: [], cascadeCount: 0, cascades: [] }
    }

    this.swap(from, to)

    const initialMatches = findMatches(this.board)
    if (initialMatches.length === 0) {
      this.swap(from, to)
      return { valid: false, matches: [], cascadeCount: 0, cascades: [] }
    }

    const cascades = this.processCascade()
    const allMatches = cascades.flatMap(c => c.matches)

    return {
      valid: true,
      matches: allMatches,
      cascadeCount: cascades.length,
      cascades,
    }
  }

  private swap(a: Position, b: Position): void {
    const temp = this.board[a.col][a.row]
    this.board[a.col][a.row] = this.board[b.col][b.row]
    this.board[b.col][b.row] = temp
  }

  processCascade(): CascadeStep[] {
    const steps: CascadeStep[] = []
    let safety = 0

    while (safety++ < 30) {
      const matches = findMatches(this.board)
      if (matches.length === 0) break

      for (const match of matches) {
        for (const cell of match.cells) {
          this.board[cell.col][cell.row] = EMPTY
        }
      }

      const falls = applyGravity(this.board)
      const spawned = fillEmpty(this.board)

      steps.push({ matches, falls, spawned })
    }

    return steps
  }

  removeCells(cells: Position[]): CascadeStep[] {
    for (const cell of cells) {
      if (cell.col >= 0 && cell.col < BOARD_COLS && cell.row >= 0 && cell.row < BOARD_ROWS) {
        this.board[cell.col][cell.row] = EMPTY
      }
    }
    const falls = applyGravity(this.board)
    const spawned = fillEmpty(this.board)
    const initial: CascadeStep = { matches: [], falls, spawned }
    return [initial, ...this.processCascade()]
  }

  hasValidMoves(): boolean {
    return this.findHintMove() !== null
  }

  findHintMove(): { from: Position; to: Position } | null {
    const dirs: [number, number][] = [[0, 1], [1, 0]]
    for (let col = 0; col < BOARD_COLS; col++) {
      for (let row = 0; row < BOARD_ROWS; row++) {
        for (const [dc, dr] of dirs) {
          const nc = col + dc
          const nr = row + dr
          if (nc >= BOARD_COLS || nr >= BOARD_ROWS) continue

          this.swap({ col, row }, { col: nc, row: nr })
          const hasMatch = findMatches(this.board).length > 0
          this.swap({ col, row }, { col: nc, row: nr })

          if (hasMatch) return { from: { col, row }, to: { col: nc, row: nr } }
        }
      }
    }
    return null
  }

  shuffle(): void {
    const blocks: BlockType[] = []
    for (let c = 0; c < BOARD_COLS; c++)
      for (let r = 0; r < BOARD_ROWS; r++)
        if (this.board[c][r] !== EMPTY) blocks.push(this.board[c][r] as BlockType)

    for (let i = blocks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[blocks[i], blocks[j]] = [blocks[j], blocks[i]]
    }

    let idx = 0
    for (let c = 0; c < BOARD_COLS; c++)
      for (let r = 0; r < BOARD_ROWS; r++)
        this.board[c][r] = blocks[idx++]
  }
}
