class_name BuildingDB

const WHEAT_FARM := "wheat_farm"
const CORN_FARM := "corn_farm"
const CARROT_FARM := "carrot_farm"
const BAKERY := "bakery"
const CANNERY := "cannery"
const JUICE_FACTORY := "juice_factory"
const HELICOPTER_PAD := "helicopter_pad"
const WAREHOUSE := "warehouse"

const CAT_FARM := "farm"
const CAT_FACTORY := "factory"
const CAT_SPECIAL := "special"

static var BUILDINGS: Dictionary = {
	WHEAT_FARM: {
		"name": "밀 농장",
		"category": CAT_FARM,
		"unlock_level": 1,
		"cost": 50,
		"size": Vector2i(2, 2),
		"grow_time": 30.0,
		"output_item": "wheat",
		"output_amount": 1,
	},
	CORN_FARM: {
		"name": "옥수수 농장",
		"category": CAT_FARM,
		"unlock_level": 3,
		"cost": 120,
		"size": Vector2i(2, 2),
		"grow_time": 60.0,
		"output_item": "corn",
		"output_amount": 1,
	},
	CARROT_FARM: {
		"name": "당근 농장",
		"category": CAT_FARM,
		"unlock_level": 5,
		"cost": 200,
		"size": Vector2i(2, 2),
		"grow_time": 45.0,
		"output_item": "carrot",
		"output_amount": 1,
	},
	BAKERY: {
		"name": "제빵 공장",
		"category": CAT_FACTORY,
		"unlock_level": 2,
		"cost": 100,
		"size": Vector2i(2, 2),
		"slots": 2,
	},
	CANNERY: {
		"name": "통조림 공장",
		"category": CAT_FACTORY,
		"unlock_level": 4,
		"cost": 250,
		"size": Vector2i(2, 2),
		"slots": 2,
	},
	JUICE_FACTORY: {
		"name": "주스 공장",
		"category": CAT_FACTORY,
		"unlock_level": 6,
		"cost": 350,
		"size": Vector2i(2, 2),
		"slots": 2,
	},
	HELICOPTER_PAD: {
		"name": "헬리콥터 패드",
		"category": CAT_SPECIAL,
		"unlock_level": 1,
		"cost": 0,
		"size": Vector2i(3, 3),
	},
	WAREHOUSE: {
		"name": "창고",
		"category": CAT_SPECIAL,
		"unlock_level": 1,
		"cost": 0,
		"size": Vector2i(2, 2),
	},
}

static func get_building(type: String) -> Dictionary:
	return BUILDINGS.get(type, {})

static func get_unlocked_buildings(level: int) -> Array[String]:
	var result: Array[String] = []
	for key in BUILDINGS:
		if BUILDINGS[key]["unlock_level"] <= level:
			result.append(key)
	return result
