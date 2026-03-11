extends BuildingBase
class_name FarmBuilding
## Farm: idle → growing → ready → harvested → idle

enum State { IDLE, GROWING, READY }

var state: int = State.IDLE
var building_type: String = ""
var output_item: String = ""
var output_amount: int = 1
var grow_time: float = 30.0
var ready_indicator: ColorRect

func _ready() -> void:
	super._ready()
	var data: Dictionary = get_meta("building_data", {})
	building_type = get_meta("building_type", "")
	output_item = data.get("output_item", "wheat")
	output_amount = data.get("output_amount", 1)
	grow_time = data.get("grow_time", 30.0)
	_setup_ready_indicator()

func _setup_ready_indicator() -> void:
	ready_indicator = ColorRect.new()
	ready_indicator.size = Vector2(16, 16)
	ready_indicator.position = Vector2(16, -40)
	ready_indicator.color = Color(0.2, 0.9, 0.2)  # Green "ready" dot
	ready_indicator.visible = false
	add_child(ready_indicator)

func _on_clicked() -> void:
	match state:
		State.IDLE:
			_start_growing()
		State.READY:
			_harvest()

func _start_growing() -> void:
	state = State.GROWING
	start_timer(grow_time)
	# Visual: darken farm to show "growing"
	var rect := get_child(0) as ColorRect
	if rect:
		rect.color = Color(0.4, 0.6, 0.2)  # Greenish during growth

func _on_timer_complete() -> void:
	state = State.READY
	progress_bar.visible = false
	ready_indicator.visible = true
	EventBus.farm_harvest_ready.emit(self)
	# Visual: bright color for ready
	var rect := get_child(0) as ColorRect
	if rect:
		rect.color = Color(0.9, 0.8, 0.1)  # Golden when ready

func _harvest() -> void:
	if not GameManager.can_store(output_amount):
		EventBus.storage_full.emit()
		return
	GameManager.add_item(output_item, output_amount)
	EventBus.farm_harvested.emit(output_item, output_amount)
	state = State.IDLE
	ready_indicator.visible = false
	# Reset visual
	var rect := get_child(0) as ColorRect
	if rect:
		rect.color = Color(0.6, 0.4, 0.2)  # Brown idle

func get_save_data() -> Dictionary:
	return {
		"state": state,
		"timer": timer,
	}

func load_save_data(data: Dictionary) -> void:
	state = data.get("state", State.IDLE)
	if state == State.GROWING:
		var saved_timer: float = data.get("timer", 0.0)
		# Account for elapsed time while away
		start_timer(grow_time)
		timer = saved_timer
		if timer >= grow_time:
			_on_timer_complete()
	elif state == State.READY:
		ready_indicator.visible = true
		var rect := get_child(0) as ColorRect
		if rect:
			rect.color = Color(0.9, 0.8, 0.1)
