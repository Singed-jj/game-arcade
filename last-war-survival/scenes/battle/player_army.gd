extends Node2D

## Manages the player's army formation
## Spawns soldiers and keeps them in a grid formation

const SOLDIER_SCENE_PATH := "res://scenes/battle/soldier.tscn"
const FORMATION_SPACING: float = 28.0
const FORMATION_COLS: int = 5
const ARMY_Y_POSITION: float = 650.0

var _soldier_scene: PackedScene
var _soldiers: Array[CharacterBody2D] = []

func _ready() -> void:
	add_to_group("player_army")
	_soldier_scene = load(SOLDIER_SCENE_PATH) as PackedScene
	EventBus.soldier_lost.connect(_on_soldier_lost)

func spawn_army() -> void:
	var count: int = GameManager.get_starting_army_size()
	for i in range(count):
		_spawn_soldier(i)
	EventBus.soldier_recruited.emit(count)

func _spawn_soldier(index: int) -> void:
	var soldier: CharacterBody2D = _soldier_scene.instantiate()
	var col: int = index % FORMATION_COLS
	var row: int = index / FORMATION_COLS
	var cols_in_row: int = mini(FORMATION_COLS, _get_remaining_count(row))

	var offset_x: float = (col - (cols_in_row - 1) / 2.0) * FORMATION_SPACING
	var offset_y: float = row * FORMATION_SPACING

	soldier.position = Vector2(195.0 + offset_x, ARMY_Y_POSITION + offset_y)
	add_child(soldier)
	_soldiers.append(soldier)

func _get_remaining_count(row: int) -> int:
	var total: int = GameManager.get_starting_army_size()
	var before: int = row * FORMATION_COLS
	return mini(FORMATION_COLS, total - before)

func add_soldiers(count: int) -> void:
	var start_index: int = _soldiers.size()
	for i in range(count):
		_spawn_soldier(start_index + i)
	EventBus.soldier_recruited.emit(count)

func get_soldier_count() -> int:
	_soldiers = _soldiers.filter(func(s: CharacterBody2D) -> bool: return is_instance_valid(s))
	return _soldiers.size()

func get_army_center() -> Vector2:
	if _soldiers.is_empty():
		return Vector2(195.0, ARMY_Y_POSITION)
	var sum := Vector2.ZERO
	var valid_count: int = 0
	for s in _soldiers:
		if is_instance_valid(s):
			sum += s.global_position
			valid_count += 1
	if valid_count == 0:
		return Vector2(195.0, ARMY_Y_POSITION)
	return sum / valid_count

func _on_soldier_lost(_count: int) -> void:
	_soldiers = _soldiers.filter(func(s: CharacterBody2D) -> bool: return is_instance_valid(s))
	if _soldiers.is_empty():
		EventBus.army_destroyed.emit()
