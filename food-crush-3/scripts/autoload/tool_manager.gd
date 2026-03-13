# scripts/autoload/tool_manager.gd
extends Node

var _counts: Dictionary = {"rocket": 0, "bomb": 0, "rainbow": 0}

func _ready() -> void:
	_counts = SaveManager.get_tools()

func _tool_key(type: int) -> String:
	match type:
		0: return "rocket"   # ROCKET
		1: return "bomb"     # BOMB
		2: return "rainbow"  # RAINBOW
		_: return ""

func get_count(type: int) -> int:
	return int(_counts.get(_tool_key(type), 0))

func add_tool(type: int, count := 1) -> void:
	var key := _tool_key(type)
	_counts[key] = int(_counts.get(key, 0)) + count
	SaveManager.set_tools(_counts)
	EventBus.emit_event("tool:count-changed", {"type": type, "count": get_count(type)})

func use_tool(type: int) -> bool:
	if get_count(type) <= 0:
		return false
	var key := _tool_key(type)
	_counts[key] = int(_counts[key]) - 1
	SaveManager.set_tools(_counts)
	EventBus.emit_event("tool:count-changed", {"type": type, "count": get_count(type)})
	return true
