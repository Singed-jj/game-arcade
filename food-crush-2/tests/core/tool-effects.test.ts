import { describe, it, expect } from 'vitest'
import { getRocketTargets, getBombTargets, getRainbowTargets } from '@/core/tool-effects'
import { BlockType, BOARD_COLS, BOARD_ROWS, EMPTY, type BoardGrid } from '@/core/types'

function filledBoard(): BoardGrid {
  return Array.from({ length: BOARD_COLS }, (_, c) =>
    Array.from({ length: BOARD_ROWS }, (_, r) => ((c + r) % 5) as BlockType)
  )
}

describe('getRocketTargets', () => {
  it('같은 행의 모든 셀을 반환한다', () => {
    const targets = getRocketTargets(3, 4, 'horizontal')
    expect(targets).toHaveLength(BOARD_COLS)
    targets.forEach(t => expect(t.row).toBe(4))
  })

  it('같은 열의 모든 셀을 반환한다', () => {
    const targets = getRocketTargets(3, 4, 'vertical')
    expect(targets).toHaveLength(BOARD_ROWS)
    targets.forEach(t => expect(t.col).toBe(3))
  })
})

describe('getBombTargets', () => {
  it('3x3 영역의 셀을 반환한다', () => {
    const targets = getBombTargets(3, 3)
    expect(targets).toHaveLength(9)
  })

  it('보드 가장자리에서 범위를 벗어나지 않는다', () => {
    const targets = getBombTargets(0, 0)
    expect(targets.every(t => t.col >= 0 && t.row >= 0)).toBe(true)
    expect(targets).toHaveLength(4) // 0,0 / 0,1 / 1,0 / 1,1
  })
})

describe('getRainbowTargets', () => {
  it('같은 타입의 모든 블록 위치를 반환한다', () => {
    const board = filledBoard()
    const targets = getRainbowTargets(board, BlockType.CHICKEN)
    expect(targets.length).toBeGreaterThan(0)
    targets.forEach(t => expect(board[t.col][t.row]).toBe(BlockType.CHICKEN))
  })
})
