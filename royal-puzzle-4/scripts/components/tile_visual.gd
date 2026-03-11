class_name TileVisual
extends Node2D

var sprite: Sprite2D
var tile_data: Tile
var cell_size := Vector2(80.0, 80.0)

func _ready() -> void:
	sprite = Sprite2D.new()
	add_child(sprite)
	var img := Image.create(64, 64, false, Image.FORMAT_RGBA8)
	img.fill(Color.WHITE)
	# Round corners effect via slightly smaller inner rect
	var tex := ImageTexture.create_from_image(img)
	sprite.texture = tex

func setup(tile: Tile, p_cell_size: Vector2) -> void:
	tile_data = tile
	cell_size = p_cell_size
	_update_visual()
	position = grid_to_pixel(tile.grid_pos)

func grid_to_pixel(grid_pos: Vector2i) -> Vector2:
	return Vector2(grid_pos.x * cell_size.x + cell_size.x / 2,
				   grid_pos.y * cell_size.y + cell_size.y / 2)

func _update_visual() -> void:
	if not tile_data:
		return
	if sprite:
		sprite.modulate = Tile.COLORS.get(tile_data.type, Color.WHITE)
		# Special tiles get a scale boost
		if tile_data.is_special():
			sprite.scale = Vector2(1.1, 1.1)

func animate_to(target_pos: Vector2i, duration: float = 0.15) -> void:
	var target := grid_to_pixel(target_pos)
	var tween := create_tween()
	tween.tween_property(self, "position", target, duration).set_ease(Tween.EASE_OUT)

func animate_destroy() -> void:
	var tween := create_tween()
	tween.tween_property(self, "scale", Vector2.ZERO, 0.2).set_ease(Tween.EASE_IN)
	tween.tween_callback(queue_free)

func animate_spawn() -> void:
	scale = Vector2.ZERO
	var tween := create_tween()
	tween.tween_property(self, "scale", Vector2.ONE, 0.2).set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_BACK)
