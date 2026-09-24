#!/usr/bin/env python3
"""Create numbered review sheets from real full-page and opening screenshots."""
import argparse
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/playwright/journal'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--end', type=int, default=500)
parser.add_argument('--start', type=int, default=0)
args = parser.parse_args()
rows = json.loads((OUT / 'coverage-0-500.json').read_text())
by_index = {r['index']: r for r in rows}
repair = OUT / 'coverage-repair-0-500.json'
if repair.exists():
    by_index.update({r['index']: r for r in json.loads(repair.read_text())})
font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 12)
small = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 10)
for start in range(args.start, min(args.end, 500), 25):
    end = min(start + 25, 500)
    if not all(i in by_index for i in range(start, end)):
        break
    sheet = Image.new('RGB', (1900, 1100), '#dce3e9')
    draw = ImageDraw.Draw(sheet)
    for slot, index in enumerate(range(start, end)):
        row = by_index[index]
        x, y = (slot % 5) * 380, (slot // 5) * 220
        label = f'{index:03}  ' + row['path'].strip('/').split('/')[-1]
        draw.text((x + 5, y + 4), label[:54], font=font, fill='#152332')
        for device, left, width in [('desktop', 5, 237), ('mobile', 246, 78)]:
            opening = OUT / f'{index:03}-{device}-opening.png'
            full = OUT / f'{index:03}-{device}.png'
            if not opening.exists() or not full.exists():
                draw.text((x + left, y + 35), 'MISSING', font=font, fill='red'); continue
            with Image.open(opening) as image:
                thumb = ImageOps.contain(image.convert('RGB'), (width, 169))
                sheet.paste(thumb, (x + left, y + 27))
            with Image.open(full) as image:
                thumb = ImageOps.contain(image.convert('RGB'), (23, 169))
                sheet.paste(thumb, (x + (328 if device == 'desktop' else 354), y + 27))
        draw.text((x + 5, y + 201), 'Desktop / Mobile openings + full-page strips', font=small, fill='#405465')
    sheet.save(OUT / f'review-sheet-{start//25+1:02}.jpg', quality=90)
    print(f'review-sheet-{start//25+1:02}.jpg: routes {start:03}–{end-1:03}')
