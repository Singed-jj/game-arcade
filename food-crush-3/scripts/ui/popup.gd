# scripts/ui/popup.gd
extends Control
class_name GamePopup

signal confirmed
signal cancelled

func _ready() -> void:
	_build_ui()
	visible = false

func _build_ui() -> void:
	# 반투명 배경
	var bg := ColorRect.new()
	bg.color = Color(0, 0, 0, 0.6)
	bg.layout_mode = 1
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	# 팝업 패널
	var panel := PanelContainer.new()
	panel.layout_mode = 1
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.custom_minimum_size = Vector2(280, 160)
	add_child(panel)

	var vbox := VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	panel.add_child(vbox)

	var title_lbl := Label.new()
	title_lbl.name = "TitleLabel"
	title_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_lbl.add_theme_font_size_override("font_size", 20)
	vbox.add_child(title_lbl)

	var msg_lbl := Label.new()
	msg_lbl.name = "MessageLabel"
	msg_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	msg_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD
	vbox.add_child(msg_lbl)

	var hbox := HBoxContainer.new()
	hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.add_child(hbox)

	var ok_btn := Button.new()
	ok_btn.name = "OkBtn"
	ok_btn.text = "확인"
	ok_btn.custom_minimum_size = Vector2(100, 44)
	ok_btn.pressed.connect(func(): confirmed.emit(); queue_free())
	hbox.add_child(ok_btn)

	var cancel_btn := Button.new()
	cancel_btn.name = "CancelBtn"
	cancel_btn.text = "취소"
	cancel_btn.custom_minimum_size = Vector2(100, 44)
	cancel_btn.visible = false
	cancel_btn.pressed.connect(func(): cancelled.emit(); queue_free())
	hbox.add_child(cancel_btn)

func show_popup(title: String, message: String, ok_text := "확인", cancel_text := "") -> void:
	var title_lbl := find_child("TitleLabel", true, false)
	var msg_lbl := find_child("MessageLabel", true, false)
	var ok_btn := find_child("OkBtn", true, false)
	var cancel_btn := find_child("CancelBtn", true, false)
	if title_lbl: title_lbl.text = title
	if msg_lbl: msg_lbl.text = message
	if ok_btn: ok_btn.text = ok_text
	if cancel_btn:
		cancel_btn.visible = cancel_text != ""
		cancel_btn.text = cancel_text
	visible = true
