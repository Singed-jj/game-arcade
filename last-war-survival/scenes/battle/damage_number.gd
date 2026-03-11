extends Node2D

## Floating damage number that pops up and fades

func show_damage(value: float, pos: Vector2, is_crit: bool = false) -> void:
	position = pos + Vector2(randf_range(-10, 10), -10)
	var label := Label.new()
	label.text = str(int(value))
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	if is_crit:
		label.add_theme_color_override("font_color", Color(1.0, 0.8, 0.2))
	else:
		label.add_theme_color_override("font_color", Color.WHITE)
	add_child(label)

	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(self, "position:y", position.y - 40.0, 0.6)
	tween.tween_property(label, "modulate:a", 0.0, 0.6).set_delay(0.2)
	tween.chain().tween_callback(queue_free)
