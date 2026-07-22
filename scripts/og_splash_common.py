# 아이콘·OG·스플래시 공용 유틸 — 영수증(지그재그) 도안 + Black Han Sans 로드
import urllib.request
from pathlib import Path

from PIL import ImageFont

BG = "#1E2126"
CHALK = "#F2EFE9"
DIM = "#B8B4AC"
ACCENT = "#E4574B"

FONT_URL = "https://github.com/google/fonts/raw/main/ofl/blackhansans/BlackHanSans-Regular.ttf"
FONT_CACHE = Path(__file__).parent / ".fonts" / "BlackHanSans-Regular.ttf"
FALLBACKS = [
    "/System/Library/Fonts/AppleSDGothicNeo.ttc",
    "/Library/Fonts/AppleGothic.ttf",
]


def load_font(size):
    try:
        if not FONT_CACHE.exists():
            FONT_CACHE.parent.mkdir(parents=True, exist_ok=True)
            urllib.request.urlretrieve(FONT_URL, FONT_CACHE)
        return ImageFont.truetype(str(FONT_CACHE), size)
    except Exception:
        for p in FALLBACKS:
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
        raise RuntimeError("한글 폰트를 찾지 못했습니다")


def draw_receipt(d, cx, cy, size):
    """영수증+분류 점 도안을 (cx, cy) 중심, 한 변 size 크기로 그린다 (favicon.svg 좌표계 100 기준)"""
    u = size / 100

    def pt(x, y):
        return (cx + (x - 50) * u, cy + (y - 50) * u)

    # 몸통(지그재그 하단)
    body = [pt(32, 20), pt(68, 20), pt(68, 72), pt(62, 78), pt(56, 72), pt(50, 78), pt(44, 72), pt(38, 78), pt(32, 72)]
    d.line(body + [body[0]], fill=CHALK, width=max(1, int(5 * u)), joint="curve")
    # 인쇄 줄
    for x2, y in [(60, 34), (60, 44), (52, 54)]:
        d.line([pt(40, y), pt(x2, y)], fill=CHALK, width=max(1, int(4 * u)))
        for ex, ey in [(40, y), (x2, y)]:
            x0, y0 = pt(ex, ey)
            r = 2 * u
            d.ellipse([x0 - r, y0 - r, x0 + r, y0 + r], fill=CHALK)
    # 분류 점
    x0, y0 = pt(62, 58)
    r = 7 * u
    d.ellipse([x0 - r, y0 - r, x0 + r, y0 + r], fill=ACCENT)


def draw_text_center(d, cx, cy, text, font, fill):
    l, t, r, b = d.textbbox((0, 0), text, font=font)
    d.text((cx - (r - l) / 2 - l, cy - (b - t) / 2 - t), text, font=font, fill=fill)
