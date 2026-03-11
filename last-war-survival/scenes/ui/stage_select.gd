extends Control

## Stage select + upgrade screen

const BATTLE_SCENE_PATH := "res://scenes/battle/battle_scene.tscn"

@onready var _stage_label: Label = $VBox/StageInfo/StageLabel
@onready var _best_label: Label = $VBox/StageInfo/BestLabel
@onready var _coins_label: Label = $VBox/TopBar/CoinsLabel
@onready var _hp_btn: Button = $VBox/Upgrades/HPUpgrade/BuyBtn
@onready var _atk_btn: Button = $VBox/Upgrades/AtkUpgrade/BuyBtn
@onready var _army_btn: Button = $VBox/Upgrades/ArmyUpgrade/BuyBtn
@onready var _hp_level: Label = $VBox/Upgrades/HPUpgrade/LevelLabel
@onready var _atk_level: Label = $VBox/Upgrades/AtkUpgrade/LevelLabel
@onready var _army_level: Label = $VBox/Upgrades/ArmyUpgrade/LevelLabel

func _ready() -> void:
	visible = false
	_update_ui()
	EventBus.show_mission_complete.connect(_on_mission_complete)
	EventBus.show_game_over.connect(_on_game_over)

func _on_visibility_changed() -> void:
	if visible:
		_update_ui()

func _update_ui() -> void:
	var stage: int = SaveManager.get_current_stage()
	_stage_label.text = "STAGE %d" % stage
	_best_label.text = "Best: Stage %d" % SaveManager.get_max_cleared_stage()
	_coins_label.text = "%d" % SaveManager.get_currency("coins")

	var hp_lv: int = SaveManager.get_upgrade_level("hp")
	var atk_lv: int = SaveManager.get_upgrade_level("attack")
	var army_lv: int = SaveManager.get_upgrade_level("army_size")

	_hp_level.text = "HP Lv.%d" % hp_lv
	_atk_level.text = "ATK Lv.%d" % atk_lv
	_army_level.text = "ARMY Lv.%d" % army_lv

	_hp_btn.text = "%d" % GameManager.get_upgrade_cost("hp")
	_atk_btn.text = "%d" % GameManager.get_upgrade_cost("attack")
	_army_btn.text = "%d" % GameManager.get_upgrade_cost("army_size")

func _on_play_pressed() -> void:
	visible = false
	var battle: PackedScene = load(BATTLE_SCENE_PATH)
	var instance: Node2D = battle.instantiate()
	get_parent().add_child(instance)

func _on_hp_buy_pressed() -> void:
	GameManager.purchase_upgrade("hp")
	_update_ui()

func _on_atk_buy_pressed() -> void:
	GameManager.purchase_upgrade("attack")
	_update_ui()

func _on_army_buy_pressed() -> void:
	GameManager.purchase_upgrade("army_size")
	_update_ui()

func _on_mission_complete(stage: int, kills: int, coins: int) -> void:
	visible = true
	_update_ui()

func _on_game_over(stage: int, kills: int) -> void:
	visible = true
	_update_ui()
