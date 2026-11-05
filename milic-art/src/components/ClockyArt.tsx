/**
 * Clocky, PROVISIONAL version drawn in code so the animation logic can be
 * tested. Replace it with your own drawing later: the states below
 * (asleep, eye1, eye2, stretch, stand, wave, awake, hide, sneeze) are the
 * list of animations to draw. Styles live in styles.css (".clocky").
 */
export type ClockyState =
  | "asleep"
  | "eye1"
  | "eye2"
  | "stretch"
  | "stand"
  | "wave"
  | "awake"
  | "hide"
  | "sneeze";

const OUT = "#2f3a24";
const BODY = "#4f6b3d";
const BODY_DARK = "#3e5530";
const SNOUT = "#6b8c55";
const BELLY = "#f2dc8a";
const CHEEK = "#f4b183";
const IRIS = "#7a4a2a";
const SCAR = "#e9b8a0";

function Paw({ x, className }: { x: number; className: string }) {
  return (
    <g className={className}>
      <ellipse cx={x} cy="176" rx="17" ry="12" fill={BODY} stroke={OUT} strokeWidth="4" />
      <path d={`M${x - 6} 172 v6 M${x} 170 v8 M${x + 6} 172 v6`} stroke={OUT} strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

function Eye({ x, side }: { x: number; side: "l" | "r" }) {
  return (
    <g>
      <ellipse cx={x} cy="72" rx="17" ry="16" fill={BODY} stroke={OUT} strokeWidth="4" />
      <ellipse cx={x} cy="74" rx="11" ry="11" fill="#fffdf7" stroke={OUT} strokeWidth="2.5" />
      <ellipse cx={x} cy="75" rx="7.5" ry="8.5" fill={IRIS} />
      <ellipse cx={x} cy="75" rx="2.4" ry="7" fill={OUT} />
      <circle cx={x + 3} cy="71" r="2.2" fill="#fffdf7" />
      {/* eyelid: scaleY(1) is closed */}
      <ellipse className={`ck-lid ck-lid-${side}`} cx={x} cy="73" rx="16.5" ry="15" fill={BODY} stroke={OUT} strokeWidth="3" />
    </g>
  );
}

export function ClockyArt({ state = "awake", className }: { state?: ClockyState; className?: string }) {
  return (
    <svg
      viewBox="0 0 220 200"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      className={`clocky ${className ?? ""}`}
      data-state={state}
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="110" cy="190" rx="70" ry="7" fill="#4b3a2a" opacity="0.15" />
      <g className="ck-root">
        {/* tail */}
        <g className="ck-tail">
          <path d="M160 150 C196 150 206 124 196 106 C204 128 184 140 160 138 Z" fill={BODY_DARK} stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
        </g>
        {/* body */}
        <g className="ck-body">
          <ellipse cx="110" cy="142" rx="64" ry="42" fill={BODY} stroke={OUT} strokeWidth="4" />
          <ellipse cx="110" cy="156" rx="40" ry="26" fill={BELLY} />
          <path d="M96 118 l5 -9 l5 9 M112 116 l5 -9 l5 9" stroke={OUT} strokeWidth="2.5" fill={BODY_DARK} strokeLinejoin="round" />
        </g>
        {/* head */}
        <g className="ck-head">
          <ellipse cx="110" cy="98" rx="60" ry="46" fill={BODY} stroke={OUT} strokeWidth="4" />
          <ellipse cx="110" cy="120" rx="42" ry="25" fill={SNOUT} stroke={OUT} strokeWidth="3.5" />
          <circle cx="98" cy="111" r="2.6" fill={OUT} />
          <circle cx="122" cy="111" r="2.6" fill={OUT} />
          <path d="M92 126 Q110 138 128 126" stroke={OUT} strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <path className="ck-yawn" d="M92 126 Q110 150 128 126 Q110 130 92 126 Z" fill="#7b2f2f" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          <path d="M100 129 l3 5 l3 -4 M114 129 l3 4 l3 -5" stroke="#fffdf7" strokeWidth="2.4" fill="none" strokeLinejoin="round" strokeLinecap="round" />
          <ellipse cx="62" cy="106" rx="9" ry="6" fill={CHEEK} opacity="0.8" />
          <ellipse cx="158" cy="106" rx="9" ry="6" fill={CHEEK} opacity="0.8" />
          <Eye x={80} side="l" />
          <Eye x={140} side="r" />
          {/* burn scar over the character's left eye */}
          <path d="M127 56 L152 92" stroke={SCAR} strokeWidth="4.5" strokeLinecap="round" />
          <path d="M131 66 l7 -3 M138 77 l7 -3" stroke={SCAR} strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <Paw x={78} className="ck-paw ck-paw-l" />
        <Paw x={142} className="ck-paw ck-paw-r" />
      </g>
      {/* extras */}
      <g className="ck-zzz" fill="#4b3a2a" fontFamily="Baloo 2, sans-serif" fontWeight="700">
        <text x="168" y="40" fontSize="18" className="z1">z</text>
        <text x="182" y="24" fontSize="22" className="z2">z</text>
        <text x="198" y="8" fontSize="26" className="z3">Z</text>
      </g>
      <g className="ck-spray" fill="#bfe3ee" stroke="#4b3a2a" strokeWidth="1.5">
        <circle cx="104" cy="148" r="4" />
        <circle cx="124" cy="152" r="3" />
        <circle cx="114" cy="158" r="2.5" />
      </g>
    </svg>
  );
}
