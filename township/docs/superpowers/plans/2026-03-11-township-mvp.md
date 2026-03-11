# Township MVP Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 탑다운 2D 타운 빌더 + 농장/공장 생산체인 + 주문 시스템 MVP 구현

**Architecture:** Godot 4.4 GDScript. Autoload 싱글톤 3개(SaveManager, GameManager, EventBus)가 게임 상태를 관리. 건물은 공통 base class에서 파생. 맵은 TileMapLayer 기반 그리드. UI는 CanvasLayer로 분리.

**Tech Stack:** Godot 4.4, GDScript, HTML5 export, localStorage save

**Spec:** `docs/superpowers/specs/2026-03-11-township-mvp-design.md`

---

## File Structure

```
township/
├── project.godot                    # Godot 프로젝트 설정 + Autoload 등록
├── scenes/
│   ├── main.tscn                    # 루트 씬: 맵 + 카메라 + UI
│   ├── buildings/
│   │   ├── building.tscn            # 건물 공용 씬 (Sprite2D + Area2D + ProgressBar)
│   │   ├── helicopter_pad.tscn      # 헬리콥터 패드 씬
│   │   └── warehouse.tscn           # 창고 씬
│   └── ui/
│       ├── hud.tscn                 # HUD (레벨, 코인, 저장소)
│       ├── build_panel.tscn         # 건설 패널
│       ├── order_panel.tscn         # 주문 패널
│       ├── factory_panel.tscn       # 공장 생산 선택 패널
│       └── inventory_panel.tscn     # 인벤토리 패널
├── scripts/
│   ├── managers/
│   │   ├── save_manager.gd          # Autoload: localStorage 저장/로드
│   │   ├── game_manager.gd          # Autoload: 레벨/XP/코인/인벤토리 상태
│   │   └── event_bus.gd             # Autoload: 시그널 버스
│   ├── data/
│   │   ├── building_db.gd           # 건물 정적 데이터 (Dictionary)
│   │   ├── recipe_db.gd             # 레시피 정적 데이터
│   │   └── level_db.gd              # 레벨/해금 정적 데이터
│   ├── map/
│   │   ├── grid_map.gd              # 그리드 맵 관리 (배치/충돌)
│   │   └── camera_controller.gd     # 카메라 패닝/줌
│   ├── buildings/
│   │   ├── building_base.gd         # 건물 기본 클래스
│   │   ├── farm.gd                  # 농장 로직 (심기→성장→수확)
│   │   ├── factory.gd               # 공장 로직 (투입→생산→수거)
│   │   ├── helicopter_pad.gd        # 주문 납품 로직
│   │   └── warehouse.gd             # 창고 (UI 트리거만)
│   └── ui/
│       ├── hud.gd                   # HUD 업데이트
│       ├── build_panel.gd           # 건설 UI + 배치 모드
│       ├── order_panel.gd           # 주문 목록 UI
│       ├── factory_panel.gd         # 공장 레시피 선택 UI
│       └── inventory_panel.gd       # 인벤토리 그리드 UI
└── assets/
    ├── sprites/
    │   ├── buildings/               # 건물 스프라이트 (32x32)
    │   ├── items/                   # 아이템 아이콘 (16x16)
    │   ├── tiles/                   # 맵 타일 (32x32)
    │   └── ui/                      # UI 요소
    └── fonts/
```

---

## Chunk 1: Foundation — Project Setup & Data Layer

### Task 1: Project Configuration

**Files:**
- Modify: `project.godot`

- [ ] **Step 1: Update project.godot with display settings and autoloads**

```ini
config_version=5

[application]
config/name="Township"
config/features=PackedStringArray("4.4")
run/main_scene="res://scenes/main.tscn"

[autoload]
SaveManager="*res://scripts/managers/save_manager.gd"
GameManager="*res://scripts/managers/game_manager.gd"
EventBus="*res://scripts/managers/event_bus.gd"

[display]
window/size/viewport_width=1280
window/size/viewport_height=720
window/stretch/mode="canvas_items"
window/stretch/aspect="keep_width"

[rendering]
renderer/rendering_method="gl_compatibility"
```

- [ ] **Step 2: Commit**
```bash
git add project.godot && git commit -m "chore: configure project settings, autoloads, display"
```

### Task 2: EventBus Singleton

**Files:**
- Create: `scripts/managers/event_bus.gd`

- [ ] **Step 1: Create EventBus with all game signals**

```gdscript
extends Node
## Global signal bus for decoupled communication between systems.

# Inventory
signal inventory_changed(item_id: String, new_amount: int)
signal storage_full()

# Buildings
signal building_placed(building_type: String, grid_pos: Vector2i)
signal building_removed(grid_pos: Vector2i)
signal farm_harvest_ready(farm_node: Node)
signal farm_harvested(item_id: String, amount: int)
signal factory_production_ready(factory_node: Node)
signal factory_collected(item_id: String, amount: int)

# Orders
signal order_completed(reward_coins: int, reward_xp: int)
signal order_refreshed(slot_index: int)

# Player
signal coins_changed(new_amount: int)
signal xp_changed(new_xp: int, new_level: int)
signal level_up(new_level: int)

# UI
signal build_mode_entered()
signal build_mode_exited()
signal panel_opened(panel_name: String)
signal panel_closed(panel_name: String)
```

- [ ] **Step 2: Commit**
```bash
git add scripts/managers/event_bus.gd && git commit -m "feat: add EventBus signal hub"
```

### Task 3: SaveManager

**Files:**
- Create: `scripts/managers/save_manager.gd`

- [ ] **Step 1: Create SaveManager based on local-storage-save.md reference, adapted for Township data**

```gdscript
extends Node
## Persists game state to localStorage (web) or user://save.json (native).

const SAVE_KEY := "township_save"
const SAVE_VERSION := 1

var data := {}

func _ready() -> void:
	load_game()

func save_game() -> void:
	data["_version"] = SAVE_VERSION
	data["_saved_at"] = Time.get_datetime_string_from_system()
	var json_str := JSON.stringify(data)
	if _is_web():
		JavaScriptBridge.eval("localStorage.setItem('%s', '%s')" % [SAVE_KEY, json_str.c_escape()])
	else:
		_save_to_file(json_str)

func load_game() -> void:
	if _is_web():
		var raw = JavaScriptBridge.eval("localStorage.getItem('%s')" % SAVE_KEY)
		if raw != null and raw is String and raw != "":
			var parsed = JSON.parse_string(raw)
			if parsed is Dictionary:
				data = parsed
				return
	else:
		_load_from_file()
		return
	data = _default_data()

func clear_save() -> void:
	data = _default_data()
	if _is_web():
		JavaScriptBridge.eval("localStorage.removeItem('%s')" % SAVE_KEY)
	else:
		var path := "user://save.json"
		if FileAccess.file_exists(path):
			DirAccess.remove_absolute(path)

func get_val(key: String, default_value = null):
	return data.get(key, default_value)

func set_val(key: String, value) -> void:
	data[key] = value
	save_game()

func _is_web() -> bool:
	return OS.has_feature("web")

func _default_data() -> Dictionary:
	return {
		"_version": SAVE_VERSION,
		"level": 1,
		"xp": 0,
		"coins": 200,
		"inventory": {},
		"storage_capacity": 20,
		"buildings": [],
		"orders": [],
	}

func _save_to_file(json_str: String) -> void:
	var file := FileAccess.open("user://save.json", FileAccess.WRITE)
	if file:
		file.store_string(json_str)

func _load_from_file() -> void:
	var path := "user://save.json"
	if not FileAccess.file_exists(path):
		data = _default_data()
		return
	var file := FileAccess.open(path, FileAccess.READ)
	if file:
		var parsed = JSON.parse_string(file.get_as_text())
		if parsed is Dictionary:
			data = parsed
			return
	data = _default_data()
```

- [ ] **Step 2: Commit**
```bash
git add scripts/managers/save_manager.gd && git commit -m "feat: add SaveManager with localStorage/file persistence"
```

### Task 4: Static Data — Buildings, Recipes, Levels

**Files:**
- Create: `scripts/data/building_db.gd`
- Create: `scripts/data/recipe_db.gd`
- Create: `scripts/data/level_db.gd`

- [ ] **Step 1: Create BuildingDB**

```gdscript
class_name BuildingDB

## Building type constants
const WHEAT_FARM := "wheat_farm"
const CORN_FARM := "corn_farm"
const CARROT_FARM := "carrot_farm"
const BAKERY := "bakery"
const CANNERY := "cannery"
const JUICE_FACTORY := "juice_factory"
const HELICOPTER_PAD := "helicopter_pad"
const WAREHOUSE := "warehouse"

## category constants
const CAT_FARM := "farm"
const CAT_FACTORY := "factory"
const CAT_SPECIAL := "special"

static var BUILDINGS: Dictionary = {
	WHEAT_FARM: {
		"name": "밀 농장",
		"category": CAT_FARM,
		"unlock_level": 1,
		"cost": 50,
		"size": Vector2i(2, 2),
		"grow_time": 30.0,
		"output_item": "wheat",
		"output_amount": 1,
	},
	CORN_FARM: {
		"name": "옥수수 농장",
		"category": CAT_FARM,
		"unlock_level": 3,
		"cost": 120,
		"size": Vector2i(2, 2),
		"grow_time": 60.0,
		"output_item": "corn",
		"output_amount": 1,
	},
	CARROT_FARM: {
		"name": "당근 농장",
		"category": CAT_FARM,
		"unlock_level": 5,
		"cost": 200,
		"size": Vector2i(2, 2),
		"grow_time": 45.0,
		"output_item": "carrot",
		"output_amount": 1,
	},
	BAKERY: {
		"name": "제빵 공장",
		"category": CAT_FACTORY,
		"unlock_level": 2,
		"cost": 100,
		"size": Vector2i(2, 2),
		"slots": 2,
	},
	CANNERY: {
		"name": "통조림 공장",
		"category": CAT_FACTORY,
		"unlock_level": 4,
		"cost": 250,
		"size": Vector2i(2, 2),
		"slots": 2,
	},
	JUICE_FACTORY: {
		"name": "주스 공장",
		"category": CAT_FACTORY,
		"unlock_level": 6,
		"cost": 350,
		"size": Vector2i(2, 2),
		"slots": 2,
	},
	HELICOPTER_PAD: {
		"name": "헬리콥터 패드",
		"category": CAT_SPECIAL,
		"unlock_level": 1,
		"cost": 0,
		"size": Vector2i(3, 3),
	},
	WAREHOUSE: {
		"name": "창고",
		"category": CAT_SPECIAL,
		"unlock_level": 1,
		"cost": 0,
		"size": Vector2i(2, 2),
	},
}

static func get_building(type: String) -> Dictionary:
	return BUILDINGS.get(type, {})

static func get_unlocked_buildings(level: int) -> Array[String]:
	var result: Array[String] = []
	for key in BUILDINGS:
		if BUILDINGS[key]["unlock_level"] <= level:
			result.append(key)
	return result
```

- [ ] **Step 2: Create RecipeDB**

```gdscript
class_name RecipeDB

## Item display names
static var ITEM_NAMES: Dictionary = {
	"wheat": "밀",
	"corn": "옥수수",
	"carrot": "당근",
	"bread": "빵",
	"canned_corn": "통조림",
	"carrot_juice": "당근 주스",
}

## Item base values (for order reward calculation)
static var ITEM_VALUES: Dictionary = {
	"wheat": 5,
	"corn": 8,
	"carrot": 7,
	"bread": 15,
	"canned_corn": 20,
	"carrot_juice": 18,
}

## Factory recipes: factory_type -> Array of recipes
static var RECIPES: Dictionary = {
	"bakery": [
		{"input": {"wheat": 1}, "output": "bread", "amount": 1, "time": 60.0},
	],
	"cannery": [
		{"input": {"corn": 1}, "output": "canned_corn", "amount": 1, "time": 90.0},
	],
	"juice_factory": [
		{"input": {"carrot": 1}, "output": "carrot_juice", "amount": 1, "time": 75.0},
	],
}

static func get_recipes(factory_type: String) -> Array:
	return RECIPES.get(factory_type, [])

static func get_item_name(item_id: String) -> String:
	return ITEM_NAMES.get(item_id, item_id)

static func get_item_value(item_id: String) -> int:
	return ITEM_VALUES.get(item_id, 1)
```

- [ ] **Step 3: Create LevelDB**

```gdscript
class_name LevelDB

## level -> {xp_required, unlocks description}
static var LEVELS: Dictionary = {
	1: {"xp_required": 0, "description": "시작"},
	2: {"xp_required": 50, "description": "제빵 공장 해금"},
	3: {"xp_required": 120, "description": "옥수수 농장 해금"},
	4: {"xp_required": 200, "description": "통조림 공장 해금"},
	5: {"xp_required": 300, "description": "당근 농장 해금"},
	6: {"xp_required": 420, "description": "주스 공장 해금"},
	7: {"xp_required": 560, "description": "창고 확장 할인"},
	8: {"xp_required": 720, "description": "농장 추가 배치"},
	9: {"xp_required": 900, "description": "공장 슬롯 +1"},
	10: {"xp_required": 1100, "description": "MVP 완료!"},
}

static var MAX_LEVEL := 10

static func get_xp_for_level(level: int) -> int:
	if LEVELS.has(level):
		return LEVELS[level]["xp_required"]
	return 99999

static func get_level_for_xp(total_xp: int) -> int:
	var result := 1
	for lvl in range(1, MAX_LEVEL + 1):
		if total_xp >= LEVELS[lvl]["xp_required"]:
			result = lvl
		else:
			break
	return result
```

- [ ] **Step 4: Commit**
```bash
git add scripts/data/ && git commit -m "feat: add static data — BuildingDB, RecipeDB, LevelDB"
```

### Task 5: GameManager

**Files:**
- Create: `scripts/managers/game_manager.gd`

- [ ] **Step 1: Create GameManager — core state controller**

```gdscript
extends Node
## Central game state: coins, XP, level, inventory, orders.

var coins: int = 200
var xp: int = 0
var level: int = 1
var inventory: Dictionary = {}  # {item_id: amount}
var storage_capacity: int = 20
var orders: Array[Dictionary] = []

func _ready() -> void:
	_load_state()
	_ensure_orders()

# --- Coins ---

func add_coins(amount: int) -> void:
	coins += amount
	EventBus.coins_changed.emit(coins)
	_save_state()

func spend_coins(amount: int) -> bool:
	if coins < amount:
		return false
	coins -= amount
	EventBus.coins_changed.emit(coins)
	_save_state()
	return true

# --- XP & Level ---

func add_xp(amount: int) -> void:
	xp += amount
	var new_level := LevelDB.get_level_for_xp(xp)
	if new_level > level:
		level = new_level
		EventBus.level_up.emit(level)
	EventBus.xp_changed.emit(xp, level)
	_save_state()

func get_xp_progress() -> float:
	## Returns 0.0-1.0 progress toward next level
	if level >= LevelDB.MAX_LEVEL:
		return 1.0
	var current_threshold := LevelDB.get_xp_for_level(level)
	var next_threshold := LevelDB.get_xp_for_level(level + 1)
	var range_val := next_threshold - current_threshold
	if range_val <= 0:
		return 1.0
	return float(xp - current_threshold) / float(range_val)

# --- Inventory ---

func get_item_count(item_id: String) -> int:
	return inventory.get(item_id, 0)

func get_total_items() -> int:
	var total := 0
	for amount in inventory.values():
		total += amount
	return total

func can_store(amount: int) -> bool:
	return get_total_items() + amount <= storage_capacity

func add_item(item_id: String, amount: int = 1) -> bool:
	if not can_store(amount):
		EventBus.storage_full.emit()
		return false
	inventory[item_id] = get_item_count(item_id) + amount
	EventBus.inventory_changed.emit(item_id, inventory[item_id])
	_save_state()
	return true

func remove_item(item_id: String, amount: int = 1) -> bool:
	if get_item_count(item_id) < amount:
		return false
	inventory[item_id] -= amount
	if inventory[item_id] <= 0:
		inventory.erase(item_id)
	EventBus.inventory_changed.emit(item_id, get_item_count(item_id))
	_save_state()
	return true

func has_items(items: Dictionary) -> bool:
	for item_id in items:
		if get_item_count(item_id) < items[item_id]:
			return false
	return true

func remove_items(items: Dictionary) -> bool:
	if not has_items(items):
		return false
	for item_id in items:
		remove_item(item_id, items[item_id])
	return true

# --- Orders ---

func _ensure_orders() -> void:
	while orders.size() < 3:
		orders.append(_generate_order())
	_save_state()

func complete_order(index: int) -> void:
	if index < 0 or index >= orders.size():
		return
	var order: Dictionary = orders[index]
	if not has_items(order["items"]):
		return
	remove_items(order["items"])
	add_coins(order["reward_coins"])
	add_xp(order["reward_xp"])
	EventBus.order_completed.emit(order["reward_coins"], order["reward_xp"])
	orders[index] = _generate_order()
	EventBus.order_refreshed.emit(index)
	_save_state()

func delete_order(index: int) -> void:
	if index < 0 or index >= orders.size():
		return
	orders[index] = _generate_order()
	EventBus.order_refreshed.emit(index)
	_save_state()

func _generate_order() -> Dictionary:
	var available_items: Array[String] = ["wheat"]
	if level >= 2:
		available_items.append("bread")
	if level >= 3:
		available_items.append("corn")
	if level >= 4:
		available_items.append("canned_corn")
	if level >= 5:
		available_items.append("carrot")
	if level >= 6:
		available_items.append("carrot_juice")

	var num_types := clampi(randi_range(1, ceili(level / 3.0)), 1, mini(3, available_items.size()))
	available_items.shuffle()
	var order_items := {}
	var total_value := 0
	for i in range(num_types):
		var item_id: String = available_items[i]
		var qty := randi_range(1, clampi(ceili(level / 3.0), 1, 3))
		order_items[item_id] = qty
		total_value += RecipeDB.get_item_value(item_id) * qty

	return {
		"items": order_items,
		"reward_coins": ceili(total_value * 1.5),
		"reward_xp": num_types * 10 + (level * 2),
	}

# --- Persistence ---

func _save_state() -> void:
	SaveManager.data["coins"] = coins
	SaveManager.data["xp"] = xp
	SaveManager.data["level"] = level
	SaveManager.data["inventory"] = inventory.duplicate()
	SaveManager.data["storage_capacity"] = storage_capacity
	SaveManager.data["orders"] = orders.duplicate(true)
	SaveManager.save_game()

func _load_state() -> void:
	coins = SaveManager.get_val("coins", 200)
	xp = SaveManager.get_val("xp", 0)
	level = SaveManager.get_val("level", 1)
	inventory = SaveManager.get_val("inventory", {})
	if inventory == null:
		inventory = {}
	storage_capacity = SaveManager.get_val("storage_capacity", 20)
	orders = SaveManager.get_val("orders", [])
	if orders == null:
		orders = []
	# Ensure level matches XP
	level = LevelDB.get_level_for_xp(xp)
```

- [ ] **Step 2: Commit**
```bash
git add scripts/managers/game_manager.gd && git commit -m "feat: add GameManager — coins, XP, inventory, orders"
```

---

## Chunk 2: Map, Camera & Building Placement

### Task 6: Camera Controller

**Files:**
- Create: `scripts/map/camera_controller.gd`

- [ ] **Step 1: Create camera with drag-pan and scroll-zoom**

```gdscript
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
```

- [ ] **Step 2: Commit**
```bash
git add scripts/map/camera_controller.gd && git commit -m "feat: add camera pan/zoom controller"
```

### Task 7: Grid Map Manager

**Files:**
- Create: `scripts/map/grid_map.gd`

- [ ] **Step 1: Create grid map — occupancy tracking and coordinate conversion**

```gdscript
extends Node2D
## Manages the 20x20 tile grid. Tracks which cells are occupied.

const GRID_SIZE := 20
const TILE_SIZE := 32

## grid[x][y] = building_type or "" if empty
var grid: Array[Array] = []

func _ready() -> void:
	_init_grid()

func _init_grid() -> void:
	grid.clear()
	for x in range(GRID_SIZE):
		var col: Array = []
		col.resize(GRID_SIZE)
		col.fill("")
		grid.append(col)

func world_to_grid(world_pos: Vector2) -> Vector2i:
	return Vector2i(int(world_pos.x) / TILE_SIZE, int(world_pos.y) / TILE_SIZE)

func grid_to_world(grid_pos: Vector2i) -> Vector2:
	return Vector2(grid_pos.x * TILE_SIZE, grid_pos.y * TILE_SIZE)

func grid_to_world_center(grid_pos: Vector2i, building_size: Vector2i) -> Vector2:
	return Vector2(
		grid_pos.x * TILE_SIZE + building_size.x * TILE_SIZE / 2.0,
		grid_pos.y * TILE_SIZE + building_size.y * TILE_SIZE / 2.0
	)

func can_place(grid_pos: Vector2i, size: Vector2i) -> bool:
	for x in range(grid_pos.x, grid_pos.x + size.x):
		for y in range(grid_pos.y, grid_pos.y + size.y):
			if x < 0 or x >= GRID_SIZE or y < 0 or y >= GRID_SIZE:
				return false
			if grid[x][y] != "":
				return false
	return true

func place_building(grid_pos: Vector2i, size: Vector2i, building_id: String) -> void:
	for x in range(grid_pos.x, grid_pos.x + size.x):
		for y in range(grid_pos.y, grid_pos.y + size.y):
			grid[x][y] = building_id

func remove_building(grid_pos: Vector2i, size: Vector2i) -> void:
	for x in range(grid_pos.x, grid_pos.x + size.x):
		for y in range(grid_pos.y, grid_pos.y + size.y):
			if x >= 0 and x < GRID_SIZE and y >= 0 and y < GRID_SIZE:
				grid[x][y] = ""

func is_in_bounds(grid_pos: Vector2i) -> bool:
	return grid_pos.x >= 0 and grid_pos.x < GRID_SIZE and grid_pos.y >= 0 and grid_pos.y < GRID_SIZE
```

- [ ] **Step 2: Commit**
```bash
git add scripts/map/grid_map.gd && git commit -m "feat: add GridMap — occupancy grid and coordinate conversion"
```

### Task 8: Placeholder Assets

**Files:**
- Create: `assets/sprites/tiles/grass.png` (32x32 green)
- Create: `assets/sprites/buildings/` (placeholder colored squares)
- Create: `assets/sprites/items/` (placeholder colored circles)

- [ ] **Step 1: Generate minimal placeholder sprites using Godot-compatible script**

> Note: 실제 픽셀아트는 나중에 Gemini로 생성. 지금은 컬러 사각형으로 대체.

Godot 에디터에서 `@tool` 스크립트로 placeholder 생성하거나, 1x1 컬러 PNG를 수동 생성.
가장 간단한 방법: 각 건물/아이템에 **ColorRect** 노드 사용 (이미지 없이 색상으로 표시).

이 태스크에서는 스프라이트 없이 **ColorRect 기반 시각화**로 진행. 에셋은 후반부에 추가.

- [ ] **Step 2: Commit** (skip if no files — placeholder 에셋 생성은 Task 10에서 씬에 포함)

### Task 9: Main Scene Skeleton

**Files:**
- Create: `scenes/main.tscn` (via script — 코드로 씬 구성)
- Create: `scripts/main.gd`

- [ ] **Step 1: Create main.gd — root controller that assembles the game**

```gdscript
extends Node2D
## Root scene. Spawns grid background, manages building instances, connects UI.

@onready var grid_map: Node2D = $GridMap
@onready var camera: Camera2D = $Camera
@onready var buildings_container: Node2D = $Buildings
@onready var ui_layer: CanvasLayer = $UILayer

var building_nodes: Dictionary = {}  # grid_pos_key -> Node

func _ready() -> void:
	_draw_grid_background()
	_load_buildings()

func _draw_grid_background() -> void:
	# Draw grass tiles as simple colored rects
	for x in range(grid_map.GRID_SIZE):
		for y in range(grid_map.GRID_SIZE):
			var tile := ColorRect.new()
			tile.size = Vector2(grid_map.TILE_SIZE - 1, grid_map.TILE_SIZE - 1)
			tile.position = Vector2(x * grid_map.TILE_SIZE, y * grid_map.TILE_SIZE)
			tile.color = Color(0.35, 0.65, 0.25) if (x + y) % 2 == 0 else Color(0.38, 0.68, 0.28)
			add_child(tile)
			move_child(tile, 0)  # Send to back

func place_building_at(building_type: String, grid_pos: Vector2i) -> Node:
	var data := BuildingDB.get_building(building_type)
	if data.is_empty():
		return null
	var size: Vector2i = data["size"]
	if not grid_map.can_place(grid_pos, size):
		return null
	if not GameManager.spend_coins(data["cost"]):
		return null

	grid_map.place_building(grid_pos, size, building_type)

	var node: Node2D
	match data["category"]:
		BuildingDB.CAT_FARM:
			node = _create_farm(building_type, data)
		BuildingDB.CAT_FACTORY:
			node = _create_factory(building_type, data)
		_:
			node = _create_generic(building_type, data)

	node.position = grid_map.grid_to_world_center(grid_pos, size)
	buildings_container.add_child(node)
	var key := "%d,%d" % [grid_pos.x, grid_pos.y]
	building_nodes[key] = node
	node.set_meta("grid_pos", grid_pos)
	node.set_meta("building_type", building_type)

	EventBus.building_placed.emit(building_type, grid_pos)
	_save_buildings()
	return node

func _create_farm(building_type: String, data: Dictionary) -> Node2D:
	var node := Node2D.new()
	var rect := ColorRect.new()
	rect.size = Vector2(data["size"].x * grid_map.TILE_SIZE - 2, data["size"].y * grid_map.TILE_SIZE - 2)
	rect.position = -rect.size / 2
	rect.color = Color(0.6, 0.4, 0.2)  # Brown for farms
	node.add_child(rect)
	var script = preload("res://scripts/buildings/farm.gd")
	node.set_script(script)
	node.set_meta("building_data", data)
	node.set_meta("building_type", building_type)
	return node

func _create_factory(building_type: String, data: Dictionary) -> Node2D:
	var node := Node2D.new()
	var rect := ColorRect.new()
	rect.size = Vector2(data["size"].x * grid_map.TILE_SIZE - 2, data["size"].y * grid_map.TILE_SIZE - 2)
	rect.position = -rect.size / 2
	rect.color = Color(0.5, 0.5, 0.7)  # Blue-grey for factories
	node.add_child(rect)
	var script = preload("res://scripts/buildings/factory.gd")
	node.set_script(script)
	node.set_meta("building_data", data)
	node.set_meta("building_type", building_type)
	return node

func _create_generic(building_type: String, data: Dictionary) -> Node2D:
	var node := Node2D.new()
	var rect := ColorRect.new()
	rect.size = Vector2(data["size"].x * grid_map.TILE_SIZE - 2, data["size"].y * grid_map.TILE_SIZE - 2)
	rect.position = -rect.size / 2
	rect.color = Color(0.7, 0.7, 0.3)  # Yellow for special
	node.add_child(rect)
	return node

func _save_buildings() -> void:
	var building_data: Array = []
	for key in building_nodes:
		var node: Node2D = building_nodes[key]
		var grid_pos: Vector2i = node.get_meta("grid_pos")
		var btype: String = node.get_meta("building_type")
		var entry := {"type": btype, "x": grid_pos.x, "y": grid_pos.y}
		# Save building-specific state
		if node.has_method("get_save_data"):
			entry["state"] = node.get_save_data()
		building_data.append(entry)
	SaveManager.set_val("buildings", building_data)

func _load_buildings() -> void:
	var saved: Array = SaveManager.get_val("buildings", [])
	if saved == null:
		saved = []
	for entry in saved:
		var btype: String = entry.get("type", "")
		var gpos := Vector2i(entry.get("x", 0), entry.get("y", 0))
		var data := BuildingDB.get_building(btype)
		if data.is_empty():
			continue
		# Temporarily bypass coin cost for loading
		var original_coins := GameManager.coins
		GameManager.coins += data["cost"]
		var node := place_building_at(btype, gpos)
		GameManager.coins = original_coins
		# Restore building state
		if node and entry.has("state") and node.has_method("load_save_data"):
			node.load_save_data(entry["state"])
```

- [ ] **Step 2: Create minimal main.tscn structure**

> 씬은 코드로 수동 조립할 수도 있지만, 기본 노드 트리는 `.tscn`으로 정의해야 Godot이 로드 가능.

```
Main (Node2D) [script: main.gd]
├── GridMap (Node2D) [script: grid_map.gd]
├── Buildings (Node2D)
├── Camera (Camera2D) [script: camera_controller.gd]
└── UILayer (CanvasLayer)
    ├── HUD (Control)
    └── Panels (Control)
```

Run: Godot 에디터에서 씬 생성 또는 `.tscn` 파일 직접 작성.

- [ ] **Step 3: Verify — Godot에서 프로젝트 실행**

Run: `godot --headless --quit` (프로젝트 유효성 확인)
Expected: 에러 없이 종료

- [ ] **Step 4: Commit**
```bash
git add scenes/ scripts/main.gd scripts/map/ && git commit -m "feat: add main scene with grid map and camera"
```

---

## Chunk 3: Building Logic — Farm & Factory

### Task 10: Farm Building Script

**Files:**
- Create: `scripts/buildings/building_base.gd`
- Create: `scripts/buildings/farm.gd`

- [ ] **Step 1: Create BuildingBase — shared interface**

```gdscript
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
	var size := data.get("size", Vector2i(2, 2))
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
```

- [ ] **Step 2: Create Farm script**

```gdscript
extends BuildingBase
class_name FarmBuilding
## Farm: idle → growing → ready → harvested → idle

enum State { IDLE, GROWING, READY }

var state: int = State.IDLE
var building_type: String = ""
var output_item: String = ""
var output_amount: int = 1
var grow_time: float = 30.0
var ready_indicator: ColorRect

func _ready() -> void:
	super._ready()
	var data: Dictionary = get_meta("building_data", {})
	building_type = get_meta("building_type", "")
	output_item = data.get("output_item", "wheat")
	output_amount = data.get("output_amount", 1)
	grow_time = data.get("grow_time", 30.0)
	_setup_ready_indicator()

func _setup_ready_indicator() -> void:
	ready_indicator = ColorRect.new()
	ready_indicator.size = Vector2(16, 16)
	ready_indicator.position = Vector2(16, -40)
	ready_indicator.color = Color(0.2, 0.9, 0.2)  # Green "ready" dot
	ready_indicator.visible = false
	add_child(ready_indicator)

func _on_clicked() -> void:
	match state:
		State.IDLE:
			_start_growing()
		State.READY:
			_harvest()

func _start_growing() -> void:
	state = State.GROWING
	start_timer(grow_time)
	# Visual: darken farm to show "growing"
	var rect := get_child(0) as ColorRect
	if rect:
		rect.color = Color(0.4, 0.6, 0.2)  # Greenish during growth

func _on_timer_complete() -> void:
	state = State.READY
	progress_bar.visible = false
	ready_indicator.visible = true
	EventBus.farm_harvest_ready.emit(self)
	# Visual: bright color for ready
	var rect := get_child(0) as ColorRect
	if rect:
		rect.color = Color(0.9, 0.8, 0.1)  # Golden when ready

func _harvest() -> void:
	if not GameManager.can_store(output_amount):
		EventBus.storage_full.emit()
		return
	GameManager.add_item(output_item, output_amount)
	EventBus.farm_harvested.emit(output_item, output_amount)
	state = State.IDLE
	ready_indicator.visible = false
	# Reset visual
	var rect := get_child(0) as ColorRect
	if rect:
		rect.color = Color(0.6, 0.4, 0.2)  # Brown idle

func get_save_data() -> Dictionary:
	return {
		"state": state,
		"timer": timer,
	}

func load_save_data(data: Dictionary) -> void:
	state = data.get("state", State.IDLE)
	if state == State.GROWING:
		var saved_timer: float = data.get("timer", 0.0)
		# Account for elapsed time while away
		start_timer(grow_time)
		timer = saved_timer
		if timer >= grow_time:
			_on_timer_complete()
	elif state == State.READY:
		ready_indicator.visible = true
		var rect := get_child(0) as ColorRect
		if rect:
			rect.color = Color(0.9, 0.8, 0.1)
```

- [ ] **Step 3: Commit**
```bash
git add scripts/buildings/ && git commit -m "feat: add BuildingBase and Farm building logic"
```

### Task 11: Factory Building Script

**Files:**
- Create: `scripts/buildings/factory.gd`

- [ ] **Step 1: Create Factory script — queue-based production**

```gdscript
extends BuildingBase
class_name FactoryBuilding
## Factory: select recipe → consume inputs → produce → collect

enum State { IDLE, PRODUCING, READY }

var building_type: String = ""
var max_slots: int = 2
var production_queue: Array[Dictionary] = []  # [{recipe_index, timer, state}]
var current_slot: int = -1
var ready_indicator: ColorRect

func _ready() -> void:
	super._ready()
	var data: Dictionary = get_meta("building_data", {})
	building_type = get_meta("building_type", "")
	max_slots = data.get("slots", 2)
	_setup_ready_indicator()

func _setup_ready_indicator() -> void:
	ready_indicator = ColorRect.new()
	ready_indicator.size = Vector2(16, 16)
	ready_indicator.position = Vector2(16, -40)
	ready_indicator.color = Color(0.2, 0.9, 0.2)
	ready_indicator.visible = false
	add_child(ready_indicator)

func _on_clicked() -> void:
	# Check if any ready items to collect first
	var collected := false
	for i in range(production_queue.size() - 1, -1, -1):
		if production_queue[i]["state"] == State.READY:
			_collect(i)
			collected = true
	if collected:
		return
	# Otherwise open factory panel to add production
	EventBus.panel_opened.emit("factory:" + building_type)

func start_production(recipe_index: int) -> bool:
	if production_queue.size() >= max_slots:
		return false
	var recipes := RecipeDB.get_recipes(building_type)
	if recipe_index >= recipes.size():
		return false
	var recipe: Dictionary = recipes[recipe_index]
	# Check and consume inputs
	if not GameManager.has_items(recipe["input"]):
		return false
	GameManager.remove_items(recipe["input"])
	production_queue.append({
		"recipe_index": recipe_index,
		"timer": 0.0,
		"duration": recipe["time"],
		"state": State.PRODUCING,
		"output": recipe["output"],
		"amount": recipe["amount"],
	})
	_check_active_production()
	return true

func _process(delta: float) -> void:
	var any_active := false
	for entry in production_queue:
		if entry["state"] == State.PRODUCING:
			entry["timer"] += delta
			if entry["timer"] >= entry["duration"]:
				entry["state"] = State.READY
				ready_indicator.visible = true
				EventBus.factory_production_ready.emit(self)
			else:
				any_active = true
	# Update progress bar for first active item
	_update_progress_bar()

func _update_progress_bar() -> void:
	for entry in production_queue:
		if entry["state"] == State.PRODUCING:
			progress_bar.value = entry["timer"] / entry["duration"]
			progress_bar.visible = true
			return
	progress_bar.visible = false

func _collect(index: int) -> void:
	var entry: Dictionary = production_queue[index]
	if not GameManager.can_store(entry["amount"]):
		EventBus.storage_full.emit()
		return
	GameManager.add_item(entry["output"], entry["amount"])
	EventBus.factory_collected.emit(entry["output"], entry["amount"])
	production_queue.remove_at(index)
	# Check if more items are ready
	var any_ready := false
	for e in production_queue:
		if e["state"] == State.READY:
			any_ready = true
			break
	ready_indicator.visible = any_ready

func _check_active_production() -> void:
	# Ensure production states are correct
	pass

func get_queue_info() -> Array[Dictionary]:
	return production_queue

func get_save_data() -> Dictionary:
	return {"queue": production_queue.duplicate(true)}

func load_save_data(data: Dictionary) -> void:
	production_queue = data.get("queue", [])
	if production_queue == null:
		production_queue = []
	for entry in production_queue:
		if entry["state"] == State.READY:
			ready_indicator.visible = true
			break
```

- [ ] **Step 2: Commit**
```bash
git add scripts/buildings/factory.gd && git commit -m "feat: add Factory building — queue-based production"
```

---

## Chunk 4: UI Layer

### Task 12: HUD

**Files:**
- Create: `scripts/ui/hud.gd`

- [ ] **Step 1: Create HUD script — level, coins, storage display**

```gdscript
extends Control
## Top-bar HUD: [Lv.N ★ progress] [🪙 coins]  [📦 items/capacity]

@onready var level_label: Label = $LevelLabel
@onready var xp_bar: ProgressBar = $XPBar
@onready var coins_label: Label = $CoinsLabel
@onready var storage_label: Label = $StorageLabel

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
	coins_label.text = "🪙 %d" % new_amount

func _on_xp_changed(_xp: int, _level: int) -> void:
	level_label.text = "Lv.%d" % GameManager.level
	xp_bar.value = GameManager.get_xp_progress()

func _on_level_up(new_level: int) -> void:
	level_label.text = "Lv.%d ★" % new_level

func _on_inventory_changed(_item: String, _amount: int) -> void:
	storage_label.text = "📦 %d/%d" % [GameManager.get_total_items(), GameManager.storage_capacity]

func _on_storage_full() -> void:
	storage_label.modulate = Color.RED
	var tween := create_tween()
	tween.tween_property(storage_label, "modulate", Color.WHITE, 1.0)
```

- [ ] **Step 2: Commit**
```bash
git add scripts/ui/hud.gd && git commit -m "feat: add HUD — level, coins, storage display"
```

### Task 13: Build Panel

**Files:**
- Create: `scripts/ui/build_panel.gd`

- [ ] **Step 1: Create Build Panel — building selection + placement mode**

```gdscript
extends Control
## Bottom panel for selecting buildings to place. Enters build mode on selection.

var buttons_container: HBoxContainer
var selected_type: String = ""
var is_build_mode := false
var preview_node: ColorRect
var main_node: Node2D  # Reference to main scene

func _ready() -> void:
	visible = false
	_setup_ui()

func _setup_ui() -> void:
	# Background panel
	var bg := ColorRect.new()
	bg.color = Color(0.15, 0.15, 0.2, 0.9)
	bg.size = Vector2(1280, 120)
	bg.position = Vector2(0, 600)
	add_child(bg)
	# Buttons container
	buttons_container = HBoxContainer.new()
	buttons_container.position = Vector2(20, 610)
	buttons_container.add_theme_constant_override("separation", 10)
	add_child(buttons_container)
	# Cancel button
	var cancel_btn := Button.new()
	cancel_btn.text = "✕ 취소"
	cancel_btn.position = Vector2(1180, 610)
	cancel_btn.pressed.connect(_cancel_build)
	add_child(cancel_btn)

func open(main_ref: Node2D) -> void:
	main_node = main_ref
	_refresh_buttons()
	visible = true
	EventBus.build_mode_entered.emit()

func close() -> void:
	_cancel_build()
	visible = false
	EventBus.build_mode_exited.emit()

func _refresh_buttons() -> void:
	for child in buttons_container.get_children():
		child.queue_free()
	var unlocked := BuildingDB.get_unlocked_buildings(GameManager.level)
	for btype in unlocked:
		var data := BuildingDB.get_building(btype)
		var btn := Button.new()
		btn.text = "%s\n💰%d" % [data["name"], data["cost"]]
		btn.custom_minimum_size = Vector2(100, 80)
		btn.pressed.connect(_on_building_selected.bind(btype))
		# Disable if can't afford
		if GameManager.coins < data["cost"]:
			btn.disabled = true
		buttons_container.add_child(btn)

func _on_building_selected(btype: String) -> void:
	selected_type = btype
	is_build_mode = true
	# Create preview
	if preview_node:
		preview_node.queue_free()
	var data := BuildingDB.get_building(btype)
	preview_node = ColorRect.new()
	preview_node.size = Vector2(data["size"].x * 32, data["size"].y * 32)
	preview_node.color = Color(1, 1, 1, 0.5)
	preview_node.mouse_filter = Control.MOUSE_FILTER_IGNORE
	main_node.add_child(preview_node)

func _unhandled_input(event: InputEvent) -> void:
	if not is_build_mode or not main_node:
		return
	if event is InputEventMouseMotion and preview_node:
		var world_pos := main_node.get_global_mouse_position()
		var grid_map: Node2D = main_node.get_node("GridMap")
		var grid_pos := grid_map.world_to_grid(world_pos)
		preview_node.position = grid_map.grid_to_world(grid_pos)
		var data := BuildingDB.get_building(selected_type)
		if grid_map.can_place(grid_pos, data["size"]):
			preview_node.color = Color(0, 1, 0, 0.4)
		else:
			preview_node.color = Color(1, 0, 0, 0.4)
	elif event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		var world_pos := main_node.get_global_mouse_position()
		var grid_map: Node2D = main_node.get_node("GridMap")
		var grid_pos := grid_map.world_to_grid(world_pos)
		var result := main_node.place_building_at(selected_type, grid_pos)
		if result:
			_cancel_build()
			_refresh_buttons()

func _cancel_build() -> void:
	is_build_mode = false
	selected_type = ""
	if preview_node:
		preview_node.queue_free()
		preview_node = null
```

- [ ] **Step 2: Commit**
```bash
git add scripts/ui/build_panel.gd && git commit -m "feat: add Build Panel — building selection and grid placement"
```

### Task 14: Order Panel

**Files:**
- Create: `scripts/ui/order_panel.gd`

- [ ] **Step 1: Create Order Panel — 3 order cards with send/delete**

```gdscript
extends Control
## Shows 3 helicopter orders. Each has item requirements + Send/Delete buttons.

var order_cards: Array[VBoxContainer] = []

func _ready() -> void:
	visible = false
	_setup_ui()
	EventBus.order_refreshed.connect(_refresh_order)
	EventBus.inventory_changed.connect(func(_a, _b): _refresh_all())

func _setup_ui() -> void:
	var bg := ColorRect.new()
	bg.color = Color(0.12, 0.12, 0.18, 0.95)
	bg.size = Vector2(800, 300)
	bg.position = Vector2(240, 210)
	add_child(bg)
	# Title
	var title := Label.new()
	title.text = "🚁 헬리콥터 주문"
	title.position = Vector2(260, 215)
	title.add_theme_font_size_override("font_size", 20)
	add_child(title)
	# Close button
	var close_btn := Button.new()
	close_btn.text = "✕"
	close_btn.position = Vector2(1000, 215)
	close_btn.pressed.connect(func(): visible = false; EventBus.panel_closed.emit("orders"))
	add_child(close_btn)
	# 3 order cards
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
	# Items label
	var items_label := Label.new()
	items_label.name = "ItemsLabel"
	items_label.autowrap_mode = TextServer.AUTOWRAP_WORD
	items_label.custom_minimum_size = Vector2(220, 100)
	card.add_child(items_label)
	# Reward label
	var reward_label := Label.new()
	reward_label.name = "RewardLabel"
	card.add_child(reward_label)
	# Buttons
	var btn_row := HBoxContainer.new()
	var send_btn := Button.new()
	send_btn.name = "SendBtn"
	send_btn.text = "📦 납품"
	send_btn.pressed.connect(func(): _send_order(index))
	btn_row.add_child(send_btn)
	var del_btn := Button.new()
	del_btn.name = "DeleteBtn"
	del_btn.text = "🗑️"
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
	# Items
	var items_text := ""
	var can_send := true
	for item_id in order["items"]:
		var needed: int = order["items"][item_id]
		var have: int = GameManager.get_item_count(item_id)
		var color := "green" if have >= needed else "red"
		items_text += "[color=%s]%s: %d/%d[/color]\n" % [color, RecipeDB.get_item_name(item_id), have, needed]
		if have < needed:
			can_send = false
	var items_label := card.get_node("ItemsLabel") as Label
	items_label.text = items_text.strip_edges()
	# Reward
	var reward_label := card.get_node("RewardLabel") as Label
	reward_label.text = "보상: 🪙%d  ⭐%d" % [order["reward_coins"], order["reward_xp"]]
	# Send button state
	var send_btn := card.get_node("SendBtn") as Button
	send_btn.disabled = not can_send

func _send_order(index: int) -> void:
	GameManager.complete_order(index)

func _delete_order(index: int) -> void:
	GameManager.delete_order(index)
```

- [ ] **Step 2: Commit**
```bash
git add scripts/ui/order_panel.gd && git commit -m "feat: add Order Panel — 3-slot helicopter orders"
```

### Task 15: Factory Panel

**Files:**
- Create: `scripts/ui/factory_panel.gd`

- [ ] **Step 1: Create Factory Panel — recipe selection for production**

```gdscript
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
	close_btn.text = "✕"
	close_btn.position = Vector2(800, 215)
	close_btn.pressed.connect(func(): visible = false)
	add_child(close_btn)
	recipe_buttons = VBoxContainer.new()
	recipe_buttons.position = Vector2(460, 260)
	add_child(recipe_buttons)

func _on_panel_opened(panel_name: String) -> void:
	if not panel_name.begins_with("factory:"):
		return
	var factory_type := panel_name.substr(8)  # After "factory:"
	# Find the factory node that triggered this
	# This will be set by the factory's _on_clicked via EventBus
	_show_for_factory_type(factory_type)

func set_factory(factory_node: Node) -> void:
	target_factory = factory_node

func _show_for_factory_type(factory_type: String) -> void:
	var title_label := get_node("Title") as Label
	var data := BuildingDB.get_building(factory_type)
	title_label.text = "🏭 " + data.get("name", factory_type)
	# Clear old buttons
	for child in recipe_buttons.get_children():
		child.queue_free()
	# Add recipe buttons
	var recipes := RecipeDB.get_recipes(factory_type)
	for i in range(recipes.size()):
		var recipe: Dictionary = recipes[i]
		var btn := Button.new()
		var input_text := ""
		for item_id in recipe["input"]:
			input_text += "%s x%d " % [RecipeDB.get_item_name(item_id), recipe["input"][item_id]]
		btn.text = "%s → %s (%.0fs)" % [input_text.strip_edges(), RecipeDB.get_item_name(recipe["output"]), recipe["time"]]
		btn.custom_minimum_size = Vector2(360, 40)
		var has_input := GameManager.has_items(recipe["input"])
		btn.disabled = not has_input
		btn.pressed.connect(_on_recipe_selected.bind(i))
		recipe_buttons.add_child(btn)
	# Queue info
	if target_factory and target_factory.has_method("get_queue_info"):
		var queue := target_factory.get_queue_info()
		if queue.size() > 0:
			var queue_label := Label.new()
			queue_label.text = "\n생산 큐: %d/%d" % [queue.size(), data.get("slots", 2)]
			recipe_buttons.add_child(queue_label)
	visible = true

func _on_recipe_selected(recipe_index: int) -> void:
	if target_factory and target_factory.has_method("start_production"):
		target_factory.start_production(recipe_index)
		visible = false
```

- [ ] **Step 2: Commit**
```bash
git add scripts/ui/factory_panel.gd && git commit -m "feat: add Factory Panel — recipe selection UI"
```

### Task 16: Inventory Panel

**Files:**
- Create: `scripts/ui/inventory_panel.gd`

- [ ] **Step 1: Create Inventory Panel — grid display of all items**

```gdscript
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
	title.text = "📦 인벤토리"
	title.position = Vector2(460, 190)
	title.add_theme_font_size_override("font_size", 18)
	add_child(title)
	var close_btn := Button.new()
	close_btn.text = "✕"
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
		empty_label.text = "비어 있음"
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
	# Storage info
	var info := Label.new()
	info.text = "\n사용: %d / %d" % [GameManager.get_total_items(), GameManager.storage_capacity]
	items_container.add_child(info)
```

- [ ] **Step 2: Commit**
```bash
git add scripts/ui/inventory_panel.gd && git commit -m "feat: add Inventory Panel"
```

### Task 17: Bottom Navigation Bar

**Files:**
- Modify: `scripts/main.gd` — add bottom bar and wire UI panels

- [ ] **Step 1: Add bottom navigation bar to main scene and connect all panels**

Add to `main.gd`'s `_ready()`:

```gdscript
func _setup_bottom_bar() -> void:
	var bar := HBoxContainer.new()
	bar.position = Vector2(400, 670)
	bar.add_theme_constant_override("separation", 20)
	ui_layer.add_child(bar)

	var build_btn := Button.new()
	build_btn.text = "🏗️ 건설"
	build_btn.custom_minimum_size = Vector2(120, 40)
	build_btn.pressed.connect(_on_build_pressed)
	bar.add_child(build_btn)

	var order_btn := Button.new()
	order_btn.text = "🚁 주문"
	order_btn.custom_minimum_size = Vector2(120, 40)
	order_btn.pressed.connect(_on_order_pressed)
	bar.add_child(order_btn)

	var inv_btn := Button.new()
	inv_btn.text = "📋 인벤토리"
	inv_btn.custom_minimum_size = Vector2(120, 40)
	inv_btn.pressed.connect(_on_inventory_pressed)
	bar.add_child(inv_btn)
```

Wire up build_panel, order_panel, inventory_panel, factory_panel, and hud as children of UILayer in main.gd `_ready()`.

- [ ] **Step 2: Verify — Run project, check all UI panels open/close**

Run: `godot --path /Users/jaejin/projects/toy/game-arcade/township`
Expected: Green grid visible, bottom buttons work, panels open/close

- [ ] **Step 3: Commit**
```bash
git add scripts/ scenes/ && git commit -m "feat: wire all UI panels and bottom nav bar"
```

---

## Chunk 5: Integration & Polish

### Task 18: Wire Factory → Panel Communication

**Files:**
- Modify: `scripts/buildings/factory.gd`

- [ ] **Step 1: Fix factory click to pass self-reference to factory panel**

In `factory.gd` `_on_clicked()`, when no ready items, emit signal and set factory ref:

```gdscript
func _on_clicked() -> void:
	# Collect ready items first
	var collected := false
	for i in range(production_queue.size() - 1, -1, -1):
		if production_queue[i]["state"] == State.READY:
			_collect(i)
			collected = true
	if collected:
		return
	# Open factory panel
	var factory_panel = get_tree().get_first_node_in_group("factory_panel")
	if factory_panel:
		factory_panel.target_factory = self
	EventBus.panel_opened.emit("factory:" + building_type)
```

- [ ] **Step 2: Add factory_panel to "factory_panel" group in main.gd setup**

- [ ] **Step 3: Commit**
```bash
git add scripts/ && git commit -m "fix: wire factory click → factory panel communication"
```

### Task 19: Place Default Buildings on New Game

**Files:**
- Modify: `scripts/main.gd`

- [ ] **Step 1: If no saved buildings, place starting buildings (helicopter pad + warehouse)**

In `_load_buildings()`, after loading saved data:

```gdscript
func _load_buildings() -> void:
	var saved: Array = SaveManager.get_val("buildings", [])
	if saved == null or saved.is_empty():
		# First time: place default buildings
		_place_default_buildings()
		return
	# ... existing load logic
```

```gdscript
func _place_default_buildings() -> void:
	# Helicopter pad at center
	var pad_pos := Vector2i(8, 8)
	var data := BuildingDB.get_building(BuildingDB.HELICOPTER_PAD)
	grid_map.place_building(pad_pos, data["size"], BuildingDB.HELICOPTER_PAD)
	var pad := _create_generic(BuildingDB.HELICOPTER_PAD, data)
	pad.position = grid_map.grid_to_world_center(pad_pos, data["size"])
	buildings_container.add_child(pad)
	building_nodes["%d,%d" % [pad_pos.x, pad_pos.y]] = pad
	pad.set_meta("grid_pos", pad_pos)
	pad.set_meta("building_type", BuildingDB.HELICOPTER_PAD)

	# Warehouse nearby
	var wh_pos := Vector2i(12, 8)
	var wh_data := BuildingDB.get_building(BuildingDB.WAREHOUSE)
	grid_map.place_building(wh_pos, wh_data["size"], BuildingDB.WAREHOUSE)
	var wh := _create_generic(BuildingDB.WAREHOUSE, wh_data)
	wh.position = grid_map.grid_to_world_center(wh_pos, wh_data["size"])
	buildings_container.add_child(wh)
	building_nodes["%d,%d" % [wh_pos.x, wh_pos.y]] = wh
	wh.set_meta("grid_pos", wh_pos)
	wh.set_meta("building_type", BuildingDB.WAREHOUSE)

	_save_buildings()
```

- [ ] **Step 2: Commit**
```bash
git add scripts/main.gd && git commit -m "feat: place default helicopter pad and warehouse on new game"
```

### Task 20: Full Integration Test

- [ ] **Step 1: Run game and verify complete loop**

1. Start game → see green grid with helicopter pad + warehouse
2. Click 🏗️ → select 밀 농장 → place on grid → coins deducted
3. Click farm → starts growing (progress bar visible)
4. Wait 30s → golden color → click to harvest → 밀 appears in inventory
5. Click 🏗️ → select 제빵 공장 → place
6. Click factory → select 밀→빵 recipe → bread starts producing
7. Wait 60s → click factory → collect bread
8. Click 🚁 → see orders → 납품 button works
9. Send order → coins + XP increase in HUD
10. Level up → new buildings unlock in build panel

- [ ] **Step 2: Fix any issues found during integration test**

- [ ] **Step 3: Final commit**
```bash
git add -A && git commit -m "feat: township MVP — full game loop working"
```

### Task 21: Pixel Art Placeholder Generation

- [ ] **Step 1: Generate placeholder pixel art sprites using gemini-web-image-gen**

Use `Skill("gemini-web-image-gen")` for P0 assets:
- 6 building sprites (farms x3 states, factories x2 states)
- 6 item icons (wheat, corn, carrot, bread, canned_corn, carrot_juice)
- Grass/road tiles

- [ ] **Step 2: Process and import assets**

Follow `godot-game-dev/reference/asset-pipeline.md`:
1. Background removal (Pillow threshold >= 250)
2. Normalize to 32x32
3. `godot --headless --import`

- [ ] **Step 3: Replace ColorRect placeholders with actual sprites**

- [ ] **Step 4: Commit**
```bash
git add assets/ scripts/ scenes/ && git commit -m "art: add pixel art sprites and replace placeholders"
```

---

## Summary

| Chunk | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-5 | Foundation: project config, autoloads, data layer |
| 2 | 6-9 | Map, camera, grid, main scene |
| 3 | 10-11 | Building logic: farm + factory |
| 4 | 12-17 | UI: HUD, build panel, orders, factory, inventory, nav bar |
| 5 | 18-21 | Integration, default buildings, testing, pixel art |

**Total: 21 tasks**, estimated ~2-3 hours for implementation.
