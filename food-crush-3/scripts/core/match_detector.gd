# scripts/core/match_detector.gd
class_name MatchDetector

static func _find_horizontal_runs(board: Array) -> Array:
	var runs := []
	for row in range(C.BOARD_ROWS):
		var col := 0
		while col < C.BOARD_COLS:
			var type = board[col][row]
			if type == C.EMPTY:
				col += 1
				continue
			var end_col := col
			while end_col + 1 < C.BOARD_COLS and board[end_col + 1][row] == type:
				end_col += 1
			if end_col - col + 1 >= C.MATCH_MIN:
				var cells := []
				for c in range(col, end_col + 1):
					cells.append({"col": c, "row": row})
				runs.append({"cells": cells, "block_type": type, "orientation": "horizontal"})
			col = end_col + 1
	return runs

static func _find_vertical_runs(board: Array) -> Array:
	var runs := []
	for col in range(C.BOARD_COLS):
		var row := 0
		while row < C.BOARD_ROWS:
			var type = board[col][row]
			if type == C.EMPTY:
				row += 1
				continue
			var end_row := row
			while end_row + 1 < C.BOARD_ROWS and board[col][end_row + 1] == type:
				end_row += 1
			if end_row - row + 1 >= C.MATCH_MIN:
				var cells := []
				for r in range(row, end_row + 1):
					cells.append({"col": col, "row": r})
				runs.append({"cells": cells, "block_type": type, "orientation": "vertical"})
			row = end_row + 1
	return runs

static func _merge_runs(all_runs: Array) -> Array:
	if all_runs.is_empty():
		return []

	var cell_to_runs: Dictionary = {}
	for i in range(all_runs.size()):
		for cell in all_runs[i]["cells"]:
			var key := "%d,%d" % [cell["col"], cell["row"]]
			if not cell_to_runs.has(key):
				cell_to_runs[key] = []
			cell_to_runs[key].append(i)

	var visited: Dictionary = {}
	var results := []

	for i in range(all_runs.size()):
		if visited.has(i):
			continue
		visited[i] = true

		var group := [all_runs[i]]
		var queue := [i]
		var block_type = all_runs[i]["block_type"]

		while not queue.is_empty():
			var idx: int = queue.pop_front()
			for cell in all_runs[idx]["cells"]:
				var key := "%d,%d" % [cell["col"], cell["row"]]
				for neighbor_idx in cell_to_runs.get(key, []):
					if not visited.has(neighbor_idx) and all_runs[neighbor_idx]["block_type"] == block_type:
						visited[neighbor_idx] = true
						queue.append(neighbor_idx)
						group.append(all_runs[neighbor_idx])

		var cell_set: Dictionary = {}
		var cells := []
		for run in group:
			for cell in run["cells"]:
				var key := "%d,%d" % [cell["col"], cell["row"]]
				if not cell_set.has(key):
					cell_set[key] = true
					cells.append(cell)

		var has_h := false
		var has_v := false
		for r in group:
			if r["orientation"] == "horizontal":
				has_h = true
			else:
				has_v = true

		var pattern: int
		if has_h and has_v:
			pattern = C.MatchPattern.CROSS if cells.size() >= 9 else C.MatchPattern.L_SHAPE
		elif has_h:
			if cells.size() >= 5:
				pattern = C.MatchPattern.HORIZONTAL_5
			elif cells.size() >= 4:
				pattern = C.MatchPattern.HORIZONTAL_4
			else:
				pattern = C.MatchPattern.HORIZONTAL
		else:
			if cells.size() >= 5:
				pattern = C.MatchPattern.VERTICAL_5
			elif cells.size() >= 4:
				pattern = C.MatchPattern.VERTICAL_4
			else:
				pattern = C.MatchPattern.VERTICAL

		results.append({"cells": cells, "pattern": pattern, "block_type": block_type})

	return results

static func find_matches(board: Array) -> Array:
	var h_runs := _find_horizontal_runs(board)
	var v_runs := _find_vertical_runs(board)
	return _merge_runs(h_runs + v_runs)
