extends Node2D

## Road visual - draws highway lanes and shoulders
## Viewport: 390x844, road fills most of the width

const ROAD_COLOR := Color(0.25, 0.25, 0.28, 1.0)
const SHOULDER_COLOR := Color(0.15, 0.15, 0.17, 1.0)
const LINE_COLOR := Color(0.9, 0.9, 0.3, 0.6)
const GRASS_COLOR := Color(0.408, 0.827, 0.569, 1.0) # #68D391

const ROAD_WIDTH: float = 280.0
const SHOULDER_WIDTH: float = 16.0
const LANE_DASH_LENGTH: float = 40.0
const LANE_GAP_LENGTH: float = 30.0
const LINE_WIDTH: float = 2.0

var _scroll_offset: float = 0.0
var _scroll_speed: float = 80.0

func _process(delta: float) -> void:
	if GameManager.is_battle_active:
		_scroll_offset += _scroll_speed * delta
		_scroll_offset = fmod(_scroll_offset, LANE_DASH_LENGTH + LANE_GAP_LENGTH)
		queue_redraw()

func _draw() -> void:
	var vp_w: float = 390.0
	var vp_h: float = 844.0
	var road_left: float = (vp_w - ROAD_WIDTH) / 2.0
	var road_right: float = road_left + ROAD_WIDTH

	# Grass background
	draw_rect(Rect2(0, -vp_h, vp_w, vp_h * 3), GRASS_COLOR)

	# Road shoulders
	draw_rect(Rect2(road_left - SHOULDER_WIDTH, -vp_h, SHOULDER_WIDTH, vp_h * 3), SHOULDER_COLOR)
	draw_rect(Rect2(road_right, -vp_h, SHOULDER_WIDTH, vp_h * 3), SHOULDER_COLOR)

	# Road surface
	draw_rect(Rect2(road_left, -vp_h, ROAD_WIDTH, vp_h * 3), ROAD_COLOR)

	# Center dashed line
	var center_x: float = vp_w / 2.0
	var cycle: float = LANE_DASH_LENGTH + LANE_GAP_LENGTH
	var y: float = vp_h + _scroll_offset
	while y > -vp_h:
		draw_line(
			Vector2(center_x, y),
			Vector2(center_x, y - LANE_DASH_LENGTH),
			LINE_COLOR, LINE_WIDTH
		)
		y -= cycle

	# Edge lines (solid)
	draw_line(Vector2(road_left, -vp_h), Vector2(road_left, vp_h * 2), LINE_COLOR, LINE_WIDTH)
	draw_line(Vector2(road_right, -vp_h), Vector2(road_right, vp_h * 2), LINE_COLOR, LINE_WIDTH)
