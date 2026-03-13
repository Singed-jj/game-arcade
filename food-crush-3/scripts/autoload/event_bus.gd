# scripts/autoload/event_bus.gd
extends Node

var _listeners: Dictionary = {}

func on(event: String, callback: Callable) -> void:
	if not _listeners.has(event):
		_listeners[event] = []
	if not _listeners[event].has(callback):
		_listeners[event].append(callback)

func off(event: String, callback: Callable) -> void:
	if _listeners.has(event):
		_listeners[event].erase(callback)

func emit_event(event: String, data: Dictionary = {}) -> void:
	if not _listeners.has(event):
		return
	for callback: Callable in _listeners[event].duplicate():
		callback.call(data)

func change_screen(screen_name: String, data: Dictionary = {}) -> void:
	emit_event("screen:change", {"screen": screen_name, "data": data})
