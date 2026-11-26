import sys, glob
from PIL import Image
from collections import Counter
PAL = """2e1b14 4a2c1f 35563a 587a35 8aa23a bcc046 e2d870 5a3322 8a4e2a b96d32 dc9544 f2bd6e 463f4a 77707c a8a08e d6cbb0 1b5f66 2c9488 58cc9f b2f0cc effbe6 7a2e26 b84a2c e8874a f4b183 5f3a24 8f5a30 bf8444 e0b070 fbf3e4 fffdf7 d99a1c f2c230 f9e07a c94b64 f092a4 8a5fc0 c3a2e6 4f7fd0 a8cdf2 8fd2d2 c8ecdc c2e0d8 ffffff""".split()
P = {tuple(int(h[i:i+2], 16) for i in (0, 2, 4)) for h in PAL}
def _noche():
    tabla = {"35563a":"1b2a3a","587a35":"2a4546","8aa23a":"3f6552","bcc046":"6a8a68","e2d870":"94ad86","5a3322":"1c1424","8a4e2a":"35243a","b96d32":"583a48","dc9544":"7e5456","f2bd6e":"a47868","1b5f66":"10284a","2c9488":"1c4a7a","58cc9f":"3a7fa8","b2f0cc":"7fbbd0","effbe6":"d6f0f0","7a2e26":"2a1930","b84a2c":"53283e","e8874a":"8a4a52","f4b183":"b57a7a","8a5fc0":"4a3a8a","c3a2e6":"7a6aa8","4f7fd0":"2a4a8a","a8cdf2":"6a8ab8","8fd2d2":"1b1840","c8ecdc":"3a2f6e","fbf3e4":"6a5aa0"}
    base = (0x1b, 0x18, 0x40)
    out = set()
    for h in PAL:
        if h in tabla: v = tabla[h]; out.add(tuple(int(v[i:i+2], 16) for i in (0, 2, 4)))
        else:
            c = tuple(int(h[i:i+2], 16) for i in (0, 2, 4)); out.add(tuple(int(round(c[k]*0.45 + base[k]*0.55)) for k in range(3)))
    for h in ("ffd36b", "fff1a8", "fff6d6", "fff3c4"): out.add(tuple(int(h[i:i+2], 16) for i in (0, 2, 4)))
    return out
PN = P | _noche()
for f in sorted(glob.glob(sys.argv[1] + "/**/*.png", recursive=True)):
    if f.endswith("_x8.png"): continue
    im = Image.open(f).convert("RGBA")
    c = Counter(im.getdata())
    PP = PN if ("noche" in f or "luna" in f) else P
    fuera = sorted({"#%02x%02x%02x" % a[:3] for a in c if a[3] > 0 and a[:3] not in PP})
    semi = sum(v for a, v in c.items() if 0 < a[3] < 255)
    transp = any(a[3] == 0 for a in c)
    ok = not fuera and semi == 0 and transp
    print("OK " if ok else "MAL", f, im.size, "fuera:", fuera, "semi:", semi)
