import { PIECES_FOR_GACHA, ToolType } from '@/core/types'
import type { GachaResult } from '@/core/types'
import type { ToolManager } from './tool-manager'
import { eventBus } from './event-bus'

export class PieceManager {
  private pieces = 0
  private toolManager: ToolManager | null = null

  setToolManager(tm: ToolManager): void {
    this.toolManager = tm
  }

  getPieces(): number { return this.pieces }

  addPieces(count: number): void {
    this.pieces += count
    eventBus.emit('piece:changed', { current: this.pieces, max: PIECES_FOR_GACHA })
    if (this.pieces >= PIECES_FOR_GACHA) {
      eventBus.emit('piece:gacha-ready')
    }
  }

  canGacha(): boolean { return this.pieces >= PIECES_FOR_GACHA }

  useForGacha(): GachaResult | null {
    if (!this.canGacha()) return null
    this.pieces -= PIECES_FOR_GACHA
    eventBus.emit('piece:changed', { current: this.pieces, max: PIECES_FOR_GACHA })

    // 누적 확률로 결과 결정
    const rand = Math.random() * 100
    let result: GachaResult

    if (rand < 66.45) {
      // 66.45%: 도구 1개 (로켓 or 폭탄 랜덤)
      const tool = Math.random() < 0.5 ? 'ROCKET' : 'BOMB'
      result = { type: 'tool1', tools: [tool] }
    } else if (rand < 96.45) {
      // 30%: 도구 3개
      result = { type: 'tool3', tools: ['ROCKET', 'BOMB', 'RAINBOW'] }
    } else if (rand < 99.45) {
      // 3%: 1000원 쿠폰
      result = { type: 'coupon1000', couponValue: 1000 }
    } else if (rand < 99.95) {
      // 0.5%: 2000원 쿠폰
      result = { type: 'coupon2000', couponValue: 2000 }
    } else {
      // 0.05%: 치킨
      result = { type: 'chicken' }
    }

    // 도구는 실제로 추가
    if (result.tools && this.toolManager) {
      const toolTypeMap: Record<string, ToolType> = {
        ROCKET: ToolType.ROCKET,
        BOMB: ToolType.BOMB,
        RAINBOW: ToolType.RAINBOW,
      }
      result.tools.forEach(tool => {
        const tt = toolTypeMap[tool]
        if (tt) this.toolManager!.addTool(tt, 1)
      })
    }

    return result
  }

  loadState(pieces: number): void {
    this.pieces = pieces
    eventBus.emit('piece:changed', { current: this.pieces, max: PIECES_FOR_GACHA })
  }
}
