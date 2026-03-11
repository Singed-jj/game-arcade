extends Node2D
## Root scene. Spawns grid background, manages building instances, connects UI.

@onready var grid_map: Node2D = $GridMap
@onready var camera: Camera2D = $Camera
@onready var buildings_container: Node2D = $Buildings
@onready var ui_layer: CanvasLayer = $UILayer

var building_nodes: Dictionary = {}  # grid_pos_key -> Node

# UI references
var hud: Control
var build_panel: Control
var order_panel: Control
var factory_panel: Control
var inventory_panel: Control

func _ready() -> void:
	_draw_grid_background()
	_setup_ui()
	_setup_bottom_bar()
	_load_buildings()

func _draw_grid_background() -> void:
	for x in range(grid_map.GRID_SIZE):
		for y in range(grid_map.GRID_SIZE):
			var tile := ColorRect.new()
			tile.size = Vector2(grid_map.TILE_SIZE - 1, grid_map.TILE_SIZE - 1)
			tile.position = Vector2(x * grid_map.TILE_SIZE, y * grid_map.TILE_SIZE)
			tile.color = Color(0.35, 0.65, 0.25) if (x + y) % 2 == 0 else Color(0.38, 0.68, 0.28)
			add_child(tile)
			move_child(tile, 0)  # Send to back

func _setup_ui() -> void:
	# HUD
	hud = Control.new()
	hud.set_script(preload("res://scripts/ui/hud.gd"))
	ui_layer.add_child(hud)
	# Build panel
	build_panel = Control.new()
	build_panel.set_script(preload("res://scripts/ui/build_panel.gd"))
	ui_layer.add_child(build_panel)
	# Order panel
	order_panel = Control.new()
	order_panel.set_script(preload("res://scripts/ui/order_panel.gd"))
	ui_layer.add_child(order_panel)
	# Factory panel
	factory_panel = Control.new()
	factory_panel.set_script(preload("res://scripts/ui/factory_panel.gd"))
	factory_panel.add_to_group("factory_panel")
	ui_layer.add_child(factory_panel)
	# Inventory panel
	inventory_panel = Control.new()
	inventory_panel.set_script(preload("res://scripts/ui/inventory_panel.gd"))
	ui_layer.add_child(inventory_panel)

func _setup_bottom_bar() -> void:
	var bar := HBoxContainer.new()
	bar.position = Vector2(400, 670)
	bar.add_theme_constant_override("separation", 20)
	ui_layer.add_child(bar)

	var build_btn := Button.new()
	build_btn.text = "Build"
	build_btn.custom_minimum_size = Vector2(120, 40)
	build_btn.pressed.connect(_on_build_pressed)
	bar.add_child(build_btn)

	var order_btn := Button.new()
	order_btn.text = "Orders"
	order_btn.custom_minimum_size = Vector2(120, 40)
	order_btn.pressed.connect(_on_order_pressed)
	bar.add_child(order_btn)

	var inv_btn := Button.new()
	inv_btn.text = "Inventory"
	inv_btn.custom_minimum_size = Vector2(120, 40)
	inv_btn.pressed.connect(_on_inventory_pressed)
	bar.add_child(inv_btn)

func _on_build_pressed() -> void:
	if build_panel.visible:
		build_panel.close()
	else:
		order_panel.visible = false
		inventory_panel.visible = false
		factory_panel.visible = false
		build_panel.open(self)

func _on_order_pressed() -> void:
	if order_panel.visible:
		order_panel.visible = false
	else:
		build_panel.close() if build_panel.visible else null
		inventory_panel.visible = false
		factory_panel.visible = false
		order_panel.open()

func _on_inventory_pressed() -> void:
	if inventory_panel.visible:
		inventory_panel.visible = false
	else:
		build_panel.close() if build_panel.visible else null
		order_panel.visible = false
		factory_panel.visible = false
		inventory_panel.open()

func place_building_at(building_type: String, grid_pos: Vector2i) -> Node:
	var data := BuildingDB.get_building(building_type)
	if data.is_empty():
		return null
	var size: Vector2i = data["size"]
	if not grid_map.can_place(grid_pos, size):
		return null
	if not GameManager.spend_coins(data["cost"]):
		return null

	grid_map.place_building(grid_pos, size, building_type)

	var node: Node2D
	match data["category"]:
		BuildingDB.CAT_FARM:
			node = _create_farm(building_type, data)
		BuildingDB.CAT_FACTORY:
			node = _create_factory(building_type, data)
		_:
			node = _create_generic(building_type, data)

	node.position = grid_map.grid_to_world_center(grid_pos, size)
	buildings_container.add_child(node)
	var key := "%d,%d" % [grid_pos.x, grid_pos.y]
	building_nodes[key] = node
	node.set_meta("grid_pos", grid_pos)
	node.set_meta("building_type", building_type)

	EventBus.building_placed.emit(building_type, grid_pos)
	_save_buildings()
	return node

func _create_farm(building_type: String, data: Dictionary) -> Node2D:
	var node := Node2D.new()
	var rect := ColorRect.new()
	rect.size = Vector2(data["size"].x * grid_map.TILE_SIZE - 2, data["size"].y * grid_map.TILE_SIZE - 2)
	rect.position = -rect.size / 2
	rect.color = Color(0.6, 0.4, 0.2)  # Brown for farms
	node.add_child(rect)
	var script = preload("res://scripts/buildings/farm.gd")
	node.set_script(script)
	node.set_meta("building_data", data)
	node.set_meta("building_type", building_type)
	return node

func _create_factory(building_type: String, data: Dictionary) -> Node2D:
	var node := Node2D.new()
	var rect := ColorRect.new()
	rect.size = Vector2(data["size"].x * grid_map.TILE_SIZE - 2, data["size"].y * grid_map.TILE_SIZE - 2)
	rect.position = -rect.size / 2
	rect.color = Color(0.5, 0.5, 0.7)  # Blue-grey for factories
	node.add_child(rect)
	var script = preload("res://scripts/buildings/factory.gd")
	node.set_script(script)
	node.set_meta("building_data", data)
	node.set_meta("building_type", building_type)
	return node

func _create_generic(building_type: String, data: Dictionary) -> Node2D:
	var node := Node2D.new()
	var rect := ColorRect.new()
	rect.size = Vector2(data["size"].x * grid_map.TILE_SIZE - 2, data["size"].y * grid_map.TILE_SIZE - 2)
	rect.position = -rect.size / 2
	rect.color = Color(0.7, 0.7, 0.3)  # Yellow for special
	node.add_child(rect)
	return node

func _save_buildings() -> void:
	var building_data: Array = []
	for key in building_nodes:
		var node: Node2D = building_nodes[key]
		var grid_pos: Vector2i = node.get_meta("grid_pos")
		var btype: String = node.get_meta("building_type")
		var entry := {"type": btype, "x": grid_pos.x, "y": grid_pos.y}
		if node.has_method("get_save_data"):
			entry["state"] = node.get_save_data()
		building_data.append(entry)
	SaveManager.set_val("buildings", building_data)

func _load_buildings() -> void:
	var saved: Array = SaveManager.get_val("buildings", [])
	if saved == null or saved.is_empty():
		_place_default_buildings()
		return
	for entry in saved:
		var btype: String = entry.get("type", "")
		var gpos := Vector2i(entry.get("x", 0), entry.get("y", 0))
		var data := BuildingDB.get_building(btype)
		if data.is_empty():
			continue
		var original_coins := GameManager.coins
		GameManager.coins += data["cost"]
		var node := place_building_at(btype, gpos)
		GameManager.coins = original_coins
		if node and entry.has("state") and node.has_method("load_save_data"):
			node.load_save_data(entry["state"])

func _place_default_buildings() -> void:
	# Helicopter pad at center
	var pad_pos := Vector2i(8, 8)
	var data := BuildingDB.get_building(BuildingDB.HELICOPTER_PAD)
	grid_map.place_building(pad_pos, data["size"], BuildingDB.HELICOPTER_PAD)
	var pad := _create_generic(BuildingDB.HELICOPTER_PAD, data)
	pad.position = grid_map.grid_to_world_center(pad_pos, data["size"])
	buildings_container.add_child(pad)
	building_nodes["%d,%d" % [pad_pos.x, pad_pos.y]] = pad
	pad.set_meta("grid_pos", pad_pos)
	pad.set_meta("building_type", BuildingDB.HELICOPTER_PAD)

	# Warehouse nearby
	var wh_pos := Vector2i(12, 8)
	var wh_data := BuildingDB.get_building(BuildingDB.WAREHOUSE)
	grid_map.place_building(wh_pos, wh_data["size"], BuildingDB.WAREHOUSE)
	var wh := _create_generic(BuildingDB.WAREHOUSE, wh_data)
	wh.position = grid_map.grid_to_world_center(wh_pos, wh_data["size"])
	buildings_container.add_child(wh)
	building_nodes["%d,%d" % [wh_pos.x, wh_pos.y]] = wh
	wh.set_meta("grid_pos", wh_pos)
	wh.set_meta("building_type", BuildingDB.WAREHOUSE)

	_save_buildings()
