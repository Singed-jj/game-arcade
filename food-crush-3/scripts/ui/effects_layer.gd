# scripts/ui/effects_layer.gd
extends CanvasLayer
class_name EffectsLayer

const BLOCK_COLORS := {
	0: Color(0.98, 0.57, 0.24),
	1: Color(0.97, 0.44, 0.44),
	2: Color(0.98, 0.75, 0.14),
	3: Color(0.63, 0.38, 0.04),
	4: Color(0.30, 0.87, 0.50),
}

func spawn_block_pop(world_pos: Vector2, block_type: int) -> void:
	var particles := CPUParticles2D.new()
	add_child(particles)
	particles.position = world_pos
	particles.emitting = true
	particles.one_shot = true
	particles.explosiveness = 1.0
	particles.amount = 12
	particles.lifetime = 0.6
	particles.direction = Vector2.ZERO
	particles.spread = 180.0
	particles.gravity = Vector2(0, 300)
	particles.initial_velocity_min = 80.0
	particles.initial_velocity_max = 200.0
	particles.scale_amount_min = 3.0
	particles.scale_amount_max = 6.0
	particles.color = BLOCK_COLORS.get(block_type, Color.WHITE)
	await get_tree().create_timer(1.0).timeout
	if is_instance_valid(particles):
		particles.queue_free()

func flash(color: Color = Color(1, 1, 1, 0.25)) -> void:
	var rect := ColorRect.new()
	add_child(rect)
	rect.color = color
	rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var tween := create_tween()
	tween.tween_property(rect, "modulate:a", 0.0, 0.2)
	tween.tween_callback(rect.queue_free)
