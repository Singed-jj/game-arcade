import {
  type BoardGrid, type Position, type BlockType,
  BOARD_COLS, BOARD_ROWS,
} from './types'

/** 로켓: 한 행 또는 한 열 전체 */
export function getRocketTargets(
  col: number, row: number, direction: 'horizontal' | 'vertical'
): Position[] {
  const targets: Position[] = []
  if (direction === 'horizontal') {
    for (let c = 0; c < BOARD_COLS; c++) targets.push({ col: c, row })
  } else {
    for (let r = 0; r < BOARD_ROWS; r++) targets.push({ col, row: r })
  }
  return targets
}

/** 폭탄: 3x3 영역 */
export function getBombTargets(col: number, row: number): Position[] {
  const targets: Position[] = []
  for (let dc = -1; dc <= 1; dc++) {
    for (let dr = -1; dr <= 1; dr++) {
      const c = col + dc
      const r = row + dr
      if (c >= 0 && c < BOARD_COLS && r >= 0 && r < BOARD_ROWS) {
        targets.push({ col: c, row: r })
      }
    }
  }
  return targets
}

/** 무지개: 같은 타입 전부 */
export function getRainbowTargets(board: BoardGrid, blockType: BlockType): Position[] {
  const targets: Position[] = []
  for (let col = 0; col < BOARD_COLS; col++) {
    for (let row = 0; row < BOARD_ROWS; row++) {
      if (board[col][row] === blockType) {
        targets.push({ col, row })
      }
    }
  }
  return targets
}
