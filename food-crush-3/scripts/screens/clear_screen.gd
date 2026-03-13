# scripts/screens/clear_screen.gd
extends Control

var _level := 1
var _stars := 1

func setup(data: Dictionary) -> void:
	_level = data.get("level", 1)
	_stars = data.get("stars", 1)

func _ready() -> void:
	_build()

func _build() -> void:
	var bg := ColorRect.new()
	bg.color = Color(0.08, 0.05, 0.18)
	bg.layout_mode = 1
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	var vbox := VBoxContainer.new()
	vbox.layout_mode = 1
	vbox.set_anchors_preset(Control.PRESET_CENTER)
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.add_theme_constant_override("separation", 20)
	add_child(vbox)

	# 클리어 타이틀
	var title := Label.new()
	title.text = "STAGE CLEAR!"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 42)
	title.add_theme_color_override("font_color", Color(1, 0.9, 0.1))
	vbox.add_child(title)

	var level_label := Label.new()
	level_label.text = "Stage %d" % _level
	level_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	level_label.add_theme_font_size_override("font_size", 22)
	vbox.add_child(level_label)

	# 별 표시 (애니메이션)
	var stars_hbox := HBoxContainer.new()
	stars_hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	stars_hbox.add_theme_constant_override("separation", 8)
	vbox.add_child(stars_hbox)

	for i in range(3):
		var star_lbl := Label.new()
		star_lbl.text = "★"
		star_lbl.add_theme_font_size_override("font_size", 48)
		star_lbl.add_theme_color_override("font_color",
			Color(1, 0.85, 0.0) if i < _stars else Color(0.35, 0.35, 0.35))
		star_lbl.modulate.a = 0.0
		stars_hbox.add_child(star_lbl)
		# 순차 페이드인
		var tween := create_tween()
		tween.tween_interval(0.3 + i * 0.25)
		tween.tween_property(star_lbl, "modulate:a", 1.0, 0.3)
		if i < _stars:
			tween.tween_property(star_lbl, "scale", Vector2(1.3, 1.3), 0.1)
			tween.tween_property(star_lbl, "scale", Vector2.ONE, 0.1)

	# 버튼 영역
	var btn_vbox := VBoxContainer.new()
	btn_vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	btn_vbox.add_theme_constant_override("separation", 12)
	vbox.add_child(btn_vbox)

	var next_btn := Button.new()
	next_btn.text = "다음 스테이지 →"
	next_btn.custom_minimum_size = Vector2(240, 56)
	next_btn.add_theme_font_size_override("font_size", 20)
	next_btn.pressed.connect(func():
		SoundManager.play("swap")
		EventBus.change_screen("game", {"level": _level + 1})
	)
	btn_vbox.add_child(next_btn)

	var map_btn := Button.new()
	map_btn.text = "맵으로 돌아가기"
	map_btn.custom_minimum_size = Vector2(240, 48)
	map_btn.add_theme_font_size_override("font_size", 17)
	map_btn.pressed.connect(func(): EventBus.change_screen("map"))
	btn_vbox.add_child(map_btn)

	# 별 사운드 딜레이
	await get_tree().create_timer(0.2).timeout
	SoundManager.play("star")
