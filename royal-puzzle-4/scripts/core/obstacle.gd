class_name Obstacle
extends RefCounted

enum Type {
	WOODEN_BOX,
	STONE_BOX,
	GRASS,
	FENCE,
	CHAIN,
	MAILBOX,
}

const PROPERTIES := {
	"wooden_box": {"type": Type.WOODEN_BOX, "hp": 1, "blocks_tile": false, "destroyable_by": "adjacent"},
	"stone_box": {"type": Type.STONE_BOX, "hp": 2, "blocks_tile": false, "destroyable_by": "adjacent"},
	"grass": {"type": Type.GRASS, "hp": 1, "blocks_tile": false, "destroyable_by": "on_top"},
	"fence": {"type": Type.FENCE, "hp": 1, "blocks_tile": true, "destroyable_by": "adjacent"},
	"chain": {"type": Type.CHAIN, "hp": 1, "blocks_tile": true, "destroyable_by": "adjacent"},
	"mailbox": {"type": Type.MAILBOX, "hp": -1, "blocks_tile": false, "destroyable_by": "adjacent"},
}

const INTRO_LEVELS := {
	"mailbox": 3,
	"wooden_box": 5,
	"grass": 8,
	"stone_box": 10,
	"fence": 12,
	"chain": 15,
}

static func get_properties(type_name: String) -> Dictionary:
	return PROPERTIES.get(type_name, {})

static func should_hit_on_adjacent_match(type_name: String) -> bool:
	var props := get_properties(type_name)
	return props.get("destroyable_by", "") == "adjacent"

static func should_hit_on_top_match(type_name: String) -> bool:
	var props := get_properties(type_name)
	return props.get("destroyable_by", "") == "on_top"
