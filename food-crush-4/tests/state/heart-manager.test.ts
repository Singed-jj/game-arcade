import { describe, it, expect, beforeEach } from 'vitest'
import { HeartManager } from '@/state/heart-manager'
import { MAX_HEARTS } from '@/core/types'

describe('HeartManager', () => {
  let mgr: HeartManager
  beforeEach(() => { mgr = new HeartManager() })

  it('초기 하트는 MAX_HEARTS (3개)', () => {
    expect(mgr.getHearts()).toBe(MAX_HEARTS)
  })

  it('하트를 1개 소모한다', () => {
    mgr.useHeart()
    expect(mgr.getHearts()).toBe(2)
  })

  it('하트가 0이면 소모할 수 없다', () => {
    mgr.useHeart(); mgr.useHeart(); mgr.useHeart()
    expect(mgr.useHeart()).toBe(false)
    expect(mgr.getHearts()).toBe(0)
  })

  it('하트를 최대까지 회복한다', () => {
    mgr.useHeart(); mgr.useHeart()
    mgr.refillAll()
    expect(mgr.getHearts()).toBe(MAX_HEARTS)
  })
})
