extends Control

## Title screen - TAP TO START with pulsing animation

var _pulse_tween: Tween

func _ready() -> void:
	_start_pulse()
	EventBus.return_to_menu.connect(_on_return_to_menu)

func _start_pulse() -> void:
	var label: Label = $CenterContainer/VBoxContainer/TapLabel
	_pulse_tween = create_tween().set_loops()
	_pulse_tween.tween_property(label, "modulate:a", 0.3, 0.8)
	_pulse_tween.tween_property(label, "modulate:a", 1.0, 0.8)

func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		_go_to_stage_select()
	elif event is InputEventScreenTouch and event.pressed:
		_go_to_stage_select()

func _go_to_stage_select() -> void:
	visible = false
	get_parent().get_node("StageSelect").visible = true

func _on_return_to_menu() -> void:
	visible = true
	get_parent().get_node("StageSelect").visible = false
	if get_parent().has_node("BattleScene"):
		get_parent().get_node("BattleScene").queue_free()
