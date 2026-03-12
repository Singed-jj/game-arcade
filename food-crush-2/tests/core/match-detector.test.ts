// tests/core/match-detector.test.ts
import { describe, it, expect } from 'vitest'
import { findMatches } from '@/core/match-detector'
import { BlockType, BOARD_COLS, BOARD_ROWS, EMPTY, type BoardGrid } from '@/core/types'

function emptyBoard(): BoardGrid {
  return Array.from({ length: BOARD_COLS }, () =>
    Array.from({ length: BOARD_ROWS }, () => EMPTY)
  )
}

describe('findMatches', () => {
  it('가로 3개 매치를 감지한다', () => {
    const board = emptyBoard()
    board[0][0] = BlockType.CHICKEN
    board[1][0] = BlockType.CHICKEN
    board[2][0] = BlockType.CHICKEN

    const matches = findMatches(board)
    expect(matches.length).toBe(1)
    expect(matches[0].cells).toHaveLength(3)
    expect(matches[0].blockType).toBe(BlockType.CHICKEN)
  })

  it('세로 3개 매치를 감지한다', () => {
    const board = emptyBoard()
    board[0][0] = BlockType.COLA
    board[0][1] = BlockType.COLA
    board[0][2] = BlockType.COLA

    const matches = findMatches(board)
    expect(matches.length).toBe(1)
    expect(matches[0].cells).toHaveLength(3)
  })

  it('매치가 없으면 빈 배열을 반환한다', () => {
    const board = emptyBoard()
    board[0][0] = BlockType.CHICKEN
    board[1][0] = BlockType.COLA
    board[2][0] = BlockType.FRIES

    expect(findMatches(board)).toHaveLength(0)
  })

  it('가로 4개 매치를 감지한다', () => {
    const board = emptyBoard()
    for (let c = 0; c < 4; c++) board[c][0] = BlockType.PIZZA
    const matches = findMatches(board)
    expect(matches.length).toBe(1)
    expect(matches[0].cells).toHaveLength(4)
  })

  it('여러 매치를 동시에 감지한다', () => {
    const board = emptyBoard()
    // 가로 매치 row 0
    board[0][0] = BlockType.CHICKEN
    board[1][0] = BlockType.CHICKEN
    board[2][0] = BlockType.CHICKEN
    // 세로 매치 col 5
    board[5][0] = BlockType.COLA
    board[5][1] = BlockType.COLA
    board[5][2] = BlockType.COLA

    const matches = findMatches(board)
    expect(matches.length).toBe(2)
  })

  it('빈 셀(-1)은 매치에 포함하지 않는다', () => {
    const board = emptyBoard()
    expect(findMatches(board)).toHaveLength(0)
  })

  it('교차하는 L/T 매치를 하나로 합친다', () => {
    const board = emptyBoard()
    // 가로 row=2: col 0,1,2
    board[0][2] = BlockType.BURGER
    board[1][2] = BlockType.BURGER
    board[2][2] = BlockType.BURGER
    // 세로 col=2: row 0,1,2
    board[2][0] = BlockType.BURGER
    board[2][1] = BlockType.BURGER
    // board[2][2] 는 이미 BURGER (교차점)

    const matches = findMatches(board)
    expect(matches.length).toBe(1) // 하나로 합쳐짐
    expect(matches[0].cells.length).toBe(5) // 5개 셀
  })
})
