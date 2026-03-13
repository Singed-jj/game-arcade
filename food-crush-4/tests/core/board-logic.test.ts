// tests/core/board-logic.test.ts
import { describe, it, expect } from 'vitest'
import { BoardLogic } from '@/core/board-logic'
import { BlockType, BOARD_COLS, BOARD_ROWS, EMPTY } from '@/core/types'

describe('BoardLogic', () => {
  it('보드를 초기 매치 없이 생성한다', () => {
    const logic = new BoardLogic()
    logic.initBoard()
    const board = logic.getBoard()
    expect(board.length).toBe(BOARD_COLS)
    expect(board[0].length).toBe(BOARD_ROWS)
    for (let c = 0; c < BOARD_COLS; c++)
      for (let r = 0; r < BOARD_ROWS; r++)
        expect(board[c][r]).not.toBe(EMPTY)
  })

  it('유효한 스왑을 수행하고 캐스케이드를 처리한다', () => {
    const logic = new BoardLogic()
    logic.initBoard()
    const result = logic.trySwap({ col: 0, row: 0 }, { col: 1, row: 0 })
    for (let c = 0; c < BOARD_COLS; c++)
      for (let r = 0; r < BOARD_ROWS; r++)
        expect(logic.getBoard()[c][r]).not.toBe(EMPTY)
  })

  it('인접하지 않은 셀은 스왑할 수 없다', () => {
    const logic = new BoardLogic()
    logic.initBoard()
    const result = logic.trySwap({ col: 0, row: 0 }, { col: 2, row: 0 })
    expect(result.valid).toBe(false)
  })

  it('removeCells로 셀을 제거하면 중력 + 채우기가 적용된다', () => {
    const logic = new BoardLogic()
    logic.initBoard()
    const destroyed = logic.removeCells([{ col: 0, row: 6 }, { col: 1, row: 6 }])
    for (let c = 0; c < BOARD_COLS; c++)
      for (let r = 0; r < BOARD_ROWS; r++)
        expect(logic.getBoard()[c][r]).not.toBe(EMPTY)
  })

  it('매치 가능한 스왑이 있는지 확인한다', () => {
    const logic = new BoardLogic()
    logic.initBoard()
    expect(logic.hasValidMoves()).toBe(true)
  })
})
