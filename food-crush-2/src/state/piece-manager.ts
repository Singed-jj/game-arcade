import { PIECES_FOR_GACHA } from '@/core/types'
import { eventBus } from './event-bus'

export class PieceManager {
  private pieces = 0

  getPieces(): number { return this.pieces }

  addPieces(count: number): void {
    this.pieces += count
    eventBus.emit('piece:changed', { current: this.pieces, max: PIECES_FOR_GACHA })
    if (this.pieces >= PIECES_FOR_GACHA) {
      eventBus.emit('piece:gacha-ready')
    }
  }

  canGacha(): boolean { return this.pieces >= PIECES_FOR_GACHA }

  useForGacha(): boolean {
    if (!this.canGacha()) return false
    this.pieces -= PIECES_FOR_GACHA
    eventBus.emit('piece:changed', { current: this.pieces, max: PIECES_FOR_GACHA })
    return true
  }

  loadState(pieces: number): void {
    this.pieces = pieces
    eventBus.emit('piece:changed', { current: this.pieces, max: PIECES_FOR_GACHA })
  }
}
