class_name RecipeDB

static var ITEM_NAMES: Dictionary = {
	"wheat": "밀",
	"corn": "옥수수",
	"carrot": "당근",
	"bread": "빵",
	"canned_corn": "통조림",
	"carrot_juice": "당근 주스",
}

static var ITEM_VALUES: Dictionary = {
	"wheat": 5,
	"corn": 8,
	"carrot": 7,
	"bread": 15,
	"canned_corn": 20,
	"carrot_juice": 18,
}

static var RECIPES: Dictionary = {
	"bakery": [
		{"input": {"wheat": 1}, "output": "bread", "amount": 1, "time": 60.0},
	],
	"cannery": [
		{"input": {"corn": 1}, "output": "canned_corn", "amount": 1, "time": 90.0},
	],
	"juice_factory": [
		{"input": {"carrot": 1}, "output": "carrot_juice", "amount": 1, "time": 75.0},
	],
}

static func get_recipes(factory_type: String) -> Array:
	return RECIPES.get(factory_type, [])

static func get_item_name(item_id: String) -> String:
	return ITEM_NAMES.get(item_id, item_id)

static func get_item_value(item_id: String) -> int:
	return ITEM_VALUES.get(item_id, 1)
