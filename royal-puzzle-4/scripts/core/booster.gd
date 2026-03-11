class_name Booster
extends RefCounted

static func get_booster_for_pattern(pattern: String) -> Tile.SpecialType:
	match pattern:
		"line_4_h":
			return Tile.SpecialType.ROCKET_H
		"line_4_v":
			return Tile.SpecialType.ROCKET_V
		"line_5":
			return Tile.SpecialType.LIGHT_BALL
		"t_or_l":
			return Tile.SpecialType.TNT
	return Tile.SpecialType.NONE

static func get_affected_cells(board: Board, pos: Vector2i, special: Tile.SpecialType) -> Array[Vector2i]:
	var cells: Array[Vector2i] = []
	match special:
		Tile.SpecialType.ROCKET_H:
			for x in range(board.width):
				if board.is_active(x, pos.y):
					cells.append(Vector2i(x, pos.y))
		Tile.SpecialType.ROCKET_V:
			for y in range(board.height):
				if board.is_active(pos.x, y):
					cells.append(Vector2i(pos.x, y))
		Tile.SpecialType.TNT:
			for dy in range(-1, 2):
				for dx in range(-1, 2):
					var cell := Vector2i(pos.x + dx, pos.y + dy)
					if board.is_active(cell.x, cell.y):
						cells.append(cell)
		Tile.SpecialType.LIGHT_BALL:
			pass
		Tile.SpecialType.MISSILE:
			cells.append(pos)
	return cells

static func get_light_ball_targets(board: Board, target_type: Tile.Type) -> Array[Vector2i]:
	var cells: Array[Vector2i] = []
	for y in range(board.height):
		for x in range(board.width):
			var tile := board.get_tile(Vector2i(x, y))
			if tile and tile.type == target_type and not tile.is_special():
				cells.append(Vector2i(x, y))
	return cells

static func get_missile_target(board: Board, exclude: Vector2i) -> Vector2i:
	var obstacles: Array[Vector2i] = []
	var tiles: Array[Vector2i] = []
	for y in range(board.height):
		for x in range(board.width):
			var pos := Vector2i(x, y)
			if pos == exclude:
				continue
			if board.get_obstacle(pos) != null:
				obstacles.append(pos)
			elif board.get_tile(pos) != null:
				tiles.append(pos)
	if obstacles.size() > 0:
		return obstacles[randi() % obstacles.size()]
	if tiles.size() > 0:
		return tiles[randi() % tiles.size()]
	return Vector2i(-1, -1)
