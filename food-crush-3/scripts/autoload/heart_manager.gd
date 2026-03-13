# scripts/autoload/heart_manager.gd
extends Node

const MAX_HEARTS := 3
const HEART_RECOVERY_SEC := 20.0 * 60.0

var _hearts := MAX_HEARTS
var _last_used_at := 0.0
var _recovery_timer: Timer = null

func _ready() -> void:
	var raw := SaveManager.get_hearts_raw()
	_hearts = raw["hearts"]
	_last_used_at = raw["last_used_at"]
	if _hearts < MAX_HEARTS and _last_used_at > 0.0:
		var elapsed := Time.get_unix_time_from_system() - _last_used_at
		var recovered := int(elapsed / HEART_RECOVERY_SEC)
		if recovered > 0:
			_hearts = min(MAX_HEARTS, _hearts + recovered)
			_last_used_at = Time.get_unix_time_from_system() - fmod(elapsed, HEART_RECOVERY_SEC)
	_save()
	EventBus.emit_event("heart:changed", {"current": _hearts, "max": MAX_HEARTS})
	if _hearts < MAX_HEARTS:
		_start_recovery()

func use_heart() -> bool:
	if _hearts <= 0:
		EventBus.emit_event("heart:empty", {})
		return false
	_hearts -= 1
	_last_used_at = Time.get_unix_time_from_system()
	_save()
	EventBus.emit_event("heart:changed", {"current": _hearts, "max": MAX_HEARTS})
	if _hearts < MAX_HEARTS:
		_start_recovery()
	return true

func refill_all() -> void:
	_hearts = MAX_HEARTS
	_last_used_at = 0.0
	_save()
	_stop_recovery()
	EventBus.emit_event("heart:changed", {"current": _hearts, "max": MAX_HEARTS})

func get_hearts() -> int:
	return _hearts

func get_recovery_sec() -> float:
	if _hearts >= MAX_HEARTS:
		return 0.0
	var elapsed := Time.get_unix_time_from_system() - _last_used_at
	return max(0.0, HEART_RECOVERY_SEC - elapsed)

func _save() -> void:
	SaveManager.set_hearts_raw(_hearts, _last_used_at)

func _start_recovery() -> void:
	if _recovery_timer and not _recovery_timer.is_stopped():
		return
	if not _recovery_timer:
		_recovery_timer = Timer.new()
		add_child(_recovery_timer)
		_recovery_timer.timeout.connect(_on_recovery)
	var wait := get_recovery_sec()
	_recovery_timer.wait_time = wait if wait > 0 else HEART_RECOVERY_SEC
	_recovery_timer.one_shot = true
	_recovery_timer.start()

func _stop_recovery() -> void:
	if _recovery_timer:
		_recovery_timer.stop()

func _on_recovery() -> void:
	_hearts = min(MAX_HEARTS, _hearts + 1)
	_last_used_at = Time.get_unix_time_from_system()
	_save()
	EventBus.emit_event("heart:changed", {"current": _hearts, "max": MAX_HEARTS})
	EventBus.emit_event("heart:recovered", {})
	if _hearts < MAX_HEARTS:
		_recovery_timer.wait_time = HEART_RECOVERY_SEC
		_recovery_timer.start()
