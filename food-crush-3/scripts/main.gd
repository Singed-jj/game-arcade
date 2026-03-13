# scripts/main.gd
extends Control

@onready var screen_container: Control = $ScreenContainer

const SCREENS := {
	"cover":     "res://scenes/screens/cover_screen.tscn",
	"map":       "res://scenes/screens/map_screen.tscn",
	"game":      "res://scenes/screens/game_screen.tscn",
	"clear":     "res://scenes/screens/clear_screen.tscn",
	"fail":      "res://scenes/screens/fail_screen.tscn",
	"gacha":     "res://scenes/screens/gacha_screen.tscn",
	"inventory": "res://scenes/screens/inventory_screen.tscn",
	"no-hearts": "res://scenes/screens/no_hearts_screen.tscn",
}

func _ready() -> void:
	EventBus.on("screen:change", _on_screen_change)
	_change_screen("cover", {})

func _on_screen_change(data: Dictionary) -> void:
	_change_screen(data.get("screen", "cover"), data.get("data", {}))

func _change_screen(screen_name: String, data: Dictionary) -> void:
	for child in screen_container.get_children():
		child.queue_free()
	if not SCREENS.has(screen_name):
		push_error("Unknown screen: %s" % screen_name)
		return
	var scene: PackedScene = load(SCREENS[screen_name])
	var instance := scene.instantiate()
	instance.set_anchors_preset(Control.PRESET_FULL_RECT)
	screen_container.add_child(instance)
	if instance.has_method("setup"):
		instance.setup(data)

func _exit_tree() -> void:
	EventBus.off("screen:change", _on_screen_change)
