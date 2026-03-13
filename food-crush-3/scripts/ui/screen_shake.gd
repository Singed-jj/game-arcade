# scripts/ui/screen_shake.gd
extends Node
class_name ScreenShake

var _target: Control
var _origin := Vector2.ZERO
var _is_shaking := false

func setup(target: Control) -> void:
	_target = target
	_origin = target.position

func shake(intensity: float, duration: float = 0.3) -> void:
	if not _target or _is_shaking:
		return
	_is_shaking = true
	var tween := _target.create_tween()
	var steps := max(1, int(duration / 0.04))
	for i in range(steps):
		var decay := 1.0 - float(i) / float(steps)
		var offset := Vector2(
			randf_range(-intensity, intensity) * decay,
			randf_range(-intensity, intensity) * decay
		)
		tween.tween_property(_target, "position", _origin + offset, 0.04)
	tween.tween_property(_target, "position", _origin, 0.04)
	tween.tween_callback(func(): _is_shaking = false)
