class_name CoinManager
extends RefCounted

const REWARDS := {
	"level_clear": 20,
	"extra_move_bonus": 5,
	"nightmare_min": 50,
	"nightmare_max": 100,
	"area_complete": 500,
}

const COSTS := {
	"extra_moves": 100,
	"life_refill": 100,
	"start_booster": 200,
	"shuffle": 50,
}

static func reward_level_clear(remaining_moves: int) -> int:
	var total := REWARDS["level_clear"] + remaining_moves * REWARDS["extra_move_bonus"]
	SaveManager.add_coins(total)
	return total

static func reward_nightmare(scenario_difficulty: int) -> int:
	var reward := REWARDS["nightmare_min"] + scenario_difficulty * 10
	reward = mini(reward, REWARDS["nightmare_max"])
	SaveManager.add_coins(reward)
	return reward

static func reward_area_complete() -> int:
	SaveManager.add_coins(REWARDS["area_complete"])
	return REWARDS["area_complete"]

static func buy_extra_moves() -> bool:
	return SaveManager.spend_coins(COSTS["extra_moves"])

static func buy_shuffle() -> bool:
	return SaveManager.spend_coins(COSTS["shuffle"])
