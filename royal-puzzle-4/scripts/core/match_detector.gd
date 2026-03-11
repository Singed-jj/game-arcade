class_name MatchDetector
extends RefCounted

static func find_all_matches(grid: Array, width: int, height: int, is_active: Callable) -> Array:
	var matches: Array = []
	var matched_cells := {}

	# Horizontal matches
	for y in range(height):
		var run_start := 0
		for x in range(1, width + 1):
			var same := false
			if x < width:
				same = _cells_match(grid, run_start, y, x, y, is_active)
			if not same:
				var run_len := x - run_start
				if run_len >= 3:
					var cells: Array[Vector2i] = []
					for rx in range(run_start, x):
						if is_active.call(rx, y):
							cells.append(Vector2i(rx, y))
					if cells.size() >= 3:
						matches.append({"cells": cells, "pattern": "horizontal", "length": run_len})
						for c in cells:
							matched_cells[c] = true
				run_start = x

	# Vertical matches
	for x in range(width):
		var run_start := 0
		for y in range(1, height + 1):
			var same := false
			if y < height:
				same = _cells_match(grid, x, run_start, x, y, is_active)
			if not same:
				var run_len := y - run_start
				if run_len >= 3:
					var cells: Array[Vector2i] = []
					for ry in range(run_start, y):
						if is_active.call(x, ry):
							cells.append(Vector2i(x, ry))
					if cells.size() >= 3:
						matches.append({"cells": cells, "pattern": "vertical", "length": run_len})
						for c in cells:
							matched_cells[c] = true
				run_start = y

	return _merge_matches(matches)

static func _cells_match(grid: Array, x1: int, y1: int, x2: int, y2: int, is_active: Callable) -> bool:
	if not is_active.call(x1, y1) or not is_active.call(x2, y2):
		return false
	var t1 = grid[y1][x1]
	var t2 = grid[y2][x2]
	if t1 == null or t2 == null:
		return false
	if t1 is Tile and t2 is Tile:
		return t1.type == t2.type and not t1.is_special() and not t2.is_special()
	return false

static func _merge_matches(matches: Array) -> Array:
	if matches.size() <= 1:
		return matches
	var merged: Array = []
	var used := []
	used.resize(matches.size())
	used.fill(false)
	for i in range(matches.size()):
		if used[i]:
			continue
		var group_cells := {}
		for c in matches[i]["cells"]:
			group_cells[c] = true
		var found_overlap := true
		while found_overlap:
			found_overlap = false
			for j in range(i + 1, matches.size()):
				if used[j]:
					continue
				var overlaps := false
				for c in matches[j]["cells"]:
					if c in group_cells:
						overlaps = true
						break
				if overlaps:
					for c in matches[j]["cells"]:
						group_cells[c] = true
					used[j] = true
					found_overlap = true
		var all_cells: Array[Vector2i] = []
		for c in group_cells.keys():
			all_cells.append(c)
		var pattern := _classify_pattern(all_cells)
		merged.append({"cells": all_cells, "pattern": pattern, "length": all_cells.size()})
		used[i] = true
	return merged

static func _classify_pattern(cells: Array[Vector2i]) -> String:
	var count := cells.size()
	if count >= 5:
		var all_same_row := true
		var all_same_col := true
		for i in range(1, cells.size()):
			if cells[i].y != cells[0].y:
				all_same_row = false
			if cells[i].x != cells[0].x:
				all_same_col = false
		if all_same_row or all_same_col:
			return "line_5"
		return "t_or_l"
	if count == 4:
		var all_same_row := true
		var all_same_col := true
		for i in range(1, cells.size()):
			if cells[i].y != cells[0].y:
				all_same_row = false
			if cells[i].x != cells[0].x:
				all_same_col = false
		if all_same_row:
			return "line_4_h"
		if all_same_col:
			return "line_4_v"
		return "t_or_l"
	return "match_3"

static func has_possible_moves(grid: Array, width: int, height: int, is_active: Callable) -> bool:
	for y in range(height):
		for x in range(width):
			if not is_active.call(x, y):
				continue
			if x + 1 < width and is_active.call(x + 1, y):
				_swap(grid, x, y, x + 1, y)
				var m := find_all_matches(grid, width, height, is_active)
				_swap(grid, x, y, x + 1, y)
				if m.size() > 0:
					return true
			if y + 1 < height and is_active.call(x, y + 1):
				_swap(grid, x, y, x, y + 1)
				var m := find_all_matches(grid, width, height, is_active)
				_swap(grid, x, y, x, y + 1)
				if m.size() > 0:
					return true
	return false

static func _swap(grid: Array, x1: int, y1: int, x2: int, y2: int) -> void:
	var temp = grid[y1][x1]
	grid[y1][x1] = grid[y2][x2]
	grid[y2][x2] = temp
