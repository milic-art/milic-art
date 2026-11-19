import { site, type PlaceId } from "../content";
import { ClockyArt } from "./ClockyArt";

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
      {id === "periodismo" && (
        <g {...common}>
          <circle cx="10.5" cy="10.5" r="5.5" />
          <path d="m15 15 5 5" />
          <path d="M8.5 9.5h4M8.5 12h3" />
        </g>
      )}
      {id === "diseno" && (
        <g {...common}>
          <path d="M12 4c-5 0-8 3.4-8 7.2 0 3.6 2.8 6 5.8 6 1.4 0 1.7-.9 1.2-1.8-.6-1 .1-2.2 1.4-2.2H17c2 0 3-1.2 3-3C20 6.2 16.6 4 12 4Z" />
          <circle cx="8.2" cy="10" r=".9" />
          <circle cx="12" cy="7.8" r=".9" />
          <circle cx="15.6" cy="9.4" r=".9" />
        </g>
      )}
      {id === "dibujo" && (
        <g {...common}>
          <path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19l-4 1Z" />
          <path d="m14.5 6.5 3 3" />
        </g>
      )}
      {id === "programacion" && (
        <g {...common}>
          <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12" />
        </g>
      )}
      {id === "casita" && (
        <g {...common}>
          <path d="M4 11.5 12 4.5l8 7" />
          <path d="M6.5 10.5V19h11v-8.5" />
          <path d="M10.5 19v-4.5h3V19" />
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
        <span className="mt-0.5 hidden whitespace-nowrap text-[11px] font-semibold leading-none text-ink-soft xl:block">
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
  onList,
  onWrite,
}: {
  activeId: PlaceId | null;
  onOpen: (id: PlaceId) => void;
  onList: () => void;
  onWrite: () => void;
}) {
  const listButton = (
    <button
      type="button"
      onClick={onList}
      className="stamp-btn pointer-events-auto flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-xl border-2 border-ink bg-paper/95 px-3 font-display text-[13px] font-bold text-ink shadow-[0_4px_0_rgba(75,58,42,0.55)]"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      {site.labels.list}
    </button>
  );
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-3 sm:p-5">
      <Wordmark />

      <div className="pointer-events-none flex items-start gap-2">
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
                <span className="hidden lg:inline 2xl:hidden">{place.short}</span>
                <span className="hidden 2xl:inline">{place.name}</span>
                <span className="hidden text-[11px] font-bold opacity-70 2xl:inline">{index + 1}</span>
              </button>
            );
          })}
        </nav>
        {listButton}
        <button
          type="button"
          onClick={onWrite}
          className="stamp-btn pointer-events-auto hidden min-h-[44px] items-center rounded-xl border-2 border-ink bg-orange-deep px-3.5 font-display text-[13px] font-bold whitespace-nowrap text-chalk shadow-[0_4px_0_rgba(75,58,42,0.7)] sm:flex"
        >
          {site.labels.write}
        </button>
      </div>
    </header>
  );
}

/** Todos los lugares como lista, para quien no quiere recorrer el mapa. */
export function ListView({
  onPick,
  onClose,
  onWrite,
}: {
  onPick: (id: PlaceId) => void;
  onClose: () => void;
  onWrite: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[45] overflow-y-auto bg-paper px-4 pb-28 pt-4 sm:px-8 sm:pb-10">
      <div className="mx-auto flex max-w-[640px] flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-orange-deep">
              {site.brand.wordmark}
            </p>
            <h2 className="font-display text-[28px] font-extrabold leading-none">Todos los lugares</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="stamp-btn min-h-[44px] rounded-xl border-2 border-ink bg-chalk px-3.5 font-display text-[13px] font-bold text-ink shadow-[0_3px_0_rgba(75,58,42,0.6)]"
          >
            {site.labels.map}
          </button>
        </div>
        <ul className="flex flex-col gap-2.5">
          {site.map.places.map((place) => (
            <li key={place.id}>
              <button
                type="button"
                onClick={() => onPick(place.id)}
                className="stamp-btn flex min-h-[64px] w-full items-center gap-3.5 rounded-2xl border-2 border-ink bg-chalk px-4 py-3 text-left shadow-[0_3px_0_rgba(75,58,42,0.5)] hover:bg-paper-deep"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-orange-soft text-ink">
                  <PlaceGlyph id={place.id} className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[18px] font-bold leading-tight text-ink">{place.name}</span>
                  <span className="block text-[13.5px] leading-snug text-ink-soft">{place.blurb}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onWrite}
          className="stamp-btn min-h-[48px] rounded-full border-2 border-ink bg-orange-deep px-5 font-display text-[15px] font-bold text-chalk shadow-[0_3px_0_rgba(75,58,42,0.85)]"
        >
          {site.labels.write}
        </button>
      </div>
    </div>
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
      <ul className="flex items-stretch justify-between gap-0.5 rounded-2xl border-2 border-ink bg-paper/97 px-1 py-1.5 shadow-[0_4px_0_rgba(75,58,42,0.55)]">
        {site.map.places.map((place) => {
          const active = activeId === place.id;
          return (
            <li key={place.id} className="flex-1">
              <button
                type="button"
                onClick={() => onOpen(place.id)}
                aria-current={active ? "true" : undefined}
                aria-label={`${place.name}, ${place.blurb}`}
                className={`flex w-full flex-col items-center gap-1 rounded-xl px-0.5 py-1.5 transition-colors ${
                  active ? "bg-orange-deep text-chalk" : "text-ink"
                }`}
              >
                <PlaceGlyph id={place.id} className="h-5 w-5" />
                <span className="font-display text-[10px] font-bold leading-none">
                  {place.short}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Clocky habla desde un globo con su cabeza. Tocá la cabeza para hacerlo estornudar. */
export function GuideCompanion({
  line,
  dimmed,
  onPoke,
}: {
  line: string;
  dimmed: boolean;
  onPoke: () => void;
}) {
  return (
    <div
      className={`pointer-events-none absolute bottom-[84px] left-2.5 z-30 items-end gap-2 transition-opacity duration-300 sm:bottom-5 sm:left-5 ${
        dimmed ? "hidden sm:flex" : "flex"
      }`}
    >
      <button
        type="button"
        onClick={onPoke}
        aria-label={site.mascot.poke}
        className="pointer-events-auto relative h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-ink bg-orange-soft shadow-[0_3px_0_rgba(75,58,42,0.7)]"
      >
        <span className="absolute left-1/2 top-[58%] block w-[190%] -translate-x-1/2 -translate-y-1/2">
          <ClockyArt state="awake" />
        </span>
      </button>
      <div className="bubble-in relative max-w-[210px] rounded-2xl rounded-bl-[6px] border-2 border-ink bg-chalk px-3 py-2 shadow-[0_3px_0_rgba(75,58,42,0.7)] sm:max-w-[270px] sm:px-3.5 sm:py-2.5">
        <p className="text-[12.5px] font-semibold leading-snug text-ink sm:text-[13.5px]" aria-live="polite">
          {line}
        </p>
      </div>
    </div>
  );
}
