# scripts/screens/no_hearts_screen.gd
extends Control

var _timer_label: Label

func _ready() -> void:
	_build()
	set_process(true)

func _build() -> void:
	var bg := ColorRect.new()
	bg.color = Color(0.05, 0.05, 0.15)
	bg.layout_mode = 1
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	var vbox := VBoxContainer.new()
	vbox.layout_mode = 1
	vbox.set_anchors_preset(Control.PRESET_CENTER)
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.add_theme_constant_override("separation", 20)
	add_child(vbox)

	var title := Label.new()
	title.text = "♥ 하트가 없습니다"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 32)
	title.add_theme_color_override("font_color", Color(1, 0.3, 0.4))
	vbox.add_child(title)

	var desc := Label.new()
	desc.text = "잠시 후 하트가 자동으로 회복됩니다."
	desc.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	desc.add_theme_font_size_override("font_size", 16)
	vbox.add_child(desc)

	_timer_label = Label.new()
	_timer_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_timer_label.add_theme_font_size_override("font_size", 36)
	_timer_label.add_theme_color_override("font_color", Color(0.9, 0.9, 0.3))
	vbox.add_child(_timer_label)

	var map_btn := Button.new()
	map_btn.text = "맵으로 돌아가기"
	map_btn.custom_minimum_size = Vector2(240, 52)
	map_btn.add_theme_font_size_override("font_size", 18)
	map_btn.pressed.connect(func(): EventBus.change_screen("map"))
	vbox.add_child(map_btn)

func _process(_delta: float) -> void:
	var sec := HeartManager.get_recovery_sec()
	if sec <= 0:
		if _timer_label:
			_timer_label.text = "회복 완료!"
		return
	var m := int(sec) / 60
	var s := int(sec) % 60
	if _timer_label:
		_timer_label.text = "%02d:%02d 후 회복" % [m, s]
