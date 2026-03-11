class_name LifeManager
extends RefCounted

const MAX_LIVES := 5
const RECOVERY_SECONDS := 1800

static func get_lives() -> int:
	_process_recovery()
	return SaveManager.get_lives()

static func has_lives() -> bool:
	return get_lives() > 0

static func use_life() -> bool:
	var lives := get_lives()
	if lives <= 0:
		return false
	SaveManager.set_lives(lives - 1)
	if lives == MAX_LIVES:
		SaveManager.set_lives_recovery_timestamp(int(Time.get_unix_time_from_system()))
	return true

static func buy_life() -> bool:
	if not SaveManager.spend_coins(100):
		return false
	var lives := mini(get_lives() + 1, MAX_LIVES)
	SaveManager.set_lives(lives)
	return true

static func get_time_to_next_life() -> int:
	if SaveManager.get_lives() >= MAX_LIVES:
		return 0
	var ts := SaveManager.get_lives_recovery_timestamp()
	if ts == 0:
		return 0
	var elapsed := int(Time.get_unix_time_from_system()) - ts
	var remaining := RECOVERY_SECONDS - (elapsed % RECOVERY_SECONDS)
	return remaining

static func _process_recovery() -> void:
	var current := SaveManager.get_lives()
	if current >= MAX_LIVES:
		return
	var ts := SaveManager.get_lives_recovery_timestamp()
	if ts == 0:
		return
	var now := int(Time.get_unix_time_from_system())
	var elapsed := now - ts
	var recovered := elapsed / RECOVERY_SECONDS
	if recovered > 0:
		var new_lives := mini(current + recovered, MAX_LIVES)
		SaveManager.set_lives(new_lives)
		if new_lives >= MAX_LIVES:
			SaveManager.set_lives_recovery_timestamp(0)
		else:
			SaveManager.set_lives_recovery_timestamp(ts + recovered * RECOVERY_SECONDS)
