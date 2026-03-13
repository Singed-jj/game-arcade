# Match3 (second video) — Effects & Motion Analysis (Claude Vision)

## Key Observations

### Gameplay Animation Philosophy
This game (appears to be "Royal Match" clone/competitor) emphasizes **dense simultaneous explosions** and **very fast cascade pacing** — the board is almost always in motion.

---

## Effect Catalog

### 1. Multi-block Cascade Explosion
- **Type**: particle / screen-effect
- **Observed**: Frame 10, 15 — multiple blocks exploding simultaneously mid-cascade
- **Visual**: Dense cloud of colored particles (20-30 total) scatter in all directions; brief screen-wide color flash matching dominant match color
- **Duration**: ~250ms per wave; cascades chain at ~150ms intervals
- **Key property**: Simultaneous explosions merge particle clouds creating a "burst zone" effect

### 2. Block Removal Pop
- **Type**: animation
- **Observed**: Frames 10-25 showing various board states mid-match
- **Visual**: Blocks scale to 0 with a brief brightness flash (white highlight on surface)
- **Easing**: Quick ease-in, no bounce on disappear
- **Duration**: ~150ms

### 3. Block Fall with Settle Bounce
- **Type**: animation
- **Observed**: Active cascade states (f10-20)
- **Visual**: Blocks fall quickly (fast ease-in), then bounce once on landing (+3-4px overshoot)
- **Key diff from Royal Match**: Smaller overshoot, faster settle — feels more "snappy"

### 4. Fortune Wheel Spin
- **Type**: animation (special screen)
- **Observed**: Frames 35-45 — fortune wheel gacha mechanic
- **Visual**: Wheel spins fast then decelerates, pointer bounces between segments
- **Easing**: Fast → ease-out-cubic, final settle with 2-3 micro-bounces
- **Duration**: ~3-4s total

### 5. Score/Counter Update
- **Type**: UI feedback
- **Visual**: Number rolls up with brief scale pulse

---

## Critical Animation Differentiators

### What this game does well:

1. **Cascade speed is FAST** — waves resolve in ~150ms each, no waiting between cascades
2. **Simultaneous explosion merging** — when 3+ blocks explode at once, their particle clouds overlap creating a richer effect
3. **Clear color-coded particles** — particles exactly match the gem color, making it easy to see what exploded
4. **No "dead time"** — new blocks fill immediately after cascade, zero pause between fill and next possible match
