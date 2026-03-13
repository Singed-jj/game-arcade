# scripts/autoload/game_state.gd
extends Node

const STAR_3_THRESHOLD := 4
const STAR_2_THRESHOLD := 1

var _level := 0
var _remaining_moves := 0
var _score := 0
var _goals: Dictionary = {}
var _active := false

func start_level(config: Dictionary) -> void:
	_level = config["level"]
	_remaining_moves = config["moves"]
	_score = 0
	_goals.clear()
	_active = true
	for obj in config["objectives"]:
		_goals[obj["block_type"]] = {"current": 0, "target": obj["count"]}
	EventBus.emit_event("game:level-start", {"config": config})

func use_move() -> void:
	if _remaining_moves > 0:
		_remaining_moves -= 1
		EventBus.emit_event("game:move-used", {"remaining": _remaining_moves})

func add_goal_progress(block_type: int, count: int) -> void:
	if not _goals.has(block_type):
		return
	var goal := _goals[block_type]
	goal["current"] = min(goal["target"], goal["current"] + count)
	EventBus.emit_event("game:goal-progress", {
		"block_type": block_type,
		"current": goal["current"],
		"target": goal["target"]
	})

func add_score(delta: int) -> void:
	_score += delta
	EventBus.emit_event("game:score-changed", {"score": _score, "delta": delta})

func are_all_goals_met() -> bool:
	for bt in _goals:
		if _goals[bt]["current"] < _goals[bt]["target"]:
			return false
	return not _goals.is_empty()

func get_stars() -> int:
	if _remaining_moves >= STAR_3_THRESHOLD:
		return 3
	if _remaining_moves >= STAR_2_THRESHOLD:
		return 2
	return 1

func get_level() -> int:
	return _level

func get_remaining_moves() -> int:
	return _remaining_moves

func get_score() -> int:
	return _score

func get_goals() -> Dictionary:
	return _goals

func is_active() -> bool:
	return _active

func deactivate() -> void:
	_active = false
