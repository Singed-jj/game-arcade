# scripts/autoload/piece_manager.gd
extends Node

const PIECES_FOR_GACHA := 5

const GACHA_TABLE := [
	{"type": "tool1",     "weight": 35},
	{"type": "chicken",   "weight": 30},
	{"type": "tool3",     "weight": 15},
	{"type": "coupon1000","weight": 12},
	{"type": "coupon2000","weight": 8},
]

var _pieces := 0

func _ready() -> void:
	_pieces = SaveManager.get_pieces()

func get_pieces() -> int:
	return _pieces

func add_pieces(count: int) -> void:
	_pieces += count
	SaveManager.set_pieces(_pieces)
	EventBus.emit_event("piece:changed", {"count": _pieces})

func use_for_gacha() -> Variant:
	if _pieces < PIECES_FOR_GACHA:
		return null
	_pieces -= PIECES_FOR_GACHA
	SaveManager.set_pieces(_pieces)
	EventBus.emit_event("piece:changed", {"count": _pieces})
	return _roll()

func _roll() -> Dictionary:
	var total := 0
	for entry in GACHA_TABLE:
		total += entry["weight"]
	var rnd := randi() % total
	var acc := 0
	for entry in GACHA_TABLE:
		acc += entry["weight"]
		if rnd < acc:
			return _build_result(entry["type"])
	return _build_result("chicken")

func _build_result(type_str: String) -> Dictionary:
	match type_str:
		"tool1":
			var tool := "ROCKET" if randf() < 0.5 else "BOMB"
			return {"type": "tool1", "tools": [tool]}
		"tool3":
			return {"type": "tool3", "tools": ["ROCKET", "BOMB", "RAINBOW"]}
		"coupon1000":
			return {"type": "coupon1000", "coupon_value": 1000}
		"coupon2000":
			return {"type": "coupon2000", "coupon_value": 2000}
		_:
			return {"type": "chicken"}
