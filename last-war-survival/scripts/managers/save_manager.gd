extends Node

const SAVE_KEY := "last_war_save"
const SAVE_VERSION := 1

var data := {}

func _ready() -> void:
	load_game()

# --- Public API ---

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

# --- Stage Progress ---

func get_current_stage() -> int:
	return data.get("stage_current", 1)

func set_current_stage(stage: int) -> void:
	data["stage_current"] = stage
	if stage > get_max_cleared_stage():
		data["stage_max_cleared"] = stage
	save_game()

func get_max_cleared_stage() -> int:
	return data.get("stage_max_cleared", 0)

# --- Currencies ---

func get_currency(currency_name: String) -> int:
	var currencies: Dictionary = data.get("currencies", {})
	return currencies.get(currency_name, 0)

func add_currency(currency_name: String, amount: int) -> void:
	if not data.has("currencies"):
		data["currencies"] = {}
	var current: int = data["currencies"].get(currency_name, 0)
	data["currencies"][currency_name] = current + amount
	save_game()

func spend_currency(currency_name: String, amount: int) -> bool:
	var current := get_currency(currency_name)
	if current < amount:
		return false
	data["currencies"][currency_name] = current - amount
	save_game()
	return true

# --- Upgrades ---

func get_upgrade_level(upgrade_name: String) -> int:
	var upgrades: Dictionary = data.get("upgrades", {})
	return upgrades.get(upgrade_name, 0)

func set_upgrade_level(upgrade_name: String, level: int) -> void:
	if not data.has("upgrades"):
		data["upgrades"] = {}
	data["upgrades"][upgrade_name] = level
	save_game()

# --- Internal ---

func _is_web() -> bool:
	return OS.has_feature("web")

func _default_data() -> Dictionary:
	return {
		"_version": SAVE_VERSION,
		"stage_current": 1,
		"stage_max_cleared": 0,
		"currencies": {"coins": 0},
		"upgrades": {"hp": 0, "attack": 0, "army_size": 0},
		"player_state": {},
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
