# scripts/autoload/sound_manager.gd
extends Node

const SOUNDS := {
	"block-pop": "res://audio/block-pop.mp3",
	"bomb":      "res://audio/bomb.mp3",
	"clear":     "res://audio/clear.mp3",
	"fail":      "res://audio/fail.mp3",
	"rainbow":   "res://audio/rainbow.mp3",
	"rocket":    "res://audio/rocket.mp3",
	"star":      "res://audio/star.mp3",
	"swap":      "res://audio/swap.mp3",
}

var _players: Dictionary = {}

func _ready() -> void:
	for key in SOUNDS:
		var player := AudioStreamPlayer.new()
		player.stream = load(SOUNDS[key])
		player.volume_db = -6.0
		add_child(player)
		_players[key] = player

func play(sound_name: String) -> void:
	if _players.has(sound_name):
		var player: AudioStreamPlayer = _players[sound_name]
		if not player.playing:
			player.play()
