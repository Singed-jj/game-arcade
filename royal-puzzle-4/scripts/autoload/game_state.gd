extends Node

var current_level_data: Resource = null
var is_playing := false
var is_nightmare := false

func get_current_level() -> int:
	return SaveManager.get_current_level()

func get_coins() -> int:
	return SaveManager.get_coins()

func get_lives() -> int:
	return SaveManager.get_lives()

func get_stars() -> int:
	return SaveManager.get_stars()

func start_level(level_number: int) -> void:
	var path := "res://resources/levels/level_%03d.tres" % level_number
	if ResourceLoader.exists(path):
		current_level_data = load(path)
	is_playing = true
	is_nightmare = false
	GameEvents.level_started.emit(level_number)

func complete_level(level_number: int, remaining_moves: int) -> void:
	is_playing = false
	SaveManager.add_stars(1)
	var coin_reward := 20 + (remaining_moves * 5)
	SaveManager.add_coins(coin_reward)
	if level_number >= SaveManager.get_current_level():
		SaveManager.set_current_level(level_number + 1)
	GameEvents.level_completed.emit(level_number, remaining_moves)

func fail_level(level_number: int) -> void:
	is_playing = false
	SaveManager.set_lives(SaveManager.get_lives() - 1)
	GameEvents.level_failed.emit(level_number)

func start_nightmare(scenario_id: String) -> void:
	is_playing = true
	is_nightmare = true
	GameEvents.nightmare_started.emit(scenario_id)

func complete_nightmare(scenario_id: String, reward: int) -> void:
	is_playing = false
	is_nightmare = false
	SaveManager.complete_nightmare(scenario_id)
	SaveManager.add_coins(reward)
	GameEvents.nightmare_completed.emit(scenario_id, reward)

func go_to_scene(scene_name: String, params: Dictionary = {}) -> void:
	GameEvents.scene_change_requested.emit(scene_name, params)
