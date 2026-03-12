import { describe, it, expect, beforeEach } from 'vitest'
import { GameState } from '@/state/game-state'
import { BlockType, STAR_3_THRESHOLD, STAR_2_THRESHOLD } from '@/core/types'

describe('GameState', () => {
  let state: GameState

  beforeEach(() => {
    state = new GameState()
  })

  it('레벨을 시작하면 이동 횟수와 목표가 설정된다', () => {
    state.startLevel({
      level: 1,
      moves: 25,
      objectives: [
        { blockType: BlockType.CHICKEN, count: 16 },
        { blockType: BlockType.COLA, count: 16 },
      ],
    })
    expect(state.getRemainingMoves()).toBe(25)
    expect(state.isLevelActive()).toBe(true)
  })

  it('이동을 사용하면 남은 횟수가 줄어든다', () => {
    state.startLevel({ level: 1, moves: 25, objectives: [{ blockType: BlockType.CHICKEN, count: 16 }] })
    state.useMove()
    expect(state.getRemainingMoves()).toBe(24)
  })

  it('목표 진행을 추가하면 카운트가 올라간다', () => {
    state.startLevel({ level: 1, moves: 25, objectives: [{ blockType: BlockType.CHICKEN, count: 5 }] })
    state.addGoalProgress(BlockType.CHICKEN, 3)
    expect(state.getGoalProgress(BlockType.CHICKEN)).toBe(3)
  })

  it('모든 목표를 달성하면 레벨 완료', () => {
    state.startLevel({ level: 1, moves: 25, objectives: [{ blockType: BlockType.CHICKEN, count: 3 }] })
    state.addGoalProgress(BlockType.CHICKEN, 3)
    expect(state.areAllGoalsMet()).toBe(true)
  })

  it('별 계산: 남은 4+ = 3별, 1~3 = 2별, 0 = 1별', () => {
    state.startLevel({ level: 1, moves: 10, objectives: [{ blockType: BlockType.CHICKEN, count: 1 }] })
    for (let i = 0; i < 6; i++) state.useMove()
    expect(state.calculateStars()).toBe(3)

    state.useMove()
    expect(state.calculateStars()).toBe(2)

    for (let i = 0; i < 3; i++) state.useMove()
    expect(state.calculateStars()).toBe(1)
  })
})
