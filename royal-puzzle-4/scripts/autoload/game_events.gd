extends Node

# --- Board / Match ---
signal tile_swapped(from: Vector2i, to: Vector2i)
signal match_found(cells: Array[Vector2i], pattern: String)
signal tiles_cleared(cells: Array[Vector2i])
signal board_settled()
signal no_moves_available()

# --- Booster ---
signal booster_created(pos: Vector2i, type: String)
signal booster_activated(pos: Vector2i, type: String)
signal booster_merge(pos_a: Vector2i, pos_b: Vector2i, type_a: String, type_b: String)

# --- Obstacle ---
signal obstacle_hit(pos: Vector2i, type: String, remaining_hp: int)
signal obstacle_destroyed(pos: Vector2i, type: String)

# --- Level ---
signal level_started(level_number: int)
signal level_completed(level_number: int, remaining_moves: int)
signal level_failed(level_number: int)
signal moves_changed(remaining: int)
signal target_progress(target_type: String, current: int, total: int)
signal target_completed(target_type: String)

# --- Economy ---
signal coins_changed(amount: int)
signal lives_changed(amount: int)
signal stars_changed(amount: int)

# --- Meta ---
signal castle_task_completed(task_id: String)
signal castle_area_completed(area_id: String)
signal nightmare_started(scenario_id: String)
signal nightmare_completed(scenario_id: String, reward: int)
signal daily_bonus_claimed(day: int, reward: Dictionary)

# --- Scene ---
signal scene_change_requested(scene_name: String, params: Dictionary)
