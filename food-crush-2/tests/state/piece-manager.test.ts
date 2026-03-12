import { describe, it, expect, beforeEach } from 'vitest'
import { PieceManager } from '@/state/piece-manager'
import { PIECES_FOR_GACHA } from '@/core/types'

describe('PieceManager', () => {
  let mgr: PieceManager
  beforeEach(() => { mgr = new PieceManager() })

  it('초기 조각은 0개', () => {
    expect(mgr.getPieces()).toBe(0)
  })

  it('조각을 추가한다', () => {
    mgr.addPieces(1)
    expect(mgr.getPieces()).toBe(1)
  })

  it('5개가 되면 뽑기 가능', () => {
    mgr.addPieces(5)
    expect(mgr.canGacha()).toBe(true)
  })

  it('뽑기를 하면 5개가 차감된다', () => {
    mgr.addPieces(5)
    mgr.useForGacha()
    expect(mgr.getPieces()).toBe(0)
  })
})
