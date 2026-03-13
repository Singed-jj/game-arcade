# scripts/core/level_data.gd
class_name LevelData

const HAND_CRAFTED := [
	{
		"level": 1, "moves": 25,
		"objectives": [{"block_type": 0, "count": 12}, {"block_type": 1, "count": 12}]
	},
	{
		"level": 2, "moves": 23,
		"objectives": [{"block_type": 2, "count": 13}, {"block_type": 3, "count": 13}]
	},
	{
		"level": 3, "moves": 20,
		"objectives": [{"block_type": 0, "count": 14}, {"block_type": 4, "count": 14}]
	},
	{
		"level": 4, "moves": 18,
		"objectives": [{"block_type": 1, "count": 15}, {"block_type": 2, "count": 15}]
	},
	{
		"level": 5, "moves": 17,
		"objectives": [{"block_type": 0, "count": 15}, {"block_type": 1, "count": 15}]
	},
	{
		"level": 6, "moves": 16,
		"objectives": [{"block_type": 2, "count": 14}, {"block_type": 4, "count": 14}]
	},
	{
		"level": 7, "moves": 13,
		"objectives": [{"block_type": 1, "count": 16}, {"block_type": 3, "count": 16}]
	},
	{
		"level": 8, "moves": 15,
		"objectives": [
			{"block_type": 0, "count": 12},
			{"block_type": 4, "count": 12},
			{"block_type": 2, "count": 12},
		]
	},
	{
		"level": 9, "moves": 12,
		"objectives": [{"block_type": 3, "count": 18}, {"block_type": 2, "count": 18}]
	},
	{
		"level": 10, "moves": 10,
		"objectives": [
			{"block_type": 0, "count": 12},
			{"block_type": 1, "count": 12},
			{"block_type": 2, "count": 12},
		]
	},
]

static func _seeded_rand(seed_val: int) -> Array:
	var s := seed_val
	var results := []
	for _i in range(20):
		s = (s * 1103515245 + 12345) & 0x7fffffff
		results.append(float(s) / float(0x7fffffff))
	return results

static func _generate_level(level: int) -> Dictionary:
	var cycle := (level - 11) / 4
	var pos := (level - 11) % 4
	var rnd := _seeded_rand(level * 7919)
	var ri := 0

	var all_types := [0, 1, 2, 3, 4]
	for i in range(all_types.size() - 1, 0, -1):
		var j := int(rnd[ri] * (i + 1)) % (i + 1)
		ri += 1
		var tmp := all_types[i]
		all_types[i] = all_types[j]
		all_types[j] = tmp

	var moves: int
	var type_count: int
	var per_type: int

	match pos:
		0:
			moves = max(10, 14 - cycle)
			type_count = 2
			per_type = 14 + cycle
		1:
			moves = max(9, 11 - cycle)
			type_count = 2
			per_type = 13 + cycle
		2:
			moves = max(10, 14 - cycle)
			type_count = 2
			per_type = 15 + cycle
		_:
			moves = 10
			type_count = 3
			per_type = 10 + cycle

	var objectives := []
	for i in range(type_count):
		objectives.append({"block_type": all_types[i], "count": per_type})

	return {"level": level, "moves": moves, "objectives": objectives}

static func get_level_config(level: int) -> Dictionary:
	if level >= 1 and level <= 10:
		return HAND_CRAFTED[level - 1]
	return _generate_level(level)
