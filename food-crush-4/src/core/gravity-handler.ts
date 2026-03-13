// src/core/gravity-handler.ts
import {
  type BoardGrid, type FallMove, type Position, type BlockType,
  BOARD_COLS, BOARD_ROWS, BLOCK_TYPES_COUNT, EMPTY,
} from './types'

/** 중력 적용: 빈 셀 위의 블록을 아래로 떨어뜨린다 */
export function applyGravity(board: BoardGrid): FallMove[] {
  const falls: FallMove[] = []

  for (let col = 0; col < BOARD_COLS; col++) {
    // 아래부터 위로 스캔하며 압축
    let writeRow = BOARD_ROWS - 1

    for (let row = BOARD_ROWS - 1; row >= 0; row--) {
      if (board[col][row] !== EMPTY) {
        if (writeRow !== row) {
          falls.push({
            from: { col, row },
            to: { col, row: writeRow },
            blockType: board[col][row] as BlockType,
          })
          board[col][writeRow] = board[col][row]
          board[col][row] = EMPTY
        }
        writeRow--
      }
    }
  }

  return falls
}

/** 빈 셀을 랜덤 블록으로 채운다
 * 신규 블록은 row 0부터 채워짐 — 렌더러에서 row=0..N이 스폰 위치임
 */
export function fillEmpty(board: BoardGrid): { pos: Position; blockType: BlockType }[] {
  const spawned: { pos: Position; blockType: BlockType }[] = []

  for (let col = 0; col < BOARD_COLS; col++) {
    for (let row = 0; row < BOARD_ROWS; row++) {
      if (board[col][row] === EMPTY) {
        const type = Math.floor(Math.random() * BLOCK_TYPES_COUNT) as BlockType
        board[col][row] = type
        spawned.push({ pos: { col, row }, blockType: type })
      }
    }
  }

  return spawned
}
