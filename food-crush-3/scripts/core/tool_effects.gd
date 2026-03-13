# scripts/core/tool_effects.gd
class_name ToolEffects

static func get_rocket_targets(col: int, row: int, direction: String) -> Array:
	var targets := []
	if direction == "horizontal":
		for c in range(C.BOARD_COLS):
			targets.append({"col": c, "row": row})
	else:
		for r in range(C.BOARD_ROWS):
			targets.append({"col": col, "row": r})
	return targets

static func get_bomb_targets(col: int, row: int) -> Array:
	var targets := []
	for dc in range(-1, 2):
		for dr in range(-1, 2):
			var c := col + dc
			var r := row + dr
			if c >= 0 and c < C.BOARD_COLS and r >= 0 and r < C.BOARD_ROWS:
				targets.append({"col": c, "row": r})
	return targets

static func get_rainbow_targets(board: Array, block_type: int) -> Array:
	var targets := []
	for col in range(C.BOARD_COLS):
		for row in range(C.BOARD_ROWS):
			if board[col][row] == block_type:
				targets.append({"col": col, "row": row})
	return targets
