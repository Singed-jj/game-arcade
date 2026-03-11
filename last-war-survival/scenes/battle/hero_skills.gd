extends CanvasLayer

## Hero skill system - 3 skill slots with cooldowns
## Skills: Ice Beam (AOE), Airstrike (burst), Healing Wave (heal)

const SKILL_COUNT: int = 3
const SKILL_COOLDOWNS: Array[float] = [7.0, 10.0, 8.0]
const SKILL_NAMES: Array[String] = ["Ice Beam", "Airstrike", "Heal"]
const SKILL_COLORS: Array[Color] = [
	Color(0.4, 0.8, 1.0, 1.0),   # Ice blue
	Color(1.0, 0.5, 0.2, 1.0),   # Orange
	Color(0.3, 0.9, 0.5, 1.0),   # Green
]

var _cooldown_timers: Array[float] = [0.0, 0.0, 0.0]
var _buttons: Array[Button] = []
var _cooldown_bars: Array[ProgressBar] = []

func _ready() -> void:
	_create_skill_ui()

func _process(delta: float) -> void:
	if not GameManager.is_battle_active:
		return
	for i in range(SKILL_COUNT):
		if _cooldown_timers[i] > 0:
			_cooldown_timers[i] -= delta
			if _cooldown_timers[i] <= 0:
				_cooldown_timers[i] = 0.0
				_buttons[i].disabled = false
				EventBus.hero_skill_ready.emit(i)
			_cooldown_bars[i].value = _cooldown_timers[i] / SKILL_COOLDOWNS[i] * 100.0
		else:
			_cooldown_bars[i].value = 0.0

func _create_skill_ui() -> void:
	var container := HBoxContainer.new()
	container.name = "SkillContainer"
	container.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	container.offset_top = -80.0
	container.offset_bottom = -10.0
	container.offset_left = 20.0
	container.offset_right = -20.0
	container.alignment = BoxContainer.ALIGNMENT_CENTER
	container.add_theme_constant_override("separation", 15)
	add_child(container)

	for i in range(SKILL_COUNT):
		var vbox := VBoxContainer.new()
		vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL

		var btn := Button.new()
		btn.text = SKILL_NAMES[i]
		btn.custom_minimum_size = Vector2(100, 50)
		btn.pressed.connect(_on_skill_pressed.bind(i))

		var style := StyleBoxFlat.new()
		style.bg_color = SKILL_COLORS[i]
		style.corner_radius_top_left = 8
		style.corner_radius_top_right = 8
		style.corner_radius_bottom_left = 8
		style.corner_radius_bottom_right = 8
		btn.add_theme_stylebox_override("normal", style)

		var pressed_style := StyleBoxFlat.new()
		pressed_style.bg_color = SKILL_COLORS[i].darkened(0.3)
		pressed_style.corner_radius_top_left = 8
		pressed_style.corner_radius_top_right = 8
		pressed_style.corner_radius_bottom_left = 8
		pressed_style.corner_radius_bottom_right = 8
		btn.add_theme_stylebox_override("pressed", pressed_style)

		var disabled_style := StyleBoxFlat.new()
		disabled_style.bg_color = Color(0.3, 0.3, 0.3, 0.7)
		disabled_style.corner_radius_top_left = 8
		disabled_style.corner_radius_top_right = 8
		disabled_style.corner_radius_bottom_left = 8
		disabled_style.corner_radius_bottom_right = 8
		btn.add_theme_stylebox_override("disabled", disabled_style)

		_buttons.append(btn)
		vbox.add_child(btn)

		var progress := ProgressBar.new()
		progress.custom_minimum_size = Vector2(100, 6)
		progress.max_value = 100.0
		progress.value = 0.0
		progress.show_percentage = false
		_cooldown_bars.append(progress)
		vbox.add_child(progress)

		container.add_child(vbox)

func _on_skill_pressed(index: int) -> void:
	if _cooldown_timers[index] > 0:
		return
	_cooldown_timers[index] = SKILL_COOLDOWNS[index]
	_buttons[index].disabled = true
	EventBus.hero_skill_used.emit(index)
	_execute_skill(index)

func _execute_skill(index: int) -> void:
	match index:
		0: _ice_beam()
		1: _airstrike()
		2: _healing_wave()

func _ice_beam() -> void:
	var enemies: Array = get_tree().get_nodes_in_group("enemies")
	for enemy in enemies:
		if is_instance_valid(enemy) and enemy.has_method("take_damage"):
			enemy.take_damage(GameManager.get_soldier_attack() * 3.0)

func _airstrike() -> void:
	var enemies: Array = get_tree().get_nodes_in_group("enemies")
	for enemy in enemies:
		if is_instance_valid(enemy) and enemy.has_method("take_damage"):
			enemy.take_damage(GameManager.get_soldier_attack() * 5.0)

func _healing_wave() -> void:
	var soldiers: Array = get_tree().get_nodes_in_group("soldiers")
	var heal_amount: float = GameManager.get_soldier_hp() * 0.5
	for soldier in soldiers:
		if is_instance_valid(soldier):
			soldier.hp = minf(soldier.hp + heal_amount, GameManager.get_soldier_hp())
