extends Node

# Battle events
signal enemy_killed(enemy_position: Vector2, coin_value: int)
signal wave_cleared(wave_index: int)
signal boss_spawned()
signal boss_killed()
signal stage_completed(stage: int)
signal stage_failed()

# Army events
signal soldier_recruited(count: int)
signal soldier_lost(count: int)
signal army_destroyed()

# Hero events
signal hero_skill_used(skill_index: int)
signal hero_skill_ready(skill_index: int)

# Economy events
signal coins_changed(new_total: int)
signal upgrade_purchased(upgrade_name: String, new_level: int)

# UI events
signal show_mission_complete(stage: int, kills: int, coins_earned: int)
signal show_game_over(stage: int, kills: int)
signal return_to_menu()
