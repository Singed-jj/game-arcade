class_name NightmareManager
extends RefCounted

const SCENARIOS := [
	{"id": "fire", "name": "주방 화재", "target_type": "red", "target_count": 30, "time": 60, "reward": 50, "after_level": 5},
	{"id": "dragon", "name": "드래곤 출현", "target_type": "blue", "target_count": 35, "time": 45, "reward": 60, "after_level": 10},
	{"id": "flood", "name": "홍수", "target_type": "green", "target_count": 40, "time": 40, "reward": 70, "after_level": 15},
	{"id": "ghost", "name": "유령 성", "target_type": "yellow", "target_count": 40, "time": 35, "reward": 80, "after_level": 20},
	{"id": "prison", "name": "감옥 탈출", "target_type": "pink", "target_count": 45, "time": 30, "reward": 90, "after_level": 25},
	{"id": "boss", "name": "드래곤 보스", "target_type": "red", "target_count": 50, "time": 30, "reward": 100, "after_level": 30},
]

static func should_trigger(level_just_cleared: int) -> bool:
	for s in SCENARIOS:
		if s["after_level"] == level_just_cleared:
			if s["id"] not in SaveManager.get_completed_nightmares():
				return true
	return false

static func get_scenario_for_level(level: int) -> Dictionary:
	for s in SCENARIOS:
		if s["after_level"] == level:
			return s
	return {}

static func get_all_scenarios() -> Array:
	return SCENARIOS
