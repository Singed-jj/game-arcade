extends Node2D
class_name BuildingBase
## Base class for all buildings. Provides timer, progress bar, click handling.

var progress_bar: ProgressBar
var timer: float = 0.0
var duration: float = 0.0
var is_active := false

func _ready() -> void:
	_setup_progress_bar()
	_setup_click_area()

func _setup_progress_bar() -> void:
	progress_bar = ProgressBar.new()
	progress_bar.size = Vector2(58, 8)
	progress_bar.position = Vector2(-29, -38)
	progress_bar.min_value = 0.0
	progress_bar.max_value = 1.0
	progress_bar.value = 0.0
	progress_bar.show_percentage = false
	progress_bar.visible = false
	add_child(progress_bar)

func _setup_click_area() -> void:
	var area := Area2D.new()
	var collision := CollisionShape2D.new()
	var shape := RectangleShape2D.new()
	var data: Dictionary = get_meta("building_data", {})
	var size: Vector2i = data.get("size", Vector2i(2, 2))
	shape.size = Vector2(size.x * 32 - 2, size.y * 32 - 2)
	collision.shape = shape
	area.add_child(collision)
	area.input_event.connect(_on_area_input)
	add_child(area)

func _on_area_input(_viewport: Node, event: InputEvent, _shape_idx: int) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		_on_clicked()

func _on_clicked() -> void:
	pass  # Override in subclasses

func start_timer(time: float) -> void:
	duration = time
	timer = 0.0
	is_active = true
	progress_bar.visible = true

func _process(delta: float) -> void:
	if not is_active:
		return
	timer += delta
	progress_bar.value = clampf(timer / duration, 0.0, 1.0)
	if timer >= duration:
		is_active = false
		_on_timer_complete()

func _on_timer_complete() -> void:
	pass  # Override in subclasses

func get_save_data() -> Dictionary:
	return {}

func load_save_data(_data: Dictionary) -> void:
	pass
