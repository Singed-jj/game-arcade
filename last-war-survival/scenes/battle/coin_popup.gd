extends Node2D

## Coin pickup visual - shows "+N" floating up from killed enemy

func show_coins(value: int, pos: Vector2) -> void:
	position = pos
	var label := Label.new()
	label.text = "+%d" % value
	label.add_theme_color_override("font_color", Color(0.965, 0.678, 0.333)) # #F6AD55
	add_child(label)

	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(self, "position:y", position.y - 50.0, 0.8)
	tween.tween_property(label, "modulate:a", 0.0, 0.8).set_delay(0.3)
	tween.chain().tween_callback(queue_free)
