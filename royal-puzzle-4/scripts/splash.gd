extends Control

func _ready() -> void:
	await get_tree().create_timer(1.5).timeout
	GameState.go_to_scene("home")
