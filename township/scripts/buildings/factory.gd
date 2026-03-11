extends BuildingBase
class_name FactoryBuilding
## Factory: select recipe → consume inputs → produce → collect

enum State { IDLE, PRODUCING, READY }

var building_type: String = ""
var max_slots: int = 2
var production_queue: Array[Dictionary] = []  # [{recipe_index, timer, state}]
var current_slot: int = -1
var ready_indicator: ColorRect

func _ready() -> void:
	super._ready()
	var data: Dictionary = get_meta("building_data", {})
	building_type = get_meta("building_type", "")
	max_slots = data.get("slots", 2)
	_setup_ready_indicator()

func _setup_ready_indicator() -> void:
	ready_indicator = ColorRect.new()
	ready_indicator.size = Vector2(16, 16)
	ready_indicator.position = Vector2(16, -40)
	ready_indicator.color = Color(0.2, 0.9, 0.2)
	ready_indicator.visible = false
	add_child(ready_indicator)

func _on_clicked() -> void:
	# Check if any ready items to collect first
	var collected := false
	for i in range(production_queue.size() - 1, -1, -1):
		if production_queue[i]["state"] == State.READY:
			_collect(i)
			collected = true
	if collected:
		return
	# Otherwise open factory panel
	var factory_panel = get_tree().get_first_node_in_group("factory_panel")
	if factory_panel:
		factory_panel.target_factory = self
	EventBus.panel_opened.emit("factory:" + building_type)

func start_production(recipe_index: int) -> bool:
	if production_queue.size() >= max_slots:
		return false
	var recipes := RecipeDB.get_recipes(building_type)
	if recipe_index >= recipes.size():
		return false
	var recipe: Dictionary = recipes[recipe_index]
	# Check and consume inputs
	if not GameManager.has_items(recipe["input"]):
		return false
	GameManager.remove_items(recipe["input"])
	production_queue.append({
		"recipe_index": recipe_index,
		"timer": 0.0,
		"duration": recipe["time"],
		"state": State.PRODUCING,
		"output": recipe["output"],
		"amount": recipe["amount"],
	})
	_check_active_production()
	return true

func _process(delta: float) -> void:
	var any_active := false
	for entry in production_queue:
		if entry["state"] == State.PRODUCING:
			entry["timer"] += delta
			if entry["timer"] >= entry["duration"]:
				entry["state"] = State.READY
				ready_indicator.visible = true
				EventBus.factory_production_ready.emit(self)
			else:
				any_active = true
	# Update progress bar for first active item
	_update_progress_bar()

func _update_progress_bar() -> void:
	for entry in production_queue:
		if entry["state"] == State.PRODUCING:
			progress_bar.value = entry["timer"] / entry["duration"]
			progress_bar.visible = true
			return
	progress_bar.visible = false

func _collect(index: int) -> void:
	var entry: Dictionary = production_queue[index]
	if not GameManager.can_store(entry["amount"]):
		EventBus.storage_full.emit()
		return
	GameManager.add_item(entry["output"], entry["amount"])
	EventBus.factory_collected.emit(entry["output"], entry["amount"])
	production_queue.remove_at(index)
	# Check if more items are ready
	var any_ready := false
	for e in production_queue:
		if e["state"] == State.READY:
			any_ready = true
			break
	ready_indicator.visible = any_ready

func _check_active_production() -> void:
	# Ensure production states are correct
	pass

func get_queue_info() -> Array[Dictionary]:
	return production_queue

func get_save_data() -> Dictionary:
	return {"queue": production_queue.duplicate(true)}

func load_save_data(data: Dictionary) -> void:
	production_queue = data.get("queue", [])
	if production_queue == null:
		production_queue = []
	for entry in production_queue:
		if entry["state"] == State.READY:
			ready_indicator.visible = true
			break
