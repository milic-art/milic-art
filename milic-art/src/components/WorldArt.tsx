/**
 * All of the artwork on this site is drawn here, in code, as simple sticker
 * illustrations. Swap any piece for your own art by setting the matching image
 * path in src/content/site.ts. Nothing in this file needs to change.
 */
import type { PlaceId } from "../content";

export type ArtVariant =
  | "gallery"
  | "commissions"
  | "about"
  | "contact"
  | "windowsill"
  | "dragonTea"
  | "lantern"
  | "owlShop"
  | "campfire"
  | "frog";

const CHALK = "#fffdf7";
const INK = "#4b3a2a";
const MOSS = "#6e8b5a";
const SAGE = "#a9be8f";
const ORANGE = "#e8874a";
const ORANGE_SOFT = "#f4b183";
const PAPER = "#fbf3e4";
const BEIGE = "#efe0c8";

/* ------------------------------------------------------------------ world */

type Dot = { x: number; y: number };

function Pine({ x, y, s = 1, tone = MOSS }: { x: number; y: number; s?: number; tone?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="tree-sway" style={{ animationDelay: `${(x % 7) * 0.4}s` }}>
        <rect x="-5" y="-6" width="10" height="20" rx="4" fill="#8a6a4b" stroke={CHALK} strokeWidth="6" />
        <path d="M0 -46 L26 -8 L-26 -8 Z" fill={tone} stroke={CHALK} strokeWidth="8" strokeLinejoin="round" />
        <path d="M0 -34 L20 -2 L-20 -2 Z" fill={tone} stroke={CHALK} strokeWidth="0" opacity="0" />
      </g>
    </g>
  );
}

function Bush({ x, y, s = 1, tone = SAGE }: { x: number; y: number; s?: number; tone?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M-26 8 C-34 -12 -14 -22 -2 -14 C6 -28 30 -22 30 -4 C42 -2 40 12 26 12 L-22 12 C-32 12 -34 12 -26 8 Z"
        fill={tone}
        stroke={CHALK}
        strokeWidth="7"
        strokeLinejoin="round"
      />
    </g>
  );
}

function Rock({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M-18 8 C-24 -6 -8 -16 4 -12 C18 -18 26 -4 20 6 C14 12 -12 12 -18 8 Z"
        fill={BEIGE}
        stroke={CHALK}
        strokeWidth="7"
        strokeLinejoin="round"
      />
    </g>
  );
}

function Mushroom({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-4" y="-2" width="8" height="14" rx="3" fill={PAPER} stroke={CHALK} strokeWidth="5" />
      <path d="M-14 -2 A14 12 0 0 1 14 -2 Z" fill={ORANGE} stroke={CHALK} strokeWidth="6" strokeLinejoin="round" />
      <circle cx="-5" cy="-6" r="2.4" fill={CHALK} />
      <circle cx="4" cy="-8" r="2" fill={CHALK} />
    </g>
  );
}

function Flower({ x, y, tone = ORANGE_SOFT }: { x: number; y: number; tone?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="5" fill={tone} />
      <path d="M0 -9 L0 4" stroke={MOSS} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Cloud({ x, y, s = 1, d = 40 }: { x: number; y: number; s?: number; d?: number }) {
  return (
    <g className="cloud-drift" style={{ ["--d" as string]: `${d}s` }}>
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity="0.9">
      <path
        d="M-40 10 C-52 -8 -30 -22 -14 -14 C-8 -30 22 -30 28 -12 C46 -14 48 10 32 10 Z"
        fill={CHALK}
        stroke={BEIGE}
        strokeWidth="5"
        strokeLinejoin="round"
      />
    </g>
    </g>
  );
}

function Sunflower({ x, y, s = 1, delay = 0 }: { x: number; y: number; s?: number; delay?: number }) {
  const petals = Array.from({ length: 10 }, (_, i) => i * 36);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="sunflower-sway" style={{ animationDelay: `${delay}s` }}>
        <path d="M0 0 L0 -34" stroke="#4f6b3d" strokeWidth="4" strokeLinecap="round" />
        <path d="M0 -14 Q-12 -20 -14 -12 Q-6 -8 0 -14 Z" fill="#6e8b5a" />
        <g transform="translate(0 -40)">
          {petals.map((a) => (
            <ellipse key={a} cx="0" cy="-10" rx="4.2" ry="7.5" fill="#f2c230" stroke="#c99a12" strokeWidth="1" transform={`rotate(${a})`} />
          ))}
          <circle r="7" fill="#7a4a2a" stroke="#4b3a2a" strokeWidth="1.5" />
        </g>
      </g>
    </g>
  );
}

function Sparkle({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path
      d={`M${x} ${y - 7 * s} L${x + 2.2 * s} ${y - 2.2 * s} L${x + 7 * s} ${y} L${x + 2.2 * s} ${y + 2.2 * s} L${x} ${y + 7 * s} L${x - 2.2 * s} ${y + 2.2 * s} L${x - 7 * s} ${y} L${x - 2.2 * s} ${y - 2.2 * s} Z`}
      fill="#f2c230"
      opacity="0.75"
      className="twinkle"
    />
  );
}

function Compass({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity="0.85">
      <circle r="38" fill={PAPER} stroke={BEIGE} strokeWidth="6" />
      <circle r="26" fill="none" stroke={BEIGE} strokeWidth="3" strokeDasharray="3 7" />
      <path d="M0 -28 L9 4 L0 -2 L-9 4 Z" fill={ORANGE} stroke={CHALK} strokeWidth="4" />
      <path d="M0 28 L7 6 L0 10 L-7 6 Z" fill={SAGE} stroke={CHALK} strokeWidth="4" />
      <text
        x="0"
        y="-44"
        textAnchor="middle"
        fill={INK}
        fontSize="15"
        fontFamily="Baloo 2, sans-serif"
        fontWeight="700"
      >
        N
      </text>
    </g>
  );
}

/** Dotted trails joining the four places. */
function Trails({ places }: { places: { id: PlaceId; x: number; y: number }[] }) {
  const p = (id: PlaceId): Dot => {
    const place = places.find((item) => item.id === id) ?? { x: 50, y: 50 };
    return { x: place.x * 16, y: place.y * 10 };
  };
  const pairs: [PlaceId, PlaceId][] = [
    ["gallery", "commissions"],
    ["gallery", "about"],
    ["commissions", "contact"],
    ["about", "contact"],
  ];

  return (
    <g fill="none" strokeLinecap="round">
      {pairs.map(([from, to]) => {
        const a = p(from);
        const b = p(to);
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2 + (Math.abs(b.x - a.x) > 500 ? 70 : -50);
        const d = `M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`;
        return (
          <g key={`${from}-${to}`}>
            <path d={d} stroke={CHALK} strokeWidth="17" strokeDasharray="2 18" opacity="0.85" className="trail-draw" />
            <path d={d} stroke={ORANGE} strokeWidth="7" strokeDasharray="2 18" opacity="0.95" className="trail-draw" />
          </g>
        );
      })}
    </g>
  );
}

/** The illustrated landscape behind the four landmarks. */
export function WorldBackdrop({ places }: { places: { id: PlaceId; x: number; y: number }[] }) {
  return (
    <svg
      viewBox="0 0 1600 1000"
      width="100%"
      height="100%"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block" }}
    >
      <defs>
        <filter id="soft-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.06" />
          </feComponentTransfer>
        </filter>
      </defs>

      <rect width="1600" height="1000" fill="#e6edc6" />

      {/* broad land masses */}
      <path
        d="M-40 250 C120 120 300 140 380 60 C470 -30 640 10 720 70 C820 40 880 120 830 210 C900 260 860 340 760 350 C700 440 520 430 470 360 C380 400 240 380 190 320 C80 340 -20 330 -40 250 Z"
        fill={SAGE}
        opacity="0.45"
      />
      <path
        d="M980 1000 C960 900 1040 840 1160 850 C1220 760 1380 760 1440 830 C1560 800 1640 880 1640 1000 Z"
        fill={MOSS}
        opacity="0.3"
      />
      <path
        d="M-20 720 C90 640 220 660 280 700 C340 640 460 640 500 700 C540 780 440 860 340 850 C260 920 120 900 60 840 C-10 840 -60 790 -20 720 Z"
        fill={BEIGE}
        opacity="0.75"
      />

      {/* river */}
      <path
        d="M760 -30 C800 120 700 210 740 320 C780 430 900 470 930 560 C960 660 880 760 900 860 C915 940 960 990 990 1030"
        fill="none"
        stroke={CHALK}
        strokeWidth="64"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M760 -30 C800 120 700 210 740 320 C780 430 900 470 930 560 C960 660 880 760 900 860 C915 940 960 990 990 1030"
        fill="none"
        stroke="#c6d8c9"
        strokeWidth="48"
        strokeLinecap="round"
      />
      <path
        className="river-flow"
        d="M760 -30 C800 120 700 210 740 320 C780 430 900 470 930 560 C960 660 880 760 900 860 C915 940 960 990 990 1030"
        fill="none"
        stroke={CHALK}
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.8"
      />
      <g stroke={CHALK} strokeWidth="5" strokeLinecap="round" opacity="0.9" fill="none">
        <path className="water-glint" d="M700 150 C715 160 730 160 745 152" />
        <path className="water-glint" d="M840 400 C856 412 872 412 888 404" />
        <path className="water-glint" d="M905 700 C918 712 934 712 948 704" />
      </g>

      <Cloud x={230} y={120} s={1.15} d={46} />
      <Cloud x={880} y={70} s={0.85} d={38} />
      <Cloud x={1300} y={150} s={1} d={52} />
      <Cloud x={520} y={520} s={0.7} d={34} />

      <Trails places={places} />

      {/* pine forest clusters, kept clear of the landmarks */}
      <Pine x={140} y={220} s={1.15} />
      <Pine x={215} y={170} s={0.85} tone={SAGE} />
      <Pine x={90} y={330} s={0.95} />
      <Pine x={400} y={150} s={1} />
      <Pine x={470} y={205} s={0.8} tone={SAGE} />
      <Pine x={560} y={130} s={1.1} />
      <Pine x={690} y={200} s={0.85} />
      <Pine x={980} y={150} s={1} />
      <Pine x={1050} y={205} s={0.85} tone={SAGE} />
      <Pine x={1330} y={180} s={1.15} />
      <Pine x={1420} y={245} s={0.9} />
      <Pine x={1470} y={420} s={1.05} />
      <Pine x={1380} y={480} s={0.8} tone={SAGE} />
      <Pine x={120} y={540} s={1} />
      <Pine x={200} y={620} s={0.85} />
      <Pine x={130} y={780} s={1.1} />
      <Pine x={230} y={860} s={0.9} tone={SAGE} />
      <Pine x={330} y={930} s={0.85} />
      <Pine x={640} y={900} s={1} />
      <Pine x={720} y={950} s={0.8} tone={SAGE} />
      <Pine x={1080} y={880} s={1.05} />
      <Pine x={1150} y={940} s={0.85} />
      <Pine x={1500} y={880} s={1} />
      <Pine x={1360} y={940} s={0.8} tone={SAGE} />
      <Pine x={1480} y={690} s={0.95} />

      <Bush x={310} y={300} s={0.8} />
      <Bush x={880} y={330} s={0.95} />
      <Bush x={1120} y={420} s={0.7} />
      <Bush x={600} y={690} s={0.85} />
      <Bush x={1000} y={820} s={0.9} />
      <Bush x={260} y={960} s={0.8} />
      <Bush x={1220} y={540} s={0.75} />

      <Rock x={690} y={420} s={0.9} />
      <Rock x={540} y={560} s={0.7} />
      <Rock x={1180} y={860} s={0.85} />
      <Rock x={300} y={430} s={0.65} />

      <Mushroom x={620} y={840} s={0.9} />
      <Mushroom x={660} y={870} s={0.7} />
      <Mushroom x={1260} y={300} s={0.85} />
      <Mushroom x={1296} y={326} s={0.6} />
      <Mushroom x={420} y={520} s={0.75} />

      <Flower x={360} y={250} />
      <Flower x={940} y={260} tone={CHALK} />
      <Flower x={780} y={700} tone={ORANGE} />
      <Flower x={560} y={340} tone={ORANGE_SOFT} />
      <Flower x={1050} y={640} tone={CHALK} />

      {/* sunflowers around the About cottage and scattered on the map */}
      <Sunflower x={395} y={800} s={1.2} delay={0} />
      <Sunflower x={440} y={840} s={1} delay={0.6} />
      <Sunflower x={580} y={810} s={1.15} delay={1.2} />
      <Sunflower x={625} y={770} s={0.9} delay={0.3} />
      <Sunflower x={370} y={740} s={0.95} delay={1.8} />
      <Sunflower x={1150} y={770} s={1} delay={0.9} />
      <Sunflower x={1290} y={790} s={0.9} delay={1.5} />
      <Sunflower x={660} y={480} s={0.85} delay={2.1} />
      <Sunflower x={1010} y={330} s={0.8} delay={0.4} />

      <Sparkle x={520} y={330} s={1.1} />
      <Sparkle x={1010} y={480} s={0.9} />
      <Sparkle x={1420} y={600} s={1} />
      <Sparkle x={360} y={620} s={0.8} />

      <g stroke={INK} strokeWidth="3" fill="none" opacity="0.55" strokeLinecap="round">
        <path d="M840 210 q8 -8 16 0 q8 -8 16 0" />
        <path d="M960 250 q6 -6 12 0 q6 -6 12 0" />
      </g>

      <Compass x={130} y={890} />

      <rect
        x="16"
        y="16"
        width="1568"
        height="968"
        rx="28"
        fill="none"
        stroke={BEIGE}
        strokeWidth="4"
        strokeDasharray="1 16"
        strokeLinecap="round"
      />

      <rect width="1600" height="1000" filter="url(#soft-grain)" opacity="0.5" pointerEvents="none" />
    </svg>
  );
}

/* -------------------------------------------------------------- landmarks */

const landmarkFrame = { width: "100%", height: "100%", display: "block" } as const;

/** Gallery: a little gallery house with an easel outside. */
function GalleryLandmark() {
  return (
    <svg viewBox="0 0 200 200" style={landmarkFrame} aria-hidden="true" focusable="false">
      <ellipse cx="100" cy="184" rx="62" ry="9" fill={INK} opacity="0.12" />
      {/* body */}
      <path
        d="M52 176 L52 92 Q52 82 62 82 L138 82 Q148 82 148 92 L148 176 Z"
        fill={PAPER}
        stroke={CHALK}
        strokeWidth="10"
        strokeLinejoin="round"
      />
      <path d="M44 92 Q100 50 156 92 Z" fill={MOSS} stroke={CHALK} strokeWidth="10" strokeLinejoin="round" />
      {/* eaves */}
      <path d="M44 92 Q100 50 156 92" fill="none" stroke={INK} strokeWidth="2.5" opacity="0.35" />
      {/* framed painting on the wall */}
      <rect x="78" y="104" width="44" height="34" rx="5" fill={PAPER} stroke={CHALK} strokeWidth="7" />
      <rect x="84" y="110" width="32" height="22" rx="3" fill={SAGE} />
      <circle cx="106" cy="118" r="5" fill={ORANGE} />
      <path d="M84 130 L96 118 L104 126 L114 116" fill="none" stroke={MOSS} strokeWidth="3" strokeLinecap="round" />
      {/* door */}
      <path d="M84 176 L84 148 Q100 138 116 148 L116 176 Z" fill={ORANGE} stroke={CHALK} strokeWidth="7" />
      <circle cx="109" cy="162" r="2.6" fill={CHALK} />
      {/* easel */}
      <g stroke={CHALK} strokeWidth="13" strokeLinecap="round">
        <path d="M34 178 L48 126" />
        <path d="M56 178 L44 126" />
      </g>
      <g stroke="#8a6a4b" strokeWidth="6" strokeLinecap="round">
        <path d="M34 178 L48 126" />
        <path d="M52 178 L42 132" />
      </g>
      <rect x="30" y="120" width="33" height="26" rx="4" fill={CHALK} stroke={CHALK} strokeWidth="6" transform="rotate(-6 46 133)" />
      <path d="M36 138 L44 126 L52 134 L58 128" stroke={ORANGE} strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* window */}
      <rect x="140" y="104" width="22" height="24" rx="9" fill={ORANGE_SOFT} stroke={CHALK} strokeWidth="6" />
      <path d="M120 176 L152 176" stroke={MOSS} strokeWidth="8" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/** Commissions: the quest board. */
function CommissionsLandmark() {
  return (
    <svg viewBox="0 0 200 200" style={landmarkFrame} aria-hidden="true" focusable="false">
      <ellipse cx="100" cy="184" rx="66" ry="9" fill={INK} opacity="0.12" />
      <path d="M66 180 L66 84" stroke={CHALK} strokeWidth="16" strokeLinecap="round" />
      <path d="M134 180 L134 84" stroke={CHALK} strokeWidth="16" strokeLinecap="round" />
      <path d="M66 180 L66 84" stroke="#8a6a4b" strokeWidth="8" strokeLinecap="round" />
      <path d="M134 180 L134 84" stroke="#8a6a4b" strokeWidth="8" strokeLinecap="round" />
      {/* board */}
      <rect x="42" y="58" width="116" height="82" rx="10" fill="#a9855e" stroke={CHALK} strokeWidth="11" />
      <rect x="52" y="68" width="96" height="62" rx="6" fill="none" stroke={INK} strokeWidth="2" opacity="0.35" />
      {/* notes */}
      <rect x="60" y="76" width="34" height="38" rx="3" fill={PAPER} transform="rotate(-4 77 95)" />
      <path d="M65 86 L90 84 M65 94 L88 92 M65 102 L82 100" stroke={INK} strokeWidth="2.2" opacity="0.45" strokeLinecap="round" />
      <rect x="102" y="72" width="34" height="30" rx="3" fill={ORANGE_SOFT} transform="rotate(3 119 87)" />
      <path d="M108 82 L130 84 M108 90 L124 92" stroke={INK} strokeWidth="2.2" opacity="0.4" strokeLinecap="round" />
      <circle cx="77" cy="80" r="3.4" fill={ORANGE} />
      <circle cx="119" cy="76" r="3.4" fill={ORANGE} />
      {/* flags */}
      <path d="M42 58 L42 30" stroke={CHALK} strokeWidth="9" strokeLinecap="round" />
      <path d="M42 58 L42 30" stroke="#8a6a4b" strokeWidth="4" strokeLinecap="round" />
      <path d="M44 32 L76 40 L44 50 Z" fill={ORANGE} stroke={CHALK} strokeWidth="6" strokeLinejoin="round" />
      {/* ink pot + quill */}
      <rect x="140" y="150" width="20" height="20" rx="6" fill={INK} opacity="0.75" stroke={CHALK} strokeWidth="6" />
      <path d="M148 152 C150 134 162 126 172 122 C168 134 162 146 152 152 Z" fill={PAPER} stroke={CHALK} strokeWidth="5" strokeLinejoin="round" />
      <path d="M150 108 L196 96" stroke={INK} strokeWidth="3" opacity="0.15" />
      {/* grass */}
      <path d="M56 182 q6 -14 14 -2 M126 182 q5 -12 12 -2" stroke={MOSS} strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** About: the round artist cottage. */
function AboutLandmark() {
  return (
    <svg viewBox="0 0 200 200" style={landmarkFrame} aria-hidden="true" focusable="false">
      <ellipse cx="100" cy="184" rx="64" ry="9" fill={INK} opacity="0.12" />
      {/* chimney */}
      <path d="M132 74 L146 74 L146 44 L134 40 Z" fill={BEIGE} stroke={CHALK} strokeWidth="8" strokeLinejoin="round" />
      <path d="M140 34 c10 -8 4 -14 -2 -18 M150 40 c8 -6 4 -14 0 -18" stroke={CHALK} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.9" />
      {/* body */}
      <path d="M50 176 L44 120 Q40 76 100 76 Q160 76 156 120 L150 176 Z" fill={PAPER} stroke={CHALK} strokeWidth="11" strokeLinejoin="round" />
      {/* roof */}
      <path d="M36 84 Q100 34 164 84 Q100 62 36 84 Z" fill={MOSS} stroke={CHALK} strokeWidth="9" strokeLinejoin="round" />
      <path d="M52 86 Q100 62 148 84" stroke={INK} strokeWidth="2" opacity="0.25" fill="none" />
      {/* arched window with a desk inside */}
      <path d="M74 156 L74 124 Q100 104 126 124 L126 156 Z" fill={ORANGE_SOFT} stroke={CHALK} strokeWidth="7" />
      <path d="M100 108 L100 156" stroke={CHALK} strokeWidth="5" />
      <rect x="76" y="140" width="48" height="12" rx="4" fill="#a9855e" opacity="0.85" />
      <circle cx="94" cy="136" r="4" fill={MOSS} />
      <rect x="106" y="128" width="12" height="12" rx="3" fill={PAPER} />
      {/* doorstep */}
      <rect x="86" y="176" width="46" height="10" rx="5" fill={BEIGE} stroke={CHALK} strokeWidth="5" />
      {/* mug + books */}
      <g transform="translate(40 172)">
        <rect x="0" y="-12" width="22" height="14" rx="4" fill={ORANGE} stroke={CHALK} strokeWidth="4" />
        <path d="M22 -10 q8 0 8 5 q-1 5 -8 4" fill="none" stroke={CHALK} strokeWidth="4" />
      </g>
      <g transform="translate(160 168)">
        <rect x="0" y="-8" width="20" height="8" rx="2" fill={MOSS} />
        <rect x="2" y="-16" width="16" height="8" rx="2" fill={ORANGE} />
      </g>
      <Bush x={58} y={182} s={0.6} />
      <Mushroom x={150} y={186} s={0.7} />
    </svg>
  );
}

/** Contact: the mailbox. */
function ContactLandmark() {
  return (
    <svg viewBox="0 0 200 200" style={landmarkFrame} aria-hidden="true" focusable="false">
      <ellipse cx="100" cy="184" rx="56" ry="8" fill={INK} opacity="0.12" />
      {/* post */}
      <path d="M96 186 L96 128" stroke={CHALK} strokeWidth="15" strokeLinecap="round" />
      <path d="M96 186 L96 128" stroke="#8a6a4b" strokeWidth="7" strokeLinecap="round" />
      {/* box */}
      <path d="M52 132 L52 106 Q52 76 96 76 Q140 76 140 106 L140 132 Z" fill={ORANGE} stroke={CHALK} strokeWidth="11" strokeLinejoin="round" />
      <path d="M52 132 L140 132" stroke={CHALK} strokeWidth="11" />
      <rect x="66" y="98" width="44" height="6" rx="3" fill={PAPER} opacity="0.9" />
      {/* flag */}
      <path d="M144 92 L164 92 L164 116 L144 116" fill={MOSS} stroke={CHALK} strokeWidth="6" strokeLinejoin="round" />
      {/* letters flying out */}
      <g transform="translate(150 62) rotate(-14)">
        <rect x="-16" y="-11" width="32" height="22" rx="3" fill={PAPER} stroke={CHALK} strokeWidth="5" />
        <path d="M-14 -8 L0 4 L14 -8" stroke={INK} strokeWidth="2.4" fill="none" opacity="0.5" />
        <circle cx="0" cy="8" r="3" fill={ORANGE} />
      </g>
      <g transform="translate(122 40) rotate(10)">
        <rect x="-13" y="-9" width="26" height="18" rx="3" fill={ORANGE_SOFT} stroke={CHALK} strokeWidth="5" />
        <path d="M-11 -6 L0 3 L11 -6" stroke={INK} strokeWidth="2.2" fill="none" opacity="0.45" />
      </g>
      <path d="M34 96 L56 88 L54 96 Z" fill={PAPER} stroke={CHALK} strokeWidth="4" strokeLinejoin="round" />
      {/* bush */}
      <Bush x={44} y={176} s={0.7} />
      <path d="M132 186 q6 -14 14 -3" stroke={MOSS} strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Fallback art for a place that has no illustration of its own. */
function GenericLandmark() {
  return (
    <svg viewBox="0 0 200 200" style={landmarkFrame} aria-hidden="true" focusable="false">
      <ellipse cx="100" cy="180" rx="52" ry="8" fill={INK} opacity="0.12" />
      <path d="M100 172 L100 84" stroke={CHALK} strokeWidth="14" strokeLinecap="round" />
      <path d="M100 172 L100 84" stroke="#8a6a4b" strokeWidth="7" strokeLinecap="round" />
      <path d="M56 84 L92 56 L144 68 L108 96 Z" fill={ORANGE} stroke={CHALK} strokeWidth="9" strokeLinejoin="round" />
      <path d="M64 76 L90 58" stroke={CHALK} strokeWidth="4" opacity="0.7" />
    </svg>
  );
}

export function LandmarkArt({ id }: { id: PlaceId }) {
  switch (id) {
    case "gallery":
      return <GalleryLandmark />;
    case "commissions":
      return <CommissionsLandmark />;
    case "about":
      return <AboutLandmark />;
    case "contact":
      return <ContactLandmark />;
    default:
      return <GenericLandmark />;
  }
}

/* ----------------------------------------------------------------- mascot */

/** Pip, the chibi map guide. */
export function MascotArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 180 220"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* legs */}
      <path d="M72 196 L72 176 L92 176 L92 196" fill="#f6d7bb" stroke={CHALK} strokeWidth="8" strokeLinejoin="round" />
      <path d="M96 196 L96 176 L116 176 L116 196" fill="#f6d7bb" stroke={CHALK} strokeWidth="8" strokeLinejoin="round" />
      <path d="M68 196 L96 196 L96 204 L68 204 Z" fill={INK} />
      <path d="M96 196 L124 196 L124 204 L96 204 Z" fill={INK} />
      {/* dress */}
      <path
        d="M62 178 Q58 132 90 128 Q122 132 118 178 Q90 188 62 178 Z"
        fill={MOSS}
        stroke={CHALK}
        strokeWidth="9"
        strokeLinejoin="round"
      />
      <path d="M74 148 L106 148" stroke={CHALK} strokeWidth="4" opacity="0.4" />
      {/* apron */}
      <path d="M80 136 L100 136 L104 174 Q90 180 76 174 Z" fill={PAPER} stroke={CHALK} strokeWidth="5" />
      <circle cx="86" cy="156" r="3.6" fill={ORANGE} opacity="0.85" />
      <circle cx="95" cy="164" r="2.8" fill={MOSS} opacity="0.8" />
      {/* waving arm */}
      <path d="M120 140 Q142 126 146 104" stroke={CHALK} strokeWidth="20" strokeLinecap="round" fill="none" />
      <path d="M120 140 Q142 126 146 104" stroke="#f6d7bb" strokeWidth="13" strokeLinecap="round" fill="none" />
      <circle cx="147" cy="99" r="11" fill="#f6d7bb" stroke={CHALK} strokeWidth="6" />
      {/* brush arm */}
      <path d="M60 142 Q40 150 36 166" stroke={CHALK} strokeWidth="20" strokeLinecap="round" fill="none" />
      <path d="M60 142 Q40 150 36 166" stroke="#f6d7bb" strokeWidth="13" strokeLinecap="round" fill="none" />
      <circle cx="34" cy="170" r="10" fill="#f6d7bb" stroke={CHALK} strokeWidth="6" />
      {/* brush */}
      <g transform="rotate(16 30 178)">
        <rect x="24" y="150" width="7" height="44" rx="3.5" fill={ORANGE} stroke={CHALK} strokeWidth="4" />
        <path d="M24 150 Q27 136 31 150 Z" fill={PAPER} stroke={CHALK} strokeWidth="4" strokeLinejoin="round" />
      </g>
      {/* head */}
      <ellipse cx="90" cy="90" rx="52" ry="48" fill="#f9ddc4" stroke={CHALK} strokeWidth="10" />
      {/* hair */}
      <path
        d="M42 82 Q40 40 90 38 Q140 40 138 82 Q128 62 90 66 Q56 62 42 82 Z"
        fill="#7d5a3c"
        stroke={CHALK}
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <path d="M60 62 Q90 52 120 62" stroke={CHALK} strokeWidth="4" opacity="0.35" fill="none" />
      {/* beret */}
      <path d="M44 52 Q52 14 94 14 Q138 14 142 50 Q94 36 44 52 Z" fill={ORANGE} stroke={CHALK} strokeWidth="9" strokeLinejoin="round" />
      <path d="M126 20 Q134 12 142 16" stroke={CHALK} strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* face */}
      <ellipse cx="70" cy="96" rx="6.5" ry="8" fill={INK} />
      <ellipse cx="110" cy="96" rx="6.5" ry="8" fill={INK} />
      <circle cx="72" cy="93" r="2.2" fill={CHALK} />
      <circle cx="112" cy="93" r="2.2" fill={CHALK} />
      <ellipse cx="56" cy="108" rx="9" ry="6" fill={ORANGE_SOFT} opacity="0.75" />
      <ellipse cx="124" cy="108" rx="9" ry="6" fill={ORANGE_SOFT} opacity="0.75" />
      <path d="M84 112 Q90 120 96 112" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M88 130 Q90 134 94 131" stroke={INK} strokeWidth="3.4" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

/* ------------------------------------------------- gallery placeholders */

const plateProps = {
  viewBox: "0 0 600 600",
  width: "100%",
  height: "100%",
  style: { display: "block" } as const,
  "aria-hidden": true as const,
  focusable: "false" as const,
};

function ArtWindowsill() {
  return (
    <svg {...plateProps}>
      <rect width="600" height="600" fill="#f6e8ce" />
      <rect x="60" y="60" width="480" height="400" rx="26" fill="#c6d8c9" stroke={CHALK} strokeWidth="16" />
      <rect x="60" y="60" width="480" height="400" rx="26" fill="none" stroke={INK} strokeWidth="3" opacity="0.25" />
      <g stroke={CHALK} strokeWidth="7" strokeLinecap="round" opacity="0.9">
        <path d="M150 110 L132 156 M240 96 L222 142 M330 116 L312 162 M430 100 L412 146 M490 140 L472 186 M196 200 L178 246 M370 210 L352 256" />
      </g>
      <path d="M60 300 L540 300" stroke={CHALK} strokeWidth="10" />
      <path d="M300 60 L300 460" stroke={CHALK} strokeWidth="10" />
      <path d="M300 300 C300 300 260 340 210 330 C160 320 150 380 210 392 L392 392 C452 384 444 320 392 330 C344 338 300 300 300 300 Z" fill={ORANGE} stroke={CHALK} strokeWidth="10" />
      <circle cx="358" cy="330" r="13" fill={PAPER} />
      <path d="M120 470 L480 470 L500 540 L100 540 Z" fill="#a9855e" stroke={CHALK} strokeWidth="12" strokeLinejoin="round" />
      {/* plants */}
      <g>
        <path d="M150 470 L150 420" stroke={CHALK} strokeWidth="12" strokeLinecap="round" />
        <path d="M150 470 Q118 440 132 404 Q156 430 150 470" fill={MOSS} stroke={CHALK} strokeWidth="8" />
        <path d="M150 470 Q182 444 172 410 Q146 434 150 470" fill={SAGE} stroke={CHALK} strokeWidth="8" />
        <rect x="128" y="462" width="44" height="40" rx="8" fill={ORANGE} stroke={CHALK} strokeWidth="8" />
      </g>
      {/* mug */}
      <g transform="translate(400 430)">
        <rect x="0" y="0" width="52" height="40" rx="10" fill={PAPER} stroke={CHALK} strokeWidth="8" />
        <path d="M52 10 q16 2 14 12 q-2 10 -16 8" fill="none" stroke={CHALK} strokeWidth="8" />
        <path d="M12 -10 q8 -12 2 -22 M30 -12 q8 -12 2 -22" stroke={CHALK} strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
      <circle cx="120" cy="520" r="10" fill={ORANGE} opacity="0.6" />
      <circle cx="500" cy="520" r="7" fill={MOSS} opacity="0.5" />
    </svg>
  );
}

function ArtDragonTea() {
  return (
    <svg {...plateProps}>
      <rect width="600" height="600" fill="#f6e8ce" />
      <circle cx="450" cy="130" r="62" fill={ORANGE_SOFT} stroke={CHALK} strokeWidth="12" />
      <path d="M0 420 Q150 340 300 400 Q450 460 600 380 L600 600 L0 600 Z" fill={SAGE} stroke={CHALK} strokeWidth="12" />
      <Pine x={120} y={400} s={1.6} />
      <Pine x={200} y={370} s={1.1} tone={MOSS} />
      <Pine x={480} y={390} s={1.4} />
      <Pine x={540} y={360} s={1} tone={MOSS} />
      {/* rock table */}
      <ellipse cx="300" cy="470" rx="150" ry="46" fill="#a9855e" stroke={CHALK} strokeWidth="12" />
      {/* dragon */}
      <g transform="translate(180 330)">
        <path d="M0 120 Q-16 40 40 30 Q96 22 110 80 Q118 128 60 132 Q18 134 0 120 Z" fill={MOSS} stroke={CHALK} strokeWidth="12" strokeLinejoin="round" />
        <path d="M30 40 Q24 8 48 0 Q60 16 52 40" fill={SAGE} stroke={CHALK} strokeWidth="8" />
        <circle cx="58" cy="66" r="7" fill={INK} />
        <circle cx="59" cy="63" r="2.4" fill={CHALK} />
        <path d="M84 84 Q96 92 84 98" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M24 100 Q18 108 26 112" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.5" />
      </g>
      {/* child */}
      <g transform="translate(390 330)">
        <path d="M20 130 Q10 82 44 76 Q78 80 70 130 Z" fill={ORANGE} stroke={CHALK} strokeWidth="12" strokeLinejoin="round" />
        <circle cx="45" cy="52" r="34" fill="#f9ddc4" stroke={CHALK} strokeWidth="10" />
        <path d="M12 46 Q18 16 45 16 Q74 16 78 44 Q56 30 12 46 Z" fill="#7d5a3c" stroke={CHALK} strokeWidth="8" />
        <circle cx="33" cy="54" r="4.6" fill={INK} />
        <circle cx="58" cy="54" r="4.6" fill={INK} />
        <path d="M40 66 Q45 71 50 66" stroke={INK} strokeWidth="3.6" fill="none" strokeLinecap="round" />
      </g>
      {/* cups */}
      <g>
        <rect x="272" y="432" width="46" height="34" rx="9" fill={PAPER} stroke={CHALK} strokeWidth="8" />
        <path d="M272 442 q-14 2 -12 11 q2 9 14 7" fill="none" stroke={CHALK} strokeWidth="8" />
        <path d="M286 424 q7 -12 1 -20" stroke={CHALK} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
      {/* lantern */}
      <g transform="translate(520 250)">
        <path d="M0 0 L0 -28" stroke={CHALK} strokeWidth="6" />
        <rect x="-18" y="0" width="36" height="46" rx="9" fill={ORANGE_SOFT} stroke={CHALK} strokeWidth="8" />
        <circle cx="0" cy="22" r="7" fill={ORANGE} />
      </g>
      <Sparkle x={300} y={120} s={1.4} />
      <Sparkle x={520} y={90} s={1} />
    </svg>
  );
}

function ArtLantern() {
  return (
    <svg {...plateProps}>
      <rect width="600" height="600" fill="#5d6f57" />
      <rect x="40" y="40" width="520" height="520" rx="28" fill="#3f5142" opacity="0.6" />
      <circle cx="300" cy="330" r="150" fill={ORANGE} opacity="0.18" />
      <path d="M0 520 Q300 470 600 520 L600 600 L0 600 Z" fill="#2f3d33" />
      {/* mushrooms */}
      <g>
        <path d="M120 520 L120 400" stroke={CHALK} strokeWidth="16" strokeLinecap="round" />
        <path d="M60 410 Q40 300 120 300 Q200 300 186 410 Q120 380 60 410 Z" fill={ORANGE} stroke={CHALK} strokeWidth="14" strokeLinejoin="round" />
        <circle cx="104" cy="348" r="9" fill={CHALK} opacity="0.9" />
        <circle cx="146" cy="366" r="7" fill={CHALK} opacity="0.9" />
      </g>
      <g>
        <path d="M500 520 L500 440" stroke={CHALK} strokeWidth="12" strokeLinecap="round" />
        <path d="M462 446 Q448 372 500 372 Q552 372 542 446 Q500 428 462 446 Z" fill={ORANGE_SOFT} stroke={CHALK} strokeWidth="11" strokeLinejoin="round" />
      </g>
      {/* traveler with lantern */}
      <g transform="translate(290 360)">
        <path d="M-30 150 Q-40 90 0 84 Q40 90 30 150 Z" fill={MOSS} stroke={CHALK} strokeWidth="12" strokeLinejoin="round" />
        <circle cx="0" cy="52" r="36" fill="#f9ddc4" stroke={CHALK} strokeWidth="10" />
        <path d="M-36 46 Q-30 12 0 12 Q32 12 38 44 Q12 30 -36 46 Z" fill="#7d5a3c" stroke={CHALK} strokeWidth="8" />
        <circle cx="-12" cy="54" r="4.6" fill={INK} />
        <circle cx="14" cy="54" r="4.6" fill={INK} />
        <path d="M-8 68 Q0 74 8 68" stroke={INK} strokeWidth="3.6" fill="none" strokeLinecap="round" />
        <path d="M-30 96 Q-56 110 -56 128" stroke={CHALK} strokeWidth="16" strokeLinecap="round" fill="none" />
        <rect x="-76" y="128" width="40" height="46" rx="10" fill={ORANGE} stroke={CHALK} strokeWidth="10" />
        <path d="M-62 132 q4 12 0 22" stroke="none" />
        <circle cx="-56" cy="152" r="8" fill={PAPER} opacity="0.85" />
      </g>
      <circle cx="230" cy="510" r="6" fill={ORANGE_SOFT} />
      <circle cx="420" cy="470" r="5" fill={ORANGE_SOFT} />
      <Sparkle x={430} y={200} s={1.4} />
      <Sparkle x={160} y={160} s={1} />
      <Sparkle x={520} y={280} s={1.1} />
    </svg>
  );
}

function ArtOwlShop() {
  return (
    <svg {...plateProps}>
      <rect width="600" height="600" fill="#f6e8ce" />
      <path d="M120 560 L120 240 Q300 90 480 240 L480 560 Z" fill={PAPER} stroke={CHALK} strokeWidth="18" strokeLinejoin="round" />
      <path d="M150 260 L150 540 M450 260 L450 540" stroke={BEIGE} strokeWidth="8" />
      {/* shelves */}
      <g>
        <rect x="150" y="330" width="300" height="14" rx="6" fill="#a9855e" stroke={CHALK} strokeWidth="7" />
        <rect x="150" y="440" width="300" height="14" rx="6" fill="#a9855e" stroke={CHALK} strokeWidth="7" />
        <g>
          <rect x="164" y="286" width="20" height="44" rx="3" fill={MOSS} />
          <rect x="190" y="296" width="16" height="34" rx="3" fill={ORANGE} />
          <rect x="212" y="282" width="22" height="48" rx="3" fill={SAGE} />
          <rect x="380" y="294" width="18" height="36" rx="3" fill={ORANGE_SOFT} />
          <rect x="404" y="284" width="22" height="46" rx="3" fill={MOSS} />
          <rect x="170" y="400" width="26" height="40" rx="3" fill={SAGE} />
          <rect x="204" y="408" width="16" height="32" rx="3" fill={MOSS} />
          <rect x="386" y="396" width="20" height="44" rx="3" fill={ORANGE} />
        </g>
      </g>
      {/* plant */}
      <g transform="translate(430 400)">
        <path d="M0 0 Q-20 -30 -6 -46 Q12 -26 0 0" fill={MOSS} stroke={CHALK} strokeWidth="6" />
        <path d="M0 0 Q18 -26 30 -18 Q16 -2 0 0" fill={SAGE} stroke={CHALK} strokeWidth="6" />
        <rect x="-18" y="-4" width="36" height="34" rx="7" fill={ORANGE} stroke={CHALK} strokeWidth="7" />
      </g>
      {/* owl on books */}
      <g transform="translate(300 380)">
        <rect x="-70" y="46" width="140" height="18" rx="5" fill={MOSS} stroke={CHALK} strokeWidth="7" />
        <rect x="-58" y="28" width="116" height="18" rx="5" fill={ORANGE} stroke={CHALK} strokeWidth="7" />
        <ellipse cx="0" cy="-6" rx="56" ry="52" fill={BEIGE} stroke={CHALK} strokeWidth="10" />
        <path d="M-52 -30 Q-44 -66 -22 -46 Q0 -60 22 -46 Q44 -66 52 -30 Z" fill="#a9855e" stroke={CHALK} strokeWidth="8" strokeLinejoin="round" />
        <circle cx="-20" cy="-6" r="14" fill={PAPER} stroke={INK} strokeWidth="3" />
        <circle cx="20" cy="-6" r="14" fill={PAPER} stroke={INK} strokeWidth="3" />
        <circle cx="-19" cy="-6" r="6" fill={INK} />
        <circle cx="19" cy="-6" r="6" fill={INK} />
        <path d="M0 6 L-8 16 L8 16 Z" fill={ORANGE} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M-16 34 Q0 44 16 34" stroke={INK} strokeWidth="3" fill="none" opacity="0.4" />
        <path d="M-46 12 L-34 26 M46 12 L34 26" stroke={INK} strokeWidth="3" opacity="0.4" />
      </g>
      {/* lamp */}
      <g transform="translate(500 300)">
        <path d="M0 0 L0 40" stroke={CHALK} strokeWidth="8" />
        <path d="M-26 -6 L26 -6 L16 -36 L-16 -36 Z" fill={ORANGE_SOFT} stroke={CHALK} strokeWidth="8" strokeLinejoin="round" />
        <circle cx="0" cy="-18" r="26" fill={ORANGE} opacity="0.16" />
      </g>
      <path d="M120 560 L480 560" stroke={CHALK} strokeWidth="14" />
      <path d="M240 560 L360 560" stroke={BEIGE} strokeWidth="10" />
    </svg>
  );
}

function ArtCampfire() {
  return (
    <svg {...plateProps}>
      <rect width="600" height="600" fill="#56694f" />
      <rect x="30" y="30" width="540" height="540" rx="26" fill="#455843" opacity="0.5" />
      <circle cx="470" cy="110" r="46" fill={PAPER} stroke={CHALK} strokeWidth="10" />
      <circle cx="452" cy="100" r="40" fill="#56694f" />
      <Sparkle x={140} y={110} s={1.3} />
      <Sparkle x={250} y={70} s={0.9} />
      <Sparkle x={540} y={200} s={1.1} />
      <Sparkle x={90} y={240} s={0.8} />
      <Pine x={92} y={470} s={1.7} />
      <Pine x={512} y={470} s={1.9} tone={MOSS} />
      <Pine x={560} y={430} s={1.1} />
      <path d="M0 500 Q300 460 600 500 L600 600 L0 600 Z" fill="#33422f" />
      {/* fire */}
      <g transform="translate(300 430)">
        <circle cy="-10" r="120" fill={ORANGE} opacity="0.14" />
        <path d="M-74 44 L74 44 L60 62 L-60 62 Z" fill="#a9855e" stroke={CHALK} strokeWidth="8" strokeLinejoin="round" />
        <path d="M-56 54 L56 34" stroke={CHALK} strokeWidth="10" strokeLinecap="round" />
        <path d="M-46 34 L44 56" stroke={CHALK} strokeWidth="10" strokeLinecap="round" />
        <path d="M0 -60 Q34 -22 20 12 Q10 34 -8 26 Q-30 16 -22 -12 Q-14 -34 0 -60 Z" fill={ORANGE} stroke={CHALK} strokeWidth="9" strokeLinejoin="round" />
        <path d="M0 -26 Q18 -6 8 14 Q0 24 -10 14 Q-20 2 0 -26 Z" fill={ORANGE_SOFT} />
      </g>
      {/* teapot */}
      <g transform="translate(180 470)">
        <ellipse cx="0" cy="0" rx="34" ry="26" fill={PAPER} stroke={CHALK} strokeWidth="9" />
        <path d="M32 -6 q18 2 14 14 q-4 10 -18 6" fill="none" stroke={CHALK} strokeWidth="9" />
        <path d="M-32 -4 L-52 -18 L-44 -2 Z" fill={PAPER} stroke={CHALK} strokeWidth="7" strokeLinejoin="round" />
        <path d="M-8 -26 q8 -14 2 -24" stroke={CHALK} strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
      {/* backpack */}
      <g transform="translate(424 452)">
        <path d="M-40 40 Q-48 -12 -20 -24 L20 -24 Q48 -12 40 40 Z" fill={MOSS} stroke={CHALK} strokeWidth="10" strokeLinejoin="round" />
        <rect x="-22" y="-6" width="44" height="30" rx="8" fill={ORANGE} stroke={CHALK} strokeWidth="8" />
        <path d="M-20 -24 Q0 -46 20 -24" fill="none" stroke={CHALK} strokeWidth="7" />
      </g>
      <path d="M60 540 q40 -18 80 0 M470 556 q40 -18 80 0" stroke={SAGE} strokeWidth="7" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function ArtFrog() {
  return (
    <svg {...plateProps}>
      <rect width="600" height="600" fill="#c6d8c9" />
      <path d="M0 470 Q300 430 600 470 L600 600 L0 600 Z" fill={MOSS} />
      <g stroke={CHALK} strokeWidth="7" strokeLinecap="round" opacity="0.95">
        <path d="M90 80 L74 140 M170 40 L154 100 M260 100 L244 160 M350 50 L334 110 M450 90 L434 150 M530 40 L514 100 M120 190 L104 250 M420 200 L404 260 M300 210 L284 270" />
      </g>
      <ellipse cx="300" cy="520" rx="150" ry="30" fill={SAGE} opacity="0.7" />
      {/* puddle */}
      <ellipse cx="300" cy="530" rx="180" ry="44" fill={PAPER} opacity="0.35" />
      {/* frog */}
      <g transform="translate(300 380)">
        <path d="M-70 150 L-70 40 Q-70 -30 0 -30 Q70 -30 70 40 L70 150 Z" fill={MOSS} stroke={CHALK} strokeWidth="14" strokeLinejoin="round" />
        <path d="M-70 40 Q-80 150 -40 152 L40 152 Q80 150 70 40" fill={ORANGE} stroke={CHALK} strokeWidth="12" strokeLinejoin="round" />
        <path d="M0 40 L0 150" stroke={CHALK} strokeWidth="5" opacity="0.5" />
        <circle cx="-86" cy="20" r="18" fill={MOSS} stroke={CHALK} strokeWidth="8" />
        <circle cx="86" cy="20" r="18" fill={MOSS} stroke={CHALK} strokeWidth="8" />
        <circle cx="0" cy="-36" r="62" fill={MOSS} stroke={CHALK} strokeWidth="14" />
        <circle cx="-30" cy="-40" r="20" fill={PAPER} stroke={INK} strokeWidth="4" />
        <circle cx="30" cy="-40" r="20" fill={PAPER} stroke={INK} strokeWidth="4" />
        <circle cx="-28" cy="-38" r="8" fill={INK} />
        <circle cx="32" cy="-38" r="8" fill={INK} />
        <path d="M-24 6 Q0 24 24 6" stroke={INK} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <ellipse cx="-52" cy="4" rx="10" ry="7" fill={ORANGE_SOFT} opacity="0.8" />
        <ellipse cx="52" cy="4" rx="10" ry="7" fill={ORANGE_SOFT} opacity="0.8" />
      </g>
      {/* umbrella */}
      <g transform="translate(120 300)">
        <path d="M0 0 L4 150" stroke={CHALK} strokeWidth="10" strokeLinecap="round" />
        <path d="M-78 -6 Q0 -90 78 -6 Q40 6 0 -2 Q-40 6 -78 -6 Z" fill={ORANGE} stroke={CHALK} strokeWidth="10" strokeLinejoin="round" />
        <circle cx="4" cy="150" r="10" fill="none" stroke={CHALK} strokeWidth="8" />
      </g>
      <Sparkle x={470} y={150} s={1.2} />
      <path d="M420 520 q10 -18 22 -2" stroke={SAGE} strokeWidth="7" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Placeholder scene shown when a gallery item has no image yet. */
export function ArtPlaceholder({ variant }: { variant: ArtVariant }) {
  switch (variant) {
    case "windowsill":
      return <ArtWindowsill />;
    case "dragonTea":
      return <ArtDragonTea />;
    case "lantern":
      return <ArtLantern />;
    case "owlShop":
      return <ArtOwlShop />;
    case "campfire":
      return <ArtCampfire />;
    case "frog":
      return <ArtFrog />;
    default:
      return <ArtWindowsill />;
  }
}
