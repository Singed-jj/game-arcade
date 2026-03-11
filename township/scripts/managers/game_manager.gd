extends Node
## Central game state: coins, XP, level, inventory, orders.

var coins: int = 200
var xp: int = 0
var level: int = 1
var inventory: Dictionary = {}  # {item_id: amount}
var storage_capacity: int = 20
var orders: Array[Dictionary] = []

func _ready() -> void:
	_load_state()
	_ensure_orders()

# --- Coins ---

func add_coins(amount: int) -> void:
	coins += amount
	EventBus.coins_changed.emit(coins)
	_save_state()

func spend_coins(amount: int) -> bool:
	if coins < amount:
		return false
	coins -= amount
	EventBus.coins_changed.emit(coins)
	_save_state()
	return true

# --- XP & Level ---

func add_xp(amount: int) -> void:
	xp += amount
	var new_level := LevelDB.get_level_for_xp(xp)
	if new_level > level:
		level = new_level
		EventBus.level_up.emit(level)
	EventBus.xp_changed.emit(xp, level)
	_save_state()

func get_xp_progress() -> float:
	## Returns 0.0-1.0 progress toward next level
	if level >= LevelDB.MAX_LEVEL:
		return 1.0
	var current_threshold := LevelDB.get_xp_for_level(level)
	var next_threshold := LevelDB.get_xp_for_level(level + 1)
	var range_val := next_threshold - current_threshold
	if range_val <= 0:
		return 1.0
	return float(xp - current_threshold) / float(range_val)

# --- Inventory ---

func get_item_count(item_id: String) -> int:
	return inventory.get(item_id, 0)

func get_total_items() -> int:
	var total := 0
	for amount in inventory.values():
		total += amount
	return total

func can_store(amount: int) -> bool:
	return get_total_items() + amount <= storage_capacity

func add_item(item_id: String, amount: int = 1) -> bool:
	if not can_store(amount):
		EventBus.storage_full.emit()
		return false
	inventory[item_id] = get_item_count(item_id) + amount
	EventBus.inventory_changed.emit(item_id, inventory[item_id])
	_save_state()
	return true

func remove_item(item_id: String, amount: int = 1) -> bool:
	if get_item_count(item_id) < amount:
		return false
	inventory[item_id] -= amount
	if inventory[item_id] <= 0:
		inventory.erase(item_id)
	EventBus.inventory_changed.emit(item_id, get_item_count(item_id))
	_save_state()
	return true

func has_items(items: Dictionary) -> bool:
	for item_id in items:
		if get_item_count(item_id) < items[item_id]:
			return false
	return true

func remove_items(items: Dictionary) -> bool:
	if not has_items(items):
		return false
	for item_id in items:
		remove_item(item_id, items[item_id])
	return true

# --- Orders ---

func _ensure_orders() -> void:
	while orders.size() < 3:
		orders.append(_generate_order())
	_save_state()

func complete_order(index: int) -> void:
	if index < 0 or index >= orders.size():
		return
	var order: Dictionary = orders[index]
	if not has_items(order["items"]):
		return
	remove_items(order["items"])
	add_coins(order["reward_coins"])
	add_xp(order["reward_xp"])
	EventBus.order_completed.emit(order["reward_coins"], order["reward_xp"])
	orders[index] = _generate_order()
	EventBus.order_refreshed.emit(index)
	_save_state()

func delete_order(index: int) -> void:
	if index < 0 or index >= orders.size():
		return
	orders[index] = _generate_order()
	EventBus.order_refreshed.emit(index)
	_save_state()

func _generate_order() -> Dictionary:
	var available_items: Array[String] = ["wheat"]
	if level >= 2:
		available_items.append("bread")
	if level >= 3:
		available_items.append("corn")
	if level >= 4:
		available_items.append("canned_corn")
	if level >= 5:
		available_items.append("carrot")
	if level >= 6:
		available_items.append("carrot_juice")

	var num_types := clampi(randi_range(1, ceili(level / 3.0)), 1, mini(3, available_items.size()))
	available_items.shuffle()
	var order_items := {}
	var total_value := 0
	for i in range(num_types):
		var item_id: String = available_items[i]
		var qty := randi_range(1, clampi(ceili(level / 3.0), 1, 3))
		order_items[item_id] = qty
		total_value += RecipeDB.get_item_value(item_id) * qty

	return {
		"items": order_items,
		"reward_coins": ceili(total_value * 1.5),
		"reward_xp": num_types * 10 + (level * 2),
	}

# --- Persistence ---

func _save_state() -> void:
	SaveManager.data["coins"] = coins
	SaveManager.data["xp"] = xp
	SaveManager.data["level"] = level
	SaveManager.data["inventory"] = inventory.duplicate()
	SaveManager.data["storage_capacity"] = storage_capacity
	SaveManager.data["orders"] = orders.duplicate(true)
	SaveManager.save_game()

func _load_state() -> void:
	coins = SaveManager.get_val("coins", 200)
	xp = SaveManager.get_val("xp", 0)
	level = SaveManager.get_val("level", 1)
	inventory = SaveManager.get_val("inventory", {})
	if inventory == null:
		inventory = {}
	storage_capacity = SaveManager.get_val("storage_capacity", 20)
	orders = SaveManager.get_val("orders", [])
	if orders == null:
		orders = []
	# Ensure level matches XP
	level = LevelDB.get_level_for_xp(xp)
