# scripts/ui/board_renderer.gd
extends Node
class_name BoardRenderer

const BlockViewScene := preload("res://scenes/ui/block_view.tscn")

const BOARD_COLS := 7
const BOARD_ROWS := 7
const CELL_SIZE := 48
const EMPTY := -1

var _grid: Control
var _views: Array = []

signal swap_requested(from_pos: Dictionary, to_pos: Dictionary)
signal block_tapped(pos: Dictionary)

var _drag_start: Dictionary = {}
var _is_dragging := false
var _drag_threshold := 10.0

func setup(grid_container: Control) -> void:
	_grid = grid_container
	_views = []
	for col in range(BOARD_COLS):
		var column := []
		column.resize(BOARD_ROWS)
		column.fill(null)
		_views.append(column)

func build_board(board: Array) -> void:
	if _grid == null:
		return
	for child in _grid.get_children():
		child.queue_free()
	for col in range(BOARD_COLS):
		for row in range(BOARD_ROWS):
			_views[col][row] = null

	for row in range(BOARD_ROWS):
		for col in range(BOARD_COLS):
			_spawn_block_view(board[col][row], col, row)

func _spawn_block_view(bt: int, col: int, row: int) -> BlockView:
	var bv: BlockView = BlockViewScene.instantiate()
	_grid.add_child(bv)
	bv.position = _grid_pos(col, row)
	bv.setup(bt, col, row)
	bv.gui_input.connect(_on_block_input.bind(col, row))
	_views[col][row] = bv
	return bv

func _grid_pos(col: int, row: int) -> Vector2:
	return Vector2(col * CELL_SIZE, row * CELL_SIZE)

func animate_swap(from_pos: Dictionary, to_pos: Dictionary) -> void:
	var bv_from: BlockView = _views[from_pos["col"]][from_pos["row"]]
	var bv_to: BlockView = _views[to_pos["col"]][to_pos["row"]]
	if not bv_from or not bv_to:
		return
	var t1 := bv_from.create_tween()
	t1.tween_property(bv_from, "position", _grid_pos(to_pos["col"], to_pos["row"]), 0.1)
	var t2 := bv_to.create_tween()
	t2.tween_property(bv_to, "position", _grid_pos(from_pos["col"], from_pos["row"]), 0.1)
	_views[from_pos["col"]][from_pos["row"]] = bv_to
	_views[to_pos["col"]][to_pos["row"]] = bv_from
	bv_from.col = to_pos["col"]; bv_from.row = to_pos["row"]
	bv_to.col = from_pos["col"]; bv_to.row = from_pos["row"]

func remove_blocks(cells: Array) -> void:
	for cell in cells:
		var bv: BlockView = _views[cell["col"]][cell["row"]]
		if bv:
			bv.pop_animation()
	await get_tree().create_timer(0.14).timeout
	for cell in cells:
		var bv: BlockView = _views[cell["col"]][cell["row"]]
		if bv:
			bv.queue_free()
			_views[cell["col"]][cell["row"]] = null

func animate_falls(falls: Array) -> void:
	for fall in falls:
		var fc: int = fall["from"]["col"]; var fr: int = fall["from"]["row"]
		var tc: int = fall["to"]["col"];   var tr: int = fall["to"]["row"]
		var bv: BlockView = _views[fc][fr]
		if bv:
			_views[tc][tr] = bv
			_views[fc][fr] = null
			bv.col = tc; bv.row = tr
			var tween := bv.create_tween()
			tween.set_ease(Tween.EASE_IN)
			tween.tween_property(bv, "position", _grid_pos(tc, tr), 0.15)
	if not falls.is_empty():
		await get_tree().create_timer(0.18).timeout

func spawn_blocks(spawned: Array) -> void:
	for s in spawned:
		var col: int = s["pos"]["col"]; var row: int = s["pos"]["row"]
		var bv: BlockView = BlockViewScene.instantiate()
		_grid.add_child(bv)
		bv.position = _grid_pos(col, row) + Vector2(0, -CELL_SIZE * BOARD_ROWS)
		bv.setup(s["block_type"], col, row)
		bv.gui_input.connect(_on_block_input.bind(col, row))
		_views[col][row] = bv
		var tween := bv.create_tween()
		tween.set_ease(Tween.EASE_IN)
		tween.tween_property(bv, "position", _grid_pos(col, row), 0.22)

func _on_block_input(event: InputEvent, col: int, row: int) -> void:
	if event is InputEventScreenTouch:
		if event.pressed:
			_drag_start = {"col": col, "row": row, "pos": event.position}
			_is_dragging = true
		else:
			if _is_dragging:
				block_tapped.emit({"col": col, "row": row})
			_is_dragging = false
	elif event is InputEventScreenDrag and _is_dragging:
		var delta := event.position - _drag_start.get("pos", event.position)
		if delta.length() < _drag_threshold:
			return
		var dc := 0; var dr := 0
		if abs(delta.x) > abs(delta.y):
			dc = 1 if delta.x > 0 else -1
		else:
			dr = 1 if delta.y > 0 else -1
		var from_pos := {"col": _drag_start["col"], "row": _drag_start["row"]}
		var to_pos := {"col": from_pos["col"] + dc, "row": from_pos["row"] + dr}
		if to_pos["col"] >= 0 and to_pos["col"] < BOARD_COLS and \
		   to_pos["row"] >= 0 and to_pos["row"] < BOARD_ROWS:
			swap_requested.emit(from_pos, to_pos)
		_is_dragging = false
