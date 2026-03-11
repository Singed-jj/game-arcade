extends Control
## Bottom panel for selecting buildings to place. Enters build mode on selection.

var buttons_container: HBoxContainer
var selected_type: String = ""
var is_build_mode := false
var preview_node: ColorRect
var main_node: Node2D  # Reference to main scene

func _ready() -> void:
	visible = false
	_setup_ui()

func _setup_ui() -> void:
	var bg := ColorRect.new()
	bg.color = Color(0.15, 0.15, 0.2, 0.9)
	bg.size = Vector2(1280, 120)
	bg.position = Vector2(0, 600)
	add_child(bg)
	buttons_container = HBoxContainer.new()
	buttons_container.position = Vector2(20, 610)
	buttons_container.add_theme_constant_override("separation", 10)
	add_child(buttons_container)
	var cancel_btn := Button.new()
	cancel_btn.text = "X Cancel"
	cancel_btn.position = Vector2(1180, 610)
	cancel_btn.pressed.connect(_cancel_build)
	add_child(cancel_btn)

func open(main_ref: Node2D) -> void:
	main_node = main_ref
	_refresh_buttons()
	visible = true
	EventBus.build_mode_entered.emit()

func close() -> void:
	_cancel_build()
	visible = false
	EventBus.build_mode_exited.emit()

func _refresh_buttons() -> void:
	for child in buttons_container.get_children():
		child.queue_free()
	var unlocked := BuildingDB.get_unlocked_buildings(GameManager.level)
	for btype in unlocked:
		var data := BuildingDB.get_building(btype)
		var btn := Button.new()
		btn.text = "%s\nCost:%d" % [data["name"], data["cost"]]
		btn.custom_minimum_size = Vector2(100, 80)
		btn.pressed.connect(_on_building_selected.bind(btype))
		if GameManager.coins < data["cost"]:
			btn.disabled = true
		buttons_container.add_child(btn)

func _on_building_selected(btype: String) -> void:
	selected_type = btype
	is_build_mode = true
	if preview_node:
		preview_node.queue_free()
	var data := BuildingDB.get_building(btype)
	preview_node = ColorRect.new()
	preview_node.size = Vector2(data["size"].x * 32, data["size"].y * 32)
	preview_node.color = Color(1, 1, 1, 0.5)
	preview_node.mouse_filter = Control.MOUSE_FILTER_IGNORE
	main_node.add_child(preview_node)

func _unhandled_input(event: InputEvent) -> void:
	if not is_build_mode or not main_node:
		return
	if event is InputEventMouseMotion and preview_node:
		var world_pos := main_node.get_global_mouse_position()
		var grid_map: Node2D = main_node.get_node("GridMap")
		var grid_pos: Vector2i = grid_map.world_to_grid(world_pos)
		preview_node.position = grid_map.grid_to_world(grid_pos)
		var data := BuildingDB.get_building(selected_type)
		if grid_map.can_place(grid_pos, data["size"]):
			preview_node.color = Color(0, 1, 0, 0.4)
		else:
			preview_node.color = Color(1, 0, 0, 0.4)
	elif event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		var world_pos := main_node.get_global_mouse_position()
		var grid_map: Node2D = main_node.get_node("GridMap")
		var grid_pos: Vector2i = grid_map.world_to_grid(world_pos)
		var result: Node = main_node.place_building_at(selected_type, grid_pos)
		if result:
			_cancel_build()
			_refresh_buttons()

func _cancel_build() -> void:
	is_build_mode = false
	selected_type = ""
	if preview_node:
		preview_node.queue_free()
		preview_node = null
