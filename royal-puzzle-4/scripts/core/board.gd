class_name Board
extends RefCounted

var width: int
var height: int
var grid: Array = []
var obstacles_grid: Array = []
var level_data: LevelData
var num_tile_types: int = 5

signal tiles_created(tiles: Array)
signal tiles_moved(moves: Array)
signal tiles_removed(positions: Array[Vector2i])

func init_board(p_level_data: LevelData) -> void:
	level_data = p_level_data
	width = p_level_data.board_width
	height = p_level_data.board_height
	num_tile_types = p_level_data.tile_types
	_init_grid()
	_place_obstacles()
	_fill_board()
	_ensure_no_initial_matches()

func _init_grid() -> void:
	grid.clear()
	obstacles_grid.clear()
	for y in range(height):
		var row := []
		var obs_row := []
		row.resize(width)
		obs_row.resize(width)
		row.fill(null)
		obs_row.fill(null)
		grid.append(row)
		obstacles_grid.append(obs_row)

func is_active(x: int, y: int) -> bool:
	if x < 0 or x >= width or y < 0 or y >= height:
		return false
	return level_data.is_cell_active(x, y)

func get_tile(pos: Vector2i) -> Tile:
	if not is_active(pos.x, pos.y):
		return null
	return grid[pos.y][pos.x]

func set_tile(pos: Vector2i, tile: Tile) -> void:
	grid[pos.y][pos.x] = tile
	if tile:
		tile.grid_pos = pos

func _place_obstacles() -> void:
	for obs_data in level_data.obstacles:
		var pos_arr: Array = obs_data.get("position", [0, 0])
		var pos := Vector2i(pos_arr[0], pos_arr[1])
		if is_active(pos.x, pos.y):
			obstacles_grid[pos.y][pos.x] = {
				"type": obs_data["type"],
				"hp": obs_data.get("hp", 1),
			}

func _fill_board() -> void:
	var new_tiles := []
	for y in range(height):
		for x in range(width):
			if is_active(x, y) and grid[y][x] == null:
				var tile := Tile.new(Tile.random_type(num_tile_types), Vector2i(x, y))
				grid[y][x] = tile
				new_tiles.append(tile)
	if new_tiles.size() > 0:
		tiles_created.emit(new_tiles)

func _ensure_no_initial_matches() -> void:
	var matches := MatchDetector.find_all_matches(grid, width, height, is_active)
	var max_iterations := 100
	while matches.size() > 0 and max_iterations > 0:
		for m in matches:
			for cell in m["cells"]:
				var new_tile := Tile.new(Tile.random_type(num_tile_types), cell)
				grid[cell.y][cell.x] = new_tile
		matches = MatchDetector.find_all_matches(grid, width, height, is_active)
		max_iterations -= 1

func can_swap(from: Vector2i, to: Vector2i) -> bool:
	if not is_active(from.x, from.y) or not is_active(to.x, to.y):
		return false
	var dist := absi(from.x - to.x) + absi(from.y - to.y)
	if dist != 1:
		return false
	var tile_from := get_tile(from)
	var tile_to := get_tile(to)
	if tile_from == null or tile_to == null:
		return false
	if _has_fence_between(from, to):
		return false
	if _is_chained(from) or _is_chained(to):
		return false
	return true

func swap(from: Vector2i, to: Vector2i) -> void:
	var tile_a := grid[from.y][from.x]
	var tile_b := grid[to.y][to.x]
	grid[from.y][from.x] = tile_b
	grid[to.y][to.x] = tile_a
	if tile_a:
		tile_a.grid_pos = to
	if tile_b:
		tile_b.grid_pos = from

func try_swap(from: Vector2i, to: Vector2i) -> bool:
	if not can_swap(from, to):
		return false
	swap(from, to)
	var matches := MatchDetector.find_all_matches(grid, width, height, is_active)
	var both_special := false
	var tile_a := get_tile(to)
	var tile_b := get_tile(from)
	if tile_a and tile_b and tile_a.is_special() and tile_b.is_special():
		both_special = true
	var lightball_swap := false
	if tile_a and tile_a.special == Tile.SpecialType.LIGHT_BALL:
		lightball_swap = true
	if tile_b and tile_b.special == Tile.SpecialType.LIGHT_BALL:
		lightball_swap = true
	if matches.size() == 0 and not both_special and not lightball_swap:
		swap(from, to)
		return false
	return true

func apply_gravity() -> Array:
	var moves_list := []
	for x in range(width):
		var write_y := height - 1
		while write_y >= 0 and not is_active(x, write_y):
			write_y -= 1
		for y in range(height - 1, -1, -1):
			if not is_active(x, y):
				continue
			if grid[y][x] != null:
				if y != write_y:
					var tile = grid[y][x]
					grid[write_y][x] = tile
					grid[y][x] = null
					tile.grid_pos = Vector2i(x, write_y)
					moves_list.append({"tile": tile, "from": Vector2i(x, y), "to": Vector2i(x, write_y)})
				write_y -= 1
				while write_y >= 0 and not is_active(x, write_y):
					write_y -= 1
	if moves_list.size() > 0:
		tiles_moved.emit(moves_list)
	return moves_list

func fill_empty() -> Array:
	var new_tiles := []
	for x in range(width):
		for y in range(height):
			if is_active(x, y) and grid[y][x] == null:
				var tile := Tile.new(Tile.random_type(num_tile_types), Vector2i(x, y))
				grid[y][x] = tile
				new_tiles.append(tile)
	if new_tiles.size() > 0:
		tiles_created.emit(new_tiles)
	return new_tiles

func shuffle() -> void:
	var all_tiles := []
	var positions := []
	for y in range(height):
		for x in range(width):
			if is_active(x, y) and grid[y][x] != null and not grid[y][x].is_special():
				all_tiles.append(grid[y][x])
				positions.append(Vector2i(x, y))
	for i in range(all_tiles.size() - 1, 0, -1):
		var j := randi() % (i + 1)
		var temp = all_tiles[i]
		all_tiles[i] = all_tiles[j]
		all_tiles[j] = temp
	for i in range(all_tiles.size()):
		var pos := positions[i]
		grid[pos.y][pos.x] = all_tiles[i]
		all_tiles[i].grid_pos = pos

func needs_shuffle() -> bool:
	return not MatchDetector.has_possible_moves(grid, width, height, is_active)

func remove_tiles(positions: Array[Vector2i]) -> void:
	for pos in positions:
		if is_active(pos.x, pos.y):
			grid[pos.y][pos.x] = null
	tiles_removed.emit(positions)

func get_obstacle(pos: Vector2i) -> Variant:
	if not is_active(pos.x, pos.y):
		return null
	return obstacles_grid[pos.y][pos.x]

func hit_obstacle(pos: Vector2i) -> bool:
	var obs = obstacles_grid[pos.y][pos.x]
	if obs == null:
		return false
	obs["hp"] -= 1
	if obs["hp"] <= 0:
		obstacles_grid[pos.y][pos.x] = null
		GameEvents.obstacle_destroyed.emit(pos, obs["type"])
		return true
	GameEvents.obstacle_hit.emit(pos, obs["type"], obs["hp"])
	return false

func _has_fence_between(from: Vector2i, to: Vector2i) -> bool:
	var obs_from = get_obstacle(from)
	var obs_to = get_obstacle(to)
	if obs_from and obs_from["type"] == "fence":
		return true
	if obs_to and obs_to["type"] == "fence":
		return true
	return false

func _is_chained(pos: Vector2i) -> bool:
	var obs = get_obstacle(pos)
	return obs != null and obs["type"] == "chain"

func get_adjacent_cells(pos: Vector2i) -> Array[Vector2i]:
	var result: Array[Vector2i] = []
	for offset in [Vector2i(-1, 0), Vector2i(1, 0), Vector2i(0, -1), Vector2i(0, 1)]:
		var adj := pos + offset
		if is_active(adj.x, adj.y):
			result.append(adj)
	return result
