class_name Tile
extends RefCounted

enum Type { RED, BLUE, GREEN, YELLOW, PINK }
enum SpecialType { NONE, ROCKET_H, ROCKET_V, TNT, LIGHT_BALL, MISSILE }

const COLORS := {
	Type.RED: Color("#d32f2f"),
	Type.BLUE: Color("#1976d2"),
	Type.GREEN: Color("#388e3c"),
	Type.YELLOW: Color("#ffc107"),
	Type.PINK: Color("#e91e63"),
}

const TYPE_NAMES := {
	Type.RED: "red",
	Type.BLUE: "blue",
	Type.GREEN: "green",
	Type.YELLOW: "yellow",
	Type.PINK: "pink",
}

var type: Type
var special: SpecialType = SpecialType.NONE
var grid_pos: Vector2i
var is_moving := false
var is_matched := false

func _init(p_type: Type, p_pos: Vector2i) -> void:
	type = p_type
	grid_pos = p_pos

func is_special() -> bool:
	return special != SpecialType.NONE

func is_rocket() -> bool:
	return special == SpecialType.ROCKET_H or special == SpecialType.ROCKET_V

static func random_type(num_types: int = 5) -> Type:
	return randi() % num_types as Type
