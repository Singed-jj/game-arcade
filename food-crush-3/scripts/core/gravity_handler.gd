# scripts/core/gravity_handler.gd
class_name GravityHandler

static func apply_gravity(board: Array) -> Array:
	var falls := []
	for col in range(C.BOARD_COLS):
		var write_row := C.BOARD_ROWS - 1
		for row in range(C.BOARD_ROWS - 1, -1, -1):
			if board[col][row] != C.EMPTY:
				if write_row != row:
					falls.append({
						"from": {"col": col, "row": row},
						"to":   {"col": col, "row": write_row},
						"block_type": board[col][row],
					})
					board[col][write_row] = board[col][row]
					board[col][row] = C.EMPTY
				write_row -= 1
	return falls

static func fill_empty(board: Array) -> Array:
	var spawned := []
	for col in range(C.BOARD_COLS):
		for row in range(C.BOARD_ROWS):
			if board[col][row] == C.EMPTY:
				var type := randi() % C.BLOCK_TYPES_COUNT
				board[col][row] = type
				spawned.append({"pos": {"col": col, "row": row}, "block_type": type})
	return spawned
