# scripts/ui/tool_bar.gd
extends HBoxContainer
class_name ToolBar

signal tool_selected(tool_type: int)

# ToolType: ROCKET=0, BOMB=1, RAINBOW=2
var _buttons: Array = []
var _active_tool := -1

func _ready() -> void:
	_build_ui()
	EventBus.on("tool:count-changed", _on_count_changed)

func _build_ui() -> void:
	for tool_type in [0, 1, 2]:
		var vbox := VBoxContainer.new()
		vbox.alignment = BoxContainer.ALIGNMENT_CENTER
		var btn := Button.new()
		btn.custom_minimum_size = Vector2(56, 56)
		match tool_type:
			0: btn.text = "🚀"
			1: btn.text = "💣"
			2: btn.text = "🌈"
		btn.pressed.connect(_on_tool_pressed.bind(tool_type))
		var count_lbl := Label.new()
		count_lbl.text = "x%d" % ToolManager.get_count(tool_type)
		count_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		count_lbl.add_theme_font_size_override("font_size", 13)
		count_lbl.name = "count_%d" % tool_type
		vbox.add_child(btn)
		vbox.add_child(count_lbl)
		add_child(vbox)
		_buttons.append(btn)

func _on_tool_pressed(type: int) -> void:
	if _active_tool == type:
		_active_tool = -1
	else:
		_active_tool = type
		for i in range(_buttons.size()):
			_buttons[i].modulate = Color(1.4, 1.4, 0.5) if i == type else Color.WHITE
	if _active_tool == -1:
		for btn in _buttons:
			btn.modulate = Color.WHITE
	tool_selected.emit(_active_tool)

func _on_count_changed(data: Dictionary) -> void:
	var lbl := find_child("count_%d" % data["type"], true, false)
	if lbl:
		lbl.text = "x%d" % data["count"]

func deselect() -> void:
	_active_tool = -1
	for btn in _buttons:
		btn.modulate = Color.WHITE

func _exit_tree() -> void:
	EventBus.off("tool:count-changed", _on_count_changed)
