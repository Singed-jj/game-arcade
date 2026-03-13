#!/usr/bin/env python3
"""
detect-stones.py
stage-map.png에서 돌다리(stepping stone) 위치를 자동 감지해
public/assets/data/stone-map.json과 scripts/stone-verify.html을 생성한다.
"""

import cv2
import json
import base64
import math
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)

IMG_PATH  = os.path.join(PROJECT_DIR, "public/assets/bg/stage-map.png")
JSON_OUT  = os.path.join(PROJECT_DIR, "src/assets/data/stone-map.json")
HTML_OUT  = os.path.join(SCRIPT_DIR, "stone-verify.html")

# ---------------------------------------------------------------------------
# 1. 이미지 로드
# ---------------------------------------------------------------------------
img = cv2.imread(IMG_PATH)
if img is None:
    raise FileNotFoundError(f"이미지를 찾을 수 없음: {IMG_PATH}")

H, W = img.shape[:2]
print(f"이미지 크기: {W}x{H}")

# ---------------------------------------------------------------------------
# 2. HSV 마스크 — 돌다리의 갈색/회색/베이지 계열 검출
#    범위를 넓게 잡고 circularity 필터로 걸러냄
# ---------------------------------------------------------------------------
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

# 갈색 계열 (hue 10-30, 채도 중간, 밝기 중간-높음)
mask_brown = cv2.inRange(hsv, (8, 30, 80), (35, 200, 220))

# 회색/베이지 계열 (채도 낮음, 밝기 중간)
mask_gray  = cv2.inRange(hsv, (0, 0, 100), (180, 60, 210))

# 황토색 추가 (hue 15-40, 채도 약간)
mask_tan   = cv2.inRange(hsv, (12, 40, 120), (45, 180, 230))

mask = cv2.bitwise_or(mask_brown, mask_gray)
mask = cv2.bitwise_or(mask, mask_tan)

# 모폴로지: 노이즈 제거 후 팽창
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN,  kernel, iterations=2)
mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=3)

# ---------------------------------------------------------------------------
# 3. 컨투어 찾기 + 타원형 후보 필터
# ---------------------------------------------------------------------------
contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

stones = []
MIN_AREA = (W * 0.05) ** 2 * 0.3   # 최소 면적 (이미지 너비의 5% 원형 기준)
MAX_AREA = (W * 0.35) ** 2          # 최대 면적

for cnt in contours:
    area = cv2.contourArea(cnt)
    if area < MIN_AREA or area > MAX_AREA:
        continue

    # 바운딩 박스
    x, y, w, h = cv2.boundingRect(cnt)

    # 가로세로 비율 필터 (타원형이므로 0.3~3.5 범위)
    aspect = w / h if h > 0 else 0
    if aspect < 0.25 or aspect > 5.0:
        continue

    # circularity 필터
    perimeter = cv2.arcLength(cnt, True)
    if perimeter == 0:
        continue
    circularity = 4 * math.pi * area / (perimeter ** 2)
    if circularity < 0.25:
        continue

    cx = x + w / 2
    cy = y + h / 2
    stones.append({
        "_cx_px": cx, "_cy_px": cy, "_w_px": w, "_h_px": h,
        "_area": area, "_circ": round(circularity, 3),
    })

# ---------------------------------------------------------------------------
# 4. 중복/겹침 제거 (NMS 유사)
# ---------------------------------------------------------------------------
def overlap_ratio(a, b):
    ax1, ay1 = a["_cx_px"] - a["_w_px"]/2, a["_cy_px"] - a["_h_px"]/2
    ax2, ay2 = ax1 + a["_w_px"],            ay1 + a["_h_px"]
    bx1, by1 = b["_cx_px"] - b["_w_px"]/2, b["_cy_px"] - b["_h_px"]/2
    bx2, by2 = bx1 + b["_w_px"],            by1 + b["_h_px"]
    ix = max(0, min(ax2, bx2) - max(ax1, bx1))
    iy = max(0, min(ay2, by2) - max(ay1, by1))
    inter = ix * iy
    union = a["_w_px"]*a["_h_px"] + b["_w_px"]*b["_h_px"] - inter
    return inter / union if union > 0 else 0

# 면적 내림차순 정렬 후 그리디 NMS
stones.sort(key=lambda s: -s["_area"])
kept = []
for s in stones:
    if all(overlap_ratio(s, k) < 0.3 for k in kept):
        kept.append(s)

# y 기준 오름차순 정렬 (위 = 작은 y = 게임 후반)
kept.sort(key=lambda s: s["_cy_px"])

print(f"감지된 돌다리: {len(kept)}개")
for i, s in enumerate(kept):
    tag = "(장식)" if i < 4 else f"→ Level {i-3}"
    print(f"  [{i}] cx={s['_cx_px']:.0f} cy={s['_cy_px']:.0f} "
          f"w={s['_w_px']:.0f} h={s['_h_px']:.0f} circ={s['_circ']} {tag}")

# ---------------------------------------------------------------------------
# 5. 정규화 → JSON 저장
# ---------------------------------------------------------------------------
normalized = []
for s in kept:
    normalized.append({
        "cx": round(s["_cx_px"] / W, 4),
        "cy": round(s["_cy_px"] / H, 4),
        "w":  round(s["_w_px"]  / W, 4),
        "h":  round(s["_h_px"]  / H, 4),
    })

output = {
    "imageSize": {"w": W, "h": H},
    "stones": normalized,
}

os.makedirs(os.path.dirname(JSON_OUT), exist_ok=True)
with open(JSON_OUT, "w") as f:
    json.dump(output, f, indent=2)
print(f"\n✅ JSON 저장: {JSON_OUT}")

# ---------------------------------------------------------------------------
# 6. 검증용 HTML 생성
# ---------------------------------------------------------------------------
# 원본 이미지에 오버레이 그리기
vis = img.copy()
for i, s in enumerate(kept):
    cx, cy = int(s["_cx_px"]), int(s["_cy_px"])
    rw, rh = int(s["_w_px"]//2), int(s["_h_px"]//2)
    color = (0, 0, 255) if i < 4 else (0, 200, 50)   # 빨강=장식, 초록=레벨
    cv2.ellipse(vis, (cx, cy), (rw, rh), 0, 0, 360, color, 3)
    label = f"{i}" if i < 4 else f"L{i-3}"
    cv2.putText(vis, label, (cx - 12, cy + 6),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)
    cv2.putText(vis, label, (cx - 12, cy + 6),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 1)

_, buf = cv2.imencode(".png", vis)
b64_vis = base64.b64encode(buf).decode()

_, buf2 = cv2.imencode(".png", img)
b64_orig = base64.b64encode(buf2).decode()

html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>Stone Verify</title>
<style>
  body {{ font-family: sans-serif; background: #1a1a2e; color: #eee; padding: 20px; }}
  h1 {{ color: #f0a500; }}
  .legend {{ margin: 10px 0; }}
  .legend span {{ display: inline-block; width: 20px; height: 20px; border-radius: 50%; vertical-align: middle; margin-right: 6px; }}
  .images {{ display: flex; gap: 20px; flex-wrap: wrap; }}
  .images img {{ max-width: 480px; border: 2px solid #444; border-radius: 8px; }}
  table {{ border-collapse: collapse; margin-top: 20px; }}
  th, td {{ border: 1px solid #444; padding: 6px 12px; text-align: center; }}
  th {{ background: #2a2a4a; }}
  tr.decor {{ background: #3a1a1a; }}
  tr.level {{ background: #1a3a1a; }}
</style>
</head>
<body>
<h1>Stone Detect Verify — {len(kept)}개 감지</h1>
<div class="legend">
  <span style="background:red"></span>장식용(0~3)
  &nbsp;&nbsp;
  <span style="background:#00c832"></span>레벨용(4+)
</div>
<div class="images">
  <div><p>오버레이</p><img src="data:image/png;base64,{b64_vis}" /></div>
  <div><p>원본</p><img src="data:image/png;base64,{b64_orig}" /></div>
</div>
<table>
<tr><th>idx</th><th>역할</th><th>cx(norm)</th><th>cy(norm)</th><th>w(norm)</th><th>h(norm)</th></tr>
"""
for i, s in enumerate(normalized):
    role = f"장식" if i < 4 else f"Level {i-3}"
    cls = "decor" if i < 4 else "level"
    html += f'<tr class="{cls}"><td>{i}</td><td>{role}</td><td>{s["cx"]}</td><td>{s["cy"]}</td><td>{s["w"]}</td><td>{s["h"]}</td></tr>\n'
html += """</table>
<p style="color:#888;margin-top:20px">잘못 감지된 경우 stone-map.json을 직접 수정하세요.</p>
</body></html>"""

with open(HTML_OUT, "w") as f:
    f.write(html)
print(f"✅ HTML 저장: {HTML_OUT}")
