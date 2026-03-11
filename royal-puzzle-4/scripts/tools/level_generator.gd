@tool
extends EditorScript

func _run() -> void:
	for i in range(1, 31):
		var ld := LevelData.new()
		ld.level_number = i
		ld.board_width = 8
		ld.board_height = 8
		ld.tile_types = 4 if i <= 5 else 5

		if i <= 5:
			ld.moves = 28 - i
		elif i <= 10:
			ld.moves = 22 - (i - 6)
		elif i <= 20:
			ld.moves = 18 - (i - 11) / 2
		else:
			ld.moves = maxi(13 - (i - 21) / 2, 10)

		ld.targets = _generate_targets(i)
		ld.obstacles = _generate_obstacles(i)
		ld.nightmare_after = (i % 5 == 0)

		var path := "res://resources/levels/level_%03d.tres" % i
		ResourceSaver.save(ld, path)
		print("Created: ", path)

func _generate_targets(level: int) -> Array:
	if level <= 5:
		return [{"type": "red", "count": 10 + level * 3}]
	elif level <= 10:
		var types := ["red", "blue", "green"]
		return [{"type": types[level % 3], "count": 20 + level * 2}]
	elif level <= 20:
		var types := ["red", "blue", "green", "yellow", "pink"]
		return [
			{"type": types[level % 5], "count": 15 + level},
			{"type": types[(level + 2) % 5], "count": 10 + level},
		]
	else:
		return [
			{"type": "red", "count": 20 + level},
			{"type": "wooden_box", "count": 5 + (level - 20)},
		]

func _generate_obstacles(level: int) -> Array:
	var obs := []
	if level >= 3:
		for j in range(mini(3, level / 3)):
			obs.append({"type": "mailbox", "position": [1 + j * 2, 1], "hp": 1})
	if level >= 5:
		for j in range(mini(4, (level - 4) / 2)):
			obs.append({"type": "wooden_box", "position": [j, 3], "hp": 1})
	if level >= 10:
		for j in range(mini(3, (level - 9) / 3)):
			obs.append({"type": "stone_box", "position": [2 + j, 5], "hp": 2})
	if level >= 8:
		for j in range(mini(4, (level - 7) / 2)):
			obs.append({"type": "grass", "position": [j * 2, 2], "hp": 1})
	if level >= 12:
		for j in range(mini(2, (level - 11) / 4)):
			obs.append({"type": "fence", "position": [3 + j, 4], "hp": 1})
	if level >= 15:
		for j in range(mini(2, (level - 14) / 5)):
			obs.append({"type": "chain", "position": [5 + j, 6], "hp": 1})
	return obs
