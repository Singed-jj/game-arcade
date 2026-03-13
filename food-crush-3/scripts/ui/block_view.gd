# scripts/ui/block_view.gd
extends Control
class_name BlockView

@onready var texture_rect: TextureRect = $TextureRect

var block_type := -1
var col := 0
var row := 0
var is_selected := false

func setup(bt: int, c: int, r: int) -> void:
	block_type = bt
	col = c
	row = r
	if texture_rect:
		texture_rect.texture = load(_get_image_path(bt))

func _get_image_path(bt: int) -> String:
	match bt:
		0: return "res://assets/blocks/chicken.png"
		1: return "res://assets/blocks/cola.png"
		2: return "res://assets/blocks/fries.png"
		3: return "res://assets/blocks/burger.png"
		4: return "res://assets/blocks/pizza.png"
		_: return ""

func set_selected(selected: bool) -> void:
	is_selected = selected
	modulate = Color(1.3, 1.3, 1.3) if selected else Color.WHITE

func pop_animation() -> void:
	var tween := create_tween()
	tween.tween_property(self, "scale", Vector2(1.3, 1.3), 0.08)
	tween.tween_property(self, "scale", Vector2.ONE, 0.08)

func highlight_hint() -> void:
	var tween := create_tween()
	tween.set_loops(3)
	tween.tween_property(self, "modulate", Color(1.5, 1.5, 0.5), 0.2)
	tween.tween_property(self, "modulate", Color.WHITE, 0.2)
