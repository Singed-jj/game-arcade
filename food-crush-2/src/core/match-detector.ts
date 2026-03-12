// src/core/match-detector.ts
import {
  type BoardGrid, type MatchResult, type Position,
  MatchPattern, BOARD_COLS, BOARD_ROWS, EMPTY,
  type BlockType,
} from './types'

interface Run {
  cells: Position[]
  blockType: BlockType
  orientation: 'horizontal' | 'vertical'
}

/** 가로 연속 런 찾기 */
function findHorizontalRuns(board: BoardGrid): Run[] {
  const runs: Run[] = []
  for (let row = 0; row < BOARD_ROWS; row++) {
    let col = 0
    while (col < BOARD_COLS) {
      const type = board[col][row]
      if (type === EMPTY) { col++; continue }
      let end = col
      while (end + 1 < BOARD_COLS && board[end + 1][row] === type) end++
      const length = end - col + 1
      if (length >= 3) {
        const cells: Position[] = []
        for (let c = col; c <= end; c++) cells.push({ col: c, row })
        runs.push({ cells, blockType: type as BlockType, orientation: 'horizontal' })
      }
      col = end + 1
    }
  }
  return runs
}

/** 세로 연속 런 찾기 */
function findVerticalRuns(board: BoardGrid): Run[] {
  const runs: Run[] = []
  for (let col = 0; col < BOARD_COLS; col++) {
    let row = 0
    while (row < BOARD_ROWS) {
      const type = board[col][row]
      if (type === EMPTY) { row++; continue }
      let end = row
      while (end + 1 < BOARD_ROWS && board[col][end + 1] === type) end++
      const length = end - row + 1
      if (length >= 3) {
        const cells: Position[] = []
        for (let r = row; r <= end; r++) cells.push({ col, row: r })
        runs.push({ cells, blockType: type as BlockType, orientation: 'vertical' })
      }
      row = end + 1
    }
  }
  return runs
}

/** 교차하는 같은 타입의 런을 하나로 합치기 (BFS) */
function mergeRuns(allRuns: Run[]): MatchResult[] {
  if (allRuns.length === 0) return []

  const cellToRuns = new Map<string, number[]>()
  allRuns.forEach((run, i) => {
    for (const cell of run.cells) {
      const key = `${cell.col},${cell.row}`
      const list = cellToRuns.get(key) ?? []
      list.push(i)
      cellToRuns.set(key, list)
    }
  })

  const visited = new Set<number>()
  const results: MatchResult[] = []

  for (let i = 0; i < allRuns.length; i++) {
    if (visited.has(i)) continue
    visited.add(i)

    const group: Run[] = [allRuns[i]]
    const queue = [i]
    const blockType = allRuns[i].blockType

    while (queue.length > 0) {
      const idx = queue.shift()!
      for (const cell of allRuns[idx].cells) {
        const key = `${cell.col},${cell.row}`
        for (const neighborIdx of cellToRuns.get(key) ?? []) {
          if (!visited.has(neighborIdx) && allRuns[neighborIdx].blockType === blockType) {
            visited.add(neighborIdx)
            queue.push(neighborIdx)
            group.push(allRuns[neighborIdx])
          }
        }
      }
    }

    const cellSet = new Set<string>()
    const cells: Position[] = []
    for (const run of group) {
      for (const cell of run.cells) {
        const key = `${cell.col},${cell.row}`
        if (!cellSet.has(key)) {
          cellSet.add(key)
          cells.push(cell)
        }
      }
    }

    const hasH = group.some(r => r.orientation === 'horizontal')
    const hasV = group.some(r => r.orientation === 'vertical')
    let pattern: MatchPattern
    if (hasH && hasV) {
      // L/T 형태는 모두 L_SHAPE로 통일 처리 (보상 동일)
      pattern = cells.length >= 9 ? MatchPattern.CROSS : MatchPattern.L_SHAPE
    } else if (hasH) {
      pattern = cells.length >= 5 ? MatchPattern.HORIZONTAL_5
        : cells.length >= 4 ? MatchPattern.HORIZONTAL_4
        : MatchPattern.HORIZONTAL
    } else {
      pattern = cells.length >= 5 ? MatchPattern.VERTICAL_5
        : cells.length >= 4 ? MatchPattern.VERTICAL_4
        : MatchPattern.VERTICAL
    }

    results.push({ cells, pattern, blockType })
  }

  return results
}

/** 보드에서 모든 매치를 찾는다 */
export function findMatches(board: BoardGrid): MatchResult[] {
  const hRuns = findHorizontalRuns(board)
  const vRuns = findVerticalRuns(board)
  return mergeRuns([...hRuns, ...vRuns])
}
