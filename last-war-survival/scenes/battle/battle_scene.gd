extends Node2D

## Main battle scene controller
## Manages the battle flow: march → waves → boss → clear

@onready var _player_army: Node2D = $PlayerArmy
@onready var _wave_manager: Node2D = $WaveManager
@onready var _camera: Camera2D = $Camera2D
@onready var _stage_label: Label = $HUD/StageLabel
@onready var _army_count_label: Label = $HUD/ArmyCountLabel
@onready var _wave_label: Label = $HUD/WaveLabel

func _ready() -> void:
	GameManager.start_run()
	_update_hud()
	_player_army.spawn_army()

	var stage_data: Dictionary = GameManager.get_stage_data(GameManager.current_stage)
	_wave_manager.start_waves(stage_data, _camera)

	EventBus.soldier_recruited.connect(_on_army_changed)
	EventBus.soldier_lost.connect(_on_army_changed)
	EventBus.army_destroyed.connect(_on_army_destroyed)
	EventBus.wave_cleared.connect(_on_wave_cleared)
	EventBus.boss_spawned.connect(_on_boss_spawned)
	EventBus.boss_killed.connect(_on_boss_killed)

func _process(_delta: float) -> void:
	if GameManager.is_battle_active:
		_follow_army()
		_update_army_count()

func _follow_army() -> void:
	var center: Vector2 = _player_army.get_army_center()
	_camera.position.y = lerp(_camera.position.y, center.y - 200.0, 0.05)

func _update_hud() -> void:
	_stage_label.text = "STAGE %d" % GameManager.current_stage

func _update_army_count() -> void:
	var count: int = _player_army.get_soldier_count()
	_army_count_label.text = "x%d" % count

func _on_army_changed(_count: int) -> void:
	_update_army_count()

func _on_wave_cleared(wave_index: int) -> void:
	_wave_label.text = "WAVE %d CLEARED!" % wave_index

func _on_boss_spawned() -> void:
	_wave_label.text = "BOSS!"

func _on_boss_killed() -> void:
	_wave_manager._stage_complete()

func _on_army_destroyed() -> void:
	GameManager.end_run_defeat()
	EventBus.show_game_over.emit(GameManager.current_stage, GameManager.kills_this_run)
