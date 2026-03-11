class_name BoardVisual
extends Node2D

const CELL_SIZE := Vector2(80.0, 80.0)
const SWIPE_THRESHOLD := 20.0

var board: Board
var tile_visuals := {}
var is_input_enabled := true
var drag_start: Vector2 = Vector2.ZERO
var drag_start_cell: Vector2i = Vector2i(-1, -1)
var is_dragging := false

signal swap_requested(from: Vector2i, to: Vector2i)

func init_visuals(p_board: Board) -> void:
	board = p_board
	board.tiles_created.connect(_on_tiles_created)
	board.tiles_moved.connect(_on_tiles_moved)
	board.tiles_removed.connect(_on_tiles_removed)
	_create_all_visuals()

func _create_all_visuals() -> void:
	for y in range(board.height):
		for x in range(board.width):
			var tile := board.get_tile(Vector2i(x, y))
			if tile:
				_create_tile_visual(tile)

func _create_tile_visual(tile: Tile) -> TileVisual:
	var visual := TileVisual.new()
	add_child(visual)
	visual.setup(tile, CELL_SIZE)
	tile_visuals[tile.grid_pos] = visual
	return visual

func _on_tiles_created(tiles: Array) -> void:
	for tile in tiles:
		var visual := _create_tile_visual(tile)
		visual.animate_spawn()

func _on_tiles_moved(moves: Array) -> void:
	for m in moves:
		var tile: Tile = m["tile"]
		var from: Vector2i = m["from"]
		var to: Vector2i = m["to"]
		if from in tile_visuals:
			var visual := tile_visuals[from]
			tile_visuals.erase(from)
			tile_visuals[to] = visual
			visual.animate_to(to)

func _on_tiles_removed(positions: Array[Vector2i]) -> void:
	for pos in positions:
		if pos in tile_visuals:
			tile_visuals[pos].animate_destroy()
			tile_visuals.erase(pos)

func _input(event: InputEvent) -> void:
	if not is_input_enabled:
		return
	if event is InputEventMouseButton:
		if event.pressed:
			drag_start = event.position - global_position
			drag_start_cell = pixel_to_grid(drag_start)
			is_dragging = true
		else:
			is_dragging = false
			drag_start_cell = Vector2i(-1, -1)
	elif event is InputEventMouseMotion and is_dragging:
		var current := event.position - global_position
		var diff := current - drag_start
		if diff.length() > SWIPE_THRESHOLD:
			is_dragging = false
			var direction := _get_swipe_direction(diff)
			var target := drag_start_cell + direction
			if drag_start_cell != Vector2i(-1, -1):
				swap_requested.emit(drag_start_cell, target)

func pixel_to_grid(pixel: Vector2) -> Vector2i:
	var gx := int(pixel.x / CELL_SIZE.x)
	var gy := int(pixel.y / CELL_SIZE.y)
	if gx < 0 or gx >= board.width or gy < 0 or gy >= board.height:
		return Vector2i(-1, -1)
	return Vector2i(gx, gy)

func _get_swipe_direction(diff: Vector2) -> Vector2i:
	if absf(diff.x) > absf(diff.y):
		return Vector2i(1, 0) if diff.x > 0 else Vector2i(-1, 0)
	else:
		return Vector2i(0, 1) if diff.y > 0 else Vector2i(0, -1)

func get_board_pixel_size() -> Vector2:
	return Vector2(board.width * CELL_SIZE.x, board.height * CELL_SIZE.y)
