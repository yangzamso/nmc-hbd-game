from PIL import Image
import os
from collections import deque

SRC = r'C:\exam\nmc-game\nmc-sticker.jpg'
OUT = r'C:\exam\nmc-game\public\items'
os.makedirs(OUT, exist_ok=True)

items = {
    "character_base":  (10,  8,   224, 328),
    "raito":           (235, 5,   450, 344),
    "detective":       (463, 14,  663, 305),
    "ajussi":          (675, 14,  925, 321),
    "strawberry":      (9,   334, 260, 665),
    "bungae":          (271, 344, 505, 670),
    "wolf":            (538, 464, 726, 663),
    "item_chupachups": (550, 338, 703, 458),
    "item_wand":       (758, 344, 896, 618),
}

def remove_bg_floodfill(img, threshold=15):
    img = img.convert("RGBA")
    w, h = img.size
    pixels = img.load()
    visited = [[False] * h for _ in range(w)]
    queue = deque()

    def is_bg(r, g, b):
        # 순수 흰색(JPEG 배경)만 제거 - 내부 흰색은 보존
        return r >= 255 - threshold and g >= 255 - threshold and b >= 255 - threshold

    # 네 모서리에서 시작
    for x in range(w):
        for y in [0, h - 1]:
            r, g, b, a = pixels[x, y]
            if is_bg(r, g, b) and not visited[x][y]:
                queue.append((x, y))
                visited[x][y] = True
    for y in range(h):
        for x in [0, w - 1]:
            r, g, b, a = pixels[x, y]
            if is_bg(r, g, b) and not visited[x][y]:
                queue.append((x, y))
                visited[x][y] = True

    while queue:
        x, y = queue.popleft()
        pixels[x, y] = (255, 255, 255, 0)
        for nx, ny in [(x+1,y),(x-1,y),(x,y+1),(x,y-1)]:
            if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                r, g, b, a = pixels[nx, ny]
                if is_bg(r, g, b):
                    visited[nx][ny] = True
                    queue.append((nx, ny))
    return img

def floodfill_from_point(img, seed_x, seed_y, threshold=15):
    """특정 좌표에서 추가 flood-fill (내부 구멍 처리용)"""
    w, h = img.size
    pixels = img.load()
    visited = [[False] * h for _ in range(w)]
    queue = deque()

    def is_white(r, g, b, a):
        return a > 0 and r >= 255 - threshold and g >= 255 - threshold and b >= 255 - threshold

    if 0 <= seed_x < w and 0 <= seed_y < h:
        r, g, b, a = pixels[seed_x, seed_y]
        if is_white(r, g, b, a):
            queue.append((seed_x, seed_y))
            visited[seed_x][seed_y] = True

    while queue:
        x, y = queue.popleft()
        pixels[x, y] = (255, 255, 255, 0)
        for nx, ny in [(x+1,y),(x-1,y),(x,y+1),(x,y-1)]:
            if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                r, g, b, a = pixels[nx, ny]
                if is_white(r, g, b, a):
                    visited[nx][ny] = True
                    queue.append((nx, ny))
    return img

def make_lens_transparent(img, color_fn, alpha, region=None):
    """안경 렌즈 영역 색상 감지 후 반투명 처리"""
    pixels = img.load()
    w, h = img.size
    x0, y0, x1, y1 = region if region else (0, 0, w, h)
    for x in range(max(0, x0), min(w, x1)):
        for y in range(max(0, y0), min(h, y1)):
            r, g, b, a = pixels[x, y]
            if a > 0 and color_fn(r, g, b):
                pixels[x, y] = (r, g, b, alpha)
    return img

# 안경 렌즈 설정
# alpha: 128 = 50% 투명, 179 = 30% 투명
lens_configs = {
    # 야바위 라이토 - 파란 슬림 선글라스 (50% 투명)
    # 크롭 y=115-170 구간에 파란계열 픽셀
    'raito': [
        dict(
            color_fn=lambda r, g, b: b > 100 and b > r + 10 and b >= g - 20,
            alpha=128,
            region=(0, 110, 215, 175),
        )
    ],
    # 아저씨 - 투명 뿔테 안경 (opacity 5%)
    'ajussi': [
        dict(
            color_fn=lambda r, g, b: r > 200 and g > 200 and b > 200,
            alpha=26,
            region=(0, 97, 250, 165),
        )
    ],
    # 하얀늑대 - 빨간 안경 (opacity 10%)
    # 렌즈: 붉은 계열 + 흰색/연분홍 내부 모두 포함
    'wolf': [
        dict(
            color_fn=lambda r, g, b: (
                (r > 130 and r > g + 25 and r > b + 25) or
                (r > 200 and g > 180 and b > 180)
            ),
            alpha=26,
            region=(0, 0, 188, 55),
        )
    ],
}

# 아이템별 내부 구멍 시드 좌표 (크롭 이미지 기준)
interior_holes = {
    "strawberry": [(125, 175)],
}

src_img = Image.open(SRC)
for name, box in items.items():
    cropped = src_img.crop(box)
    result = remove_bg_floodfill(cropped)
    if name in interior_holes:
        for sx, sy in interior_holes[name]:
            result = floodfill_from_point(result, sx, sy)
    if name in lens_configs:
        for cfg in lens_configs[name]:
            result = make_lens_transparent(result, cfg['color_fn'], cfg['alpha'], cfg.get('region'))
    result.save(os.path.join(OUT, f"{name}.png"))
    print(f"Saved: {name}.png")

print("\n완료!")
