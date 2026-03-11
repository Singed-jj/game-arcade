extends Control

var board: Board
var board_visual: BoardVisual
var scenario: Dictionary = {}
var time_remaining: float = 0.0
var target_current: int = 0
var target_total: int = 0
var is_active := false

var timer_label: Label
var target_label: Label
var scenario_label: Label

func _ready() -> void:
	scenario = get_parent().scene_params.get("scenario", {})
	if scenario.is_empty():
		GameState.go_to_scene("home")
		return

	_build_ui()

	time_remaining = scenario.get("time", 30)
	target_total = scenario.get("target_count", 30)
	target_current = 0

	if scenario_label:
		scenario_label.text = scenario.get("name", "Nightmare")

	var ld := LevelData.new()
	ld.moves = 999
	ld.targets = [{"type": scenario.get("target_type", "red"), "count": target_total}]

	board = Board.new()
	board.init_board(ld)

	board_visual = BoardVisual.new()
	add_child(board_visual)
	board_visual.position = Vector2(40, 300)
	board_visual.init_visuals(board)
	board_visual.swap_requested.connect(_on_swap)

	is_active = true

func _build_ui() -> void:
	var bg := ColorRect.new()
	bg.color = Color("#1e1030")
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	scenario_label = Label.new()
	scenario_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	scenario_label.add_theme_font_size_override("font_size", 32)
	scenario_label.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
	scenario_label.offset_top = 20
	scenario_label.offset_bottom = 70
	add_child(scenario_label)

	var info_bar := HBoxContainer.new()
	info_bar.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
	info_bar.offset_top = 80
	info_bar.offset_bottom = 120
	add_child(info_bar)

	timer_label = Label.new()
	timer_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	timer_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	timer_label.add_theme_font_size_override("font_size", 28)
	info_bar.add_child(timer_label)

	target_label = Label.new()
	target_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	target_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	target_label.add_theme_font_size_override("font_size", 28)
	info_bar.add_child(target_label)

func _process(delta: float) -> void:
	if not is_active:
		return
	time_remaining -= delta
	if timer_label:
		timer_label.text = "%02d:%02d" % [int(time_remaining) / 60, int(time_remaining) % 60]
	if target_label:
		target_label.text = "%d / %d" % [target_current, target_total]
	if time_remaining <= 0:
		_on_time_up()

func _on_swap(from: Vector2i, to: Vector2i) -> void:
	if not is_active:
		return
	if not board.try_swap(from, to):
		return
	_process_matches()

func _process_matches() -> void:
	var matches := MatchDetector.find_all_matches(board.grid, board.width, board.height, board.is_active)
	while matches.size() > 0:
		for m in matches:
			var target_type_name: String = scenario.get("target_type", "red")
			for cell in m["cells"]:
				var tile := board.get_tile(cell)
				if tile and Tile.TYPE_NAMES.get(tile.type, "") == target_type_name:
					target_current += 1
			board.remove_tiles(m["cells"])
		await get_tree().create_timer(0.2).timeout
		board.apply_gravity()
		await get_tree().create_timer(0.1).timeout
		board.fill_empty()
		await get_tree().create_timer(0.1).timeout

		if target_current >= target_total:
			_on_win()
			return
		matches = MatchDetector.find_all_matches(board.grid, board.width, board.height, board.is_active)

func _on_win() -> void:
	is_active = false
	GameState.complete_nightmare(scenario["id"], scenario.get("reward", 50))
	await get_tree().create_timer(1.0).timeout
	GameState.go_to_scene("home")

func _on_time_up() -> void:
	is_active = false
	await get_tree().create_timer(1.0).timeout
	GameState.go_to_scene("home")
