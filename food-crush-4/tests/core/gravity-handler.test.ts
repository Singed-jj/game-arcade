// tests/core/gravity-handler.test.ts
import { describe, it, expect } from 'vitest'
import { applyGravity, fillEmpty } from '@/core/gravity-handler'
import { BlockType, BOARD_COLS, BOARD_ROWS, EMPTY, type BoardGrid } from '@/core/types'

function emptyBoard(): BoardGrid {
  return Array.from({ length: BOARD_COLS }, () =>
    Array.from({ length: BOARD_ROWS }, () => EMPTY)
  )
}

describe('applyGravity', () => {
  it('빈 칸 위의 블록이 아래로 떨어진다', () => {
    const board = emptyBoard()
    board[0][0] = BlockType.CHICKEN // row 0 (위)
    // row 1, 2 빈 칸
    const falls = applyGravity(board)

    expect(board[0][6]).toBe(BlockType.CHICKEN) // row 6 (최하단)으로 이동
    expect(board[0][0]).toBe(EMPTY)
    expect(falls.length).toBeGreaterThan(0)
    expect(falls[0].from).toEqual({ col: 0, row: 0 })
    expect(falls[0].to).toEqual({ col: 0, row: 6 })
  })

  it('이미 바닥에 있는 블록은 이동하지 않는다', () => {
    const board = emptyBoard()
    board[0][6] = BlockType.COLA // 최하단
    const falls = applyGravity(board)

    expect(board[0][6]).toBe(BlockType.COLA)
    expect(falls).toHaveLength(0)
  })

  it('연속된 블록이 함께 떨어진다', () => {
    const board = emptyBoard()
    board[3][0] = BlockType.FRIES
    board[3][1] = BlockType.BURGER
    // row 2~6 빈 칸
    applyGravity(board)

    expect(board[3][5]).toBe(BlockType.FRIES)
    expect(board[3][6]).toBe(BlockType.BURGER)
  })
})

describe('fillEmpty', () => {
  it('빈 칸을 랜덤 블록으로 채운다', () => {
    const board = emptyBoard()
    // 대부분 블록으로 채우고, 2개 칸만 빈 칸으로 남김
    for (let col = 0; col < BOARD_COLS; col++) {
      for (let row = 0; row < BOARD_ROWS; row++) {
        if (!(col === 0 && row <= 1)) {
          board[col][row] = BlockType.CHICKEN
        }
      }
    }

    const spawned = fillEmpty(board)

    expect(board[0][0]).not.toBe(EMPTY)
    expect(board[0][1]).not.toBe(EMPTY)
    expect(spawned.length).toBe(2)
  })
})
