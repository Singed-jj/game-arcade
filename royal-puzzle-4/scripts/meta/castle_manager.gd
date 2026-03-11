class_name CastleManager
extends RefCounted

const AREA_1_TASKS := [
	{"id": "fountain", "name": "분수대 수리", "stars": 1, "description": "마른 분수 → 물 나오는 분수"},
	{"id": "lawn", "name": "정원 잔디 심기", "stars": 2, "description": "황무지 → 초록 잔디"},
	{"id": "flowers", "name": "꽃밭 조성", "stars": 2, "description": "빈 화단 → 꽃이 핀 화단"},
	{"id": "bench", "name": "벤치 배치", "stars": 1, "description": "빈 공간 → 벤치"},
	{"id": "lamp", "name": "가로등 설치", "stars": 2, "description": "어두운 길 → 밝은 가로등"},
	{"id": "gate", "name": "정문 장식", "stars": 3, "description": "낡은 문 → 화려한 정문"},
]

static func get_tasks() -> Array:
	return AREA_1_TASKS

static func get_next_task() -> Dictionary:
	var completed := SaveManager.get_completed_tasks()
	for task in AREA_1_TASKS:
		if task["id"] not in completed:
			return task
	return {}

static func can_complete_task(task_id: String) -> bool:
	var task := _find_task(task_id)
	if task.is_empty():
		return false
	return SaveManager.get_stars() >= task["stars"]

static func complete_task(task_id: String) -> bool:
	var task := _find_task(task_id)
	if task.is_empty():
		return false
	if not SaveManager.spend_stars(task["stars"]):
		return false
	SaveManager.complete_task(task_id)
	GameEvents.castle_task_completed.emit(task_id)
	if is_area_complete():
		CoinManager.reward_area_complete()
		GameEvents.castle_area_completed.emit("area_1")
	return true

static func is_area_complete() -> bool:
	var completed := SaveManager.get_completed_tasks()
	for task in AREA_1_TASKS:
		if task["id"] not in completed:
			return false
	return true

static func get_progress() -> Dictionary:
	var completed := SaveManager.get_completed_tasks()
	var total := AREA_1_TASKS.size()
	var done := 0
	for task in AREA_1_TASKS:
		if task["id"] in completed:
			done += 1
	return {"completed": done, "total": total}

static func _find_task(task_id: String) -> Dictionary:
	for task in AREA_1_TASKS:
		if task["id"] == task_id:
			return task
	return {}
