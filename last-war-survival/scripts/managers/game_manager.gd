extends Node

## Game balance constants
const BASE_SOLDIER_HP: float = 10.0
const BASE_SOLDIER_ATTACK: float = 5.0
const BASE_ARMY_SIZE: int = 8
const HP_PER_UPGRADE: float = 3.0
const ATTACK_PER_UPGRADE: float = 2.0
const ARMY_SIZE_PER_UPGRADE: int = 3
const UPGRADE_BASE_COST: int = 100

## Current run state
var current_stage: int = 1
var kills_this_run: int = 0
var coins_this_run: int = 0
var is_battle_active: bool = false

func _ready() -> void:
	current_stage = SaveManager.get_current_stage()

# --- Upgrade Calculations ---

func get_soldier_hp() -> float:
	var level: int = SaveManager.get_upgrade_level("hp")
	return BASE_SOLDIER_HP + level * HP_PER_UPGRADE

func get_soldier_attack() -> float:
	var level: int = SaveManager.get_upgrade_level("attack")
	return BASE_SOLDIER_ATTACK + level * ATTACK_PER_UPGRADE

func get_starting_army_size() -> int:
	var level: int = SaveManager.get_upgrade_level("army_size")
	return BASE_ARMY_SIZE + level * ARMY_SIZE_PER_UPGRADE

func get_upgrade_cost(upgrade_name: String) -> int:
	var level: int = SaveManager.get_upgrade_level(upgrade_name)
	return UPGRADE_BASE_COST * (level + 1)

func purchase_upgrade(upgrade_name: String) -> bool:
	var cost := get_upgrade_cost(upgrade_name)
	if SaveManager.spend_currency("coins", cost):
		var new_level: int = SaveManager.get_upgrade_level(upgrade_name) + 1
		SaveManager.set_upgrade_level(upgrade_name, new_level)
		EventBus.upgrade_purchased.emit(upgrade_name, new_level)
		return true
	return false

# --- Stage Data ---

func get_stage_data(stage: int) -> Dictionary:
	var wave_count: int = mini(3 + stage / 3, 6)
	var enemy_hp_mult: float = 1.0 + (stage - 1) * 0.15
	var enemy_count_per_wave: int = mini(3 + stage, 15)
	var has_boss: bool = true
	var boss_hp: float = 50.0 * enemy_hp_mult * 2.0

	return {
		"stage": stage,
		"wave_count": wave_count,
		"enemy_hp_multiplier": enemy_hp_mult,
		"enemies_per_wave": enemy_count_per_wave,
		"has_boss": has_boss,
		"boss_hp": boss_hp,
		"coin_reward": 30 + stage * 20,
	}

# --- Run Management ---

func start_run() -> void:
	kills_this_run = 0
	coins_this_run = 0
	is_battle_active = true

func end_run_victory() -> void:
	is_battle_active = false
	SaveManager.add_currency("coins", coins_this_run)
	var bonus: int = get_stage_data(current_stage).coin_reward
	SaveManager.add_currency("coins", bonus)
	coins_this_run += bonus
	EventBus.stage_completed.emit(current_stage)
	SaveManager.set_current_stage(current_stage + 1)
	current_stage = SaveManager.get_current_stage()

func end_run_defeat() -> void:
	is_battle_active = false
	SaveManager.add_currency("coins", coins_this_run)
	EventBus.stage_failed.emit()

func add_kill_coins(coin_value: int) -> void:
	kills_this_run += 1
	coins_this_run += coin_value
