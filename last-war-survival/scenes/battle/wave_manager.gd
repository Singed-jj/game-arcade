extends Node2D

## Manages enemy wave spawning and progression

const ENEMY_SCENE_PATH := "res://scenes/battle/enemy.tscn"
const GATE_SCENE_PATH := "res://scenes/battle/recruit_gate.tscn"
const SPAWN_Y_OFFSET: float = -300.0
const WAVE_DELAY: float = 2.0
const SPAWN_INTERVAL: float = 0.3

var _enemy_scene: PackedScene
var _current_wave: int = 0
var _total_waves: int = 0
var _enemies_per_wave: int = 0
var _enemy_hp_mult: float = 1.0
var _enemies_alive: int = 0
var _spawning: bool = false
var _wave_timer: float = 0.0
var _spawn_timer: float = 0.0
var _spawn_queue: int = 0
var _stage_data: Dictionary = {}
var _camera: Camera2D = null

func _ready() -> void:
	_enemy_scene = load(ENEMY_SCENE_PATH) as PackedScene
	EventBus.enemy_killed.connect(_on_enemy_killed)

func start_waves(stage_data: Dictionary, camera: Camera2D) -> void:
	_stage_data = stage_data
	_camera = camera
	_current_wave = 0
	_total_waves = stage_data.wave_count
	_enemies_per_wave = stage_data.enemies_per_wave
	_enemy_hp_mult = stage_data.enemy_hp_multiplier
	_enemies_alive = 0
	_wave_timer = 1.0
	_spawning = false

func _process(delta: float) -> void:
	if not GameManager.is_battle_active:
		return

	if _current_wave >= _total_waves:
		return

	if not _spawning:
		_wave_timer -= delta
		if _wave_timer <= 0 and _enemies_alive == 0:
			_start_next_wave()

	if _spawning and _spawn_queue > 0:
		_spawn_timer -= delta
		if _spawn_timer <= 0:
			_spawn_enemy()
			_spawn_queue -= 1
			_spawn_timer = SPAWN_INTERVAL
			if _spawn_queue == 0:
				_spawning = false

func _start_next_wave() -> void:
	_current_wave += 1
	_spawn_queue = _enemies_per_wave
	_spawning = true
	_spawn_timer = 0.0
	_maybe_spawn_gate()

func _spawn_enemy() -> void:
	var enemy: CharacterBody2D = _enemy_scene.instantiate()
	var spawn_x: float = randf_range(85.0, 305.0)
	var spawn_y: float = _camera.position.y + SPAWN_Y_OFFSET + randf_range(-40.0, 40.0)
	enemy.position = Vector2(spawn_x, spawn_y)

	var base_hp: float = 10.0 * _enemy_hp_mult
	var base_atk: float = 3.0 * _enemy_hp_mult * 0.5
	enemy.setup(base_hp, base_atk)

	add_child(enemy)
	_enemies_alive += 1

func _on_enemy_killed(_pos: Vector2, _coins: int) -> void:
	_enemies_alive -= 1
	if _enemies_alive <= 0 and _spawn_queue == 0:
		EventBus.wave_cleared.emit(_current_wave)
		if _current_wave >= _total_waves:
			_on_all_waves_cleared()
		else:
			_wave_timer = WAVE_DELAY

func _on_all_waves_cleared() -> void:
	if _stage_data.has_boss and _stage_data.has_boss:
		EventBus.boss_spawned.emit()
		_spawn_boss()
	else:
		_stage_complete()

func _spawn_boss() -> void:
	var boss: CharacterBody2D = _enemy_scene.instantiate()
	boss.position = Vector2(195.0, _camera.position.y + SPAWN_Y_OFFSET)
	boss.setup(_stage_data.boss_hp, 8.0 * _enemy_hp_mult)
	boss.scale = Vector2(2.5, 2.5)
	boss.add_to_group("boss")
	add_child(boss)
	_enemies_alive = 1

func _stage_complete() -> void:
	GameManager.end_run_victory()
	EventBus.show_mission_complete.emit(
		GameManager.current_stage - 1,
		GameManager.kills_this_run,
		GameManager.coins_this_run
	)

func _maybe_spawn_gate() -> void:
	if randf() > 0.6:
		return
	var gate_scene: PackedScene = load(GATE_SCENE_PATH) as PackedScene
	var gate: Area2D = gate_scene.instantiate()
	var side: float = 130.0 if randf() > 0.5 else 260.0
	gate.position = Vector2(side, _camera.position.y + SPAWN_Y_OFFSET - 100.0)
	if randf() < 0.25:
		gate.soldier_count = -randi_range(2, 4)
	else:
		gate.soldier_count = randi_range(3, 8)
	get_parent().add_child(gate)

func get_enemies_alive() -> int:
	return _enemies_alive
