extends Node

const SCENES := {
	"splash": "res://scenes/splash.tscn",
	"home": "res://scenes/home.tscn",
	"game": "res://scenes/game.tscn",
	"nightmare": "res://scenes/nightmare.tscn",
}

var current_scene: Node = null
var scene_params: Dictionary = {}

func _ready() -> void:
	GameEvents.scene_change_requested.connect(_on_scene_change)
	_change_scene("splash")

	# Add PopupManager
	var popup_mgr := CanvasLayer.new()
	popup_mgr.set_script(load("res://scripts/ui/popup_manager.gd"))
	popup_mgr.layer = 10
	add_child(popup_mgr)

func _on_scene_change(scene_name: String, params: Dictionary) -> void:
	scene_params = params
	_change_scene(scene_name)

func _change_scene(scene_name: String) -> void:
	if current_scene:
		current_scene.queue_free()
		current_scene = null
	if scene_name in SCENES:
		var packed := load(SCENES[scene_name]) as PackedScene
		if packed:
			current_scene = packed.instantiate()
			add_child(current_scene)
