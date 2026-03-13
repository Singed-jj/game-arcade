import { ToolType } from '@/core/types'
import { eventBus } from './event-bus'

export class ToolManager {
  private counts = new Map<ToolType, number>([
    [ToolType.ROCKET, 0],
    [ToolType.BOMB, 0],
    [ToolType.RAINBOW, 0],
  ])

  getCount(type: ToolType): number { return this.counts.get(type) ?? 0 }

  addTool(type: ToolType, count = 1): void {
    this.counts.set(type, (this.counts.get(type) ?? 0) + count)
    eventBus.emit('tool:count-changed', { type, count: this.getCount(type) })
  }

  useTool(type: ToolType): boolean {
    const current = this.getCount(type)
    if (current <= 0) return false
    this.counts.set(type, current - 1)
    eventBus.emit('tool:count-changed', { type, count: this.getCount(type) })
    return true
  }

  loadState(data: Record<string, number>): void {
    for (const [key, val] of Object.entries(data)) {
      this.counts.set(key as ToolType, val)
    }
  }

  toJSON(): Record<string, number> {
    return Object.fromEntries(this.counts)
  }
}
