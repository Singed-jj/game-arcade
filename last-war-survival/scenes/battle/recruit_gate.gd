extends Area2D

## Recruit gate - adds or removes soldiers when army passes through

@export var soldier_count: int = 5
var _used: bool = false

func _ready() -> void:
	collision_layer = 4
	collision_mask = 1
	body_entered.connect(_on_body_entered)
	queue_redraw()

func _draw() -> void:
	var color: Color
	var text: String
	if soldier_count > 0:
		color = Color(0.282, 0.733, 0.471, 0.8) # green
		text = "+%d" % soldier_count
	else:
		color = Color(0.898, 0.243, 0.243, 0.8) # red
		text = "%d" % soldier_count

	# Gate background
	draw_rect(Rect2(-30, -20, 60, 40), color)
	# Border
	draw_rect(Rect2(-30, -20, 60, 40), Color.WHITE, false, 2.0)

func _on_body_entered(body: Node2D) -> void:
	if _used:
		return
	if not body.is_in_group("soldiers"):
		return
	_used = true

	var army: Node2D = get_tree().get_first_node_in_group("player_army")
	if army and army.has_method("add_soldiers") and soldier_count > 0:
		army.add_soldiers(soldier_count)
	elif army and soldier_count < 0:
		var to_remove: int = absi(soldier_count)
		var soldiers: Array = get_tree().get_nodes_in_group("soldiers")
		for i in range(mini(to_remove, soldiers.size())):
			if is_instance_valid(soldiers[i]):
				soldiers[i].take_damage(9999.0)

	queue_free()
