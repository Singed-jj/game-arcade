# scripts/screens/fail_screen.gd
extends Control

var _level := 1

func setup(data: Dictionary) -> void:
	_level = data.get("level", 1)

func _ready() -> void:
	_build()

func _build() -> void:
	var bg := ColorRect.new()
	bg.color = Color(0.12, 0.03, 0.03)
	bg.layout_mode = 1
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	var vbox := VBoxContainer.new()
	vbox.layout_mode = 1
	vbox.set_anchors_preset(Control.PRESET_CENTER)
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.add_theme_constant_override("separation", 24)
	add_child(vbox)

	var title := Label.new()
	title.text = "STAGE FAILED"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 40)
	title.add_theme_color_override("font_color", Color(1, 0.3, 0.3))
	vbox.add_child(title)

	var level_label := Label.new()
	level_label.text = "Stage %d" % _level
	level_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	level_label.add_theme_font_size_override("font_size", 20)
	vbox.add_child(level_label)

	var hint_label := Label.new()
	hint_label.text = "조각이 필요하다면 뽑기로 도구를 획득해보세요!"
	hint_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	hint_label.add_theme_font_size_override("font_size", 14)
	hint_label.add_theme_color_override("font_color", Color(0.8, 0.8, 0.8))
	hint_label.autowrap_mode = TextServer.AUTOWRAP_WORD
	hint_label.custom_minimum_size = Vector2(300, 0)
	vbox.add_child(hint_label)

	var btn_vbox := VBoxContainer.new()
	btn_vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	btn_vbox.add_theme_constant_override("separation", 12)
	vbox.add_child(btn_vbox)

	var retry_btn := Button.new()
	retry_btn.text = "다시 도전!"
	retry_btn.custom_minimum_size = Vector2(240, 56)
	retry_btn.add_theme_font_size_override("font_size", 20)
	retry_btn.pressed.connect(func(): EventBus.change_screen("game", {"level": _level}))
	btn_vbox.add_child(retry_btn)

	var map_btn := Button.new()
	map_btn.text = "맵으로"
	map_btn.custom_minimum_size = Vector2(240, 48)
	map_btn.add_theme_font_size_override("font_size", 17)
	map_btn.pressed.connect(func(): EventBus.change_screen("map"))
	btn_vbox.add_child(map_btn)
