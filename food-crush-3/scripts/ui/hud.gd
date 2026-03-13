# scripts/ui/hud.gd
extends HBoxContainer
class_name HUD

var _moves_label: Label
var _goal_container: HBoxContainer

func _ready() -> void:
	_build_ui()
	EventBus.on("game:move-used", _on_move_used)
	EventBus.on("game:goal-progress", _on_goal_progress)
	EventBus.on("game:level-start", _on_level_start)

func _build_ui() -> void:
	var moves_vbox := VBoxContainer.new()
	var moves_title := Label.new()
	moves_title.text = "MOVES"
	moves_title.add_theme_font_size_override("font_size", 12)
	_moves_label = Label.new()
	_moves_label.text = "0"
	_moves_label.add_theme_font_size_override("font_size", 28)
	_moves_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	moves_vbox.add_child(moves_title)
	moves_vbox.add_child(_moves_label)
	add_child(moves_vbox)

	_goal_container = HBoxContainer.new()
	_goal_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	add_child(_goal_container)

func _on_level_start(data: Dictionary) -> void:
	var config: Dictionary = data["config"]
	_moves_label.text = str(config["moves"])
	for child in _goal_container.get_children():
		child.queue_free()
	for obj in config["objectives"]:
		var vbox := VBoxContainer.new()
		vbox.alignment = BoxContainer.ALIGNMENT_CENTER
		var icon := TextureRect.new()
		icon.texture = _load_block_texture(obj["block_type"])
		icon.custom_minimum_size = Vector2(36, 36)
		icon.expand_mode = TextureRect.EXPAND_FIT_WIDTH_PROPORTIONAL
		icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		var label := Label.new()
		label.text = "0/%d" % obj["count"]
		label.name = "goal_%d" % obj["block_type"]
		label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		label.add_theme_font_size_override("font_size", 14)
		vbox.add_child(icon)
		vbox.add_child(label)
		_goal_container.add_child(vbox)

func _load_block_texture(bt: int) -> Texture2D:
	match bt:
		0: return load("res://assets/blocks/chicken.png")
		1: return load("res://assets/blocks/cola.png")
		2: return load("res://assets/blocks/fries.png")
		3: return load("res://assets/blocks/burger.png")
		4: return load("res://assets/blocks/pizza.png")
		_: return null

func _on_move_used(data: Dictionary) -> void:
	if _moves_label:
		_moves_label.text = str(data["remaining"])

func _on_goal_progress(data: Dictionary) -> void:
	if not _goal_container:
		return
	var lbl := _goal_container.find_child("goal_%d" % data["block_type"], true, false)
	if lbl:
		lbl.text = "%d/%d" % [data["current"], data["target"]]

func _exit_tree() -> void:
	EventBus.off("game:move-used", _on_move_used)
	EventBus.off("game:goal-progress", _on_goal_progress)
	EventBus.off("game:level-start", _on_level_start)
