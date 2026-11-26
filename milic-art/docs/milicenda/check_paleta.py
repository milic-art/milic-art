import sys, glob
from PIL import Image
from collections import Counter
PAL = """2e1b14 4a2c1f 35563a 587a35 8aa23a bcc046 e2d870 5a3322 8a4e2a b96d32 dc9544 f2bd6e 463f4a 77707c a8a08e d6cbb0 1b5f66 2c9488 58cc9f b2f0cc effbe6 7a2e26 b84a2c e8874a f4b183 5f3a24 8f5a30 bf8444 e0b070 fbf3e4 fffdf7 d99a1c f2c230 f9e07a c94b64 f092a4 8a5fc0 c3a2e6 4f7fd0 a8cdf2 8fd2d2 c8ecdc c2e0d8 ffffff""".split()
P = {tuple(int(h[i:i+2], 16) for i in (0, 2, 4)) for h in PAL}
for f in sorted(glob.glob(sys.argv[1] + "/**/*.png", recursive=True)):
    if f.endswith("_x8.png"): continue
    im = Image.open(f).convert("RGBA")
    c = Counter(im.getdata())
    fuera = sorted({"#%02x%02x%02x" % a[:3] for a in c if a[3] > 0 and a[:3] not in P})
    semi = sum(v for a, v in c.items() if 0 < a[3] < 255)
    transp = any(a[3] == 0 for a in c)
    ok = not fuera and semi == 0 and transp
    print("OK " if ok else "MAL", f, im.size, "fuera:", fuera, "semi:", semi)
