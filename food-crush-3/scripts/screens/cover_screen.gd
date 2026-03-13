# scripts/screens/cover_screen.gd
extends Control

func _ready() -> void:
	_build()

func _build() -> void:
	# 배경
	var bg := TextureRect.new()
	bg.texture = load("res://assets/bg/game-bg.png")
	bg.layout_mode = 1
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	add_child(bg)

	# 타이틀 컨테이너
	var center := VBoxContainer.new()
	center.layout_mode = 1
	center.set_anchors_preset(Control.PRESET_CENTER)
	center.alignment = BoxContainer.ALIGNMENT_CENTER
	add_child(center)

	# 게임 로고 (chicken 아이콘)
	var logo := TextureRect.new()
	logo.texture = load("res://assets/blocks/chicken.png")
	logo.custom_minimum_size = Vector2(100, 100)
	logo.expand_mode = TextureRect.EXPAND_FIT_WIDTH_PROPORTIONAL
	logo.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	center.add_child(logo)

	var title := Label.new()
	title.text = "Food Crush 3"
	title.add_theme_font_size_override("font_size", 40)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_color_override("font_color", Color(1, 0.9, 0.2))
	center.add_child(title)

	var spacer := Control.new()
	spacer.custom_minimum_size = Vector2(0, 40)
	center.add_child(spacer)

	var start_btn := Button.new()
	start_btn.text = "TAP TO START"
	start_btn.custom_minimum_size = Vector2(200, 56)
	start_btn.add_theme_font_size_override("font_size", 20)
	start_btn.pressed.connect(func(): EventBus.change_screen("map"))
	center.add_child(start_btn)
