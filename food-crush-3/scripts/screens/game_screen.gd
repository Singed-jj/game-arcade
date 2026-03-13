# scripts/screens/game_screen.gd
extends Control

var _board_logic: BoardLogic
var _board_renderer: BoardRenderer
var _shake: ScreenShake
var _ticker: TickerBanner
var _tool_bar: ToolBar
var _active_tool := -1
var _is_animating := false
var _level := 1
var _hint_timer: Timer = null

func setup(data: Dictionary) -> void:
	_level = data.get("level", 1)

func _ready() -> void:
	_build()

func _build() -> void:
	# 하트 체크
	if not HeartManager.use_heart():
		EventBus.change_screen("no-hearts")
		return

	# 배경
	var bg := TextureRect.new()
	bg.texture = load("res://assets/bg/game-bg.png")
	bg.layout_mode = 1
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	add_child(bg)

	# 레벨 시작
	var config := LevelData.get_level_config(_level)
	GameState.start_level(config)

	# 보드 배경
	var board_bg := TextureRect.new()
	board_bg.texture = load("res://assets/ui/board-bg.png")
	board_bg.layout_mode = 1
	board_bg.set_anchors_preset(Control.PRESET_CENTER)
	board_bg.custom_minimum_size = Vector2(7 * 48 + 20, 7 * 48 + 20)
	board_bg.expand_mode = TextureRect.EXPAND_FIT_WIDTH_PROPORTIONAL
	board_bg.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	add_child(board_bg)

	# 그리드 컨테이너
	var grid := GridContainer.new()
	grid.columns = 7
	grid.layout_mode = 1
	grid.set_anchors_preset(Control.PRESET_CENTER)
	grid.add_theme_constant_override("h_separation", 0)
	grid.add_theme_constant_override("v_separation", 0)
	add_child(grid)

	# 보드 로직
	_board_logic = BoardLogic.new()
	_board_logic.init_board()

	# 보드 렌더러
	_board_renderer = BoardRenderer.new()
	_board_renderer.setup(grid)
	_board_renderer.build_board(_board_logic.get_board())
	_board_renderer.swap_requested.connect(_on_swap_requested)
	_board_renderer.block_tapped.connect(_on_block_tapped)
	add_child(_board_renderer)

	# 스크린 셰이크
	_shake = ScreenShake.new()
	_shake.setup(self)
	add_child(_shake)

	# HUD (상단)
	var hud := HUD.new()
	hud.layout_mode = 1
	hud.set_anchors_preset(Control.PRESET_TOP_WIDE)
	hud.custom_minimum_size = Vector2(0, 64)
	hud.add_theme_constant_override("separation", 16)
	add_child(hud)

	# 도구바 (하단)
	_tool_bar = ToolBar.new()
	_tool_bar.layout_mode = 1
	_tool_bar.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	_tool_bar.custom_minimum_size = Vector2(0, 72)
	_tool_bar.alignment = BoxContainer.ALIGNMENT_CENTER
	_tool_bar.add_theme_constant_override("separation", 20)
	_tool_bar.tool_selected.connect(_on_tool_selected)
	add_child(_tool_bar)

	# 티커 배너 (중앙 오버레이)
	_ticker = TickerBanner.new()
	_ticker.layout_mode = 1
	_ticker.set_anchors_preset(Control.PRESET_CENTER)
	_ticker.z_index = 10
	add_child(_ticker)

	# 뒤로가기
	var back_btn := Button.new()
	back_btn.text = "← 맵"
	back_btn.layout_mode = 1
	back_btn.set_anchors_preset(Control.PRESET_TOP_LEFT)
	back_btn.custom_minimum_size = Vector2(72, 44)
	back_btn.pressed.connect(_on_back_pressed)
	add_child(back_btn)

	# 힌트 타이머
	_hint_timer = Timer.new()
	_hint_timer.wait_time = 3.0
	_hint_timer.one_shot = true
	_hint_timer.timeout.connect(_show_hint)
	add_child(_hint_timer)
	_hint_timer.start()

func _on_back_pressed() -> void:
	EventBus.change_screen("map")

func _on_tool_selected(tool_type: int) -> void:
	_active_tool = tool_type

func _on_block_tapped(pos: Dictionary) -> void:
	if _is_animating:
		return
	if _active_tool < 0:
		return
	var tool_type := _active_tool
	if not ToolManager.use_tool(tool_type):
		return
	_active_tool = -1
	if _tool_bar and _tool_bar.has_method("deselect"):
		_tool_bar.deselect()

	var targets: Array
	match tool_type:
		0:  # ROCKET - 기본 horizontal
			targets = ToolEffects.get_rocket_targets(pos["col"], pos["row"], "horizontal")
			SoundManager.play("rocket")
		1:  # BOMB
			targets = ToolEffects.get_bomb_targets(pos["col"], pos["row"])
			SoundManager.play("bomb")
		2:  # RAINBOW
			var bt := _board_logic.get_block(pos["col"], pos["row"])
			if bt == -1:
				ToolManager.add_tool(tool_type)
				return
			targets = ToolEffects.get_rainbow_targets(_board_logic.get_board(), bt)
			SoundManager.play("rainbow")
		_:
			return

	var cascades := _board_logic.apply_tool_targets(targets)
	await _play_cascades(cascades, 1)
	_check_end()

func _on_swap_requested(from_pos: Dictionary, to_pos: Dictionary) -> void:
	if _is_animating or _active_tool >= 0:
		return

	_hint_timer.stop()

	var result := _board_logic.try_swap(from_pos, to_pos)
	if not result["valid"]:
		SoundManager.play("swap")
		# 잘못된 스왑: 미니 셰이크
		_shake.shake(3.0, 0.15)
		_hint_timer.start()
		return

	SoundManager.play("swap")
	GameState.use_move()
	await _play_cascades(result["cascades"], 1)
	_check_end()
	_hint_timer.start()

func _play_cascades(cascades: Array, start_count: int) -> void:
	_is_animating = true
	var cascade_count := start_count

	for step in cascades:
		if not step["matches"].is_empty():
			SoundManager.play("block-pop")
			var all_cells := []
			for m in step["matches"]:
				all_cells += m["cells"]
				GameState.add_goal_progress(m["block_type"], m["cells"].size())
				GameState.add_score(m["cells"].size() * 10)
			await _board_renderer.remove_blocks(all_cells)
			HapticManager.vibrate("light")

		await _board_renderer.animate_falls(step["falls"])
		_board_renderer.spawn_blocks(step["spawned"])
		await get_tree().create_timer(0.24).timeout

		if not step["matches"].is_empty():
			_ticker.show_cascade(cascade_count)
			if cascade_count >= 2:
				var idx := min(cascade_count, 5)
				var shake_intensity := float(idx * 2)
				_shake.shake(shake_intensity)
				HapticManager.vibrate("cascade" if cascade_count >= 4 else "medium")
			cascade_count += 1

	_is_animating = false

func _check_end() -> void:
	if GameState.are_all_goals_met():
		await get_tree().create_timer(0.4).timeout
		SoundManager.play("clear")
		var stars := GameState.get_stars()
		var level := GameState.get_level()
		var prev_stars := SaveManager.get_level_stars(level)
		if stars > prev_stars:
			SaveManager.set_level_stars(level, stars)
		if level >= SaveManager.get_unlocked_level():
			SaveManager.set_unlocked_level(level + 1)
		PieceManager.add_pieces(1)  # PIECES_ON_CLEAR
		GameState.deactivate()
		EventBus.change_screen("clear", {"level": level, "stars": stars})
	elif GameState.get_remaining_moves() <= 0:
		await get_tree().create_timer(0.4).timeout
		SoundManager.play("fail")
		GameState.deactivate()
		EventBus.change_screen("fail", {"level": GameState.get_level()})

func _show_hint() -> void:
	# 3초 비활동 시 힌트 표시 (간단한 깜빡임)
	pass  # 구현 생략 가능
