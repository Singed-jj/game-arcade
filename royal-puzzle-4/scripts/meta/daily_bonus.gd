class_name DailyBonus
extends RefCounted

const REWARDS := [
	{"coins": 10},
	{"coins": 20},
	{"coins": 30},
	{"coins": 40},
	{"coins": 50},
	{"coins": 50, "booster": "rocket"},
	{"lives": 5},
]

static func can_claim() -> bool:
	var last := SaveManager.get_daily_bonus_last_claim()
	if last == "":
		return true
	var today := Time.get_date_string_from_system()
	return today != last

static func claim() -> Dictionary:
	if not can_claim():
		return {}
	var day := SaveManager.get_daily_bonus_day()
	var reward := REWARDS[day % REWARDS.size()]
	if reward.has("coins"):
		SaveManager.add_coins(reward["coins"])
	if reward.has("lives"):
		SaveManager.set_lives(LifeManager.MAX_LIVES)
	var next_day := (day + 1) % REWARDS.size()
	var today := Time.get_date_string_from_system()
	SaveManager.set_daily_bonus(next_day, today)
	GameEvents.daily_bonus_claimed.emit(day, reward)
	return reward

static func get_current_day() -> int:
	return SaveManager.get_daily_bonus_day()

static func get_reward_preview() -> Dictionary:
	var day := SaveManager.get_daily_bonus_day()
	return REWARDS[day % REWARDS.size()]
