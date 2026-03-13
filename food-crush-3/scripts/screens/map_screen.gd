# scripts/screens/map_screen.gd
extends Control

func _ready() -> void:
	_build()
	EventBus.on("heart:changed", _on_heart_changed)

func _build() -> void:
	# 배경
	var bg := TextureRect.new()
	bg.texture = load("res://assets/bg/stage-map.png")
	bg.layout_mode = 1
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	add_child(bg)

	# 상단 바
	var top_bar := HBoxContainer.new()
	top_bar.layout_mode = 1
	top_bar.set_anchors_preset(Control.PRESET_TOP_WIDE)
	top_bar.custom_minimum_size = Vector2(0, 60)
	add_child(top_bar)

	# 하트 표시
	var heart_hbox := HBoxContainer.new()
	heart_hbox.name = "HeartBox"
	heart_hbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	heart_hbox.alignment = BoxContainer.ALIGNMENT_END
	_populate_hearts(heart_hbox)
	top_bar.add_child(heart_hbox)

	# 인벤토리 버튼
	var inv_btn := Button.new()
	inv_btn.text = "🎒"
	inv_btn.custom_minimum_size = Vector2(48, 48)
	inv_btn.pressed.connect(func(): EventBus.change_screen("inventory"))
	top_bar.add_child(inv_btn)

	# 스크롤 스테이지 목록
	var scroll := ScrollContainer.new()
	scroll.layout_mode = 1
	scroll.anchor_top = 0.08
	scroll.anchor_right = 1.0
	scroll.anchor_bottom = 1.0
	scroll.grow_vertical = Control.GROW_DIRECTION_END
	add_child(scroll)

	var vbox := VBoxContainer.new()
	vbox.custom_minimum_size = Vector2(390, 0)
	vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(vbox)

	var unlocked := SaveManager.get_unlocked_level()
	var max_show := min(unlocked + 2, 99)

	for level in range(1, max_show + 1):
		var btn := _make_stage_btn(level, unlocked)
		vbox.add_child(btn)

	# 뽑기 버튼
	var pieces := PieceManager.get_pieces()
	var gacha_btn := Button.new()
	gacha_btn.text = "🎰 뽑기  [%d/%d 조각]" % [pieces, PieceManager.PIECES_FOR_GACHA]
	gacha_btn.custom_minimum_size = Vector2(0, 60)
	gacha_btn.add_theme_font_size_override("font_size", 18)
	gacha_btn.disabled = pieces < PieceManager.PIECES_FOR_GACHA
	gacha_btn.pressed.connect(func(): EventBus.change_screen("gacha"))
	vbox.add_child(gacha_btn)

func _make_stage_btn(level: int, unlocked: int) -> Button:
	var btn := Button.new()
	var stars := SaveManager.get_level_stars(level)
	var star_str := "★".repeat(stars) + "☆".repeat(3 - stars)
	btn.text = "Stage %d   %s" % [level, star_str]
	btn.custom_minimum_size = Vector2(0, 56)
	btn.add_theme_font_size_override("font_size", 18)
	btn.disabled = level > unlocked
	if not btn.disabled:
		btn.pressed.connect(func(): EventBus.change_screen("game", {"level": level}))
	return btn

func _populate_hearts(hbox: HBoxContainer) -> void:
	for child in hbox.get_children():
		child.queue_free()
	var hearts := HeartManager.get_hearts()
	for i in range(HeartManager.MAX_HEARTS):
		var icon := Label.new()
		icon.text = "♥"
		icon.add_theme_font_size_override("font_size", 28)
		icon.add_theme_color_override("font_color",
			Color(1, 0.2, 0.3) if i < hearts else Color(0.4, 0.4, 0.4))
		hbox.add_child(icon)

func _on_heart_changed(_data: Dictionary) -> void:
	var hbox := find_child("HeartBox", true, false)
	if hbox:
		_populate_hearts(hbox)

func _exit_tree() -> void:
	EventBus.off("heart:changed", _on_heart_changed)
