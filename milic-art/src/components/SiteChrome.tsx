import { site, type PlaceId } from "../content";
import { MascotArt } from "./WorldArt";

function PlaceGlyph({ id, className = "h-4 w-4" }: { id: PlaceId; className?: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      {id === "gallery" && (
        <g {...common}>
          <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
          <path d="M6 15.5 9.5 11l3 4 2.5-3 3 4.5" />
          <circle cx="9" cy="8.6" r="1.2" />
        </g>
      )}
      {id === "commissions" && (
        <g {...common}>
          <rect x="5" y="4" width="14" height="16" rx="2.5" />
          <path d="M9 9h6M9 13h6M9 17h3" />
        </g>
      )}
      {id === "about" && (
        <g {...common}>
          <path d="M4 11.5 12 4.5l8 7" />
          <path d="M6.5 10.5V19h11v-8.5" />
          <path d="M10.5 19v-4.5h3V19" />
        </g>
      )}
      {id === "contact" && (
        <g {...common}>
          <rect x="3" y="6" width="18" height="12" rx="2.5" />
          <path d="m4.5 8 7.5 6 7.5-6" />
        </g>
      )}
    </svg>
  );
}

function Wordmark() {
  return (
    <div className="pointer-events-auto inline-flex items-center gap-2.5 rounded-2xl border-2 border-ink bg-paper/95 px-3.5 py-2 shadow-[0_4px_0_rgba(75,58,42,0.55)]">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-orange-soft">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <g fill="none" stroke="#4b3a2a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 18.5c-1.4.2-2.3-.7-2-2 .4-1.8 2-4.4 5.4-7.8 3.4-3.4 6-5 7.8-5.4 1.3-.3 2.2.6 2 2-.4 1.8-2 4.4-5.4 7.8-3.4 3.4-6 5-7.8 5.4Z" />
            <path d="M12.5 8.5l3 3" />
          </g>
        </svg>
      </span>
      <span className="block leading-tight">
        <span className="block font-display text-[19px] font-extrabold leading-none tracking-tight text-ink">
          {site.brand.wordmark}
        </span>
        <span className="mt-0.5 block text-[11px] font-semibold leading-none text-ink-soft">
          {site.brand.mapName} · {site.brand.mapNote}
        </span>
      </span>
    </div>
  );
}

/** Top bar: wordmark on a paper tab, plus the always visible place menu. */
export function SiteHeader({
  activeId,
  onOpen,
}: {
  activeId: PlaceId | null;
  onOpen: (id: PlaceId) => void;
}) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-3 sm:p-5">
      <Wordmark />

      <nav
        aria-label={site.labels.menu}
        className="pointer-events-auto hidden items-center gap-1.5 rounded-2xl border-2 border-ink bg-paper/95 px-2 py-1.5 shadow-[0_4px_0_rgba(75,58,42,0.55)] sm:flex"
      >
        {site.map.places.map((place, index) => {
          const active = activeId === place.id;
          return (
            <button
              key={place.id}
              type="button"
              onClick={() => onOpen(place.id)}
              aria-current={active ? "true" : undefined}
              aria-label={`${place.name}, ${place.blurb}`}
              className={`menu-tab flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 font-display text-[13.5px] font-bold leading-none shadow-[0_2px_0_rgba(75,58,42,0.6)] ${
                active
                  ? "border-ink bg-orange-deep text-chalk"
                  : "border-transparent bg-chalk text-ink hover:bg-paper-deep"
              }`}
            >
              <PlaceGlyph id={place.id} className="h-4 w-4" />
              <span>{place.name}</span>
              <span className="hidden text-[11px] font-bold text-ink-soft lg:inline">
                {index + 1}
              </span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}

/** Phone menu: pinned to the bottom so it is always one tap away. */
export function MobileDock({
  activeId,
  onOpen,
}: {
  activeId: PlaceId | null;
  onOpen: (id: PlaceId) => void;
}) {
  return (
    <nav
      aria-label={site.labels.menu}
      className="pointer-events-auto fixed inset-x-2.5 bottom-2.5 z-40 sm:hidden"
    >
      <ul className="flex items-stretch justify-between gap-1 rounded-2xl border-2 border-ink bg-paper/97 px-1.5 py-1.5 shadow-[0_4px_0_rgba(75,58,42,0.55)]">
        {site.map.places.map((place) => {
          const active = activeId === place.id;
          return (
            <li key={place.id} className="flex-1">
              <button
                type="button"
                onClick={() => onOpen(place.id)}
                aria-current={active ? "true" : undefined}
                aria-label={`${place.name}, ${place.blurb}`}
                className={`flex w-full flex-col items-center gap-1 rounded-xl px-1 py-1.5 transition-colors ${
                  active ? "bg-orange-deep text-chalk" : "text-ink"
                }`}
              >
                <PlaceGlyph id={place.id} className="h-5 w-5" />
                <span className="font-display text-[11px] font-bold leading-none">
                  {place.name}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Pip, the chibi guide, with a short speech bubble. */
export function GuideCompanion({ line, dimmed }: { line: string; dimmed: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute bottom-[78px] left-2 z-30 items-end transition-opacity duration-300 sm:bottom-5 sm:left-5 ${
        dimmed ? "hidden sm:flex" : "flex"
      }`}
    >
      <div className="guide-bob aspect-[180/220] w-[84px] shrink-0 sm:w-[108px]">
        <MascotArt />
      </div>
      <div className="bubble-in relative mb-7 max-w-[190px] rounded-2xl rounded-bl-[6px] border-2 border-ink bg-chalk px-3 py-2 shadow-[0_3px_0_rgba(75,58,42,0.7)] sm:mb-10 sm:max-w-[250px] sm:px-3.5 sm:py-2.5">
        <p className="text-[12px] font-semibold leading-snug text-ink sm:text-[13px]" aria-live="polite">
          {line}
        </p>
      </div>
    </div>
  );
}
