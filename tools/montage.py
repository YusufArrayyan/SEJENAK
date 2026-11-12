import sys
from PIL import Image
out, h = sys.argv[1], int(sys.argv[2]); files = sys.argv[3:]
ims = [Image.open(f).convert("RGB") for f in files]
ims = [i.resize((int(i.width * h / i.height), h)) for i in ims]
W = sum(i.width for i in ims) + 20 * (len(ims) - 1)
c = Image.new("RGB", (W, h), (120, 120, 120)); x = 0
for i in ims: c.paste(i, (x, 0)); x += i.width + 20
c.save(out)
