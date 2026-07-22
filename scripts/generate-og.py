# OG 공유 이미지 생성 (1200×630) — public/og.png. 저장소 루트에서 실행.
from PIL import Image, ImageDraw

from og_splash_common import BG, CHALK, DIM, draw_receipt, load_font

W, H = 1200, 630
SS = 2

img = Image.new("RGB", (W * SS, H * SS), BG)
d = ImageDraw.Draw(img)

draw_receipt(d, 950 * SS, 300 * SS, 380 * SS)
d.text((90 * SS, 160 * SS), "영수증 정리함", font=load_font(100 * SS), fill=CHALK)
sub = load_font(42 * SS)
d.text((94 * SS, 310 * SS), "사진을 끌어다 놓으면 분류·집계", font=sub, fill=DIM)
d.text((94 * SS, 372 * SS), "온디바이스 AI 자동 인식 (지원 기기)", font=sub, fill=DIM)
d.text((94 * SS, 434 * SS), "사진도 내역도 내 기기에만 · CSV 내보내기", font=sub, fill=DIM)

img.resize((W, H), Image.LANCZOS).save("public/og.png")
print("public/og.png")
