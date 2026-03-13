# scripts/screens/gacha_screen.gd
extends Control

const REEL_ITEMS := ["🚀", "💣", "🎟", "🚀", "🍗", "💣", "🌈", "🍗", "🚀"]

func _ready() -> void:
	var result = PieceManager.use_for_gacha()
	if result == null:
		EventBus.change_screen("map")
		return
	_apply_result(result)
	_build(result)

func _apply_result(result: Dictionary) -> void:
	match result["type"]:
		"tool1":
			var tool_key: String = result["tools"][0]
			var tool_type := 0 if tool_key == "ROCKET" else 1
			ToolManager.add_tool(tool_type)
		"tool3":
			ToolManager.add_tool(0)  # ROCKET
			ToolManager.add_tool(1)  # BOMB
			ToolManager.add_tool(2)  # RAINBOW

func _build(result: Dictionary) -> void:
	var bg := ColorRect.new()
	bg.color = Color(0.1, 0.03, 0.2)
	bg.layout_mode = 1
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	var vbox := VBoxContainer.new()
	vbox.layout_mode = 1
	vbox.set_anchors_preset(Control.PRESET_CENTER)
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.add_theme_constant_override("separation", 28)
	add_child(vbox)

	var title := Label.new()
	title.text = "🎰 GACHA!"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 36)
	title.add_theme_color_override("font_color", Color(1, 0.85, 0.1))
	vbox.add_child(title)

	# 릴 디스플레이
	var reel_panel := PanelContainer.new()
	reel_panel.custom_minimum_size = Vector2(200, 80)
	vbox.add_child(reel_panel)

	var reel_label := Label.new()
	reel_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	reel_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	reel_label.add_theme_font_size_override("font_size", 52)
	reel_panel.add_child(reel_label)

	# 결과 레이블
	var result_label := Label.new()
	result_label.text = ""
	result_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	result_label.add_theme_font_size_override("font_size", 26)
	result_label.add_theme_color_override("font_color", Color(0.9, 1, 0.9))
	vbox.add_child(result_label)

	# 확인 버튼
	var ok_btn := Button.new()
	ok_btn.text = "확인"
	ok_btn.custom_minimum_size = Vector2(200, 56)
	ok_btn.add_theme_font_size_override("font_size", 20)
	ok_btn.disabled = true
	ok_btn.pressed.connect(func(): EventBus.change_screen("map"))
	vbox.add_child(ok_btn)

	# 릴 애니메이션
	var target_emoji := _target_emoji(result)
	var result_text := _result_text(result)

	_animate_reel(reel_label, result_label, ok_btn, target_emoji, result_text)

func _animate_reel(reel_lbl: Label, result_lbl: Label, ok_btn: Button,
		target: String, result_text: String) -> void:
	var tween := create_tween()
	for i in range(18):
		var interval := 0.04 + i * 0.012
		tween.tween_callback(func():
			reel_lbl.text = REEL_ITEMS[i % REEL_ITEMS.size()]
		)
		tween.tween_interval(interval)
	tween.tween_callback(func():
		reel_lbl.text = target
		reel_lbl.add_theme_color_override("font_color", Color(1, 1, 0.5))
		result_lbl.text = result_text
		ok_btn.disabled = false
		SoundManager.play("clear")
	)

func _target_emoji(result: Dictionary) -> String:
	match result["type"]:
		"tool1": return "🚀" if result["tools"][0] == "ROCKET" else "💣"
		"tool3": return "🎟"
		"coupon1000", "coupon2000": return "🎟"
		_: return "🍗"

func _result_text(result: Dictionary) -> String:
	match result["type"]:
		"tool1":
			return "🚀 로켓 획득!" if result["tools"][0] == "ROCKET" else "💣 폭탄 획득!"
		"tool3": return "🚀💣🌈 도구 3종 획득!"
		"coupon1000": return "🎟 1000 쿠폰!"
		"coupon2000": return "🎟 2000 쿠폰!"
		_: return "🍗 치킨~"
