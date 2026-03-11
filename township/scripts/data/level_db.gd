class_name LevelDB

static var LEVELS: Dictionary = {
	1: {"xp_required": 0, "description": "시작"},
	2: {"xp_required": 50, "description": "제빵 공장 해금"},
	3: {"xp_required": 120, "description": "옥수수 농장 해금"},
	4: {"xp_required": 200, "description": "통조림 공장 해금"},
	5: {"xp_required": 300, "description": "당근 농장 해금"},
	6: {"xp_required": 420, "description": "주스 공장 해금"},
	7: {"xp_required": 560, "description": "창고 확장 할인"},
	8: {"xp_required": 720, "description": "농장 추가 배치"},
	9: {"xp_required": 900, "description": "공장 슬롯 +1"},
	10: {"xp_required": 1100, "description": "MVP 완료!"},
}

static var MAX_LEVEL := 10

static func get_xp_for_level(level: int) -> int:
	if LEVELS.has(level):
		return LEVELS[level]["xp_required"]
	return 99999

static func get_level_for_xp(total_xp: int) -> int:
	var result := 1
	for lvl in range(1, MAX_LEVEL + 1):
		if total_xp >= LEVELS[lvl]["xp_required"]:
			result = lvl
		else:
			break
	return result
