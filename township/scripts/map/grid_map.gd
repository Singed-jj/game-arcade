extends Node2D
## Manages the 20x20 tile grid. Tracks which cells are occupied.

const GRID_SIZE := 20
const TILE_SIZE := 32

## grid[x][y] = building_type or "" if empty
var grid: Array[Array] = []

func _ready() -> void:
	_init_grid()

func _init_grid() -> void:
	grid.clear()
	for x in range(GRID_SIZE):
		var col: Array = []
		col.resize(GRID_SIZE)
		col.fill("")
		grid.append(col)

func world_to_grid(world_pos: Vector2) -> Vector2i:
	return Vector2i(int(world_pos.x) / TILE_SIZE, int(world_pos.y) / TILE_SIZE)

func grid_to_world(grid_pos: Vector2i) -> Vector2:
	return Vector2(grid_pos.x * TILE_SIZE, grid_pos.y * TILE_SIZE)

func grid_to_world_center(grid_pos: Vector2i, building_size: Vector2i) -> Vector2:
	return Vector2(
		grid_pos.x * TILE_SIZE + building_size.x * TILE_SIZE / 2.0,
		grid_pos.y * TILE_SIZE + building_size.y * TILE_SIZE / 2.0
	)

func can_place(grid_pos: Vector2i, size: Vector2i) -> bool:
	for x in range(grid_pos.x, grid_pos.x + size.x):
		for y in range(grid_pos.y, grid_pos.y + size.y):
			if x < 0 or x >= GRID_SIZE or y < 0 or y >= GRID_SIZE:
				return false
			if grid[x][y] != "":
				return false
	return true

func place_building(grid_pos: Vector2i, size: Vector2i, building_id: String) -> void:
	for x in range(grid_pos.x, grid_pos.x + size.x):
		for y in range(grid_pos.y, grid_pos.y + size.y):
			grid[x][y] = building_id

func remove_building(grid_pos: Vector2i, size: Vector2i) -> void:
	for x in range(grid_pos.x, grid_pos.x + size.x):
		for y in range(grid_pos.y, grid_pos.y + size.y):
			if x >= 0 and x < GRID_SIZE and y >= 0 and y < GRID_SIZE:
				grid[x][y] = ""

func is_in_bounds(grid_pos: Vector2i) -> bool:
	return grid_pos.x >= 0 and grid_pos.x < GRID_SIZE and grid_pos.y >= 0 and grid_pos.y < GRID_SIZE
