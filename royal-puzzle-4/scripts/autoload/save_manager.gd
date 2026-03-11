extends Node

const SAVE_KEY := "royal_puzzle_4_save"
const SAVE_VERSION := 1

var data := {}

func _ready() -> void:
	load_game()

func save_game() -> void:
	data["_version"] = SAVE_VERSION
	data["_saved_at"] = Time.get_datetime_string_from_system()
	var json_str := JSON.stringify(data)
	if _is_web():
		JavaScriptBridge.eval("localStorage.setItem('%s', '%s')" % [SAVE_KEY, json_str.c_escape()])
	else:
		_save_to_file(json_str)

func load_game() -> void:
	if _is_web():
		var raw = JavaScriptBridge.eval("localStorage.getItem('%s')" % SAVE_KEY)
		if raw != null and raw is String and raw != "":
			var parsed = JSON.parse_string(raw)
			if parsed is Dictionary:
				data = parsed
				return
	else:
		_load_from_file()
		return
	data = _default_data()

func clear_save() -> void:
	data = _default_data()
	if _is_web():
		JavaScriptBridge.eval("localStorage.removeItem('%s')" % SAVE_KEY)
	else:
		var path := "user://save.json"
		if FileAccess.file_exists(path):
			DirAccess.remove_absolute(path)

func get_current_level() -> int:
	return data.get("current_level", 1)

func set_current_level(level: int) -> void:
	data["current_level"] = level
	save_game()

func get_coins() -> int:
	return data.get("coins", 0)

func add_coins(amount: int) -> void:
	data["coins"] = get_coins() + amount
	save_game()
	GameEvents.coins_changed.emit(get_coins())

func spend_coins(amount: int) -> bool:
	if get_coins() < amount:
		return false
	data["coins"] = get_coins() - amount
	save_game()
	GameEvents.coins_changed.emit(get_coins())
	return true

func get_lives() -> int:
	return data.get("lives", 5)

func set_lives(amount: int) -> void:
	data["lives"] = clampi(amount, 0, 5)
	save_game()
	GameEvents.lives_changed.emit(get_lives())

func get_lives_recovery_timestamp() -> int:
	return data.get("lives_recovery_timestamp", 0)

func set_lives_recovery_timestamp(ts: int) -> void:
	data["lives_recovery_timestamp"] = ts
	save_game()

func get_stars() -> int:
	return data.get("stars", 0)

func add_stars(amount: int) -> void:
	data["stars"] = get_stars() + amount
	save_game()
	GameEvents.stars_changed.emit(get_stars())

func spend_stars(amount: int) -> bool:
	if get_stars() < amount:
		return false
	data["stars"] = get_stars() - amount
	save_game()
	GameEvents.stars_changed.emit(get_stars())
	return true

func get_completed_tasks() -> Array:
	return data.get("castle_tasks_completed", [])

func complete_task(task_id: String) -> void:
	var tasks: Array = get_completed_tasks()
	if task_id not in tasks:
		tasks.append(task_id)
		data["castle_tasks_completed"] = tasks
		save_game()

func get_completed_nightmares() -> Array:
	return data.get("nightmare_completed", [])

func complete_nightmare(scenario_id: String) -> void:
	var completed: Array = get_completed_nightmares()
	if scenario_id not in completed:
		completed.append(scenario_id)
		data["nightmare_completed"] = completed
		save_game()

func get_daily_bonus_day() -> int:
	return data.get("daily_bonus_day", 0)

func get_daily_bonus_last_claim() -> String:
	return data.get("daily_bonus_last_claim", "")

func set_daily_bonus(day: int, date_str: String) -> void:
	data["daily_bonus_day"] = day
	data["daily_bonus_last_claim"] = date_str
	save_game()

func get_setting(key: String, default_value = true):
	var settings: Dictionary = data.get("settings", {})
	return settings.get(key, default_value)

func set_setting(key: String, value) -> void:
	if not data.has("settings"):
		data["settings"] = {}
	data["settings"][key] = value
	save_game()

func get_unlocked_boosters() -> Array:
	return data.get("unlocked_boosters", [])

func unlock_booster(booster_id: String) -> void:
	var boosters: Array = get_unlocked_boosters()
	if booster_id not in boosters:
		boosters.append(booster_id)
		data["unlocked_boosters"] = boosters
		save_game()

func _is_web() -> bool:
	return OS.has_feature("web")

func _default_data() -> Dictionary:
	return {
		"_version": SAVE_VERSION,
		"current_level": 1,
		"coins": 0,
		"lives": 5,
		"lives_recovery_timestamp": 0,
		"stars": 0,
		"castle_tasks_completed": [],
		"daily_bonus_day": 0,
		"daily_bonus_last_claim": "",
		"unlocked_boosters": [],
		"nightmare_completed": [],
		"settings": {"sfx": true, "bgm": true},
	}

func _save_to_file(json_str: String) -> void:
	var file := FileAccess.open("user://save.json", FileAccess.WRITE)
	if file:
		file.store_string(json_str)

func _load_from_file() -> void:
	var path := "user://save.json"
	if not FileAccess.file_exists(path):
		data = _default_data()
		return
	var file := FileAccess.open(path, FileAccess.READ)
	if file:
		var parsed = JSON.parse_string(file.get_as_text())
		if parsed is Dictionary:
			data = parsed
			return
	data = _default_data()
