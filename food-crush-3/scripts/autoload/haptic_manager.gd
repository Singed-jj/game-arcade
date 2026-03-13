# scripts/autoload/haptic_manager.gd
extends Node

func vibrate(pattern: String) -> void:
	if not OS.has_feature("web"):
		match pattern:
			"light":   Input.vibrate_handheld(30)
			"medium":  Input.vibrate_handheld(60)
			"heavy":   Input.vibrate_handheld(120)
			"cascade": Input.vibrate_handheld(200)
		return
	var duration := 30
	match pattern:
		"light":   duration = 30
		"medium":  duration = 60
		"heavy":   duration = 120
		"cascade": duration = 200
	JavaScriptBridge.eval("if(navigator.vibrate) navigator.vibrate(%d)" % duration)
