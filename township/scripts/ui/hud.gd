extends Control
## Top-bar HUD: [Lv.N ★ progress] [coins] [items/capacity]

var level_label: Label
var xp_bar: ProgressBar
var coins_label: Label
var storage_label: Label

func _ready() -> void:
	_setup_ui()
	_connect_signals()
	_update_all()

func _setup_ui() -> void:
	# Level
	level_label = Label.new()
	level_label.position = Vector2(10, 5)
	level_label.add_theme_font_size_override("font_size", 16)
	add_child(level_label)
	# XP bar
	xp_bar = ProgressBar.new()
	xp_bar.position = Vector2(80, 8)
	xp_bar.size = Vector2(100, 16)
	xp_bar.show_percentage = false
	add_child(xp_bar)
	# Coins
	coins_label = Label.new()
	coins_label.position = Vector2(200, 5)
	coins_label.add_theme_font_size_override("font_size", 16)
	add_child(coins_label)
	# Storage
	storage_label = Label.new()
	storage_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	storage_label.position = Vector2(1100, 5)
	storage_label.size = Vector2(170, 24)
	storage_label.add_theme_font_size_override("font_size", 16)
	add_child(storage_label)

func _connect_signals() -> void:
	EventBus.coins_changed.connect(_on_coins_changed)
	EventBus.xp_changed.connect(_on_xp_changed)
	EventBus.level_up.connect(_on_level_up)
	EventBus.inventory_changed.connect(_on_inventory_changed)
	EventBus.storage_full.connect(_on_storage_full)

func _update_all() -> void:
	_on_coins_changed(GameManager.coins)
	_on_xp_changed(GameManager.xp, GameManager.level)
	_on_inventory_changed("", 0)

func _on_coins_changed(new_amount: int) -> void:
	coins_label.text = "Coins: %d" % new_amount

func _on_xp_changed(_xp: int, _level: int) -> void:
	level_label.text = "Lv.%d" % GameManager.level
	xp_bar.value = GameManager.get_xp_progress()

func _on_level_up(new_level: int) -> void:
	level_label.text = "Lv.%d *" % new_level

func _on_inventory_changed(_item: String, _amount: int) -> void:
	storage_label.text = "Storage: %d/%d" % [GameManager.get_total_items(), GameManager.storage_capacity]

func _on_storage_full() -> void:
	storage_label.modulate = Color.RED
	var tween := create_tween()
	tween.tween_property(storage_label, "modulate", Color.WHITE, 1.0)
