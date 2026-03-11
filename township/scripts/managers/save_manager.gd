extends Node
## Persists game state to localStorage (web) or user://save.json (native).

const SAVE_KEY := "township_save"
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

func get_val(key: String, default_value = null):
	return data.get(key, default_value)

func set_val(key: String, value) -> void:
	data[key] = value
	save_game()

func _is_web() -> bool:
	return OS.has_feature("web")

func _default_data() -> Dictionary:
	return {
		"_version": SAVE_VERSION,
		"level": 1,
		"xp": 0,
		"coins": 200,
		"inventory": {},
		"storage_capacity": 20,
		"buildings": [],
		"orders": [],
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
