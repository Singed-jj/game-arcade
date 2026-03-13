# scripts/autoload/save_manager.gd
extends Node

const SAVE_KEY := "food-crush-3-save"

var _data: Dictionary = {
	"unlockedLevel": 1,
	"hearts": 3,
	"heartsLastUsedAt": 0.0,
	"pieces": 0,
	"tools": {"rocket": 0, "bomb": 0, "rainbow": 0},
	"levelStars": {},
}

func _ready() -> void:
	load_save()

func load_save() -> void:
	var raw := ""
	if OS.has_feature("web"):
		raw = JavaScriptBridge.eval("localStorage.getItem('%s') || ''" % SAVE_KEY)
	else:
		if FileAccess.file_exists("user://save.json"):
			var f := FileAccess.open("user://save.json", FileAccess.READ)
			if f:
				raw = f.get_as_text()

	if raw != "":
		var parsed = JSON.parse_string(raw)
		if parsed is Dictionary:
			for key in parsed:
				_data[key] = parsed[key]

func save() -> void:
	var json := JSON.stringify(_data)
	if OS.has_feature("web"):
		var escaped := json.replace("\\", "\\\\").replace("'", "\\'")
		JavaScriptBridge.eval("localStorage.setItem('%s', '%s')" % [SAVE_KEY, escaped])
	else:
		var f := FileAccess.open("user://save.json", FileAccess.WRITE)
		if f:
			f.store_string(json)

func clear_save() -> void:
	_data = {
		"unlockedLevel": 1, "hearts": 3, "heartsLastUsedAt": 0.0,
		"pieces": 0,
		"tools": {"rocket": 0, "bomb": 0, "rainbow": 0},
		"levelStars": {},
	}
	if OS.has_feature("web"):
		JavaScriptBridge.eval("localStorage.removeItem('%s')" % SAVE_KEY)
	else:
		if FileAccess.file_exists("user://save.json"):
			DirAccess.remove_absolute("user://save.json")

func get_unlocked_level() -> int:
	return int(_data.get("unlockedLevel", 1))

func set_unlocked_level(v: int) -> void:
	_data["unlockedLevel"] = v
	save()

func get_level_stars(level: int) -> int:
	return int(_data["levelStars"].get(str(level), 0))

func set_level_stars(level: int, stars: int) -> void:
	_data["levelStars"][str(level)] = stars
	save()

func get_hearts_raw() -> Dictionary:
	return {
		"hearts": int(_data.get("hearts", 3)),
		"last_used_at": float(_data.get("heartsLastUsedAt", 0.0))
	}

func set_hearts_raw(hearts: int, last_used_at: float) -> void:
	_data["hearts"] = hearts
	_data["heartsLastUsedAt"] = last_used_at
	save()

func get_pieces() -> int:
	return int(_data.get("pieces", 0))

func set_pieces(v: int) -> void:
	_data["pieces"] = v
	save()

func get_tools() -> Dictionary:
	return _data.get("tools", {"rocket": 0, "bomb": 0, "rainbow": 0}).duplicate()

func set_tools(d: Dictionary) -> void:
	_data["tools"] = d
	save()
