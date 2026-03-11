extends Control

var board: Board
var board_visual: BoardVisual
var remaining_moves: int = 0
var targets: Dictionary = {}
var is_processing := false

func _ready() -> void:
	var level_num := GameState.get_current_level()
	var level_data: LevelData
	var path := "res://resources/levels/level_%03d.tres" % level_num
	if ResourceLoader.exists(path):
		level_data = load(path)
	else:
		level_data = _create_default_level(level_num)

	remaining_moves = level_data.moves
	_init_targets(level_data)

	board = Board.new()
	board.init_board(level_data)

	board_visual = BoardVisual.new()
	add_child(board_visual)
	var board_size := Vector2(board.width * 80, board.height * 80)
	board_visual.position = Vector2((720 - board_size.x) / 2, 200)
	board_visual.init_visuals(board)
	board_visual.swap_requested.connect(_on_swap_requested)

	GameEvents.moves_changed.emit(remaining_moves)

	# Add HUD
	var hud := Control.new()
	hud.set_script(load("res://scripts/ui/hud.gd"))
	hud.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(hud)
	hud.setup(remaining_moves, targets)

func _init_targets(level_data: LevelData) -> void:
	for t in level_data.targets:
		targets[t["type"]] = {"current": 0, "total": t["count"]}

func _on_swap_requested(from: Vector2i, to: Vector2i) -> void:
	if is_processing:
		return
	if remaining_moves <= 0:
		return

	var tile_a := board.get_tile(from)
	var tile_b := board.get_tile(to)
	if tile_a and tile_b and tile_a.is_special() and tile_b.is_special():
		_handle_booster_merge(from, to, tile_a, tile_b)
		return

	if tile_a and tile_a.special == Tile.SpecialType.LIGHT_BALL and tile_b:
		_handle_light_ball_swap(from, to, tile_b.type)
		return
	if tile_b and tile_b.special == Tile.SpecialType.LIGHT_BALL and tile_a:
		_handle_light_ball_swap(to, from, tile_a.type)
		return

	if not board.try_swap(from, to):
		return

	remaining_moves -= 1
	GameEvents.moves_changed.emit(remaining_moves)
	is_processing = true
	await _process_matches()
	is_processing = false
	_check_game_end()

func _process_matches() -> void:
	var matches := MatchDetector.find_all_matches(board.grid, board.width, board.height, board.is_active)
	while matches.size() > 0:
		for m in matches:
			_handle_match(m)
		await get_tree().create_timer(0.25).timeout
		board.apply_gravity()
		await get_tree().create_timer(0.15).timeout
		board.fill_empty()
		await get_tree().create_timer(0.15).timeout
		matches = MatchDetector.find_all_matches(board.grid, board.width, board.height, board.is_active)

	if board.needs_shuffle():
		board.shuffle()
		_rebuild_visuals()

func _handle_match(match_data: Dictionary) -> void:
	var cells: Array[Vector2i] = match_data["cells"]
	var pattern: String = match_data["pattern"]
	var booster_type := Booster.get_booster_for_pattern(pattern)

	for cell in cells:
		for adj in board.get_adjacent_cells(cell):
			var obs = board.get_obstacle(adj)
			if obs and Obstacle.should_hit_on_adjacent_match(obs["type"]):
				board.hit_obstacle(adj)
		var obs_on = board.get_obstacle(cell)
		if obs_on and Obstacle.should_hit_on_top_match(obs_on["type"]):
			board.hit_obstacle(cell)

	if cells.size() > 0:
		var tile := board.get_tile(cells[0])
		if tile:
			var type_name := Tile.TYPE_NAMES.get(tile.type, "")
			_update_target(type_name, cells.size())

	board.remove_tiles(cells)

	if booster_type != Tile.SpecialType.NONE:
		var center := cells[cells.size() / 2]
		var booster_tile := Tile.new(Tile.Type.RED, center)
		booster_tile.special = booster_type
		board.set_tile(center, booster_tile)
		GameEvents.booster_created.emit(center, str(booster_type))

func _handle_booster_merge(from: Vector2i, to: Vector2i, tile_a: Tile, tile_b: Tile) -> void:
	var merge := BoosterMerger.get_merge_type(tile_a.special, tile_b.special)
	if merge == BoosterMerger.MergeResult.NONE:
		return
	remaining_moves -= 1
	GameEvents.moves_changed.emit(remaining_moves)
	is_processing = true

	var merge_pos := to
	var cells := BoosterMerger.get_merge_cells(board, merge_pos, merge)

	if merge in [BoosterMerger.MergeResult.COLOR_ROCKET, BoosterMerger.MergeResult.COLOR_TNT, BoosterMerger.MergeResult.COLOR_MISSILE]:
		var color := BoosterMerger.get_most_common_color(board)
		cells = Booster.get_light_ball_targets(board, color)

	board.remove_tiles([from, to])
	if cells.size() > 0:
		board.remove_tiles(cells)
	GameEvents.booster_merge.emit(from, to, str(tile_a.special), str(tile_b.special))

	await get_tree().create_timer(0.3).timeout
	board.apply_gravity()
	await get_tree().create_timer(0.15).timeout
	board.fill_empty()
	await get_tree().create_timer(0.15).timeout
	await _process_matches()
	is_processing = false
	_check_game_end()

func _handle_light_ball_swap(ball_pos: Vector2i, target_pos: Vector2i, target_type: Tile.Type) -> void:
	remaining_moves -= 1
	GameEvents.moves_changed.emit(remaining_moves)
	is_processing = true

	var cells := Booster.get_light_ball_targets(board, target_type)
	board.remove_tiles([ball_pos])
	board.remove_tiles(cells)
	_update_target(Tile.TYPE_NAMES.get(target_type, ""), cells.size())

	await get_tree().create_timer(0.3).timeout
	board.apply_gravity()
	await get_tree().create_timer(0.15).timeout
	board.fill_empty()
	await get_tree().create_timer(0.15).timeout
	await _process_matches()
	is_processing = false
	_check_game_end()

func _update_target(type_name: String, count: int) -> void:
	if type_name in targets:
		targets[type_name]["current"] = mini(
			targets[type_name]["current"] + count,
			targets[type_name]["total"]
		)
		GameEvents.target_progress.emit(
			type_name,
			targets[type_name]["current"],
			targets[type_name]["total"]
		)
		if targets[type_name]["current"] >= targets[type_name]["total"]:
			GameEvents.target_completed.emit(type_name)

func _check_game_end() -> void:
	var all_complete := true
	for t in targets:
		if targets[t]["current"] < targets[t]["total"]:
			all_complete = false
			break
	if all_complete:
		GameState.complete_level(GameState.get_current_level(), remaining_moves)
		return
	if remaining_moves <= 0:
		GameState.fail_level(GameState.get_current_level())

func _rebuild_visuals() -> void:
	for key in board_visual.tile_visuals:
		if is_instance_valid(board_visual.tile_visuals[key]):
			board_visual.tile_visuals[key].queue_free()
	board_visual.tile_visuals.clear()
	board_visual._create_all_visuals()

func _create_default_level(level_num: int) -> LevelData:
	var ld := LevelData.new()
	ld.level_number = level_num
	ld.moves = maxi(28 - level_num, 10)
	ld.targets = [{"type": "red", "count": 10 + level_num * 2}]
	return ld
