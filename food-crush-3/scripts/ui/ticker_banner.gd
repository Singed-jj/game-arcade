# scripts/ui/ticker_banner.gd
extends Label
class_name TickerBanner

const CASCADE_CONFIG := [
	{},
	{},
	{"text": "Good!",         "font_size": 24, "shake": 2},
	{"text": "Great!!",       "font_size": 32, "shake": 4},
	{"text": "Amazing!!!",    "font_size": 40, "shake": 6},
	{"text": "INCREDIBLE!!!", "font_size": 48, "shake": 8},
]

func _ready() -> void:
	horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	visible = false

func show_cascade(count: int) -> void:
	var idx := min(count, CASCADE_CONFIG.size() - 1)
	if idx < 2:
		visible = false
		return
	var cfg: Dictionary = CASCADE_CONFIG[idx]
	if cfg.is_empty():
		visible = false
		return
	text = cfg["text"]
	add_theme_font_size_override("font_size", cfg["font_size"])
	modulate = Color.WHITE
	visible = true
	scale = Vector2(0.5, 0.5)
	var tween := create_tween()
	tween.tween_property(self, "scale", Vector2.ONE, 0.12).set_ease(Tween.EASE_OUT)
	tween.tween_interval(0.5)
	tween.tween_property(self, "modulate:a", 0.0, 0.25)
	tween.tween_callback(func(): visible = false; scale = Vector2.ONE)
