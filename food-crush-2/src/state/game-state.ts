import {
  type LevelConfig, type BlockType,
  STAR_3_THRESHOLD, STAR_2_THRESHOLD,
} from '@/core/types'
import { eventBus } from './event-bus'

export class GameState {
  private level = 0
  private remainingMoves = 0
  private score = 0
  private goals = new Map<BlockType, { current: number; target: number }>()
  private active = false

  startLevel(config: LevelConfig): void {
    this.level = config.level
    this.remainingMoves = config.moves
    this.score = 0
    this.goals.clear()
    this.active = true

    for (const obj of config.objectives) {
      this.goals.set(obj.blockType, { current: 0, target: obj.count })
    }

    eventBus.emit('game:level-start', { config })
  }

  useMove(): void {
    if (this.remainingMoves > 0) {
      this.remainingMoves--
      eventBus.emit('game:move-used', { remaining: this.remainingMoves })
    }
  }

  addGoalProgress(blockType: BlockType, count: number): void {
    const goal = this.goals.get(blockType)
    if (!goal) return
    goal.current = Math.min(goal.target, goal.current + count)
    eventBus.emit('game:goal-progress', {
      blockType,
      current: goal.current,
      target: goal.target,
    })
  }

  addScore(delta: number): void {
    this.score += delta
    eventBus.emit('game:score-changed', { score: this.score, delta })
  }

  getRemainingMoves(): number { return this.remainingMoves }
  getScore(): number { return this.score }
  getLevel(): number { return this.level }
  isLevelActive(): boolean { return this.active }

  getGoalProgress(blockType: BlockType): number {
    return this.goals.get(blockType)?.current ?? 0
  }

  getGoals(): Map<BlockType, { current: number; target: number }> {
    return this.goals
  }

  areAllGoalsMet(): boolean {
    for (const goal of this.goals.values()) {
      if (goal.current < goal.target) return false
    }
    return true
  }

  calculateStars(): number {
    if (this.remainingMoves >= STAR_3_THRESHOLD) return 3
    if (this.remainingMoves >= STAR_2_THRESHOLD) return 2
    return 1
  }

  endLevel(): void {
    this.active = false
  }
}
