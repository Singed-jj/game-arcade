## Visual/UI Spec Analysis (Frames 1–7)

## 1) Art Style & Quality
- **Style:** Stylized **cartoon/casual mobile** UI, not pixel art, not realistic 3D.  
- **Rendering:** Mostly **2D illustrated assets** with soft gradients, bevels, outlines, and drop shadows for depth (e.g., logos/buttons in Frames 1, 2, 4–7).
- **Quality Level:** **High-polish midcore/casual** production quality:
  - Consistent lighting/shading language
  - Clean anti-aliased edges
  - Strong visual hierarchy and platform-ready iconography
- **Theme:** Friendly, playful, high-contrast “match/puzzle” presentation.

## 2) Color Palette (estimated from frames)
> Hex values are visual estimates from screenshots.

- **Primary background blues (cool):**
  - Deep royal blue: `#0B2F8F` (Frames 4–7)
  - Dark navy-blue: `#152A7A` (Frame 1 corners)
  - Mid blue gradient center: `#1E39D8` / `#1548B3`
- **UI panel blue/gray:**
  - Slate panel fill: `#233654` (Frames 2, 4 content area)
  - Top-tab strip lighter blue: `#5E7EA8` (Frame 4)
- **Accent warm colors:**
  - Gold/yellow highlights/text outlines: `#F2C94C` / `#F2B233`
  - Orange trim lines: `#F28C28`
- **Neutrals:**
  - Off-white text/icons: `#F1F1E8`
  - Dark stroke/shadow: `#1D2440`
- **Special item colors (Frames 5–7):**
  - Green gem: `#35C24A`
  - Red block: `#D83A36`
  - Magenta gem: `#E643D4`
- **Temperature balance:** Dominantly **cool** base with **warm accents** for callouts and interactives.

## 3) UI Layout & Composition
- **Orientation:** **Portrait** (all frames).
- **Likely aspect/device target:** ~**9:16** smartphone (e.g., 1080×1920 class).  
- **Core structure (Frames 2, 4):**
  - Top header/title bar (`My Team`, `Teams`)
  - Secondary tab row (`Join / Search / Create`)
  - Large central content panel (~65–75% screen height)
  - Bottom persistent nav bar with 4–5 icons
- **Safe areas:**
  - Top margin used for title and controls (Frame 3 close button top-right)
  - Bottom nav sits above screen edge with padding for thumb interaction
- **Game vs UI ratio (these shots):**
  - Mostly **UI-heavy meta screens** (team/clan/social)
  - Loading/tutorial screens (Frames 5–7) are centered instructional graphics with minimal chrome.
- **Button placement:**
  - High-priority dismiss/action at top-right (`X`, Frame 3)
  - Tabs centered near top (Frame 4)
  - Nav actions at bottom center/edges (Frames 2–4)

## 4) Typography
- **Font style:** Rounded, bold, cartoon display type with thick outlines and subtle shadow.
- **Hierarchy:**
  1. Screen titles (`My Team`, `Team Info`, `Teams`) large, high contrast
  2. Tabs/buttons medium bold (`Join`, `Search`, `Create`, `View`)
  3. Status/helper text smaller (`Loading`)
- **Readability:**
  - Strong due to outline + shadow + high contrast on blue backgrounds
  - Slight dark-overlay readability loss in Frame 3 (modal dim state), expected behavior.

## 5) Icons & Symbol System
- **Style:** Glossy, rounded-square icon frames with gold borders; cartoon pictograms.
- **Consistency:** High consistency across bottom nav and item symbols (Frames 2–7).
- **Clarity:**
  - Bottom nav icons are recognizable by shape/color grouping
  - Special power-up tutorial graphics are clear and instructional (T/L patterns + arrow + resulting item)
- **Potential ambiguity:** Some bottom icons rely on familiarity; labels help (e.g., `Team`/`Teams` visible in Frames 2, 4).

## 6) Effects & Motion Cues (inferred from stills)
- **Observed effects:**
  - Drop shadows on logos/text/buttons
  - Gradient backgrounds and bevel highlights
  - Dimmed backdrop modal state (Frame 3)
  - Spinner/loading indicators (Frames 3, 4)
  - Spark burst around resulting power-up icon (Frames 5–7)
- **Likely transitions/animations:**
  - Spinner rotation
  - Tab/content fade or slide transitions
  - Modal fade-in/out with darkened backdrop
  - Subtle bounce/pop on buttons/icons (common with this style)

## 7) Frame-by-Frame Notes
- **Frame 1:** Splash/logo screen; centered logo on deep radial blue gradient, minimal UI.
- **Frame 2:** “My Team” meta screen; empty/placeholder large central panel, persistent bottom nav.
- **Frame 3:** “Team Info” modal overlay with dark scrim + visible loading spinner; close button top-right.
- **Frame 4:** “Teams” list screen with active tabs and centered spinner in content area.
- **Frame 5:** Loading tip card: TNT power-up recipe (T-shape match).
- **Frame 6:** Loading tip card: Rocket recipe (4 in a line).
- **Frame 7:** Loading tip card: Light Ball recipe (5 in a line).

## 8) Spec Summary (Quick)
- **Genre UI language:** Casual match/puzzle with clan/team social layer.
- **Visual direction:** Cool blue base + gold/orange accents, rounded glossy cartoon controls.
- **Target platform:** Portrait mobile phone, touch-first, large tap targets.
- **Design maturity:** Production-ready visual consistency across navigation, modals, and tutorial/loading states.
