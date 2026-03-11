class_name BoosterMerger
extends RefCounted

enum MergeResult {
	NONE,
	CROSS,
	BIG_ROCKET,
	COLOR_ROCKET,
	MEGA_EXPLOSION,
	COLOR_TNT,
	ALL_BOARD,
	TRIPLE_MISSILE,
	MISSILE_ROCKET,
	MISSILE_TNT,
	COLOR_MISSILE,
}

static func get_merge_type(type_a: Tile.SpecialType, type_b: Tile.SpecialType) -> MergeResult:
	var is_rocket_a := type_a == Tile.SpecialType.ROCKET_H or type_a == Tile.SpecialType.ROCKET_V
	var is_rocket_b := type_b == Tile.SpecialType.ROCKET_H or type_b == Tile.SpecialType.ROCKET_V

	if is_rocket_a and is_rocket_b:
		return MergeResult.CROSS
	if (is_rocket_a and type_b == Tile.SpecialType.TNT) or (type_a == Tile.SpecialType.TNT and is_rocket_b):
		return MergeResult.BIG_ROCKET
	if (is_rocket_a and type_b == Tile.SpecialType.LIGHT_BALL) or (type_a == Tile.SpecialType.LIGHT_BALL and is_rocket_b):
		return MergeResult.COLOR_ROCKET
	if type_a == Tile.SpecialType.TNT and type_b == Tile.SpecialType.TNT:
		return MergeResult.MEGA_EXPLOSION
	if (type_a == Tile.SpecialType.TNT and type_b == Tile.SpecialType.LIGHT_BALL) or (type_a == Tile.SpecialType.LIGHT_BALL and type_b == Tile.SpecialType.TNT):
		return MergeResult.COLOR_TNT
	if type_a == Tile.SpecialType.LIGHT_BALL and type_b == Tile.SpecialType.LIGHT_BALL:
		return MergeResult.ALL_BOARD
	if type_a == Tile.SpecialType.MISSILE and type_b == Tile.SpecialType.MISSILE:
		return MergeResult.TRIPLE_MISSILE
	if (type_a == Tile.SpecialType.MISSILE and is_rocket_b) or (is_rocket_a and type_b == Tile.SpecialType.MISSILE):
		return MergeResult.MISSILE_ROCKET
	if (type_a == Tile.SpecialType.MISSILE and type_b == Tile.SpecialType.TNT) or (type_a == Tile.SpecialType.TNT and type_b == Tile.SpecialType.MISSILE):
		return MergeResult.MISSILE_TNT
	if (type_a == Tile.SpecialType.MISSILE and type_b == Tile.SpecialType.LIGHT_BALL) or (type_a == Tile.SpecialType.LIGHT_BALL and type_b == Tile.SpecialType.MISSILE):
		return MergeResult.COLOR_MISSILE
	return MergeResult.NONE

static func get_merge_cells(board: Board, pos: Vector2i, merge: MergeResult) -> Array[Vector2i]:
	var cells: Array[Vector2i] = []
	match merge:
		MergeResult.CROSS:
			for x in range(board.width):
				if board.is_active(x, pos.y):
					cells.append(Vector2i(x, pos.y))
			for y in range(board.height):
				if board.is_active(pos.x, y) and Vector2i(pos.x, y) not in cells:
					cells.append(Vector2i(pos.x, y))
		MergeResult.BIG_ROCKET:
			for dy in range(-1, 2):
				for x in range(board.width):
					var cy := pos.y + dy
					if cy >= 0 and cy < board.height and board.is_active(x, cy):
						var v := Vector2i(x, cy)
						if v not in cells:
							cells.append(v)
		MergeResult.MEGA_EXPLOSION:
			for dy in range(-2, 3):
				for dx in range(-2, 3):
					var cell := Vector2i(pos.x + dx, pos.y + dy)
					if board.is_active(cell.x, cell.y):
						cells.append(cell)
		MergeResult.ALL_BOARD:
			for y in range(board.height):
				for x in range(board.width):
					if board.is_active(x, y):
						cells.append(Vector2i(x, y))
		MergeResult.TRIPLE_MISSILE:
			for _i in range(3):
				var target := Booster.get_missile_target(board, pos)
				if target != Vector2i(-1, -1) and target not in cells:
					cells.append(target)
	return cells

static func get_most_common_color(board: Board) -> Tile.Type:
	var counts := {}
	for y in range(board.height):
		for x in range(board.width):
			var tile := board.get_tile(Vector2i(x, y))
			if tile and not tile.is_special():
				counts[tile.type] = counts.get(tile.type, 0) + 1
	var best_type: Tile.Type = Tile.Type.RED
	var best_count := 0
	for t in counts:
		if counts[t] > best_count:
			best_count = counts[t]
			best_type = t
	return best_type
