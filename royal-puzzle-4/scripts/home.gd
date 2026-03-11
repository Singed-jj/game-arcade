extends Control

var level_label: Label
var coins_label: Label
var lives_label: Label
var stars_label: Label
var castle_progress: Label
var task_button: Button
var play_button: Button

func _ready() -> void:
	_build_ui()
	_update_ui()
	GameEvents.coins_changed.connect(func(_c): _update_ui())
	GameEvents.lives_changed.connect(func(_l): _update_ui())
	GameEvents.stars_changed.connect(func(_s): _update_ui())

	if DailyBonus.can_claim():
		_show_daily_bonus()

func _build_ui() -> void:
	# Background
	var bg := ColorRect.new()
	bg.color = Color("#87ceeb")
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	# Top bar
	var top_bar := HBoxContainer.new()
	top_bar.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
	top_bar.custom_minimum_size.y = 60
	add_child(top_bar)

	coins_label = Label.new()
	coins_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	coins_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	top_bar.add_child(coins_label)

	level_label = Label.new()
	level_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	level_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	top_bar.add_child(level_label)

	lives_label = Label.new()
	lives_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lives_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	top_bar.add_child(lives_label)

	stars_label = Label.new()
	stars_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	stars_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	top_bar.add_child(stars_label)

	# Castle area
	var castle_label := Label.new()
	castle_label.text = "Castle Garden"
	castle_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	castle_label.add_theme_font_size_override("font_size", 36)
	castle_label.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	castle_label.offset_top = -200
	castle_label.offset_bottom = -150
	add_child(castle_label)

	castle_progress = Label.new()
	castle_progress.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	castle_progress.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	castle_progress.offset_top = -100
	castle_progress.offset_bottom = -70
	add_child(castle_progress)

	# Task button
	task_button = Button.new()
	task_button.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	task_button.offset_top = -30
	task_button.offset_bottom = 20
	task_button.offset_left = -120
	task_button.offset_right = 120
	task_button.pressed.connect(_on_task_pressed)
	add_child(task_button)

	# Play button
	play_button = Button.new()
	play_button.text = "Play"
	play_button.add_theme_font_size_override("font_size", 28)
	play_button.set_anchors_and_offsets_preset(Control.PRESET_CENTER_BOTTOM)
	play_button.offset_top = -120
	play_button.offset_bottom = -60
	play_button.offset_left = -100
	play_button.offset_right = 100
	play_button.pressed.connect(_on_play_pressed)
	add_child(play_button)

func _update_ui() -> void:
	if level_label:
		level_label.text = "Lv.%d" % GameState.get_current_level()
	if coins_label:
		coins_label.text = "Coins:%d" % GameState.get_coins()
	if lives_label:
		lives_label.text = "Lives:%d" % LifeManager.get_lives()
	if stars_label:
		stars_label.text = "Stars:%d" % GameState.get_stars()
	if castle_progress:
		var prog := CastleManager.get_progress()
		castle_progress.text = "Progress: %d/%d" % [prog["completed"], prog["total"]]
	if task_button:
		var next := CastleManager.get_next_task()
		if next.is_empty():
			task_button.text = "Area Complete!"
			task_button.disabled = true
		else:
			task_button.text = "%s (Stars:%d)" % [next["name"], next["stars"]]
			task_button.disabled = not CastleManager.can_complete_task(next["id"])

func _on_play_pressed() -> void:
	if not LifeManager.has_lives():
		return
	LifeManager.use_life()
	var level := GameState.get_current_level()
	GameState.start_level(level)
	GameState.go_to_scene("game")

func _on_task_pressed() -> void:
	var next := CastleManager.get_next_task()
	if not next.is_empty():
		CastleManager.complete_task(next["id"])
		_update_ui()

func _show_daily_bonus() -> void:
	var reward := DailyBonus.claim()
	if reward.is_empty():
		return
	print("Daily Bonus Day %d: %s" % [DailyBonus.get_current_day(), str(reward)])
