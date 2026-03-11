extends Node
## Global signal bus for decoupled communication between systems.

# Inventory
signal inventory_changed(item_id: String, new_amount: int)
signal storage_full()

# Buildings
signal building_placed(building_type: String, grid_pos: Vector2i)
signal building_removed(grid_pos: Vector2i)
signal farm_harvest_ready(farm_node: Node)
signal farm_harvested(item_id: String, amount: int)
signal factory_production_ready(factory_node: Node)
signal factory_collected(item_id: String, amount: int)

# Orders
signal order_completed(reward_coins: int, reward_xp: int)
signal order_refreshed(slot_index: int)

# Player
signal coins_changed(new_amount: int)
signal xp_changed(new_xp: int, new_level: int)
signal level_up(new_level: int)

# UI
signal build_mode_entered()
signal build_mode_exited()
signal panel_opened(panel_name: String)
signal panel_closed(panel_name: String)
