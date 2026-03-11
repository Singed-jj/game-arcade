extends Control

var moves_label: Label
var target_container: VBoxContainer
var target_labels := {}

func _ready() -> void:
	# Build HUD UI programmatically
	var top_bar := HBoxContainer.new()
	top_bar.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
	top_bar.custom_minimum_size.y = 80
	add_child(top_bar)

	var target_panel := PanelContainer.new()
	target_container = VBoxContainer.new()
	target_panel.add_child(target_container)
	top_bar.add_child(target_panel)

	var spacer := Control.new()
	spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top_bar.add_child(spacer)

	var moves_panel := PanelContainer.new()
	moves_label = Label.new()
	moves_label.add_theme_font_size_override("font_size", 32)
	moves_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	moves_panel.add_child(moves_label)
	top_bar.add_child(moves_panel)

	GameEvents.moves_changed.connect(_on_moves_changed)
	GameEvents.target_progress.connect(_on_target_progress)

func setup(moves: int, targets: Dictionary) -> void:
	_on_moves_changed(moves)
	for type_name in targets:
		var label := Label.new()
		label.text = "%s: 0/%d" % [type_name, targets[type_name]["total"]]
		label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		target_container.add_child(label)
		target_labels[type_name] = label

func _on_moves_changed(remaining: int) -> void:
	if moves_label:
		moves_label.text = str(remaining)

func _on_target_progress(type_name: String, current: int, total: int) -> void:
	if type_name in target_labels:
		target_labels[type_name].text = "%s: %d/%d" % [type_name, current, total]
