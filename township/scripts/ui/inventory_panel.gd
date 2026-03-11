extends Control
## Shows all items in warehouse as a simple list.

var items_container: VBoxContainer

func _ready() -> void:
	visible = false
	_setup_ui()
	EventBus.inventory_changed.connect(func(_a, _b): _refresh() if visible else null)

func _setup_ui() -> void:
	var bg := ColorRect.new()
	bg.color = Color(0.12, 0.12, 0.18, 0.95)
	bg.size = Vector2(400, 350)
	bg.position = Vector2(440, 185)
	add_child(bg)
	var title := Label.new()
	title.text = "Inventory"
	title.position = Vector2(460, 190)
	title.add_theme_font_size_override("font_size", 18)
	add_child(title)
	var close_btn := Button.new()
	close_btn.text = "X"
	close_btn.position = Vector2(800, 190)
	close_btn.pressed.connect(func(): visible = false; EventBus.panel_closed.emit("inventory"))
	add_child(close_btn)
	items_container = VBoxContainer.new()
	items_container.position = Vector2(460, 230)
	add_child(items_container)

func open() -> void:
	_refresh()
	visible = true
	EventBus.panel_opened.emit("inventory")

func _refresh() -> void:
	for child in items_container.get_children():
		child.queue_free()
	if GameManager.inventory.is_empty():
		var empty_label := Label.new()
		empty_label.text = "Empty"
		items_container.add_child(empty_label)
		return
	for item_id in GameManager.inventory:
		var amount: int = GameManager.inventory[item_id]
		if amount <= 0:
			continue
		var row := Label.new()
		row.text = "%s: %d" % [RecipeDB.get_item_name(item_id), amount]
		row.add_theme_font_size_override("font_size", 16)
		items_container.add_child(row)
	var info := Label.new()
	info.text = "\nUsed: %d / %d" % [GameManager.get_total_items(), GameManager.storage_capacity]
	items_container.add_child(info)
