extends Node2D

## Manages visual effects: damage numbers, coin popups

func _ready() -> void:
	EventBus.enemy_killed.connect(_on_enemy_killed)

func spawn_damage_number(value: float, pos: Vector2, is_crit: bool = false) -> void:
	var dmg := Node2D.new()
	dmg.set_script(load("res://scenes/battle/damage_number.gd"))
	add_child(dmg)
	dmg.show_damage(value, pos, is_crit)

func _on_enemy_killed(pos: Vector2, coin_value: int) -> void:
	var popup := Node2D.new()
	popup.set_script(load("res://scenes/battle/coin_popup.gd"))
	add_child(popup)
	popup.show_coins(coin_value, pos)
