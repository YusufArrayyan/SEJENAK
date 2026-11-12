from PIL import Image
import sys, os
src, pub, assets = sys.argv[1], sys.argv[2], sys.argv[3]
im = Image.open(src).convert("RGBA")
px = im.load(); w, h = im.size
# alpha from distance to white (anti-aliased edges preserved)
out = Image.new("RGBA", im.size)
op = out.load()
for y in range(h):
    for x in range(w):
        r, g, b, _ = px[x, y]
        d = 255 - min(r, g, b)
        if d < 14:
            op[x, y] = (0, 0, 0, 0); continue
        a = min(255, int(d * 255 / 200)) if d < 200 else 255
        # un-premultiply against white
        f = a / 255
        rr = int(max(0, min(255, (r - 255 * (1 - f)) / f)))
        gg = int(max(0, min(255, (g - 255 * (1 - f)) / f)))
        bb = int(max(0, min(255, (b - 255 * (1 - f)) / f)))
        op[x, y] = (rr, gg, bb, a)
bbox = out.getbbox(); mark = out.crop(bbox)
pad = int(max(mark.size) * 0.04)
sq = max(mark.size) + pad * 2
canvas = Image.new("RGBA", (sq, sq)); canvas.paste(mark, ((sq - mark.size[0]) // 2, (sq - mark.size[1]) // 2))
canvas.resize((512, 512), Image.LANCZOS).save(os.path.join(assets, "mark.png"))
# dark variant: charcoal -> near white
dk = canvas.copy(); dp = dk.load()
for y in range(dk.size[1]):
    for x in range(dk.size[0]):
        r, g, b, a = dp[x, y]
        if a and max(r, g, b) < 110:
            dp[x, y] = (242, 244, 245, a)
dk.resize((512, 512), Image.LANCZOS).save(os.path.join(assets, "mark-dark.png"))
def icon(size, bg, scale, name):
    c = Image.new("RGBA", (size, size), bg)
    s = int(size * scale); m = canvas.resize((s, s), Image.LANCZOS)
    c.alpha_composite(m, ((size - s) // 2, (size - s) // 2)); c.save(os.path.join(pub, name))
icon(192, (255, 255, 255, 255), 0.78, "icons/icon-192.png")
icon(512, (255, 255, 255, 255), 0.78, "icons/icon-512.png")
icon(512, (255, 255, 255, 255), 0.62, "icons/maskable-512.png")
icon(180, (255, 255, 255, 255), 0.74, "icons/apple-touch-icon.png")
icon(64, (0, 0, 0, 0), 1.0, "favicon.png")
print("ok", bbox)
