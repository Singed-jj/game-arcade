extends Control
## Shows 3 helicopter orders. Each has item requirements + Send/Delete buttons.

var order_cards: Array[VBoxContainer] = []

func _ready() -> void:
	visible = false
	_setup_ui()
	EventBus.order_refreshed.connect(_refresh_order)
	EventBus.inventory_changed.connect(func(_a, _b): _refresh_all() if visible else null)

func _setup_ui() -> void:
	var bg := ColorRect.new()
	bg.color = Color(0.12, 0.12, 0.18, 0.95)
	bg.size = Vector2(800, 300)
	bg.position = Vector2(240, 210)
	add_child(bg)
	var title := Label.new()
	title.text = "Helicopter Orders"
	title.position = Vector2(260, 215)
	title.add_theme_font_size_override("font_size", 20)
	add_child(title)
	var close_btn := Button.new()
	close_btn.text = "X"
	close_btn.position = Vector2(1000, 215)
	close_btn.pressed.connect(func(): visible = false; EventBus.panel_closed.emit("orders"))
	add_child(close_btn)
	var cards_container := HBoxContainer.new()
	cards_container.position = Vector2(260, 260)
	cards_container.add_theme_constant_override("separation", 20)
	add_child(cards_container)
	for i in range(3):
		var card := _create_order_card(i)
		cards_container.add_child(card)
		order_cards.append(card)

func _create_order_card(index: int) -> VBoxContainer:
	var card := VBoxContainer.new()
	card.custom_minimum_size = Vector2(230, 200)
	var card_bg := ColorRect.new()
	card_bg.color = Color(0.2, 0.2, 0.28)
	card_bg.size = Vector2(230, 200)
	card.add_child(card_bg)
	var items_label := Label.new()
	items_label.name = "ItemsLabel"
	items_label.autowrap_mode = TextServer.AUTOWRAP_WORD
	items_label.custom_minimum_size = Vector2(220, 100)
	card.add_child(items_label)
	var reward_label := Label.new()
	reward_label.name = "RewardLabel"
	card.add_child(reward_label)
	var btn_row := HBoxContainer.new()
	var send_btn := Button.new()
	send_btn.name = "SendBtn"
	send_btn.text = "Send"
	send_btn.pressed.connect(func(): _send_order(index))
	btn_row.add_child(send_btn)
	var del_btn := Button.new()
	del_btn.name = "DeleteBtn"
	del_btn.text = "Delete"
	del_btn.pressed.connect(func(): _delete_order(index))
	btn_row.add_child(del_btn)
	card.add_child(btn_row)
	return card

func open() -> void:
	_refresh_all()
	visible = true
	EventBus.panel_opened.emit("orders")

func _refresh_all() -> void:
	for i in range(3):
		_refresh_order(i)

func _refresh_order(index: int) -> void:
	if index >= order_cards.size() or index >= GameManager.orders.size():
		return
	var card := order_cards[index]
	var order: Dictionary = GameManager.orders[index]
	var items_text := ""
	var can_send := true
	for item_id in order["items"]:
		var needed: int = order["items"][item_id]
		var have: int = GameManager.get_item_count(item_id)
		var status := "OK" if have >= needed else "NEED"
		items_text += "%s: %d/%d [%s]\n" % [RecipeDB.get_item_name(item_id), have, needed, status]
		if have < needed:
			can_send = false
	var items_label := card.get_node("ItemsLabel") as Label
	items_label.text = items_text.strip_edges()
	var reward_label := card.get_node("RewardLabel") as Label
	reward_label.text = "Reward: %d coins, %d XP" % [order["reward_coins"], order["reward_xp"]]
	var send_btn := card.get_node("SendBtn") as Button
	send_btn.disabled = not can_send

func _send_order(index: int) -> void:
	GameManager.complete_order(index)

func _delete_order(index: int) -> void:
	GameManager.delete_order(index)
