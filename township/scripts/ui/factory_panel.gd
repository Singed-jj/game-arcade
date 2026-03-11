extends Control
## Popup panel when clicking a factory. Shows recipes and production queue.

var target_factory: Node = null
var recipe_buttons: VBoxContainer

func _ready() -> void:
	visible = false
	_setup_ui()
	EventBus.panel_opened.connect(_on_panel_opened)

func _setup_ui() -> void:
	var bg := ColorRect.new()
	bg.color = Color(0.12, 0.12, 0.18, 0.95)
	bg.size = Vector2(400, 300)
	bg.position = Vector2(440, 210)
	add_child(bg)
	var title := Label.new()
	title.name = "Title"
	title.position = Vector2(460, 215)
	title.add_theme_font_size_override("font_size", 18)
	add_child(title)
	var close_btn := Button.new()
	close_btn.text = "X"
	close_btn.position = Vector2(800, 215)
	close_btn.pressed.connect(func(): visible = false)
	add_child(close_btn)
	recipe_buttons = VBoxContainer.new()
	recipe_buttons.position = Vector2(460, 260)
	add_child(recipe_buttons)

func _on_panel_opened(panel_name: String) -> void:
	if not panel_name.begins_with("factory:"):
		return
	var factory_type := panel_name.substr(8)
	_show_for_factory_type(factory_type)

func set_factory(factory_node: Node) -> void:
	target_factory = factory_node

func _show_for_factory_type(factory_type: String) -> void:
	var title_label := get_node("Title") as Label
	var data := BuildingDB.get_building(factory_type)
	title_label.text = "Factory: " + data.get("name", factory_type)
	for child in recipe_buttons.get_children():
		child.queue_free()
	var recipes := RecipeDB.get_recipes(factory_type)
	for i in range(recipes.size()):
		var recipe: Dictionary = recipes[i]
		var btn := Button.new()
		var input_text := ""
		for item_id in recipe["input"]:
			input_text += "%s x%d " % [RecipeDB.get_item_name(item_id), recipe["input"][item_id]]
		btn.text = "%s -> %s (%.0fs)" % [input_text.strip_edges(), RecipeDB.get_item_name(recipe["output"]), recipe["time"]]
		btn.custom_minimum_size = Vector2(360, 40)
		var has_input := GameManager.has_items(recipe["input"])
		btn.disabled = not has_input
		btn.pressed.connect(_on_recipe_selected.bind(i))
		recipe_buttons.add_child(btn)
	if target_factory and target_factory.has_method("get_queue_info"):
		var queue: Array[Dictionary] = target_factory.get_queue_info()
		if queue.size() > 0:
			var queue_label := Label.new()
			queue_label.text = "\nQueue: %d/%d" % [queue.size(), data.get("slots", 2)]
			recipe_buttons.add_child(queue_label)
	visible = true

func _on_recipe_selected(recipe_index: int) -> void:
	if target_factory and target_factory.has_method("start_production"):
		target_factory.start_production(recipe_index)
		visible = false
