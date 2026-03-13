import { type LevelConfig, BlockType } from './types'

/** 레벨 1~10 수동 설계
 * 난이도 곡선: 몰입(1~3) → 첫 실패 유도(4) → 도구 유도(5) → 숨돌리기(6) → 어려움(7) → 숨돌리기(8) → 어려움(9) → 보스(10)
 * 레벨 8, 10은 3종류 목표, 나머지는 2종류
 */
const HAND_CRAFTED: LevelConfig[] = [
  // 1~3: 튜토리얼 & 몰입 단계
  { level: 1,  moves: 25, objectives: [{ blockType: BlockType.CHICKEN, count: 12 }, { blockType: BlockType.COLA, count: 12 }] },
  { level: 2,  moves: 23, objectives: [{ blockType: BlockType.FRIES, count: 13 }, { blockType: BlockType.BURGER, count: 13 }] },
  { level: 3,  moves: 20, objectives: [{ blockType: BlockType.CHICKEN, count: 14 }, { blockType: BlockType.PIZZA, count: 14 }] },
  // 4: 첫 실패 유도
  { level: 4,  moves: 18, objectives: [{ blockType: BlockType.COLA, count: 15 }, { blockType: BlockType.FRIES, count: 15 }] },
  // 5: 첫 도구 유도 (클리어율 45%) — 2종류 목표
  { level: 5,  moves: 17, objectives: [{ blockType: BlockType.CHICKEN, count: 15 }, { blockType: BlockType.COLA, count: 15 }] },
  // 6: 숨돌리기
  { level: 6,  moves: 16, objectives: [{ blockType: BlockType.FRIES, count: 14 }, { blockType: BlockType.PIZZA, count: 14 }] },
  // 7: 어려움
  { level: 7,  moves: 13, objectives: [{ blockType: BlockType.COLA, count: 16 }, { blockType: BlockType.BURGER, count: 16 }] },
  // 8: 숨돌리기 (3종류)
  { level: 8,  moves: 15, objectives: [{ blockType: BlockType.CHICKEN, count: 12 }, { blockType: BlockType.PIZZA, count: 12 }, { blockType: BlockType.FRIES, count: 12 }] },
  // 9: 어려움
  { level: 9,  moves: 12, objectives: [{ blockType: BlockType.BURGER, count: 18 }, { blockType: BlockType.FRIES, count: 18 }] },
  // 10: 보스 레벨 (3종류)
  { level: 10, moves: 10, objectives: [{ blockType: BlockType.CHICKEN, count: 12 }, { blockType: BlockType.COLA, count: 12 }, { blockType: BlockType.FRIES, count: 12 }] },
]

/** 시드 기반 의사 난수 (레벨 번호로 결정적) */
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

/** 레벨 11+ 자동 생성 */
function generateLevel(level: number): LevelConfig {
  const cycle = Math.floor((level - 11) / 4)
  const pos = (level - 11) % 4

  const rng = seededRandom(level * 7919)

  const pickTypes = (count: number): BlockType[] => {
    const all = [0, 1, 2, 3, 4] as BlockType[]
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[all[i], all[j]] = [all[j], all[i]]
    }
    return all.slice(0, count)
  }

  let moves: number
  let types: BlockType[]
  let perType: number

  switch (pos) {
    case 0: // 숨돌리기
      moves = Math.max(10, 14 - cycle)
      types = pickTypes(2)
      perType = 14 + cycle
      break
    case 1: // 어려움
      moves = Math.max(9, 11 - cycle)
      types = pickTypes(2)
      perType = 13 + cycle
      break
    case 2: // 숨돌리기
      moves = Math.max(10, 14 - cycle)
      types = pickTypes(2)
      perType = 15 + cycle
      break
    case 3: // 보스
      moves = 10
      types = pickTypes(3)
      perType = 10 + cycle
      break
    default:
      moves = 12
      types = pickTypes(2)
      perType = 14
  }

  return {
    level,
    moves,
    objectives: types.map(blockType => ({ blockType, count: perType })),
  }
}

/** 레벨 설정을 가져온다 */
export function getLevelConfig(level: number): LevelConfig {
  if (level >= 1 && level <= 10) {
    return HAND_CRAFTED[level - 1]
  }
  return generateLevel(level)
}
