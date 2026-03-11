extends CharacterBody2D

## Enemy unit - marches downward toward player army, auto-attacks

const MARCH_SPEED: float = 40.0
const ATTACK_RANGE: float = 50.0
const ATTACK_COOLDOWN: float = 1.0
const COIN_VALUE: int = 2

var hp: float = 10.0
var max_hp: float = 10.0
var attack: float = 3.0
var _attack_timer: float = 0.0
var _target: CharacterBody2D = null

@onready var _hp_bar: ColorRect = $HPBarBg/HPBarFill

func _ready() -> void:
	add_to_group("enemies")

func setup(enemy_hp: float, enemy_attack: float) -> void:
	hp = enemy_hp
	max_hp = enemy_hp
	attack = enemy_attack

func _physics_process(delta: float) -> void:
	if not GameManager.is_battle_active:
		return

	_find_target()
	_attack_timer -= delta

	if _target and is_instance_valid(_target):
		var dist: float = global_position.distance_to(_target.global_position)
		if dist <= ATTACK_RANGE:
			velocity = Vector2.ZERO
			if _attack_timer <= 0:
				_do_attack()
				_attack_timer = ATTACK_COOLDOWN
		else:
			velocity = global_position.direction_to(_target.global_position) * MARCH_SPEED
	else:
		velocity = Vector2(0, MARCH_SPEED)

	move_and_slide()

func _find_target() -> void:
	if _target and is_instance_valid(_target):
		return
	var soldiers: Array = get_tree().get_nodes_in_group("soldiers")
	if soldiers.is_empty():
		_target = null
		return
	var closest: CharacterBody2D = null
	var closest_dist: float = INF
	for s in soldiers:
		var d: float = global_position.distance_to(s.global_position)
		if d < closest_dist:
			closest_dist = d
			closest = s
	_target = closest

func _do_attack() -> void:
	if _target and is_instance_valid(_target) and _target.has_method("take_damage"):
		_target.take_damage(attack)

func take_damage(amount: float) -> void:
	hp -= amount
	_update_hp_bar()
	if hp <= 0:
		_die()

func _update_hp_bar() -> void:
	if _hp_bar:
		_hp_bar.scale.x = maxf(hp / max_hp, 0.0)

func _die() -> void:
	EventBus.enemy_killed.emit(global_position, COIN_VALUE)
	GameManager.add_kill_coins(COIN_VALUE)
	queue_free()
