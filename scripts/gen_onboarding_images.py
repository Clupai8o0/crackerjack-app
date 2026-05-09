"""
Generate onboarding hero images matching the Crackerjack design system.
  bg     = #000000
  accent = #39FF7A (neon green)
  ink    = #F5F1EB (warm white)
  ink3   = #7A7A82 (muted)
Output: 768x768 PNGs saved to assets/images/
"""

import math
import random
import struct
import zlib

W = H = 768

# ── design tokens ──────────────────────────────────────────────────────────────
BG     = (0,   0,   0)
ACCENT = (57,  255, 122)
INK    = (245, 241, 235)
INK2   = (201, 193, 213)
INK3   = (122, 122, 130)
DARK1  = (14,  14,  16)
DARK2  = (22,  22,  26)

# ── pixel buffer helpers ───────────────────────────────────────────────────────

def new_buf():
    return bytearray(W * H * 3)

def px(buf, x, y, r, g, b):
    if 0 <= x < W and 0 <= y < H:
        i = (y * W + x) * 3
        buf[i], buf[i+1], buf[i+2] = r, g, b

def blend(buf, x, y, r, g, b, a):
    if 0 <= x < W and 0 <= y < H:
        i = (y * W + x) * 3
        t = a / 255
        buf[i]   = int(buf[i]   * (1-t) + r * t)
        buf[i+1] = int(buf[i+1] * (1-t) + g * t)
        buf[i+2] = int(buf[i+2] * (1-t) + b * t)

def fill(buf, r, g, b):
    for i in range(0, len(buf), 3):
        buf[i], buf[i+1], buf[i+2] = r, g, b

def circle(buf, cx, cy, rad, r, g, b, alpha=255):
    for y in range(max(0, cy-rad), min(H, cy+rad+1)):
        for x in range(max(0, cx-rad), min(W, cx+rad+1)):
            if (x-cx)**2 + (y-cy)**2 <= rad**2:
                blend(buf, x, y, r, g, b, alpha)

def ring(buf, cx, cy, r_inner, r_outer, col, alpha=255):
    for y in range(max(0, cy-r_outer), min(H, cy+r_outer+1)):
        for x in range(max(0, cx-r_outer), min(W, cx+r_outer+1)):
            d2 = (x-cx)**2 + (y-cy)**2
            if r_inner**2 <= d2 <= r_outer**2:
                blend(buf, x, y, *col, alpha)

def line_aa(buf, x0, y0, x1, y1, r, g, b, alpha=200, thick=1):
    dx, dy = x1-x0, y1-y0
    steps = max(abs(dx), abs(dy), 1)
    for i in range(steps+1):
        t = i / steps
        xi, yi = int(x0 + dx*t), int(y0 + dy*t)
        for tx in range(-thick, thick+1):
            for ty in range(-thick, thick+1):
                blend(buf, xi+tx, yi+ty, r, g, b, alpha)

def noise_layer(buf, intensity=18):
    rng = random.Random(42)
    for y in range(H):
        for x in range(W):
            n = rng.randint(-intensity, intensity)
            i = (y * W + x) * 3
            buf[i]   = max(0, min(255, buf[i]   + n))
            buf[i+1] = max(0, min(255, buf[i+1] + n))
            buf[i+2] = max(0, min(255, buf[i+2] + n))

# ── PNG encoder ────────────────────────────────────────────────────────────────

def write_png(path, buf):
    def chunk(tag, data):
        c = zlib.crc32(tag + data) & 0xFFFFFFFF
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', c)

    raw = b''
    for y in range(H):
        raw += b'\x00'
        raw += bytes(buf[y*W*3:(y+1)*W*3])

    ihdr = struct.pack('>IIBBBBB', W, H, 8, 2, 0, 0, 0)
    idat = zlib.compress(raw, 6)

    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n')
        f.write(chunk(b'IHDR', ihdr))
        f.write(chunk(b'IDAT', idat))
        f.write(chunk(b'IEND', b''))

    print(f'wrote {path}')

# ── Image 1: waveform / DJ scene ──────────────────────────────────────────────
# Concept: concentric soundwave rings + vertical bars (EQ visualiser)

def make_hero1(path):
    buf = new_buf()
    fill(buf, *BG)

    cx, cy = W//2, H//2

    # deep glow blob behind centre
    for rad in range(200, 0, -1):
        a = int(40 * (1 - rad/200)**2)
        ring(buf, cx, cy, rad-1, rad, ACCENT, a)

    # EQ bars (centred at bottom-third)
    bar_cy = int(H * 0.62)
    rng = random.Random(7)
    bar_w = 14
    bar_gap = 6
    n_bars = 19
    total = n_bars * bar_w + (n_bars-1) * bar_gap
    x0 = cx - total//2

    for i in range(n_bars):
        bx = x0 + i * (bar_w + bar_gap)
        height = rng.randint(30, 220)
        # gradient fill: accent at top → dark at base
        for dy in range(height):
            t = dy / height
            r = int(ACCENT[0] * (1-t) + DARK2[0] * t)
            g = int(ACCENT[1] * (1-t) + DARK2[1] * t)
            b = int(ACCENT[2] * (1-t) + DARK2[2] * t)
            a = int(220 - 80*t)
            for bxi in range(bar_w):
                blend(buf, bx+bxi, bar_cy - dy, r, g, b, a)

    # concentric rings
    for rad in [90, 140, 195, 255, 320]:
        ring(buf, cx, int(H*0.38), rad, rad+2, ACCENT, 60)

    # small orbs floating
    orbs = [(cx-180, cy-160, 7), (cx+200, cy-110, 5), (cx-90, cy+190, 9),
            (cx+160, cy+200, 6), (cx-220, cy+80, 4)]
    for ox, oy, or_ in orbs:
        circle(buf, ox, oy, or_, *ACCENT, 180)
        circle(buf, ox, oy, or_+4, *ACCENT, 35)

    noise_layer(buf, 12)
    write_png(path, buf)

# ── Image 2: payment / shield ─────────────────────────────────────────────────
# Concept: hexagonal grid + central glowing shield outline

def make_hero2(path):
    buf = new_buf()
    fill(buf, *BG)

    cx, cy = W//2, H//2

    # subtle hex grid
    hex_r = 38
    rng2 = random.Random(13)
    cols = range(-2, 10)
    rows = range(-2, 10)
    for col in cols:
        for row in rows:
            hx = int(col * hex_r * 1.73 + (row % 2) * hex_r * 0.87) - 40
            hy = int(row * hex_r * 1.5) - 40
            # draw hex outline
            for angle in range(6):
                a0 = math.radians(60 * angle + 30)
                a1 = math.radians(60 * (angle+1) + 30)
                x0 = hx + int((hex_r-2) * math.cos(a0))
                y0 = hy + int((hex_r-2) * math.sin(a0))
                x1 = hx + int((hex_r-2) * math.cos(a1))
                y1 = hy + int((hex_r-2) * math.sin(a1))
                line_aa(buf, x0, y0, x1, y1, *INK3, alpha=28)

    # central accent glow
    for rad in range(180, 0, -1):
        a = int(55 * (1 - rad/180)**1.8)
        ring(buf, cx, cy, rad-1, rad, ACCENT, a)

    # shield shape (approximated as rounded polygon)
    shield_pts = []
    shield_w, shield_h = 160, 200
    for t in range(360):
        rad_t = math.radians(t)
        # pill-ish with pointed bottom
        sx = math.cos(rad_t) * shield_w * 0.5
        sy_base = math.sin(rad_t) * shield_h * 0.5
        # taper bottom
        if sy_base > 0:
            sy = sy_base * (1 + 0.35 * (sx/shield_w)**2 * math.sin(rad_t))
        else:
            sy = sy_base
        shield_pts.append((cx + int(sx), cy - 20 + int(sy)))

    for i in range(len(shield_pts)):
        x0, y0 = shield_pts[i]
        x1, y1 = shield_pts[(i+1) % len(shield_pts)]
        line_aa(buf, x0, y0, x1, y1, *ACCENT, alpha=220, thick=2)

    # inner shield glow
    for i in range(len(shield_pts)):
        x0, y0 = shield_pts[i]
        blend(buf, x0, y0, *ACCENT, 60)

    # checkmark inside shield
    ck = [(cx-30, cy-10), (cx-5, cy+25), (cx+45, cy-30)]
    line_aa(buf, ck[0][0], ck[0][1], ck[1][0], ck[1][1], *ACCENT, alpha=255, thick=3)
    line_aa(buf, ck[1][0], ck[1][1], ck[2][0], ck[2][1], *ACCENT, alpha=255, thick=3)

    # sparkle dots
    for sx, sy, sr in [(cx+220, cy-180, 4), (cx-200, cy-120, 3),
                       (cx+150, cy+190, 5), (cx-170, cy+160, 3)]:
        circle(buf, sx, sy, sr, *ACCENT, 200)
        circle(buf, sx, sy, sr+5, *ACCENT, 40)

    noise_layer(buf, 10)
    write_png(path, buf)

# ── Image 3: confetti / celebration ───────────────────────────────────────────
# Concept: starburst rays + confetti particles + central orb

def make_hero3(path):
    buf = new_buf()
    fill(buf, *BG)

    cx, cy = W//2, H//2 - 20

    # warm-tinted glow behind centre
    for rad in range(240, 0, -1):
        t = 1 - rad/240
        r = int(BG[0] + (ACCENT[0]-BG[0]) * t**2 * 0.7)
        g = int(BG[1] + (ACCENT[1]-BG[1]) * t**2 * 0.5)
        b = int(BG[2] + (57        -BG[2]) * t**2 * 0.3)
        a = int(50 * t**1.5)
        ring(buf, cx, cy, rad-1, rad, (r,g,b), a)

    # starburst rays
    n_rays = 24
    for i in range(n_rays):
        angle = math.radians(360 / n_rays * i)
        length = random.Random(i).randint(180, 320)
        x1 = cx + int(math.cos(angle) * length)
        y1 = cy + int(math.sin(angle) * length)
        bright = i % 3 == 0
        col = ACCENT if bright else INK3
        a = 90 if bright else 30
        line_aa(buf, cx, cy, x1, y1, *col, alpha=a, thick=0)

    # confetti particles
    rng3 = random.Random(99)
    palette = [ACCENT, INK, INK2, (255,180,57), (57,180,255), (255,57,150)]
    for _ in range(140):
        px_ = rng3.randint(40, W-40)
        py_ = rng3.randint(40, H-40)
        size = rng3.randint(3, 10)
        col = palette[rng3.randint(0, len(palette)-1)]
        shape = rng3.randint(0, 2)
        if shape == 0:  # circle
            circle(buf, px_, py_, size, *col, rng3.randint(160, 230))
        elif shape == 1:  # horizontal bar
            for bx in range(-size, size+1):
                blend(buf, px_+bx, py_, *col, rng3.randint(160, 210))
                blend(buf, px_+bx, py_+1, *col, 100)
        else:  # dot
            blend(buf, px_, py_, *col, rng3.randint(180, 255))

    # central bright orb
    circle(buf, cx, cy, 18, *ACCENT, 255)
    circle(buf, cx, cy, 32, *ACCENT, 80)
    circle(buf, cx, cy, 55, *ACCENT, 30)

    # ring at mid radius
    ring(buf, cx, cy, 100, 103, ACCENT, 120)
    ring(buf, cx, cy, 165, 167, ACCENT, 60)

    noise_layer(buf, 14)
    write_png(path, buf)

# ── run ────────────────────────────────────────────────────────────────────────
import os, pathlib

out = pathlib.Path(__file__).parent.parent / 'assets' / 'images'
make_hero1(str(out / 'onboarding-hero-1.png'))
make_hero2(str(out / 'onboarding-hero-2.png'))
make_hero3(str(out / 'onboarding-hero-3.png'))
print('done')
