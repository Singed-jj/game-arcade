extends CharacterBody2D

## Individual soldier in the player's army
## Auto-marches upward, attacks enemies when in range

const MARCH_SPEED: float = 80.0
const ATTACK_RANGE: float = 60.0
const ATTACK_COOLDOWN: float = 0.8

var hp: float = 10.0
var attack: float = 5.0
var is_marching: bool = true
var _target: Node2D = null
var _attack_timer: float = 0.0

func _ready() -> void:
	add_to_group("soldiers")
	hp = GameManager.get_soldier_hp()
	attack = GameManager.get_soldier_attack()

func _physics_process(delta: float) -> void:
	if not GameManager.is_battle_active:
		return

	_attack_timer -= delta
	_find_target()

	if _target and is_instance_valid(_target):
		var dist: float = global_position.distance_to(_target.global_position)
		if dist <= ATTACK_RANGE:
			is_marching = false
			velocity = Vector2.ZERO
			if _attack_timer <= 0:
				_do_attack()
				_attack_timer = ATTACK_COOLDOWN
		else:
			is_marching = true
			velocity = global_position.direction_to(_target.global_position) * MARCH_SPEED
	elif is_marching:
		velocity = Vector2(0, -MARCH_SPEED)

	move_and_slide()

func _find_target() -> void:
	if _target and is_instance_valid(_target):
		return
	var enemies: Array = get_tree().get_nodes_in_group("enemies")
	if enemies.is_empty():
		_target = null
		is_marching = true
		return
	var closest: Node2D = null
	var closest_dist: float = INF
	for e in enemies:
		var d: float = global_position.distance_to(e.global_position)
		if d < closest_dist:
			closest_dist = d
			closest = e
	_target = closest

func _do_attack() -> void:
	if _target and is_instance_valid(_target) and _target.has_method("take_damage"):
		_target.take_damage(attack)

func take_damage(amount: float) -> void:
	hp -= amount
	if hp <= 0:
		_die()

func _die() -> void:
	EventBus.soldier_lost.emit(1)
	queue_free()
