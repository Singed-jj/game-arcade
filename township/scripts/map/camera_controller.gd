extends Camera2D
## Drag to pan, scroll to zoom. Clamps to map bounds.

const ZOOM_MIN := 0.5
const ZOOM_MAX := 2.0
const ZOOM_STEP := 0.1
const MAP_SIZE_PX := 640  # 20 tiles * 32px

var _dragging := false
var _drag_start := Vector2.ZERO

func _ready() -> void:
	zoom = Vector2(1.0, 1.0)
	position = Vector2(MAP_SIZE_PX / 2.0, MAP_SIZE_PX / 2.0)

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		match event.button_index:
			MOUSE_BUTTON_LEFT:
				if event.pressed:
					_dragging = true
					_drag_start = event.position
				else:
					_dragging = false
			MOUSE_BUTTON_WHEEL_UP:
				_zoom_camera(ZOOM_STEP)
			MOUSE_BUTTON_WHEEL_DOWN:
				_zoom_camera(-ZOOM_STEP)
	elif event is InputEventMouseMotion and _dragging:
		position -= event.relative / zoom
		_clamp_position()

func _zoom_camera(step: float) -> void:
	var new_zoom := clampf(zoom.x + step, ZOOM_MIN, ZOOM_MAX)
	zoom = Vector2(new_zoom, new_zoom)
	_clamp_position()

func _clamp_position() -> void:
	var half_view := get_viewport_rect().size / (2.0 * zoom)
	position.x = clampf(position.x, half_view.x, MAP_SIZE_PX - half_view.x)
	position.y = clampf(position.y, half_view.y, MAP_SIZE_PX - half_view.y)
