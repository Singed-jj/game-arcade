// src/state/event-bus.ts
import type { Position, MatchResult, FallMove, BlockType, LevelConfig } from '@/core/types'

// CascadeStep is defined here to avoid circular imports
export interface CascadeStep {
  matches: MatchResult[]
  falls: FallMove[]
  spawned: { pos: Position; blockType: BlockType }[]
}

/** 게임 이벤트 타입 정의 */
export interface GameEventMap {
  // 보드 이벤트
  'board:cell-tapped': { col: number; row: number }
  'board:swap-requested': { from: Position; to: Position }
  'board:swap-invalid': { from: Position; to: Position }
  'board:matches-found': { matches: MatchResult[]; cascadeIndex: number }
  'board:blocks-destroyed': { cells: Position[]; blockTypes: Map<BlockType, number> }
  'board:blocks-fell': { falls: FallMove[] }
  'board:blocks-spawned': { spawned: { pos: Position; blockType: BlockType }[] }
  'board:cascade-complete': { cascadeCount: number; cascades: CascadeStep[] }
  'board:settled': void
  'board:no-moves': void

  // 게임 상태 이벤트
  'game:level-start': { config: LevelConfig }
  'game:move-used': { remaining: number }
  'game:goal-progress': { blockType: BlockType; current: number; target: number }
  'game:level-complete': { stars: number; movesLeft: number }
  'game:level-failed': void
  'game:score-changed': { score: number; delta: number }

  // 하트 이벤트
  'heart:changed': { current: number; max: number }
  'heart:empty': void
  'heart:recovered': void

  // 뽑기 조각
  'piece:changed': { current: number; max: number }
  'piece:gacha-ready': void

  // 도구
  'tool:selected': { type: string }
  'tool:used': { type: string; col: number; row: number }
  'tool:count-changed': { type: string; count: number }

  // 화면 전환
  'screen:change': { screen: string; data?: Record<string, unknown> }
}

type EventHandler<T> = T extends void ? () => void : (data: T) => void

class EventBus {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners = new Map<string, Set<(...args: any[]) => void>>()

  on<K extends keyof GameEventMap>(event: K, handler: EventHandler<GameEventMap[K]>): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(handler)
  }

  off<K extends keyof GameEventMap>(event: K, handler: EventHandler<GameEventMap[K]>): void {
    this.listeners.get(event)?.delete(handler)
  }

  emit<K extends keyof GameEventMap>(
    event: K,
    ...args: GameEventMap[K] extends void ? [] : [GameEventMap[K]]
  ): void {
    for (const handler of this.listeners.get(event) ?? []) {
      handler(...args)
    }
  }

  clear(): void {
    this.listeners.clear()
  }
}

export const eventBus = new EventBus()
