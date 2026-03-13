// src/core/types.ts

/** 블록 종류 (5종) */
export enum BlockType {
  CHICKEN = 0,
  COLA = 1,
  FRIES = 2,
  BURGER = 3,
  PIZZA = 4,
}

/** 도구 종류 */
export enum ToolType {
  ROCKET = 'rocket',
  BOMB = 'bomb',
  RAINBOW = 'rainbow',
}

/** 매치 패턴 */
export enum MatchPattern {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  HORIZONTAL_4 = 'horizontal_4',
  VERTICAL_4 = 'vertical_4',
  HORIZONTAL_5 = 'horizontal_5',
  VERTICAL_5 = 'vertical_5',
  L_SHAPE = 'l_shape',
  T_SHAPE = 't_shape',
  CROSS = 'cross',
}

/** 보드 상수 */
export const BOARD_COLS = 7
export const BOARD_ROWS = 7
export const BLOCK_TYPES_COUNT = 5
export const MATCH_MIN = 3
export const CELL_SIZE = 48 // px (7*48=336px, 모바일 375px 화면에 여유 있게)

/** 하트 시스템 */
export const MAX_HEARTS = 3
export const HEART_RECOVERY_MS = 20 * 60 * 1000 // 20분

/** 뽑기 조각 */
export const PIECES_FOR_GACHA = 5
export const PIECES_ON_CLEAR = 1

/** 별 기준 (남은 이동 수) */
export const STAR_3_THRESHOLD = 4
export const STAR_2_THRESHOLD = 1

/** 블록 색상 (파티클/canvas용 - 단색) */
export const BLOCK_COLORS: Record<BlockType, string> = {
  [BlockType.CHICKEN]: '#fb923c',  // orange
  [BlockType.COLA]:    '#f87171',  // red
  [BlockType.FRIES]:   '#fbbf24',  // yellow
  [BlockType.BURGER]:  '#a16207',  // brown
  [BlockType.PIZZA]:   '#4ade80',  // green
}

/** 블록 배경 그라디언트 (CSS용) */
export const BLOCK_GRADIENTS: Record<BlockType, string> = {
  [BlockType.CHICKEN]: 'linear-gradient(145deg, #fb923c, #ea580c)',
  [BlockType.COLA]:    'linear-gradient(145deg, #f87171, #dc2626)',
  [BlockType.FRIES]:   'linear-gradient(145deg, #fbbf24, #d97706)',
  [BlockType.BURGER]:  'linear-gradient(145deg, #b45309, #713f12)',
  [BlockType.PIZZA]:   'linear-gradient(145deg, #4ade80, #16a34a)',
}

/** 블록 이미지 경로 */
export const BLOCK_IMAGES: Record<BlockType, string> = {
  [BlockType.CHICKEN]: '/assets/blocks/chicken.png',
  [BlockType.COLA]: '/assets/blocks/cola.png',
  [BlockType.FRIES]: '/assets/blocks/fries.png',
  [BlockType.BURGER]: '/assets/blocks/burger.png',
  [BlockType.PIZZA]: '/assets/blocks/pizza.png',
}

/** 블록 이모지 (디버그/폴백) */
export const BLOCK_EMOJI: Record<BlockType, string> = {
  [BlockType.CHICKEN]: '🍗',
  [BlockType.COLA]: '🥤',
  [BlockType.FRIES]: '🍟',
  [BlockType.BURGER]: '🍔',
  [BlockType.PIZZA]: '🍕',
}

/** 블록 이모지 (렌더링용) */
export const BLOCK_EMOJIS: Record<BlockType, string> = {
  [BlockType.CHICKEN]: '🍗',
  [BlockType.COLA]: '🥤',
  [BlockType.FRIES]: '🍟',
  [BlockType.BURGER]: '🍔',
  [BlockType.PIZZA]: '🍕',
}

/** 캐스케이드 연출 설정 */
export const CASCADE_CONFIG = [
  { text: '', fontSize: 0, color: '', shakeIntensity: 0 },           // x0 placeholder
  { text: '', fontSize: 0, color: '', shakeIntensity: 0 },           // x1 기본
  { text: 'Good!', fontSize: 24, color: '#FFFFFF', shakeIntensity: 2 },
  { text: 'Great!!', fontSize: 32, color: '#FFD600', shakeIntensity: 4 },
  { text: 'Amazing!!!', fontSize: 40, color: '#FF9A3C', shakeIntensity: 6 },
  { text: 'INCREDIBLE!!!!', fontSize: 48, color: 'rainbow', shakeIntensity: 8 },
]

/** 좌표 타입 */
export interface Position {
  col: number
  row: number
}

/** 매치 결과 */
export interface MatchResult {
  cells: Position[]
  pattern: MatchPattern
  blockType: BlockType
}

/** 낙하 이동 */
export interface FallMove {
  from: Position
  to: Position
  blockType: BlockType
}

/** 레벨 목표 */
export interface LevelObjective {
  blockType: BlockType
  count: number
}

/** 레벨 설정 */
export interface LevelConfig {
  level: number
  moves: number
  objectives: LevelObjective[]
}

/** 보드 그리드 타입 (col-major: grid[col][row]) */
export type BoardGrid = (BlockType | -1)[][]

/** 뽑기 결과 타입 */
export type GachaResultType = 'tool1' | 'tool3' | 'coupon1000' | 'coupon2000' | 'chicken'

/** 뽑기 결과 */
export interface GachaResult {
  type: GachaResultType
  tools?: string[]      // tool1: ['ROCKET'] 또는 ['BOMB'], tool3: ['ROCKET','BOMB','RAINBOW']
  couponValue?: number  // 1000 또는 2000
}

/** 빈 셀 */
export const EMPTY = -1 as const
