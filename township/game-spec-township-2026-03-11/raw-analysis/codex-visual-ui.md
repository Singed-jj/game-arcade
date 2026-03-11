## 1) Art Style & Quality
- **Style:** Stylized **cartoon 2D UI over painted/cartoon scene backgrounds** (not pixel art, not flat minimalist).  
- **Rendering feel:** Glossy, high-saturation mobile-casual look with soft gradients, bevels, highlights, and thick outlines.  
- **Depth cues:** Faux-3D UI (embossed buttons, rounded badges, layered panels), plus dim overlays for modal focus.  
- **Quality level:** **Production-grade casual game UI** (consistent icon language, polished assets, clear reward-loop presentation).  
- **Frame refs:** Strongest in **F2, F3, F4, F6, F7**.

## 2) Color Palette (Approx. Hex + Temperature)
Overall palette is **warm-dominant accents** on cool/dark overlays.

- **Primary UI Blue:** `#0E6CCF` to `#2EA3FF` (panels, badges, lower UI rows) — cool  
- **Primary Gold/Yellow:** `#FFC61A` to `#FFB000` (titles, stars, trophy accents) — warm  
- **Success Green:** `#39C94B` to `#14A83A` (claim/equip/progress states) — warm-neutral  
- **Reward Red/Pink Ribbon:** `#D93A5C` to `#B51F4A` (reward tags) — warm  
- **Purple/Magenta Accents:** `#8E2BC9` / `#B02B8F` (event tabs, badges) — warm/cool mixed  
- **Background Dim Overlay:** near `#0A0A12` at high opacity (modal emphasis) — cool/dark  
- **Confetti accents (F5):** cyan `#3DDCFF`, yellow `#FFE14A`, pink `#FF5ECF`, green `#9CFF4C`

## 3) UI Layout & Composition
- **Orientation:** Landscape HUD-first layout with central gameplay/background visibility.
- **Top-left cluster:** Currency/star and help/profile/event markers (**F2, F3, F7**).
- **Top-center:** Progress bars / pass progression (**F3, F7**).
- **Top-right:** Dismiss/close or event status chips (**F3, F7**).
- **Center stage:** Reward reveal and outcome messaging (`YOUR CARDS`, `WELL DONE!`) (**F4, F6**).
- **Bottom-center controls:** Primary action buttons (`EQUIP`, `LATER`) and progress tracks (**F3, F6**).
- **Safe areas:** Critical controls/titles stay inset from edges; corners reserved for secondary HUD.
- **Game vs UI ratio:**  
  - Heavy modal states: ~**65–80% UI / 20–35% scene** (**F3, F6, F7**)  
  - Light overlay states: ~**20–35% UI / 65–80% scene** (**F1, F2, F4**)

## 4) Typography
- **Font style:** Bold, rounded, cartoon display sans; thick strokes with warm gradients and dark outlines.
- **Hierarchy:**  
  - H1 banners (`YOUR CARDS`, `WELL DONE!`) are very large, high-contrast (**F4, F6**).  
  - Secondary labels/buttons medium-large (`CLAIM`, `EQUIP`, `LATER`) (**F3, F7**).  
  - Numeric/status text compact but legible (`13/20`, timers, counts) (**F2, F3, F6**).
- **Readability:** Strong due to outline + drop-shadow + color blocking; slightly reduced only where dark overlay is strongest.

## 5) Iconography
- **Style:** Rounded, toy-like, high-gloss icons with thick outlines and gradient fills.
- **Consistency:** Very consistent shape language across currencies, rewards, chests, tickets, medals.
- **Clarity:** High semantic clarity for reward economy (coins/cash/chests/cards/timers) and progression markers.
- **Frame refs:** **F2, F3, F6, F7**.

## 6) Effects & Motion Cues (Inferred from Frames)
- **Particles:** Confetti celebration burst (**F5**) indicates milestone/reward completion.
- **Transitions:** Dimmed background + centered modal/reward card implies pop-in/fade modal transitions (**F4, F6**).
- **Micro-animations likely:** Button pulse/glow on `CLAIM` and reward objects (based on highlight treatment).
- **Progress feedback:** Bars, checkmarks, and filled counters are prominent for loop reinforcement (**F3, F6, F7**).

## 7) Screen Orientation / Aspect / Device Target
- **Orientation:** **Landscape**.
- **Approx aspect ratio:** ~**16:9** (wide mobile/tablet landscape).
- **Likely target:** Mobile casual game with tablet compatibility; UI uses generous touch targets and edge-safe anchoring.
