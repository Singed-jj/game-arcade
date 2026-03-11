extends CanvasLayer

signal popup_closed(action: String)

var current_popup: Control = null

func _ready() -> void:
	GameEvents.level_completed.connect(_on_level_completed)
	GameEvents.level_failed.connect(_on_level_failed)

func _on_level_completed(level: int, remaining_moves: int) -> void:
	var coins := 20 + remaining_moves * 5
	show_win_popup(level, coins)

func _on_level_failed(level: int) -> void:
	show_lose_popup(level)

func show_win_popup(level: int, coins: int) -> void:
	_clear_popup()
	var panel := _create_panel()
	var vbox := VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	vbox.custom_minimum_size = Vector2(400, 300)

	var title := Label.new()
	title.text = "Well Done!"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 48)
	vbox.add_child(title)

	var spacer := Control.new()
	spacer.custom_minimum_size.y = 20
	vbox.add_child(spacer)

	var reward_label := Label.new()
	reward_label.text = "★ +1    💰 +%d" % coins
	reward_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	reward_label.add_theme_font_size_override("font_size", 24)
	vbox.add_child(reward_label)

	var spacer2 := Control.new()
	spacer2.custom_minimum_size.y = 30
	vbox.add_child(spacer2)

	var nightmare := NightmareManager.should_trigger(level)

	var continue_btn := Button.new()
	continue_btn.text = "Continue"
	continue_btn.custom_minimum_size = Vector2(200, 50)
	continue_btn.pressed.connect(func():
		_clear_popup()
		if nightmare:
			_show_nightmare_prompt(level)
		else:
			GameState.go_to_scene("home")
	)
	vbox.add_child(continue_btn)

	panel.add_child(vbox)

func show_lose_popup(level: int) -> void:
	_clear_popup()
	var panel := _create_panel()
	var vbox := VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	vbox.custom_minimum_size = Vector2(400, 350)

	var title := Label.new()
	title.text = "Level Failed"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 40)
	vbox.add_child(title)

	var spacer := Control.new()
	spacer.custom_minimum_size.y = 20
	vbox.add_child(spacer)

	if SaveManager.get_coins() >= 100:
		var buy_btn := Button.new()
		buy_btn.text = "+5 Moves (100 coins)"
		buy_btn.custom_minimum_size = Vector2(200, 50)
		buy_btn.pressed.connect(func():
			if CoinManager.buy_extra_moves():
				_clear_popup()
				popup_closed.emit("buy_moves")
		)
		vbox.add_child(buy_btn)

	var retry_btn := Button.new()
	retry_btn.text = "Retry" if LifeManager.has_lives() else "No Lives"
	retry_btn.disabled = not LifeManager.has_lives()
	retry_btn.custom_minimum_size = Vector2(200, 50)
	retry_btn.pressed.connect(func():
		_clear_popup()
		GameState.start_level(level)
		GameState.go_to_scene("game")
	)
	vbox.add_child(retry_btn)

	var home_btn := Button.new()
	home_btn.text = "Home"
	home_btn.custom_minimum_size = Vector2(200, 50)
	home_btn.pressed.connect(func():
		_clear_popup()
		GameState.go_to_scene("home")
	)
	vbox.add_child(home_btn)

	panel.add_child(vbox)

func _show_nightmare_prompt(level: int) -> void:
	var scenario := NightmareManager.get_scenario_for_level(level)
	if scenario.is_empty():
		GameState.go_to_scene("home")
		return
	_clear_popup()
	var panel := _create_panel()
	var vbox := VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	vbox.custom_minimum_size = Vector2(400, 300)

	var title := Label.new()
	title.text = "King's Nightmare!"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 36)
	vbox.add_child(title)

	var desc := Label.new()
	desc.text = scenario["name"]
	desc.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	desc.add_theme_font_size_override("font_size", 24)
	vbox.add_child(desc)

	var spacer := Control.new()
	spacer.custom_minimum_size.y = 20
	vbox.add_child(spacer)

	var play_btn := Button.new()
	play_btn.text = "Play (+%d coins)" % scenario["reward"]
	play_btn.custom_minimum_size = Vector2(200, 50)
	play_btn.pressed.connect(func():
		_clear_popup()
		GameState.start_nightmare(scenario["id"])
		GameState.go_to_scene("nightmare", {"scenario": scenario})
	)
	vbox.add_child(play_btn)

	var skip_btn := Button.new()
	skip_btn.text = "Skip"
	skip_btn.custom_minimum_size = Vector2(200, 50)
	skip_btn.pressed.connect(func():
		_clear_popup()
		GameState.go_to_scene("home")
	)
	vbox.add_child(skip_btn)

	panel.add_child(vbox)

func _create_panel() -> Panel:
	var panel := Panel.new()
	panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(panel)
	current_popup = panel
	return panel

func _clear_popup() -> void:
	if current_popup and is_instance_valid(current_popup):
		current_popup.queue_free()
		current_popup = null
