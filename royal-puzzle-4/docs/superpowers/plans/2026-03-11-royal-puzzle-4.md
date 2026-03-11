# Royal Puzzle 4 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Royal Match 1:1 클론 — Match-3 + Castle Decoration 게임을 Godot 4로 구현하여 Vercel에 배포

**Architecture:** Autoload 싱글톤 3개(GameEvents, GameState, SaveManager)로 전역 상태 관리. Core(board/tile/match/booster/obstacle), UI(hud/popup/nav), Meta(castle/nightmare/life/coin/daily) 3개 모듈로 분리. Scene Flow: Splash → Home → Game → Result.

**Tech Stack:** Godot 4.4 (GDScript), HTML5 Web Export, Vercel Static Hosting

---

## File Structure

### Autoloads (scripts/autoload/)
| File | Responsibility |
|------|---------------|
| `game_events.gd` | Signal 이벤트 버스 — 씬 간 느슨한 결합 |
| `game_state.gd` | 전역 상태 (현재 레벨, 코인, 라이프, Castle 진행) |
| `save_manager.gd` | localStorage(web) / FileAccess(native) 저장 |

### Core (scripts/core/)
| File | Responsibility |
|------|---------------|
| `board.gd` | 8x8 보드 관리, 타일 생성/낙하/셔플, 비정형 보드 |
| `tile.gd` | 타일 데이터 (타입, 색상, 위치, 상태) |
| `match_detector.gd` | 3+ 매치 탐지 (수평/수직/T/L/십자) |
| `booster.gd` | 부스터 4종 생성/활성화 (Rocket/TNT/Light Ball/Missile) |
| `booster_merger.gd` | 부스터 합체 10종 판정 및 실행 |
| `obstacle.gd` | 장애물 6종 (Box/Stone/Grass/Fence/Chain/Mailbox) |
| `level_data.gd` | 레벨 정의 Resource |

### UI (scripts/ui/)
| File | Responsibility |
|------|---------------|
| `hud.gd` | 게임 중 HUD (Target, Moves, King) |
| `popup_manager.gd` | 팝업 (Win/Lose/Nightmare/Booster Unlock) |
| `bottom_nav.gd` | 홈 화면 하단 네비게이션 |

### Meta (scripts/meta/)
| File | Responsibility |
|------|---------------|
| `castle_manager.gd` | Castle 데코 에어리어/과제 관리 |
| `nightmare_manager.gd` | King's Nightmare 시나리오 관리 |
| `life_manager.gd` | 라이프 5개, 30분 회복, 코인 충전 |
| `coin_manager.gd` | 코인 획득/소비 로직 |
| `daily_bonus.gd` | 7일 연속 로그인 보너스 |

### Scenes (scenes/)
| File | Responsibility |
|------|---------------|
| `main.tscn` | 씬 전환 관리 |
| `splash.tscn` | 스플래시 화면 |
| `home.tscn` | Castle 홈 |
| `game.tscn` | Match-3 게임 보드 |
| `nightmare.tscn` | Nightmare 모드 |
| `components/tile.tscn` | 타일 씬 |
| `components/booster.tscn` | 부스터 씬 |
| `components/obstacle.tscn` | 장애물 씬 |

### Resources (resources/)
| File | Responsibility |
|------|---------------|
| `levels/level_001.tres` ~ `level_030.tres` | 레벨 데이터 30개 |
| `nightmares/` | Nightmare 시나리오 데이터 |
| `castle/` | Castle 데코 데이터 |

---

## Chunk 1: Foundation — Project Setup & Autoloads

### Task 1: Project Configuration

**Files:**
- Modify: `project.godot`

- [ ] **Step 1: Update project.godot with display settings and autoloads**

```ini
; Engine configuration file.
config_version=5

[application]

config/name="Royal Puzzle 4"
config/features=PackedStringArray("4.4")
run/main_scene="res://scenes/main.tscn"

[autoload]

GameEvents="*res://scripts/autoload/game_events.gd"
GameState="*res://scripts/autoload/game_state.gd"
SaveManager="*res://scripts/autoload/save_manager.gd"

[display]

window/size/viewport_width=720
window/size/viewport_height=1280
window/stretch/mode="canvas_items"
window/stretch/aspect="keep_height"
window/handheld/orientation=1

[rendering]

renderer/rendering_method="gl_compatibility"
```

- [ ] **Step 2: Create directory structure**

```bash
mkdir -p scripts/autoload scripts/core scripts/ui scripts/meta
mkdir -p scenes/components
mkdir -p resources/levels resources/nightmares resources/castle
mkdir -p assets/sprites assets/backgrounds assets/characters assets/effects assets/audio
```

- [ ] **Step 3: Commit**

```bash
git add project.godot
git commit -m "chore: configure project settings — 720x1280 portrait, gl_compatibility, autoloads"
```

### Task 2: GameEvents Autoload (Signal Bus)

**Files:**
- Create: `scripts/autoload/game_events.gd`

- [ ] **Step 1: Write GameEvents signal bus**

```gdscript
extends Node

# --- Board / Match ---
signal tile_swapped(from: Vector2i, to: Vector2i)
signal match_found(cells: Array[Vector2i], pattern: String)
signal tiles_cleared(cells: Array[Vector2i])
signal board_settled()
signal no_moves_available()

# --- Booster ---
signal booster_created(pos: Vector2i, type: String)
signal booster_activated(pos: Vector2i, type: String)
signal booster_merge(pos_a: Vector2i, pos_b: Vector2i, type_a: String, type_b: String)

# --- Obstacle ---
signal obstacle_hit(pos: Vector2i, type: String, remaining_hp: int)
signal obstacle_destroyed(pos: Vector2i, type: String)

# --- Level ---
signal level_started(level_number: int)
signal level_completed(level_number: int, remaining_moves: int)
signal level_failed(level_number: int)
signal moves_changed(remaining: int)
signal target_progress(target_type: String, current: int, total: int)
signal target_completed(target_type: String)

# --- Economy ---
signal coins_changed(amount: int)
signal lives_changed(amount: int)
signal stars_changed(amount: int)

# --- Meta ---
signal castle_task_completed(task_id: String)
signal castle_area_completed(area_id: String)
signal nightmare_started(scenario_id: String)
signal nightmare_completed(scenario_id: String, reward: int)
signal daily_bonus_claimed(day: int, reward: Dictionary)

# --- Scene ---
signal scene_change_requested(scene_name: String, params: Dictionary)
```

- [ ] **Step 2: Commit**

```bash
git add scripts/autoload/game_events.gd
git commit -m "feat: add GameEvents signal bus — all inter-scene signals"
```

### Task 3: SaveManager Autoload

**Files:**
- Create: `scripts/autoload/save_manager.gd`

- [ ] **Step 1: Write SaveManager with localStorage + FileAccess dual support**

```gdscript
extends Node

const SAVE_KEY := "royal_puzzle_4_save"
const SAVE_VERSION := 1

var data := {}

func _ready() -> void:
	load_game()

# --- Public API ---

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

# --- Level Progress ---

func get_current_level() -> int:
	return data.get("current_level", 1)

func set_current_level(level: int) -> void:
	data["current_level"] = level
	save_game()

# --- Currencies ---

func get_coins() -> int:
	return data.get("coins", 0)

func add_coins(amount: int) -> void:
	data["coins"] = get_coins() + amount
	save_game()
	GameEvents.coins_changed.emit(get_coins())

func spend_coins(amount: int) -> bool:
	if get_coins() < amount:
		return false
	data["coins"] = get_coins() - amount
	save_game()
	GameEvents.coins_changed.emit(get_coins())
	return true

# --- Lives ---

func get_lives() -> int:
	return data.get("lives", 5)

func set_lives(amount: int) -> void:
	data["lives"] = clampi(amount, 0, 5)
	save_game()
	GameEvents.lives_changed.emit(get_lives())

func get_lives_recovery_timestamp() -> int:
	return data.get("lives_recovery_timestamp", 0)

func set_lives_recovery_timestamp(ts: int) -> void:
	data["lives_recovery_timestamp"] = ts
	save_game()

# --- Stars ---

func get_stars() -> int:
	return data.get("stars", 0)

func add_stars(amount: int) -> void:
	data["stars"] = get_stars() + amount
	save_game()
	GameEvents.stars_changed.emit(get_stars())

func spend_stars(amount: int) -> bool:
	if get_stars() < amount:
		return false
	data["stars"] = get_stars() - amount
	save_game()
	GameEvents.stars_changed.emit(get_stars())
	return true

# --- Castle ---

func get_completed_tasks() -> Array:
	return data.get("castle_tasks_completed", [])

func complete_task(task_id: String) -> void:
	var tasks: Array = get_completed_tasks()
	if task_id not in tasks:
		tasks.append(task_id)
		data["castle_tasks_completed"] = tasks
		save_game()

# --- Nightmare ---

func get_completed_nightmares() -> Array:
	return data.get("nightmare_completed", [])

func complete_nightmare(scenario_id: String) -> void:
	var completed: Array = get_completed_nightmares()
	if scenario_id not in completed:
		completed.append(scenario_id)
		data["nightmare_completed"] = completed
		save_game()

# --- Daily Bonus ---

func get_daily_bonus_day() -> int:
	return data.get("daily_bonus_day", 0)

func get_daily_bonus_last_claim() -> String:
	return data.get("daily_bonus_last_claim", "")

func set_daily_bonus(day: int, date_str: String) -> void:
	data["daily_bonus_day"] = day
	data["daily_bonus_last_claim"] = date_str
	save_game()

# --- Settings ---

func get_setting(key: String, default_value = true):
	var settings: Dictionary = data.get("settings", {})
	return settings.get(key, default_value)

func set_setting(key: String, value) -> void:
	if not data.has("settings"):
		data["settings"] = {}
	data["settings"][key] = value
	save_game()

# --- Unlocked Boosters ---

func get_unlocked_boosters() -> Array:
	return data.get("unlocked_boosters", [])

func unlock_booster(booster_id: String) -> void:
	var boosters: Array = get_unlocked_boosters()
	if booster_id not in boosters:
		boosters.append(booster_id)
		data["unlocked_boosters"] = boosters
		save_game()

# --- Internal ---

func _is_web() -> bool:
	return OS.has_feature("web")

func _default_data() -> Dictionary:
	return {
		"_version": SAVE_VERSION,
		"current_level": 1,
		"coins": 0,
		"lives": 5,
		"lives_recovery_timestamp": 0,
		"stars": 0,
		"castle_tasks_completed": [],
		"daily_bonus_day": 0,
		"daily_bonus_last_claim": "",
		"unlocked_boosters": [],
		"nightmare_completed": [],
		"settings": {"sfx": true, "bgm": true},
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
git add scripts/autoload/save_manager.gd
git commit -m "feat: add SaveManager — localStorage/FileAccess dual save system"
```

### Task 4: GameState Autoload

**Files:**
- Create: `scripts/autoload/game_state.gd`

- [ ] **Step 1: Write GameState for runtime state management**

```gdscript
extends Node

# --- Runtime State (not saved, per-session) ---
var current_level_data: Resource = null
var is_playing := false
var is_nightmare := false

# --- Computed from SaveManager ---

func get_current_level() -> int:
	return SaveManager.get_current_level()

func get_coins() -> int:
	return SaveManager.get_coins()

func get_lives() -> int:
	return SaveManager.get_lives()

func get_stars() -> int:
	return SaveManager.get_stars()

# --- Level Flow ---

func start_level(level_number: int) -> void:
	var path := "res://resources/levels/level_%03d.tres" % level_number
	if ResourceLoader.exists(path):
		current_level_data = load(path)
	is_playing = true
	is_nightmare = false
	GameEvents.level_started.emit(level_number)

func complete_level(level_number: int, remaining_moves: int) -> void:
	is_playing = false
	# 별 1개 획득
	SaveManager.add_stars(1)
	# 기본 코인 20 + 여분 Moves당 5코인
	var coin_reward := 20 + (remaining_moves * 5)
	SaveManager.add_coins(coin_reward)
	# 다음 레벨로
	if level_number >= SaveManager.get_current_level():
		SaveManager.set_current_level(level_number + 1)
	GameEvents.level_completed.emit(level_number, remaining_moves)

func fail_level(level_number: int) -> void:
	is_playing = false
	SaveManager.set_lives(SaveManager.get_lives() - 1)
	GameEvents.level_failed.emit(level_number)

# --- Nightmare ---

func start_nightmare(scenario_id: String) -> void:
	is_playing = true
	is_nightmare = true
	GameEvents.nightmare_started.emit(scenario_id)

func complete_nightmare(scenario_id: String, reward: int) -> void:
	is_playing = false
	is_nightmare = false
	SaveManager.complete_nightmare(scenario_id)
	SaveManager.add_coins(reward)
	GameEvents.nightmare_completed.emit(scenario_id, reward)

# --- Scene Navigation ---

func go_to_scene(scene_name: String, params: Dictionary = {}) -> void:
	GameEvents.scene_change_requested.emit(scene_name, params)
```

- [ ] **Step 2: Commit**

```bash
git add scripts/autoload/game_state.gd
git commit -m "feat: add GameState — runtime state + level flow + scene navigation"
```

### Task 5: Main Scene (Scene Manager)

**Files:**
- Create: `scenes/main.tscn` (via script)
- Create: `scripts/main.gd`

- [ ] **Step 1: Write main scene script**

```gdscript
extends Node

const SCENES := {
	"splash": "res://scenes/splash.tscn",
	"home": "res://scenes/home.tscn",
	"game": "res://scenes/game.tscn",
	"nightmare": "res://scenes/nightmare.tscn",
}

var current_scene: Node = null
var scene_params: Dictionary = {}

func _ready() -> void:
	GameEvents.scene_change_requested.connect(_on_scene_change)
	# 스플래시부터 시작
	_change_scene("splash")

func _on_scene_change(scene_name: String, params: Dictionary) -> void:
	scene_params = params
	_change_scene(scene_name)

func _change_scene(scene_name: String) -> void:
	if current_scene:
		current_scene.queue_free()
		current_scene = null
	if scene_name in SCENES:
		var packed := load(SCENES[scene_name]) as PackedScene
		if packed:
			current_scene = packed.instantiate()
			add_child(current_scene)
```

- [ ] **Step 2: Create minimal placeholder scenes (splash, home, game, nightmare)**

`scripts/splash.gd`:
```gdscript
extends Control

func _ready() -> void:
	# 1.5초 후 홈으로
	await get_tree().create_timer(1.5).timeout
	GameState.go_to_scene("home")
```

`scripts/home.gd`:
```gdscript
extends Control

func _ready() -> void:
	pass # Task 에서 UI 구현

func _on_play_pressed() -> void:
	var level := GameState.get_current_level()
	GameState.start_level(level)
	GameState.go_to_scene("game")
```

`scripts/game.gd`:
```gdscript
extends Control

func _ready() -> void:
	pass # Board 초기화는 Chunk 2에서 구현
```

`scripts/nightmare_scene.gd`:
```gdscript
extends Control

func _ready() -> void:
	pass # Nightmare 구현은 Chunk 5에서
```

- [ ] **Step 3: Create .tscn files for each scene**

각 씬은 root 노드 + 스크립트 연결로 최소 구성:
- `scenes/main.tscn`: Node + `scripts/main.gd`
- `scenes/splash.tscn`: Control (full rect) + `scripts/splash.gd` + Label "Royal Puzzle 4"
- `scenes/home.tscn`: Control (full rect) + `scripts/home.gd` + Button "Play"
- `scenes/game.tscn`: Control (full rect) + `scripts/game.gd`
- `scenes/nightmare.tscn`: Control (full rect) + `scripts/nightmare_scene.gd`

- [ ] **Step 4: Run project in editor to verify scene flow: Splash → Home**

Expected: 앱 시작 → "Royal Puzzle 4" 텍스트 1.5초 → Home 씬 (Play 버튼 표시)

- [ ] **Step 5: Commit**

```bash
git add scripts/ scenes/
git commit -m "feat: add scene manager + placeholder scenes — Splash → Home flow works"
```

---

## Chunk 2: Match-3 Core Engine

### Task 6: Tile Data Model

**Files:**
- Create: `scripts/core/tile.gd`

- [ ] **Step 1: Write Tile class**

```gdscript
class_name Tile
extends RefCounted

enum Type { RED, BLUE, GREEN, YELLOW, PINK }
enum SpecialType { NONE, ROCKET_H, ROCKET_V, TNT, LIGHT_BALL, MISSILE }

const COLORS := {
	Type.RED: Color("#d32f2f"),
	Type.BLUE: Color("#1976d2"),
	Type.GREEN: Color("#388e3c"),
	Type.YELLOW: Color("#ffc107"),
	Type.PINK: Color("#e91e63"),
}

const TYPE_NAMES := {
	Type.RED: "red",
	Type.BLUE: "blue",
	Type.GREEN: "green",
	Type.YELLOW: "yellow",
	Type.PINK: "pink",
}

var type: Type
var special: SpecialType = SpecialType.NONE
var grid_pos: Vector2i
var is_moving := false
var is_matched := false

func _init(p_type: Type, p_pos: Vector2i) -> void:
	type = p_type
	grid_pos = p_pos

func is_special() -> bool:
	return special != SpecialType.NONE

func is_rocket() -> bool:
	return special == SpecialType.ROCKET_H or special == SpecialType.ROCKET_V

static func random_type(num_types: int = 5) -> Type:
	return randi() % num_types as Type
```

- [ ] **Step 2: Commit**

```bash
git add scripts/core/tile.gd
git commit -m "feat: add Tile data model — 5 types, 6 special types"
```

### Task 7: LevelData Resource

**Files:**
- Create: `scripts/core/level_data.gd`

- [ ] **Step 1: Write LevelData resource class**

```gdscript
class_name LevelData
extends Resource

@export var level_number: int = 1
@export var board_width: int = 8
@export var board_height: int = 8
@export var board_mask: Array[PackedByteArray] = []  # 비정형 보드용 (1=active, 0=inactive)
@export var moves: int = 25
@export var targets: Array[Dictionary] = []  # [{type: "red", count: 20}]
@export var obstacles: Array[Dictionary] = []  # [{type: "wooden_box", position: [2,3], hp: 1}]
@export var tile_types: int = 5  # 4 or 5
@export var nightmare_after: bool = false

func is_cell_active(x: int, y: int) -> bool:
	if board_mask.is_empty():
		return true
	if y < 0 or y >= board_mask.size():
		return false
	if x < 0 or x >= board_mask[y].size():
		return false
	return board_mask[y][x] == 1

func get_target_dict() -> Dictionary:
	# {type_string: count} 형태로 변환
	var result := {}
	for t in targets:
		result[t["type"]] = t["count"]
	return result
```

- [ ] **Step 2: Commit**

```bash
git add scripts/core/level_data.gd
git commit -m "feat: add LevelData resource — board size, mask, targets, obstacles"
```

### Task 8: MatchDetector

**Files:**
- Create: `scripts/core/match_detector.gd`

- [ ] **Step 1: Write MatchDetector — finds all matches on the board**

```gdscript
class_name MatchDetector
extends RefCounted

# Returns Array of match groups. Each group: {cells: Array[Vector2i], pattern: String}
static func find_all_matches(grid: Array, width: int, height: int, is_active: Callable) -> Array:
	var matches: Array = []
	var matched_cells := {}  # Vector2i -> true

	# Horizontal matches
	for y in range(height):
		var run_start := 0
		for x in range(1, width + 1):
			var same := false
			if x < width:
				same = _cells_match(grid, run_start, y, x, y, is_active)
			if not same:
				var run_len := x - run_start
				if run_len >= 3:
					var cells: Array[Vector2i] = []
					for rx in range(run_start, x):
						if is_active.call(rx, y):
							cells.append(Vector2i(rx, y))
					if cells.size() >= 3:
						matches.append({"cells": cells, "pattern": "horizontal", "length": run_len})
						for c in cells:
							matched_cells[c] = true
				run_start = x

	# Vertical matches
	for x in range(width):
		var run_start := 0
		for y in range(1, height + 1):
			var same := false
			if y < height:
				same = _cells_match(grid, x, run_start, x, y, is_active)
			if not same:
				var run_len := y - run_start
				if run_len >= 3:
					var cells: Array[Vector2i] = []
					for ry in range(run_start, y):
						if is_active.call(x, ry):
							cells.append(Vector2i(x, ry))
					if cells.size() >= 3:
						matches.append({"cells": cells, "pattern": "vertical", "length": run_len})
						for c in cells:
							matched_cells[c] = true
				run_start = y

	# Merge overlapping matches into T/L/Cross patterns
	return _merge_matches(matches)

static func _cells_match(grid: Array, x1: int, y1: int, x2: int, y2: int, is_active: Callable) -> bool:
	if not is_active.call(x1, y1) or not is_active.call(x2, y2):
		return false
	var t1 = grid[y1][x1]
	var t2 = grid[y2][x2]
	if t1 == null or t2 == null:
		return false
	if t1 is Tile and t2 is Tile:
		return t1.type == t2.type and not t1.is_special() and not t2.is_special()
	return false

static func _merge_matches(matches: Array) -> Array:
	if matches.size() <= 1:
		return matches

	# Group overlapping matches
	var merged: Array = []
	var used := []
	used.resize(matches.size())
	used.fill(false)

	for i in range(matches.size()):
		if used[i]:
			continue
		var group_cells := {}
		for c in matches[i]["cells"]:
			group_cells[c] = true
		var found_overlap := true
		while found_overlap:
			found_overlap = false
			for j in range(i + 1, matches.size()):
				if used[j]:
					continue
				var overlaps := false
				for c in matches[j]["cells"]:
					if c in group_cells:
						overlaps = true
						break
				if overlaps:
					for c in matches[j]["cells"]:
						group_cells[c] = true
					used[j] = true
					found_overlap = true

		var all_cells: Array[Vector2i] = []
		for c in group_cells.keys():
			all_cells.append(c)
		var pattern := _classify_pattern(all_cells)
		merged.append({"cells": all_cells, "pattern": pattern, "length": all_cells.size()})
		used[i] = true

	return merged

static func _classify_pattern(cells: Array[Vector2i]) -> String:
	var count := cells.size()
	if count >= 5:
		# Check if all in a line
		var all_same_row := true
		var all_same_col := true
		for i in range(1, cells.size()):
			if cells[i].y != cells[0].y:
				all_same_row = false
			if cells[i].x != cells[0].x:
				all_same_col = false
		if all_same_row or all_same_col:
			return "line_5"  # Light Ball
		return "t_or_l"  # TNT
	if count == 4:
		var all_same_row := true
		var all_same_col := true
		for i in range(1, cells.size()):
			if cells[i].y != cells[0].y:
				all_same_row = false
			if cells[i].x != cells[0].x:
				all_same_col = false
		if all_same_row:
			return "line_4_h"  # Horizontal Rocket
		if all_same_col:
			return "line_4_v"  # Vertical Rocket
		return "t_or_l"  # 2x2 area → Missile
	return "match_3"

# Check if any valid swap exists on the board
static func has_possible_moves(grid: Array, width: int, height: int, is_active: Callable) -> bool:
	for y in range(height):
		for x in range(width):
			if not is_active.call(x, y):
				continue
			# Try swap right
			if x + 1 < width and is_active.call(x + 1, y):
				_swap(grid, x, y, x + 1, y)
				var m := find_all_matches(grid, width, height, is_active)
				_swap(grid, x, y, x + 1, y)
				if m.size() > 0:
					return true
			# Try swap down
			if y + 1 < height and is_active.call(x, y + 1):
				_swap(grid, x, y, x, y + 1)
				var m := find_all_matches(grid, width, height, is_active)
				_swap(grid, x, y, x, y + 1)
				if m.size() > 0:
					return true
	return false

static func _swap(grid: Array, x1: int, y1: int, x2: int, y2: int) -> void:
	var temp = grid[y1][x1]
	grid[y1][x1] = grid[y2][x2]
	grid[y2][x2] = temp
```

- [ ] **Step 2: Commit**

```bash
git add scripts/core/match_detector.gd
git commit -m "feat: add MatchDetector — horizontal/vertical/T/L/5-line match detection"
```

### Task 9: Board Logic

**Files:**
- Create: `scripts/core/board.gd`

- [ ] **Step 1: Write Board — grid management, tile creation, gravity, shuffle**

```gdscript
class_name Board
extends RefCounted

var width: int
var height: int
var grid: Array = []  # grid[y][x] = Tile or null
var obstacles_grid: Array = []  # grid[y][x] = Obstacle dict or null
var level_data: LevelData
var num_tile_types: int = 5

signal tiles_created(tiles: Array)
signal tiles_moved(moves: Array)  # [{tile, from, to}]
signal tiles_removed(positions: Array[Vector2i])

func init_board(p_level_data: LevelData) -> void:
	level_data = p_level_data
	width = p_level_data.board_width
	height = p_level_data.board_height
	num_tile_types = p_level_data.tile_types
	_init_grid()
	_place_obstacles()
	_fill_board()
	_ensure_no_initial_matches()

func _init_grid() -> void:
	grid.clear()
	obstacles_grid.clear()
	for y in range(height):
		var row := []
		var obs_row := []
		row.resize(width)
		obs_row.resize(width)
		row.fill(null)
		obs_row.fill(null)
		grid.append(row)
		obstacles_grid.append(obs_row)

func is_active(x: int, y: int) -> bool:
	if x < 0 or x >= width or y < 0 or y >= height:
		return false
	return level_data.is_cell_active(x, y)

func get_tile(pos: Vector2i) -> Tile:
	if not is_active(pos.x, pos.y):
		return null
	return grid[pos.y][pos.x]

func set_tile(pos: Vector2i, tile: Tile) -> void:
	grid[pos.y][pos.x] = tile
	if tile:
		tile.grid_pos = pos

func _place_obstacles() -> void:
	for obs_data in level_data.obstacles:
		var pos_arr: Array = obs_data.get("position", [0, 0])
		var pos := Vector2i(pos_arr[0], pos_arr[1])
		if is_active(pos.x, pos.y):
			obstacles_grid[pos.y][pos.x] = {
				"type": obs_data["type"],
				"hp": obs_data.get("hp", 1),
			}

func _fill_board() -> void:
	var new_tiles := []
	for y in range(height):
		for x in range(width):
			if is_active(x, y) and grid[y][x] == null:
				var tile := Tile.new(Tile.random_type(num_tile_types), Vector2i(x, y))
				grid[y][x] = tile
				new_tiles.append(tile)
	if new_tiles.size() > 0:
		tiles_created.emit(new_tiles)

func _ensure_no_initial_matches() -> void:
	# Replace tiles that form matches at start
	var matches := MatchDetector.find_all_matches(grid, width, height, is_active)
	var max_iterations := 100
	while matches.size() > 0 and max_iterations > 0:
		for m in matches:
			for cell in m["cells"]:
				var new_tile := Tile.new(Tile.random_type(num_tile_types), cell)
				grid[cell.y][cell.x] = new_tile
		matches = MatchDetector.find_all_matches(grid, width, height, is_active)
		max_iterations -= 1

# --- Swap ---

func can_swap(from: Vector2i, to: Vector2i) -> bool:
	if not is_active(from.x, from.y) or not is_active(to.x, to.y):
		return false
	var dist := absi(from.x - to.x) + absi(from.y - to.y)
	if dist != 1:
		return false
	var tile_from := get_tile(from)
	var tile_to := get_tile(to)
	if tile_from == null or tile_to == null:
		return false
	# Check fence obstacle blocks movement
	if _has_fence_between(from, to):
		return false
	# Check chain (tile fixed)
	if _is_chained(from) or _is_chained(to):
		return false
	return true

func swap(from: Vector2i, to: Vector2i) -> void:
	var tile_a := grid[from.y][from.x]
	var tile_b := grid[to.y][to.x]
	grid[from.y][from.x] = tile_b
	grid[to.y][to.x] = tile_a
	if tile_a:
		tile_a.grid_pos = to
	if tile_b:
		tile_b.grid_pos = from

func try_swap(from: Vector2i, to: Vector2i) -> bool:
	if not can_swap(from, to):
		return false
	swap(from, to)
	var matches := MatchDetector.find_all_matches(grid, width, height, is_active)
	# Also allow booster+booster merge
	var both_special := false
	var tile_a := get_tile(to)
	var tile_b := get_tile(from)
	if tile_a and tile_b and tile_a.is_special() and tile_b.is_special():
		both_special = true
	# Allow booster+lightball swap (lightball + any color tile)
	var lightball_swap := false
	if tile_a and tile_a.special == Tile.SpecialType.LIGHT_BALL:
		lightball_swap = true
	if tile_b and tile_b.special == Tile.SpecialType.LIGHT_BALL:
		lightball_swap = true
	if matches.size() == 0 and not both_special and not lightball_swap:
		swap(from, to)  # swap back
		return false
	return true

# --- Gravity ---

func apply_gravity() -> Array:
	var moves_list := []
	for x in range(width):
		var write_y := height - 1
		# Find lowest active empty cell
		for y in range(height - 1, -1, -1):
			if not is_active(x, y):
				continue
			if grid[y][x] != null:
				if y != write_y:
					var tile = grid[y][x]
					grid[write_y][x] = tile
					grid[y][x] = null
					tile.grid_pos = Vector2i(x, write_y)
					moves_list.append({"tile": tile, "from": Vector2i(x, y), "to": Vector2i(x, write_y)})
				write_y -= 1
				while write_y >= 0 and not is_active(x, write_y):
					write_y -= 1
			# Skip inactive cells in write pointer
	if moves_list.size() > 0:
		tiles_moved.emit(moves_list)
	return moves_list

func fill_empty() -> Array:
	var new_tiles := []
	for x in range(width):
		for y in range(height):
			if is_active(x, y) and grid[y][x] == null:
				var tile := Tile.new(Tile.random_type(num_tile_types), Vector2i(x, y))
				grid[y][x] = tile
				new_tiles.append(tile)
	if new_tiles.size() > 0:
		tiles_created.emit(new_tiles)
	return new_tiles

# --- Shuffle ---

func shuffle() -> void:
	var all_tiles := []
	var positions := []
	for y in range(height):
		for x in range(width):
			if is_active(x, y) and grid[y][x] != null and not grid[y][x].is_special():
				all_tiles.append(grid[y][x])
				positions.append(Vector2i(x, y))
	# Fisher-Yates shuffle
	for i in range(all_tiles.size() - 1, 0, -1):
		var j := randi() % (i + 1)
		var temp = all_tiles[i]
		all_tiles[i] = all_tiles[j]
		all_tiles[j] = temp
	for i in range(all_tiles.size()):
		var pos := positions[i]
		grid[pos.y][pos.x] = all_tiles[i]
		all_tiles[i].grid_pos = pos

func needs_shuffle() -> bool:
	return not MatchDetector.has_possible_moves(grid, width, height, is_active)

# --- Remove ---

func remove_tiles(positions: Array[Vector2i]) -> void:
	for pos in positions:
		if is_active(pos.x, pos.y):
			grid[pos.y][pos.x] = null
	tiles_removed.emit(positions)

# --- Obstacles ---

func get_obstacle(pos: Vector2i) -> Variant:
	if not is_active(pos.x, pos.y):
		return null
	return obstacles_grid[pos.y][pos.x]

func hit_obstacle(pos: Vector2i) -> bool:
	var obs = obstacles_grid[pos.y][pos.x]
	if obs == null:
		return false
	obs["hp"] -= 1
	if obs["hp"] <= 0:
		obstacles_grid[pos.y][pos.x] = null
		GameEvents.obstacle_destroyed.emit(pos, obs["type"])
		return true
	GameEvents.obstacle_hit.emit(pos, obs["type"], obs["hp"])
	return false

func _has_fence_between(from: Vector2i, to: Vector2i) -> bool:
	var obs_from = get_obstacle(from)
	var obs_to = get_obstacle(to)
	if obs_from and obs_from["type"] == "fence":
		return true
	if obs_to and obs_to["type"] == "fence":
		return true
	return false

func _is_chained(pos: Vector2i) -> bool:
	var obs = get_obstacle(pos)
	return obs != null and obs["type"] == "chain"

# --- Adjacent cells for obstacle damage ---

func get_adjacent_cells(pos: Vector2i) -> Array[Vector2i]:
	var result: Array[Vector2i] = []
	for offset in [Vector2i(-1, 0), Vector2i(1, 0), Vector2i(0, -1), Vector2i(0, 1)]:
		var adj := pos + offset
		if is_active(adj.x, adj.y):
			result.append(adj)
	return result
```

- [ ] **Step 2: Commit**

```bash
git add scripts/core/board.gd
git commit -m "feat: add Board — grid management, gravity, shuffle, obstacle support"
```

### Task 10: Booster System

**Files:**
- Create: `scripts/core/booster.gd`

- [ ] **Step 1: Write Booster — determines booster type from match pattern, executes booster effects**

```gdscript
class_name Booster
extends RefCounted

# Determine which booster to create from a match pattern
static func get_booster_for_pattern(pattern: String) -> Tile.SpecialType:
	match pattern:
		"line_4_h":
			return Tile.SpecialType.ROCKET_H
		"line_4_v":
			return Tile.SpecialType.ROCKET_V
		"line_5":
			return Tile.SpecialType.LIGHT_BALL
		"t_or_l":
			if _is_2x2_pattern():
				return Tile.SpecialType.MISSILE
			return Tile.SpecialType.TNT
	return Tile.SpecialType.NONE

# Get cells affected by booster activation
static func get_affected_cells(board: Board, pos: Vector2i, special: Tile.SpecialType) -> Array[Vector2i]:
	var cells: Array[Vector2i] = []
	match special:
		Tile.SpecialType.ROCKET_H:
			for x in range(board.width):
				if board.is_active(x, pos.y):
					cells.append(Vector2i(x, pos.y))
		Tile.SpecialType.ROCKET_V:
			for y in range(board.height):
				if board.is_active(pos.x, y):
					cells.append(Vector2i(pos.x, y))
		Tile.SpecialType.TNT:
			for dy in range(-1, 2):
				for dx in range(-1, 2):
					var cell := Vector2i(pos.x + dx, pos.y + dy)
					if board.is_active(cell.x, cell.y):
						cells.append(cell)
		Tile.SpecialType.LIGHT_BALL:
			# Need target color — handled separately in game logic
			pass
		Tile.SpecialType.MISSILE:
			# Random target — handled separately in game logic
			cells.append(pos)
	return cells

static func get_light_ball_targets(board: Board, target_type: Tile.Type) -> Array[Vector2i]:
	var cells: Array[Vector2i] = []
	for y in range(board.height):
		for x in range(board.width):
			var tile := board.get_tile(Vector2i(x, y))
			if tile and tile.type == target_type and not tile.is_special():
				cells.append(Vector2i(x, y))
	return cells

static func get_missile_target(board: Board, exclude: Vector2i) -> Vector2i:
	# Find random obstacle or tile
	var obstacles: Array[Vector2i] = []
	var tiles: Array[Vector2i] = []
	for y in range(board.height):
		for x in range(board.width):
			var pos := Vector2i(x, y)
			if pos == exclude:
				continue
			if board.get_obstacle(pos) != null:
				obstacles.append(pos)
			elif board.get_tile(pos) != null:
				tiles.append(pos)
	if obstacles.size() > 0:
		return obstacles[randi() % obstacles.size()]
	if tiles.size() > 0:
		return tiles[randi() % tiles.size()]
	return Vector2i(-1, -1)

static func _is_2x2_pattern() -> bool:
	# Placeholder — actual 2x2 detection is done in match_detector
	return false
```

- [ ] **Step 2: Commit**

```bash
git add scripts/core/booster.gd
git commit -m "feat: add Booster — pattern-to-booster mapping + effect area calculation"
```

### Task 11: BoosterMerger

**Files:**
- Create: `scripts/core/booster_merger.gd`

- [ ] **Step 1: Write BoosterMerger — 10 combination types**

```gdscript
class_name BoosterMerger
extends RefCounted

enum MergeResult {
	NONE,
	CROSS,           # Rocket + Rocket → 행+열 동시
	BIG_ROCKET,      # Rocket + TNT → 3행/3열
	COLOR_ROCKET,    # Rocket + Light Ball → 색 전체 Rocket화
	MEGA_EXPLOSION,  # TNT + TNT → 5x5
	COLOR_TNT,       # TNT + Light Ball → 색 전체 TNT화
	ALL_BOARD,       # Light Ball + Light Ball → 전체 클리어
	TRIPLE_MISSILE,  # Missile + Missile → 3발
	MISSILE_ROCKET,  # Missile + Rocket → 경로+행/열
	MISSILE_TNT,     # Missile + TNT → 경로+3x3
	COLOR_MISSILE,   # Missile + Light Ball → 색 전체 Missile화
}

static func get_merge_type(type_a: Tile.SpecialType, type_b: Tile.SpecialType) -> MergeResult:
	# Normalize order for symmetry
	var a := mini(type_a, type_b)
	var b := maxi(type_a, type_b)
	var is_rocket_a := type_a == Tile.SpecialType.ROCKET_H or type_a == Tile.SpecialType.ROCKET_V
	var is_rocket_b := type_b == Tile.SpecialType.ROCKET_H or type_b == Tile.SpecialType.ROCKET_V

	if is_rocket_a and is_rocket_b:
		return MergeResult.CROSS
	if (is_rocket_a and type_b == Tile.SpecialType.TNT) or (type_a == Tile.SpecialType.TNT and is_rocket_b):
		return MergeResult.BIG_ROCKET
	if (is_rocket_a and type_b == Tile.SpecialType.LIGHT_BALL) or (type_a == Tile.SpecialType.LIGHT_BALL and is_rocket_b):
		return MergeResult.COLOR_ROCKET
	if type_a == Tile.SpecialType.TNT and type_b == Tile.SpecialType.TNT:
		return MergeResult.MEGA_EXPLOSION
	if (type_a == Tile.SpecialType.TNT and type_b == Tile.SpecialType.LIGHT_BALL) or (type_a == Tile.SpecialType.LIGHT_BALL and type_b == Tile.SpecialType.TNT):
		return MergeResult.COLOR_TNT
	if type_a == Tile.SpecialType.LIGHT_BALL and type_b == Tile.SpecialType.LIGHT_BALL:
		return MergeResult.ALL_BOARD
	if type_a == Tile.SpecialType.MISSILE and type_b == Tile.SpecialType.MISSILE:
		return MergeResult.TRIPLE_MISSILE
	if (type_a == Tile.SpecialType.MISSILE and is_rocket_b) or (is_rocket_a and type_b == Tile.SpecialType.MISSILE):
		return MergeResult.MISSILE_ROCKET
	if (type_a == Tile.SpecialType.MISSILE and type_b == Tile.SpecialType.TNT) or (type_a == Tile.SpecialType.TNT and type_b == Tile.SpecialType.MISSILE):
		return MergeResult.MISSILE_TNT
	if (type_a == Tile.SpecialType.MISSILE and type_b == Tile.SpecialType.LIGHT_BALL) or (type_a == Tile.SpecialType.LIGHT_BALL and type_b == Tile.SpecialType.MISSILE):
		return MergeResult.COLOR_MISSILE

	return MergeResult.NONE

static func get_merge_cells(board: Board, pos: Vector2i, merge: MergeResult) -> Array[Vector2i]:
	var cells: Array[Vector2i] = []
	match merge:
		MergeResult.CROSS:
			# Full row + full column
			for x in range(board.width):
				if board.is_active(x, pos.y):
					cells.append(Vector2i(x, pos.y))
			for y in range(board.height):
				if board.is_active(pos.x, y) and Vector2i(pos.x, y) not in cells:
					cells.append(Vector2i(pos.x, y))
		MergeResult.BIG_ROCKET:
			# 3 rows or 3 columns
			for dy in range(-1, 2):
				for x in range(board.width):
					var cy := pos.y + dy
					if cy >= 0 and cy < board.height and board.is_active(x, cy):
						var v := Vector2i(x, cy)
						if v not in cells:
							cells.append(v)
		MergeResult.MEGA_EXPLOSION:
			# 5x5
			for dy in range(-2, 3):
				for dx in range(-2, 3):
					var cell := Vector2i(pos.x + dx, pos.y + dy)
					if board.is_active(cell.x, cell.y):
						cells.append(cell)
		MergeResult.ALL_BOARD:
			for y in range(board.height):
				for x in range(board.width):
					if board.is_active(x, y):
						cells.append(Vector2i(x, y))
		MergeResult.TRIPLE_MISSILE:
			# 3 random targets
			for _i in range(3):
				var target := Booster.get_missile_target(board, pos)
				if target != Vector2i(-1, -1) and target not in cells:
					cells.append(target)
		_:
			# COLOR_ROCKET, COLOR_TNT, COLOR_MISSILE handled in game logic
			# (need most-common-color calculation)
			pass
	return cells

static func get_most_common_color(board: Board) -> Tile.Type:
	var counts := {}
	for y in range(board.height):
		for x in range(board.width):
			var tile := board.get_tile(Vector2i(x, y))
			if tile and not tile.is_special():
				counts[tile.type] = counts.get(tile.type, 0) + 1
	var best_type: Tile.Type = Tile.Type.RED
	var best_count := 0
	for t in counts:
		if counts[t] > best_count:
			best_count = counts[t]
			best_type = t
	return best_type
```

- [ ] **Step 2: Commit**

```bash
git add scripts/core/booster_merger.gd
git commit -m "feat: add BoosterMerger — 10 booster combination types"
```

### Task 12: Obstacle System

**Files:**
- Create: `scripts/core/obstacle.gd`

- [ ] **Step 1: Write Obstacle definitions**

```gdscript
class_name Obstacle
extends RefCounted

enum Type {
	WOODEN_BOX,  # HP 1, 인접 매치로 파괴
	STONE_BOX,   # HP 2, 인접 매치 2회
	GRASS,       # HP 1, 위에서 매치로 파괴
	FENCE,       # HP 1, 인접 매치로 파괴, 타일 이동 차단
	CHAIN,       # HP 1, 인접 매치로 파괴, 타일 고정
	MAILBOX,     # 수집형, 인접 매치로 우편 수집
}

const PROPERTIES := {
	"wooden_box": {"type": Type.WOODEN_BOX, "hp": 1, "blocks_tile": false, "destroyable_by": "adjacent"},
	"stone_box": {"type": Type.STONE_BOX, "hp": 2, "blocks_tile": false, "destroyable_by": "adjacent"},
	"grass": {"type": Type.GRASS, "hp": 1, "blocks_tile": false, "destroyable_by": "on_top"},
	"fence": {"type": Type.FENCE, "hp": 1, "blocks_tile": true, "destroyable_by": "adjacent"},
	"chain": {"type": Type.CHAIN, "hp": 1, "blocks_tile": true, "destroyable_by": "adjacent"},
	"mailbox": {"type": Type.MAILBOX, "hp": -1, "blocks_tile": false, "destroyable_by": "adjacent"},
}

# Introduction level for each obstacle
const INTRO_LEVELS := {
	"mailbox": 3,
	"wooden_box": 5,
	"grass": 8,
	"stone_box": 10,
	"fence": 12,
	"chain": 15,
}

static func get_properties(type_name: String) -> Dictionary:
	return PROPERTIES.get(type_name, {})

static func should_hit_on_adjacent_match(type_name: String) -> bool:
	var props := get_properties(type_name)
	return props.get("destroyable_by", "") == "adjacent"

static func should_hit_on_top_match(type_name: String) -> bool:
	var props := get_properties(type_name)
	return props.get("destroyable_by", "") == "on_top"
```

- [ ] **Step 2: Commit**

```bash
git add scripts/core/obstacle.gd
git commit -m "feat: add Obstacle — 6 obstacle types with properties and intro levels"
```

---

## Chunk 3: Game Scene & Input

### Task 13: Tile Visual (Scene Component)

**Files:**
- Create: `scenes/components/tile.tscn` (코드로 생성)
- Create: `scripts/components/tile_visual.gd`

- [ ] **Step 1: Write TileVisual — renders a tile on the board**

```gdscript
class_name TileVisual
extends Node2D

@onready var sprite: Sprite2D = $Sprite2D
@onready var special_icon: Sprite2D = $SpecialIcon

var tile_data: Tile
var cell_size := Vector2(80.0, 80.0)

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
	# Color the sprite based on tile type
	if sprite:
		sprite.modulate = Tile.COLORS.get(tile_data.type, Color.WHITE)
	# Show special icon
	if special_icon:
		special_icon.visible = tile_data.is_special()

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
```

- [ ] **Step 2: Create tile.tscn structure**

```
tile.tscn:
  Node2D (TileVisual script)
  ├── Sprite2D (64x64 white rect placeholder, modulated by color)
  └── SpecialIcon (Sprite2D, hidden by default)
```

- [ ] **Step 3: Commit**

```bash
git add scripts/components/tile_visual.gd scenes/components/tile.tscn
git commit -m "feat: add TileVisual — tile rendering with color, animation"
```

### Task 14: Board Visual & Input

**Files:**
- Create: `scripts/components/board_visual.gd`

- [ ] **Step 1: Write BoardVisual — renders board, handles swipe input**

```gdscript
class_name BoardVisual
extends Node2D

const TILE_SCENE := preload("res://scenes/components/tile.tscn")
const CELL_SIZE := Vector2(80.0, 80.0)
const SWIPE_THRESHOLD := 20.0

var board: Board
var tile_visuals := {}  # Vector2i -> TileVisual
var is_input_enabled := true
var drag_start: Vector2 = Vector2.ZERO
var drag_start_cell: Vector2i = Vector2i(-1, -1)
var is_dragging := false

signal swap_requested(from: Vector2i, to: Vector2i)

func init_visuals(p_board: Board) -> void:
	board = p_board
	board.tiles_created.connect(_on_tiles_created)
	board.tiles_moved.connect(_on_tiles_moved)
	board.tiles_removed.connect(_on_tiles_removed)
	_create_all_visuals()

func _create_all_visuals() -> void:
	for y in range(board.height):
		for x in range(board.width):
			var tile := board.get_tile(Vector2i(x, y))
			if tile:
				_create_tile_visual(tile)

func _create_tile_visual(tile: Tile) -> TileVisual:
	var visual := TILE_SCENE.instantiate() as TileVisual
	add_child(visual)
	visual.setup(tile, CELL_SIZE)
	tile_visuals[tile.grid_pos] = visual
	return visual

func _on_tiles_created(tiles: Array) -> void:
	for tile in tiles:
		var visual := _create_tile_visual(tile)
		visual.animate_spawn()

func _on_tiles_moved(moves: Array) -> void:
	for m in moves:
		var tile: Tile = m["tile"]
		var from: Vector2i = m["from"]
		var to: Vector2i = m["to"]
		if from in tile_visuals:
			var visual := tile_visuals[from]
			tile_visuals.erase(from)
			tile_visuals[to] = visual
			visual.animate_to(to)

func _on_tiles_removed(positions: Array[Vector2i]) -> void:
	for pos in positions:
		if pos in tile_visuals:
			tile_visuals[pos].animate_destroy()
			tile_visuals.erase(pos)

# --- Input ---

func _input(event: InputEvent) -> void:
	if not is_input_enabled:
		return
	if event is InputEventMouseButton:
		if event.pressed:
			drag_start = event.position - global_position
			drag_start_cell = pixel_to_grid(drag_start)
			is_dragging = true
		else:
			is_dragging = false
			drag_start_cell = Vector2i(-1, -1)
	elif event is InputEventMouseMotion and is_dragging:
		var current := event.position - global_position
		var diff := current - drag_start
		if diff.length() > SWIPE_THRESHOLD:
			is_dragging = false
			var direction := _get_swipe_direction(diff)
			var target := drag_start_cell + direction
			if drag_start_cell != Vector2i(-1, -1):
				swap_requested.emit(drag_start_cell, target)

func pixel_to_grid(pixel: Vector2) -> Vector2i:
	var gx := int(pixel.x / CELL_SIZE.x)
	var gy := int(pixel.y / CELL_SIZE.y)
	if gx < 0 or gx >= board.width or gy < 0 or gy >= board.height:
		return Vector2i(-1, -1)
	return Vector2i(gx, gy)

func _get_swipe_direction(diff: Vector2) -> Vector2i:
	if absf(diff.x) > absf(diff.y):
		return Vector2i(1, 0) if diff.x > 0 else Vector2i(-1, 0)
	else:
		return Vector2i(0, 1) if diff.y > 0 else Vector2i(0, -1)

func get_board_pixel_size() -> Vector2:
	return Vector2(board.width * CELL_SIZE.x, board.height * CELL_SIZE.y)
```

- [ ] **Step 2: Commit**

```bash
git add scripts/components/board_visual.gd
git commit -m "feat: add BoardVisual — board rendering + swipe input detection"
```

### Task 15: Game Scene (Match-3 Game Loop)

**Files:**
- Modify: `scripts/game.gd`
- Modify: `scenes/game.tscn`

- [ ] **Step 1: Write game.gd — main game loop orchestrating board, matches, boosters**

```gdscript
extends Control

var board: Board
var board_visual: BoardVisual
var remaining_moves: int = 0
var targets: Dictionary = {}  # {type: {current, total}}
var is_processing := false

func _ready() -> void:
	var level_num := GameState.get_current_level()
	var level_data: LevelData
	var path := "res://resources/levels/level_%03d.tres" % level_num
	if ResourceLoader.exists(path):
		level_data = load(path)
	else:
		level_data = _create_default_level(level_num)

	remaining_moves = level_data.moves
	_init_targets(level_data)

	board = Board.new()
	board.init_board(level_data)

	board_visual = BoardVisual.new()
	add_child(board_visual)
	# Center board
	var board_size := Vector2(board.width * 80, board.height * 80)
	board_visual.position = Vector2((720 - board_size.x) / 2, 200)
	board_visual.init_visuals(board)
	board_visual.swap_requested.connect(_on_swap_requested)

func _init_targets(level_data: LevelData) -> void:
	for t in level_data.targets:
		targets[t["type"]] = {"current": 0, "total": t["count"]}

func _on_swap_requested(from: Vector2i, to: Vector2i) -> void:
	if is_processing:
		return
	if remaining_moves <= 0:
		return

	# Check booster merge
	var tile_a := board.get_tile(from)
	var tile_b := board.get_tile(to)
	if tile_a and tile_b and tile_a.is_special() and tile_b.is_special():
		_handle_booster_merge(from, to, tile_a, tile_b)
		return

	# Check light ball swap with regular tile
	if tile_a and tile_a.special == Tile.SpecialType.LIGHT_BALL and tile_b:
		_handle_light_ball_swap(from, to, tile_b.type)
		return
	if tile_b and tile_b.special == Tile.SpecialType.LIGHT_BALL and tile_a:
		_handle_light_ball_swap(to, from, tile_a.type)
		return

	if not board.try_swap(from, to):
		return

	remaining_moves -= 1
	GameEvents.moves_changed.emit(remaining_moves)
	is_processing = true
	await _process_matches()
	is_processing = false
	_check_game_end()

func _process_matches() -> void:
	var matches := MatchDetector.find_all_matches(board.grid, board.width, board.height, board.is_active)
	while matches.size() > 0:
		for m in matches:
			_handle_match(m)
		await get_tree().create_timer(0.25).timeout
		board.apply_gravity()
		await get_tree().create_timer(0.15).timeout
		board.fill_empty()
		await get_tree().create_timer(0.15).timeout
		matches = MatchDetector.find_all_matches(board.grid, board.width, board.height, board.is_active)

	if board.needs_shuffle():
		board.shuffle()
		# Rebuild visuals after shuffle
		_rebuild_visuals()

func _handle_match(match_data: Dictionary) -> void:
	var cells: Array[Vector2i] = match_data["cells"]
	var pattern: String = match_data["pattern"]

	# Determine booster creation
	var booster_type := Booster.get_booster_for_pattern(pattern)

	# Hit adjacent obstacles
	for cell in cells:
		for adj in board.get_adjacent_cells(cell):
			var obs = board.get_obstacle(adj)
			if obs and Obstacle.should_hit_on_adjacent_match(obs["type"]):
				board.hit_obstacle(adj)
		# Hit grass on top
		var obs_on = board.get_obstacle(cell)
		if obs_on and Obstacle.should_hit_on_top_match(obs_on["type"]):
			board.hit_obstacle(cell)

	# Update targets
	if cells.size() > 0:
		var tile := board.get_tile(cells[0])
		if tile:
			var type_name := Tile.TYPE_NAMES.get(tile.type, "")
			_update_target(type_name, cells.size())

	# Remove matched tiles
	board.remove_tiles(cells)

	# Create booster at match center
	if booster_type != Tile.SpecialType.NONE:
		var center := cells[cells.size() / 2]
		var booster_tile := Tile.new(Tile.Type.RED, center)
		booster_tile.special = booster_type
		board.set_tile(center, booster_tile)
		GameEvents.booster_created.emit(center, str(booster_type))

func _handle_booster_merge(from: Vector2i, to: Vector2i, tile_a: Tile, tile_b: Tile) -> void:
	var merge := BoosterMerger.get_merge_type(tile_a.special, tile_b.special)
	if merge == BoosterMerger.MergeResult.NONE:
		return
	remaining_moves -= 1
	GameEvents.moves_changed.emit(remaining_moves)
	is_processing = true

	var merge_pos := to
	var cells := BoosterMerger.get_merge_cells(board, merge_pos, merge)

	# Handle color-based merges
	if merge in [BoosterMerger.MergeResult.COLOR_ROCKET, BoosterMerger.MergeResult.COLOR_TNT, BoosterMerger.MergeResult.COLOR_MISSILE]:
		var color := BoosterMerger.get_most_common_color(board)
		cells = Booster.get_light_ball_targets(board, color)

	board.remove_tiles([from, to])
	if cells.size() > 0:
		board.remove_tiles(cells)
	GameEvents.booster_merge.emit(from, to, str(tile_a.special), str(tile_b.special))

	await get_tree().create_timer(0.3).timeout
	board.apply_gravity()
	await get_tree().create_timer(0.15).timeout
	board.fill_empty()
	await get_tree().create_timer(0.15).timeout
	await _process_matches()
	is_processing = false
	_check_game_end()

func _handle_light_ball_swap(ball_pos: Vector2i, target_pos: Vector2i, target_type: Tile.Type) -> void:
	remaining_moves -= 1
	GameEvents.moves_changed.emit(remaining_moves)
	is_processing = true

	var cells := Booster.get_light_ball_targets(board, target_type)
	board.remove_tiles([ball_pos])
	board.remove_tiles(cells)
	_update_target(Tile.TYPE_NAMES.get(target_type, ""), cells.size())

	await get_tree().create_timer(0.3).timeout
	board.apply_gravity()
	await get_tree().create_timer(0.15).timeout
	board.fill_empty()
	await get_tree().create_timer(0.15).timeout
	await _process_matches()
	is_processing = false
	_check_game_end()

func _update_target(type_name: String, count: int) -> void:
	if type_name in targets:
		targets[type_name]["current"] = mini(
			targets[type_name]["current"] + count,
			targets[type_name]["total"]
		)
		GameEvents.target_progress.emit(
			type_name,
			targets[type_name]["current"],
			targets[type_name]["total"]
		)
		if targets[type_name]["current"] >= targets[type_name]["total"]:
			GameEvents.target_completed.emit(type_name)

func _check_game_end() -> void:
	# Check win
	var all_complete := true
	for t in targets:
		if targets[t]["current"] < targets[t]["total"]:
			all_complete = false
			break
	if all_complete:
		GameState.complete_level(GameState.get_current_level(), remaining_moves)
		return
	# Check lose
	if remaining_moves <= 0:
		GameState.fail_level(GameState.get_current_level())

func _rebuild_visuals() -> void:
	# Clear and recreate all tile visuals
	for key in board_visual.tile_visuals:
		if is_instance_valid(board_visual.tile_visuals[key]):
			board_visual.tile_visuals[key].queue_free()
	board_visual.tile_visuals.clear()
	board_visual._create_all_visuals()

func _create_default_level(level_num: int) -> LevelData:
	var ld := LevelData.new()
	ld.level_number = level_num
	ld.moves = maxi(28 - level_num, 10)
	ld.targets = [{"type": "red", "count": 10 + level_num * 2}]
	return ld
```

- [ ] **Step 2: Commit**

```bash
git add scripts/game.gd
git commit -m "feat: implement game loop — swap, match, gravity, booster, obstacle flow"
```

### Task 16: HUD

**Files:**
- Create: `scripts/ui/hud.gd`

- [ ] **Step 1: Write HUD — moves counter, target display**

```gdscript
class_name HUD
extends Control

@onready var moves_label: Label = $MovesLabel
@onready var target_container: VBoxContainer = $TargetContainer

var target_labels := {}

func _ready() -> void:
	GameEvents.moves_changed.connect(_on_moves_changed)
	GameEvents.target_progress.connect(_on_target_progress)

func setup(moves: int, targets: Dictionary) -> void:
	_on_moves_changed(moves)
	for type_name in targets:
		var label := Label.new()
		label.text = "%s: 0/%d" % [type_name, targets[type_name]["total"]]
		label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		target_container.add_child(label)
		target_labels[type_name] = label

func _on_moves_changed(remaining: int) -> void:
	if moves_label:
		moves_label.text = str(remaining)

func _on_target_progress(type_name: String, current: int, total: int) -> void:
	if type_name in target_labels:
		target_labels[type_name].text = "%s: %d/%d" % [type_name, current, total]
```

- [ ] **Step 2: Commit**

```bash
git add scripts/ui/hud.gd
git commit -m "feat: add HUD — moves counter + target progress display"
```

---

## Chunk 4: Meta Systems

### Task 17: Life Manager

**Files:**
- Create: `scripts/meta/life_manager.gd`

- [ ] **Step 1: Write LifeManager**

```gdscript
class_name LifeManager
extends RefCounted

const MAX_LIVES := 5
const RECOVERY_SECONDS := 1800  # 30분

static func get_lives() -> int:
	_process_recovery()
	return SaveManager.get_lives()

static func has_lives() -> bool:
	return get_lives() > 0

static func use_life() -> bool:
	var lives := get_lives()
	if lives <= 0:
		return false
	SaveManager.set_lives(lives - 1)
	if lives == MAX_LIVES:
		# Start recovery timer
		SaveManager.set_lives_recovery_timestamp(
			int(Time.get_unix_time_from_system())
		)
	return true

static func buy_life() -> bool:
	if not SaveManager.spend_coins(100):
		return false
	var lives := mini(get_lives() + 1, MAX_LIVES)
	SaveManager.set_lives(lives)
	return true

static func get_time_to_next_life() -> int:
	if SaveManager.get_lives() >= MAX_LIVES:
		return 0
	var ts := SaveManager.get_lives_recovery_timestamp()
	if ts == 0:
		return 0
	var elapsed := int(Time.get_unix_time_from_system()) - ts
	var lives_recovered := elapsed / RECOVERY_SECONDS
	var remaining := RECOVERY_SECONDS - (elapsed % RECOVERY_SECONDS)
	return remaining

static func _process_recovery() -> void:
	var current := SaveManager.get_lives()
	if current >= MAX_LIVES:
		return
	var ts := SaveManager.get_lives_recovery_timestamp()
	if ts == 0:
		return
	var now := int(Time.get_unix_time_from_system())
	var elapsed := now - ts
	var recovered := elapsed / RECOVERY_SECONDS
	if recovered > 0:
		var new_lives := mini(current + recovered, MAX_LIVES)
		SaveManager.set_lives(new_lives)
		if new_lives >= MAX_LIVES:
			SaveManager.set_lives_recovery_timestamp(0)
		else:
			SaveManager.set_lives_recovery_timestamp(ts + recovered * RECOVERY_SECONDS)
```

- [ ] **Step 2: Commit**

```bash
git add scripts/meta/life_manager.gd
git commit -m "feat: add LifeManager — 5 lives, 30min recovery, coin purchase"
```

### Task 18: Coin Manager

**Files:**
- Create: `scripts/meta/coin_manager.gd`

- [ ] **Step 1: Write CoinManager**

```gdscript
class_name CoinManager
extends RefCounted

const REWARDS := {
	"level_clear": 20,
	"extra_move_bonus": 5,  # per remaining move
	"nightmare_min": 50,
	"nightmare_max": 100,
	"area_complete": 500,
}

const COSTS := {
	"extra_moves": 100,  # +5 moves
	"life_refill": 100,
	"start_booster": 200,
	"shuffle": 50,
}

static func reward_level_clear(remaining_moves: int) -> int:
	var total := REWARDS["level_clear"] + remaining_moves * REWARDS["extra_move_bonus"]
	SaveManager.add_coins(total)
	return total

static func reward_nightmare(scenario_difficulty: int) -> int:
	var reward := REWARDS["nightmare_min"] + scenario_difficulty * 10
	reward = mini(reward, REWARDS["nightmare_max"])
	SaveManager.add_coins(reward)
	return reward

static func reward_area_complete() -> int:
	SaveManager.add_coins(REWARDS["area_complete"])
	return REWARDS["area_complete"]

static func buy_extra_moves() -> bool:
	return SaveManager.spend_coins(COSTS["extra_moves"])

static func buy_shuffle() -> bool:
	return SaveManager.spend_coins(COSTS["shuffle"])
```

- [ ] **Step 2: Commit**

```bash
git add scripts/meta/coin_manager.gd
git commit -m "feat: add CoinManager — reward/cost tables, purchase methods"
```

### Task 19: Daily Bonus

**Files:**
- Create: `scripts/meta/daily_bonus.gd`

- [ ] **Step 1: Write DailyBonus**

```gdscript
class_name DailyBonus
extends RefCounted

const REWARDS := [
	{"coins": 10},
	{"coins": 20},
	{"coins": 30},
	{"coins": 40},
	{"coins": 50},
	{"coins": 50, "booster": "rocket"},
	{"lives": 5},  # full refill
]

static func can_claim() -> bool:
	var last := SaveManager.get_daily_bonus_last_claim()
	if last == "":
		return true
	var today := Time.get_date_string_from_system()
	return today != last

static func claim() -> Dictionary:
	if not can_claim():
		return {}
	var day := SaveManager.get_daily_bonus_day()
	var reward := REWARDS[day % REWARDS.size()]

	if reward.has("coins"):
		SaveManager.add_coins(reward["coins"])
	if reward.has("lives"):
		SaveManager.set_lives(LifeManager.MAX_LIVES)

	var next_day := (day + 1) % REWARDS.size()
	var today := Time.get_date_string_from_system()
	SaveManager.set_daily_bonus(next_day, today)
	GameEvents.daily_bonus_claimed.emit(day, reward)
	return reward

static func get_current_day() -> int:
	return SaveManager.get_daily_bonus_day()

static func get_reward_preview() -> Dictionary:
	var day := SaveManager.get_daily_bonus_day()
	return REWARDS[day % REWARDS.size()]
```

- [ ] **Step 2: Commit**

```bash
git add scripts/meta/daily_bonus.gd
git commit -m "feat: add DailyBonus — 7-day cycle rewards"
```

### Task 20: Castle Manager

**Files:**
- Create: `scripts/meta/castle_manager.gd`

- [ ] **Step 1: Write CastleManager**

```gdscript
class_name CastleManager
extends RefCounted

const AREA_1_TASKS := [
	{"id": "fountain", "name": "분수대 수리", "stars": 1, "description": "마른 분수 → 물 나오는 분수"},
	{"id": "lawn", "name": "정원 잔디 심기", "stars": 2, "description": "황무지 → 초록 잔디"},
	{"id": "flowers", "name": "꽃밭 조성", "stars": 2, "description": "빈 화단 → 꽃이 핀 화단"},
	{"id": "bench", "name": "벤치 배치", "stars": 1, "description": "빈 공간 → 벤치"},
	{"id": "lamp", "name": "가로등 설치", "stars": 2, "description": "어두운 길 → 밝은 가로등"},
	{"id": "gate", "name": "정문 장식", "stars": 3, "description": "낡은 문 → 화려한 정문"},
]

static func get_tasks() -> Array:
	return AREA_1_TASKS

static func get_next_task() -> Dictionary:
	var completed := SaveManager.get_completed_tasks()
	for task in AREA_1_TASKS:
		if task["id"] not in completed:
			return task
	return {}

static func can_complete_task(task_id: String) -> bool:
	var task := _find_task(task_id)
	if task.is_empty():
		return false
	return SaveManager.get_stars() >= task["stars"]

static func complete_task(task_id: String) -> bool:
	var task := _find_task(task_id)
	if task.is_empty():
		return false
	if not SaveManager.spend_stars(task["stars"]):
		return false
	SaveManager.complete_task(task_id)
	GameEvents.castle_task_completed.emit(task_id)
	# Check area completion
	if is_area_complete():
		CoinManager.reward_area_complete()
		GameEvents.castle_area_completed.emit("area_1")
	return true

static func is_area_complete() -> bool:
	var completed := SaveManager.get_completed_tasks()
	for task in AREA_1_TASKS:
		if task["id"] not in completed:
			return false
	return true

static func get_progress() -> Dictionary:
	var completed := SaveManager.get_completed_tasks()
	var total := AREA_1_TASKS.size()
	var done := 0
	for task in AREA_1_TASKS:
		if task["id"] in completed:
			done += 1
	return {"completed": done, "total": total}

static func _find_task(task_id: String) -> Dictionary:
	for task in AREA_1_TASKS:
		if task["id"] == task_id:
			return task
	return {}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/meta/castle_manager.gd
git commit -m "feat: add CastleManager — Area 1 with 6 tasks, star spending"
```

### Task 21: Nightmare Manager

**Files:**
- Create: `scripts/meta/nightmare_manager.gd`

- [ ] **Step 1: Write NightmareManager**

```gdscript
class_name NightmareManager
extends RefCounted

const SCENARIOS := [
	{"id": "fire", "name": "주방 화재", "target_type": "red", "target_count": 30, "time": 60, "reward": 50, "after_level": 5},
	{"id": "dragon", "name": "드래곤 출현", "target_type": "blue", "target_count": 35, "time": 45, "reward": 60, "after_level": 10},
	{"id": "flood", "name": "홍수", "target_type": "green", "target_count": 40, "time": 40, "reward": 70, "after_level": 15},
	{"id": "ghost", "name": "유령 성", "target_type": "yellow", "target_count": 40, "time": 35, "reward": 80, "after_level": 20},
	{"id": "prison", "name": "감옥 탈출", "target_type": "pink", "target_count": 45, "time": 30, "reward": 90, "after_level": 25},
	{"id": "boss", "name": "드래곤 보스", "target_type": "red", "target_count": 50, "time": 30, "reward": 100, "after_level": 30},
]

static func should_trigger(level_just_cleared: int) -> bool:
	for s in SCENARIOS:
		if s["after_level"] == level_just_cleared:
			if s["id"] not in SaveManager.get_completed_nightmares():
				return true
	return false

static func get_scenario_for_level(level: int) -> Dictionary:
	for s in SCENARIOS:
		if s["after_level"] == level:
			return s
	return {}

static func get_all_scenarios() -> Array:
	return SCENARIOS
```

- [ ] **Step 2: Commit**

```bash
git add scripts/meta/nightmare_manager.gd
git commit -m "feat: add NightmareManager — 6 scenarios, level triggers"
```

---

## Chunk 5: Popup, Home, Level Data

### Task 22: Popup Manager

**Files:**
- Create: `scripts/ui/popup_manager.gd`

- [ ] **Step 1: Write PopupManager — Win/Lose/Nightmare popups**

```gdscript
extends CanvasLayer

signal popup_closed(action: String)

var current_popup: Control = null

func _ready() -> void:
	GameEvents.level_completed.connect(_on_level_completed)
	GameEvents.level_failed.connect(_on_level_failed)

func _on_level_completed(level: int, remaining_moves: int) -> void:
	var coins := 20 + remaining_moves * 5
	show_win_popup(level, coins)

func _on_level_failed(level: int) -> void:
	show_lose_popup(level)

func show_win_popup(level: int, coins: int) -> void:
	_clear_popup()
	var panel := _create_panel()
	var vbox := VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER

	var title := Label.new()
	title.text = "Well Done!"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 48)
	vbox.add_child(title)

	var reward_label := Label.new()
	reward_label.text = "★ +1    💰 +%d" % coins
	reward_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(reward_label)

	# Check nightmare
	var nightmare := NightmareManager.should_trigger(level)

	var continue_btn := Button.new()
	continue_btn.text = "Continue"
	continue_btn.pressed.connect(func():
		_clear_popup()
		if nightmare:
			_show_nightmare_prompt(level)
		else:
			GameState.go_to_scene("home")
	)
	vbox.add_child(continue_btn)

	panel.add_child(vbox)
	vbox.set_anchors_and_offsets_preset(Control.PRESET_CENTER)

func show_lose_popup(level: int) -> void:
	_clear_popup()
	var panel := _create_panel()
	var vbox := VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER

	var title := Label.new()
	title.text = "Level Failed"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 40)
	vbox.add_child(title)

	if SaveManager.get_coins() >= 100:
		var buy_btn := Button.new()
		buy_btn.text = "+5 Moves (100 💰)"
		buy_btn.pressed.connect(func():
			if CoinManager.buy_extra_moves():
				_clear_popup()
				popup_closed.emit("buy_moves")
		)
		vbox.add_child(buy_btn)

	var retry_btn := Button.new()
	retry_btn.text = "Retry" if LifeManager.has_lives() else "No Lives"
	retry_btn.disabled = not LifeManager.has_lives()
	retry_btn.pressed.connect(func():
		_clear_popup()
		GameState.start_level(level)
		GameState.go_to_scene("game")
	)
	vbox.add_child(retry_btn)

	var home_btn := Button.new()
	home_btn.text = "Home"
	home_btn.pressed.connect(func():
		_clear_popup()
		GameState.go_to_scene("home")
	)
	vbox.add_child(home_btn)

	panel.add_child(vbox)
	vbox.set_anchors_and_offsets_preset(Control.PRESET_CENTER)

func _show_nightmare_prompt(level: int) -> void:
	var scenario := NightmareManager.get_scenario_for_level(level)
	if scenario.is_empty():
		GameState.go_to_scene("home")
		return
	_clear_popup()
	var panel := _create_panel()
	var vbox := VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER

	var title := Label.new()
	title.text = "King's Nightmare!"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 36)
	vbox.add_child(title)

	var desc := Label.new()
	desc.text = scenario["name"]
	desc.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(desc)

	var play_btn := Button.new()
	play_btn.text = "Play (+%d 💰)" % scenario["reward"]
	play_btn.pressed.connect(func():
		_clear_popup()
		GameState.start_nightmare(scenario["id"])
		GameState.go_to_scene("nightmare", {"scenario": scenario})
	)
	vbox.add_child(play_btn)

	var skip_btn := Button.new()
	skip_btn.text = "Skip"
	skip_btn.pressed.connect(func():
		_clear_popup()
		GameState.go_to_scene("home")
	)
	vbox.add_child(skip_btn)

	panel.add_child(vbox)
	vbox.set_anchors_and_offsets_preset(Control.PRESET_CENTER)

func _create_panel() -> Panel:
	var panel := Panel.new()
	panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(panel)
	current_popup = panel
	return panel

func _clear_popup() -> void:
	if current_popup and is_instance_valid(current_popup):
		current_popup.queue_free()
		current_popup = null
```

- [ ] **Step 2: Commit**

```bash
git add scripts/ui/popup_manager.gd
git commit -m "feat: add PopupManager — win/lose/nightmare prompt popups"
```

### Task 23: Home Scene

**Files:**
- Modify: `scripts/home.gd`

- [ ] **Step 1: Write Home scene with Castle view, play button, stats**

```gdscript
extends Control

@onready var level_label: Label = $TopBar/LevelLabel
@onready var coins_label: Label = $TopBar/CoinsLabel
@onready var lives_label: Label = $TopBar/LivesLabel
@onready var stars_label: Label = $TopBar/StarsLabel
@onready var play_button: Button = $PlayButton
@onready var castle_progress: Label = $CastleProgress
@onready var task_button: Button = $TaskButton

func _ready() -> void:
	_update_ui()
	GameEvents.coins_changed.connect(func(_c): _update_ui())
	GameEvents.lives_changed.connect(func(_l): _update_ui())
	GameEvents.stars_changed.connect(func(_s): _update_ui())

	play_button.pressed.connect(_on_play_pressed)
	if task_button:
		task_button.pressed.connect(_on_task_pressed)

	# Daily bonus check
	if DailyBonus.can_claim():
		_show_daily_bonus()

func _update_ui() -> void:
	if level_label:
		level_label.text = "Level %d" % GameState.get_current_level()
	if coins_label:
		coins_label.text = "💰 %d" % GameState.get_coins()
	if lives_label:
		var lives := LifeManager.get_lives()
		lives_label.text = "♥ %d" % lives
	if stars_label:
		stars_label.text = "★ %d" % GameState.get_stars()
	if castle_progress:
		var prog := CastleManager.get_progress()
		castle_progress.text = "Castle: %d/%d" % [prog["completed"], prog["total"]]
	if task_button:
		var next := CastleManager.get_next_task()
		if next.is_empty():
			task_button.text = "Area Complete!"
			task_button.disabled = true
		else:
			task_button.text = "%s (★%d)" % [next["name"], next["stars"]]
			task_button.disabled = not CastleManager.can_complete_task(next["id"])

func _on_play_pressed() -> void:
	if not LifeManager.has_lives():
		# Show no-lives popup
		return
	LifeManager.use_life()
	var level := GameState.get_current_level()
	GameState.start_level(level)
	GameState.go_to_scene("game")

func _on_task_pressed() -> void:
	var next := CastleManager.get_next_task()
	if not next.is_empty():
		CastleManager.complete_task(next["id"])
		_update_ui()

func _show_daily_bonus() -> void:
	var reward := DailyBonus.claim()
	if reward.is_empty():
		return
	# Simple notification — could be a popup
	print("Daily Bonus Day %d: %s" % [DailyBonus.get_current_day(), str(reward)])
```

- [ ] **Step 2: Create home.tscn layout**

```
home.tscn:
  Control (full rect, scripts/home.gd)
  ├── ColorRect (background, sky blue #87ceeb)
  ├── TopBar (HBoxContainer, top)
  │   ├── CoinsLabel
  │   ├── LevelLabel
  │   ├── LivesLabel
  │   └── StarsLabel
  ├── CastleArea (CenterContainer, castle placeholder)
  │   └── Label "🏰 Castle Garden"
  ├── CastleProgress (Label)
  ├── TaskButton (Button)
  └── PlayButton (Button, "Play Level X", bottom center)
```

- [ ] **Step 3: Commit**

```bash
git add scripts/home.gd scenes/home.tscn
git commit -m "feat: add Home scene — top bar, castle progress, play/task buttons, daily bonus"
```

### Task 24: Nightmare Scene

**Files:**
- Modify: `scripts/nightmare_scene.gd`

- [ ] **Step 1: Write Nightmare scene — time-limited match-3**

```gdscript
extends Control

var board: Board
var board_visual: BoardVisual
var scenario: Dictionary = {}
var time_remaining: float = 0.0
var target_current: int = 0
var target_total: int = 0
var is_active := false

@onready var timer_label: Label = $TimerLabel
@onready var target_label: Label = $TargetLabel
@onready var scenario_label: Label = $ScenarioLabel

func _ready() -> void:
	# Get scenario from scene params
	scenario = get_parent().scene_params.get("scenario", {})
	if scenario.is_empty():
		GameState.go_to_scene("home")
		return

	time_remaining = scenario.get("time", 30)
	target_total = scenario.get("target_count", 30)
	target_current = 0

	if scenario_label:
		scenario_label.text = scenario.get("name", "Nightmare")

	# Create board (standard 8x8, no obstacles)
	var ld := LevelData.new()
	ld.moves = 999  # unlimited moves for nightmare
	ld.targets = [{"type": scenario.get("target_type", "red"), "count": target_total}]

	board = Board.new()
	board.init_board(ld)

	board_visual = BoardVisual.new()
	add_child(board_visual)
	board_visual.position = Vector2(40, 250)
	board_visual.init_visuals(board)
	board_visual.swap_requested.connect(_on_swap)

	is_active = true

func _process(delta: float) -> void:
	if not is_active:
		return
	time_remaining -= delta
	if timer_label:
		timer_label.text = "%02d:%02d" % [int(time_remaining) / 60, int(time_remaining) % 60]
	if target_label:
		target_label.text = "%d / %d" % [target_current, target_total]
	if time_remaining <= 0:
		_on_time_up()

func _on_swap(from: Vector2i, to: Vector2i) -> void:
	if not is_active:
		return
	if not board.try_swap(from, to):
		return
	_process_matches()

func _process_matches() -> void:
	var matches := MatchDetector.find_all_matches(board.grid, board.width, board.height, board.is_active)
	while matches.size() > 0:
		for m in matches:
			var target_type_name: String = scenario.get("target_type", "red")
			for cell in m["cells"]:
				var tile := board.get_tile(cell)
				if tile and Tile.TYPE_NAMES.get(tile.type, "") == target_type_name:
					target_current += 1
			board.remove_tiles(m["cells"])
		await get_tree().create_timer(0.2).timeout
		board.apply_gravity()
		await get_tree().create_timer(0.1).timeout
		board.fill_empty()
		await get_tree().create_timer(0.1).timeout

		if target_current >= target_total:
			_on_win()
			return
		matches = MatchDetector.find_all_matches(board.grid, board.width, board.height, board.is_active)

func _on_win() -> void:
	is_active = false
	GameState.complete_nightmare(scenario["id"], scenario.get("reward", 50))
	await get_tree().create_timer(1.0).timeout
	GameState.go_to_scene("home")

func _on_time_up() -> void:
	is_active = false
	await get_tree().create_timer(1.0).timeout
	GameState.go_to_scene("home")
```

- [ ] **Step 2: Commit**

```bash
git add scripts/nightmare_scene.gd
git commit -m "feat: add Nightmare scene — time-limited match-3 with scenario data"
```

### Task 25: Create Level Data (30 Levels)

**Files:**
- Create: `scripts/tools/level_generator.gd` (에디터 도구 or 스크립트)

- [ ] **Step 1: Write level generation script**

이 스크립트는 에디터에서 실행하거나 별도 도구로 30개 레벨 .tres 파일을 생성합니다. 실행 대신 직접 코드에서 LevelData를 동적 생성하는 fallback도 이미 `game.gd`의 `_create_default_level()`에 구현되어 있으므로, 레벨 데이터는 점진적으로 수동 조정합니다.

```gdscript
# scripts/tools/level_generator.gd
# Run from Godot editor: Edit > Run Script
@tool
extends EditorScript

func _run() -> void:
	for i in range(1, 31):
		var ld := LevelData.new()
		ld.level_number = i
		ld.board_width = 8
		ld.board_height = 8
		ld.tile_types = 4 if i <= 5 else 5

		# Moves curve
		if i <= 5:
			ld.moves = 28 - i  # 27-23
		elif i <= 10:
			ld.moves = 22 - (i - 6)  # 22-18
		elif i <= 20:
			ld.moves = 18 - (i - 11) / 2  # 18-13
		else:
			ld.moves = maxi(13 - (i - 21) / 2, 10)

		# Targets
		ld.targets = _generate_targets(i)
		# Obstacles
		ld.obstacles = _generate_obstacles(i)
		# Nightmare after every 5 levels
		ld.nightmare_after = (i % 5 == 0)

		var path := "res://resources/levels/level_%03d.tres" % i
		ResourceSaver.save(ld, path)
		print("Created: ", path)

func _generate_targets(level: int) -> Array:
	if level <= 5:
		return [{"type": "red", "count": 10 + level * 3}]
	elif level <= 10:
		return [{"type": ["red", "blue", "green"][level % 3], "count": 20 + level * 2}]
	elif level <= 20:
		# Dual targets
		var types := ["red", "blue", "green", "yellow", "pink"]
		return [
			{"type": types[level % 5], "count": 15 + level},
			{"type": types[(level + 2) % 5], "count": 10 + level},
		]
	else:
		# Complex targets
		return [
			{"type": "red", "count": 20 + level},
			{"type": "wooden_box", "count": 5 + (level - 20)},
		]

func _generate_obstacles(level: int) -> Array:
	var obs := []
	if level >= 3:
		# Mailboxes
		for j in range(mini(3, level / 3)):
			obs.append({"type": "mailbox", "position": [randi() % 8, randi() % 8], "hp": 1})
	if level >= 5:
		for j in range(mini(4, (level - 4) / 2)):
			obs.append({"type": "wooden_box", "position": [randi() % 8, randi() % 8], "hp": 1})
	if level >= 10:
		for j in range(mini(3, (level - 9) / 3)):
			obs.append({"type": "stone_box", "position": [randi() % 8, randi() % 8], "hp": 2})
	if level >= 8:
		for j in range(mini(4, (level - 7) / 2)):
			obs.append({"type": "grass", "position": [randi() % 8, randi() % 8], "hp": 1})
	if level >= 12:
		for j in range(mini(2, (level - 11) / 4)):
			obs.append({"type": "fence", "position": [randi() % 8, randi() % 8], "hp": 1})
	if level >= 15:
		for j in range(mini(2, (level - 14) / 5)):
			obs.append({"type": "chain", "position": [randi() % 8, randi() % 8], "hp": 1})
	return obs
```

- [ ] **Step 2: Commit**

```bash
git add scripts/tools/level_generator.gd
git commit -m "feat: add level generator — 30 levels with progressive difficulty"
```

---

## Chunk 6: Integration, Export, Deploy

### Task 26: Wire PopupManager into Main Scene

**Files:**
- Modify: `scripts/main.gd`

- [ ] **Step 1: Add PopupManager as CanvasLayer child in main scene**

main.gd에 PopupManager를 자식으로 추가:

```gdscript
# main.gd _ready() 끝에 추가:
var popup_mgr_script := load("res://scripts/ui/popup_manager.gd")
var popup_mgr := CanvasLayer.new()
popup_mgr.set_script(popup_mgr_script)
popup_mgr.layer = 10
add_child(popup_mgr)
```

- [ ] **Step 2: Commit**

```bash
git add scripts/main.gd
git commit -m "feat: wire PopupManager into main scene"
```

### Task 27: Connect HUD to Game Scene

**Files:**
- Modify: `scripts/game.gd`

- [ ] **Step 1: Add HUD initialization in game.gd _ready()**

```gdscript
# game.gd _ready() 끝에 추가:
var hud := load("res://scripts/ui/hud.gd").new()
# 또는 HUD 씬이 있으면 instantiate
add_child(hud)
hud.setup(remaining_moves, targets)
```

- [ ] **Step 2: Commit**

```bash
git add scripts/game.gd
git commit -m "feat: connect HUD to game scene"
```

### Task 28: Placeholder Assets

**Files:**
- Create: `assets/sprites/tile_placeholder.png` (64x64 white square)

- [ ] **Step 1: Generate placeholder sprites programmatically**

Godot에서 코드로 placeholder 텍스처를 생성하거나, 단순한 색 사각형 PNG를 배치합니다. TileVisual이 modulate로 색을 입히므로 흰색 사각형 1개면 충분합니다.

```gdscript
# tile_visual.gd _ready()에서 동적 텍스처 생성 (placeholder 파일 없이):
func _ready() -> void:
	if not sprite:
		sprite = Sprite2D.new()
		add_child(sprite)
	# Create white rect texture
	var img := Image.create(64, 64, false, Image.FORMAT_RGBA8)
	img.fill(Color.WHITE)
	var tex := ImageTexture.create_from_image(img)
	sprite.texture = tex
```

- [ ] **Step 2: Commit**

```bash
git add scripts/components/tile_visual.gd
git commit -m "feat: add dynamic placeholder textures for tiles"
```

### Task 29: Web Export Configuration

**Files:**
- Modify: `export/vercel.json`
- Create: `export_presets.cfg` (Godot export config)

- [ ] **Step 1: Verify vercel.json has correct COOP/COEP headers**

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" }
      ]
    }
  ]
}
```

- [ ] **Step 2: Create export_presets.cfg for HTML5 web export**

Godot 에디터에서 Export > Add > Web (HTML5)를 선택하고:
- Export Path: `export/index.html`
- Thread Support: disabled (SharedArrayBuffer 없이도 동작)

- [ ] **Step 3: Test web export locally**

```bash
cd /Users/jaejin/projects/toy/game-arcade/royal-puzzle-4
# Godot CLI export (headless)
# godot --headless --export-release "Web" export/index.html
```

- [ ] **Step 4: Commit**

```bash
git add export/ export_presets.cfg
git commit -m "feat: configure web export + Vercel COOP/COEP headers"
```

### Task 30: Vercel Deployment

- [ ] **Step 1: Deploy to Vercel**

```bash
cd /Users/jaejin/projects/toy/game-arcade/royal-puzzle-4/export
npx vercel --prod
```

- [ ] **Step 2: Update game-portal/games.json with deployed URL**

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: Royal Puzzle 4 v1.0 — Match-3 + Castle Decoration, 30 levels"
```

---

## Summary

| Chunk | Tasks | 핵심 산출물 |
|-------|-------|-----------|
| 1: Foundation | 1-5 | project.godot, 3 autoloads, scene manager, placeholder scenes |
| 2: Match-3 Core | 6-12 | Tile, LevelData, MatchDetector, Board, Booster, BoosterMerger, Obstacle |
| 3: Game Scene | 13-16 | TileVisual, BoardVisual, Game loop, HUD |
| 4: Meta Systems | 17-21 | LifeManager, CoinManager, DailyBonus, CastleManager, NightmareManager |
| 5: Scenes & Levels | 22-25 | PopupManager, Home scene, Nightmare scene, 30 levels |
| 6: Integration | 26-30 | Wiring, placeholders, web export, Vercel deploy |

**병렬 가능 작업:**
- Task 6-8 (Tile, LevelData, MatchDetector) — 독립적, 동시 작업 가능
- Task 10-12 (Booster, BoosterMerger, Obstacle) — 독립적
- Task 17-21 (Meta systems 전체) — 서로 독립적, Core와도 독립적
- Task 22-24 (Popup, Home, Nightmare) — UI 씬들, 동시 작업 가능
