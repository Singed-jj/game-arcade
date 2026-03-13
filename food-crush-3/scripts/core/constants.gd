# scripts/core/constants.gd
class_name C

## 블록 타입
enum BlockType { CHICKEN = 0, COLA = 1, FRIES = 2, BURGER = 3, PIZZA = 4 }

## 도구 타입
enum ToolType { ROCKET = 0, BOMB = 1, RAINBOW = 2 }

## 매치 패턴
enum MatchPattern {
	HORIZONTAL, VERTICAL,
	HORIZONTAL_4, VERTICAL_4,
	HORIZONTAL_5, VERTICAL_5,
	L_SHAPE, T_SHAPE, CROSS,
}

## 보드 상수
const BOARD_COLS := 7
const BOARD_ROWS := 7
const BLOCK_TYPES_COUNT := 5
const MATCH_MIN := 3
const CELL_SIZE := 48  # pixels

## 하트 시스템
const MAX_HEARTS := 3
const HEART_RECOVERY_SEC := 20.0 * 60.0  # 20분

## 뽑기
const PIECES_FOR_GACHA := 5
const PIECES_ON_CLEAR := 1

## 별 기준 (남은 이동 수)
const STAR_3_THRESHOLD := 4
const STAR_2_THRESHOLD := 1

## 빈 셀
const EMPTY := -1

## 블록 색상 (파티클용)
const BLOCK_COLORS := {
	BlockType.CHICKEN: Color(0.98, 0.57, 0.24),
	BlockType.COLA:    Color(0.97, 0.44, 0.44),
	BlockType.FRIES:   Color(0.98, 0.75, 0.14),
	BlockType.BURGER:  Color(0.63, 0.38, 0.04),
	BlockType.PIZZA:   Color(0.30, 0.87, 0.50),
}

## 블록 이미지 경로
const BLOCK_IMAGES := {
	BlockType.CHICKEN: "res://assets/blocks/chicken.png",
	BlockType.COLA:    "res://assets/blocks/cola.png",
	BlockType.FRIES:   "res://assets/blocks/fries.png",
	BlockType.BURGER:  "res://assets/blocks/burger.png",
	BlockType.PIZZA:   "res://assets/blocks/pizza.png",
}

## 캐스케이드 연출
const CASCADE_CONFIG := [
	{},  # x0 placeholder
	{},  # x1 기본
	{"text": "Good!",         "font_size": 24, "shake": 2},
	{"text": "Great!!",       "font_size": 32, "shake": 4},
	{"text": "Amazing!!!",    "font_size": 40, "shake": 6},
	{"text": "INCREDIBLE!!!", "font_size": 48, "shake": 8},
]
