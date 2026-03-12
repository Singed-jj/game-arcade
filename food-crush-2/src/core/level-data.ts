import { type LevelConfig, BlockType } from './types'

/** 레벨 1~10 수동 설계 (food-crush-level.html 기준) */
const HAND_CRAFTED: LevelConfig[] = [
  { level: 1,  moves: 25, objectives: [{ blockType: BlockType.CHICKEN, count: 16 }, { blockType: BlockType.COLA, count: 16 }] },
  { level: 2,  moves: 22, objectives: [{ blockType: BlockType.FRIES, count: 18 }, { blockType: BlockType.BURGER, count: 18 }] },
  { level: 3,  moves: 20, objectives: [{ blockType: BlockType.CHICKEN, count: 18 }, { blockType: BlockType.PIZZA, count: 18 }] },
  { level: 4,  moves: 18, objectives: [{ blockType: BlockType.COLA, count: 18 }, { blockType: BlockType.FRIES, count: 18 }] },
  { level: 5,  moves: 17, objectives: [{ blockType: BlockType.CHICKEN, count: 18 }, { blockType: BlockType.COLA, count: 18 }] },
  { level: 6,  moves: 16, objectives: [{ blockType: BlockType.FRIES, count: 15 }, { blockType: BlockType.PIZZA, count: 15 }] },
  { level: 7,  moves: 13, objectives: [{ blockType: BlockType.COLA, count: 14 }, { blockType: BlockType.BURGER, count: 14 }] },
  { level: 8,  moves: 15, objectives: [{ blockType: BlockType.CHICKEN, count: 15 }, { blockType: BlockType.PIZZA, count: 15 }] },
  { level: 9,  moves: 12, objectives: [{ blockType: BlockType.BURGER, count: 14 }, { blockType: BlockType.FRIES, count: 14 }] },
  { level: 10, moves: 10, objectives: [{ blockType: BlockType.CHICKEN, count: 10 }, { blockType: BlockType.COLA, count: 10 }, { blockType: BlockType.FRIES, count: 10 }] },
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
