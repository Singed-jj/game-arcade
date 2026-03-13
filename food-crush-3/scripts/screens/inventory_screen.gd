# scripts/screens/inventory_screen.gd
extends Control

func _ready() -> void:
	_build()

func _build() -> void:
	var bg := ColorRect.new()
	bg.color = Color(0.07, 0.07, 0.15)
	bg.layout_mode = 1
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	var vbox := VBoxContainer.new()
	vbox.layout_mode = 1
	vbox.set_anchors_preset(Control.PRESET_CENTER)
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.add_theme_constant_override("separation", 20)
	vbox.custom_minimum_size = Vector2(300, 0)
	add_child(vbox)

	var title := Label.new()
	title.text = "🎒 인벤토리"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 32)
	vbox.add_child(title)

	# 도구 목록
	var tool_names := ["🚀 로켓", "💣 폭탄", "🌈 무지개"]
	var tool_descs := ["한 줄 전체 제거", "3×3 범위 제거", "같은 종류 전부 제거"]

	for i in range(3):
		var panel := PanelContainer.new()
		panel.custom_minimum_size = Vector2(0, 60)
		vbox.add_child(panel)

		var hbox := HBoxContainer.new()
		hbox.add_theme_constant_override("separation", 16)
		panel.add_child(hbox)

		var icon_lbl := Label.new()
		icon_lbl.text = tool_names[i]
		icon_lbl.add_theme_font_size_override("font_size", 24)
		icon_lbl.custom_minimum_size = Vector2(120, 0)
		hbox.add_child(icon_lbl)

		var desc_vbox := VBoxContainer.new()
		desc_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		hbox.add_child(desc_vbox)
		var desc_lbl := Label.new()
		desc_lbl.text = tool_descs[i]
		desc_lbl.add_theme_font_size_override("font_size", 13)
		desc_lbl.add_theme_color_override("font_color", Color(0.75, 0.75, 0.75))
		desc_vbox.add_child(desc_lbl)

		var count_lbl := Label.new()
		count_lbl.text = "보유: %d개" % ToolManager.get_count(i)
		count_lbl.add_theme_font_size_override("font_size", 18)
		hbox.add_child(count_lbl)

	# 뽑기 조각
	var sep := HSeparator.new()
	vbox.add_child(sep)

	var piece_hbox := HBoxContainer.new()
	piece_hbox.add_theme_constant_override("separation", 12)
	vbox.add_child(piece_hbox)

	var piece_icon := Label.new()
	piece_icon.text = "🧩"
	piece_icon.add_theme_font_size_override("font_size", 28)
	piece_hbox.add_child(piece_icon)

	var piece_info := VBoxContainer.new()
	piece_info.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	piece_hbox.add_child(piece_info)

	var piece_title := Label.new()
	piece_title.text = "뽑기 조각"
	piece_title.add_theme_font_size_override("font_size", 18)
	piece_info.add_child(piece_title)

	var piece_count := Label.new()
	piece_count.text = "%d / %d" % [PieceManager.get_pieces(), PieceManager.PIECES_FOR_GACHA]
	piece_count.add_theme_font_size_override("font_size", 22)
	piece_info.add_child(piece_count)

	# 뒤로
	var back_btn := Button.new()
	back_btn.text = "← 뒤로"
	back_btn.custom_minimum_size = Vector2(200, 52)
	back_btn.add_theme_font_size_override("font_size", 18)
	back_btn.pressed.connect(func(): EventBus.change_screen("map"))
	vbox.add_child(back_btn)
