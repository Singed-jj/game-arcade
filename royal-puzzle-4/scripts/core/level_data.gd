class_name LevelData
extends Resource

@export var level_number: int = 1
@export var board_width: int = 8
@export var board_height: int = 8
@export var board_mask: Array[PackedByteArray] = []
@export var moves: int = 25
@export var targets: Array[Dictionary] = []
@export var obstacles: Array[Dictionary] = []
@export var tile_types: int = 5
@export var nightmare_after: bool = false

func is_cell_active(x: int, y: int) -> bool:
	if board_mask.is_empty():
		return true
	if y < 0 or y >= board_mask.size():
		return false
	if x < 0 or x >= board_mask[y].size():
		return false
	return board_mask[y][x] == 1

func get_target_dict() -> Dictionary:
	var result := {}
	for t in targets:
		result[t["type"]] = t["count"]
	return result
