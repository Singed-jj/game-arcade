import { describe, it, expect } from 'vitest'
import { getLevelConfig } from '@/core/level-data'

describe('getLevelConfig', () => {
  it('레벨 1: 이동 25, 목표 2종', () => {
    const config = getLevelConfig(1)
    expect(config.moves).toBe(25)
    expect(config.objectives).toHaveLength(2)
  })

  it('레벨 10: 이동 10, 목표 3종 (보스)', () => {
    const config = getLevelConfig(10)
    expect(config.moves).toBe(10)
    expect(config.objectives).toHaveLength(3)
  })

  it('레벨 11+: 자동 생성 (톱니 패턴)', () => {
    const lv11 = getLevelConfig(11)
    expect(lv11.moves).toBe(14)
    expect(lv11.objectives).toHaveLength(2)

    const lv14 = getLevelConfig(14) // 보스
    expect(lv14.moves).toBe(10)
    expect(lv14.objectives).toHaveLength(3)
  })

  it('레벨 번호가 같으면 같은 결과', () => {
    const a = getLevelConfig(25)
    const b = getLevelConfig(25)
    expect(a.moves).toBe(b.moves)
    expect(a.objectives.length).toBe(b.objectives.length)
  })
})
