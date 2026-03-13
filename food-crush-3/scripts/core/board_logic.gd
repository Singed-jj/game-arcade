# scripts/core/board_logic.gd
class_name BoardLogic

var _board: Array = []

func init_board() -> void:
	_board = []
	for col in range(C.BOARD_COLS):
		var column := []
		column.resize(C.BOARD_ROWS)
		column.fill(C.EMPTY)
		_board.append(column)

	for col in range(C.BOARD_COLS):
		for row in range(C.BOARD_ROWS):
			var type: int
			var attempts := 0
			while true:
				type = randi() % C.BLOCK_TYPES_COUNT
				attempts += 1
				if not _would_match(col, row, type) or attempts > 20:
					break
			_board[col][row] = type

func _would_match(col: int, row: int, type: int) -> bool:
	if col >= 2 and _board[col - 1][row] == type and _board[col - 2][row] == type:
		return true
	if row >= 2 and _board[col][row - 1] == type and _board[col][row - 2] == type:
		return true
	return false

func get_board() -> Array:
	return _board

func get_block(col: int, row: int) -> int:
	if col < 0 or col >= C.BOARD_COLS or row < 0 or row >= C.BOARD_ROWS:
		return C.EMPTY
	return _board[col][row]

func set_board(grid: Array) -> void:
	_board = []
	for col in range(grid.size()):
		_board.append(grid[col].duplicate())

func _is_adjacent(a: Dictionary, b: Dictionary) -> bool:
	var dc := abs(a["col"] - b["col"])
	var dr := abs(a["row"] - b["row"])
	return (dc == 1 and dr == 0) or (dc == 0 and dr == 1)

func try_swap(from_pos: Dictionary, to_pos: Dictionary) -> Dictionary:
	if not _is_adjacent(from_pos, to_pos):
		return {"valid": false, "cascades": []}

	var fc := from_pos["col"]; var fr := from_pos["row"]
	var tc := to_pos["col"];   var tr := to_pos["row"]
	var tmp = _board[fc][fr]
	_board[fc][fr] = _board[tc][tr]
	_board[tc][tr] = tmp

	var initial_matches := MatchDetector.find_matches(_board)
	if initial_matches.is_empty():
		tmp = _board[fc][fr]
		_board[fc][fr] = _board[tc][tr]
		_board[tc][tr] = tmp
		return {"valid": false, "cascades": []}

	var cascades := []
	var matches := initial_matches
	while not matches.is_empty():
		for match_result in matches:
			for cell in match_result["cells"]:
				_board[cell["col"]][cell["row"]] = C.EMPTY

		var falls := GravityHandler.apply_gravity(_board)
		var spawned := GravityHandler.fill_empty(_board)
		cascades.append({"matches": matches, "falls": falls, "spawned": spawned})
		matches = MatchDetector.find_matches(_board)

	return {"valid": true, "cascades": cascades}

func apply_tool_targets(targets: Array) -> Array:
	for pos in targets:
		if _board[pos["col"]][pos["row"]] != C.EMPTY:
			_board[pos["col"]][pos["row"]] = C.EMPTY

	var cascades := []
	var falls := GravityHandler.apply_gravity(_board)
	var spawned := GravityHandler.fill_empty(_board)
	cascades.append({"matches": [], "falls": falls, "spawned": spawned})

	var matches := MatchDetector.find_matches(_board)
	while not matches.is_empty():
		for match_result in matches:
			for cell in match_result["cells"]:
				_board[cell["col"]][cell["row"]] = C.EMPTY
		falls = GravityHandler.apply_gravity(_board)
		spawned = GravityHandler.fill_empty(_board)
		cascades.append({"matches": matches, "falls": falls, "spawned": spawned})
		matches = MatchDetector.find_matches(_board)

	return cascades
