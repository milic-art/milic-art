import { useEffect, useMemo, useState } from "react";
import { hints, site, type PlaceId } from "./content";
import { GuideCompanion, MobileDock, SiteHeader } from "./components/SiteChrome";
import { MapStage } from "./components/MapStage";
import { PlacePanel } from "./components/PlacePanel";
import { useClocky } from "./components/useClocky";

const structuredData = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.about.name,
  alternateName: site.brand.wordmark,
  jobTitle: "Periodista investigadora, diseñadora, dibujante y programadora",
  description: site.meta.description,
  ...(site.contact.email ? { email: `mailto:${site.contact.email}` } : {}),
  sameAs: site.contact.links.filter((link) => Boolean(link.url)).map((link) => link.url),
});

export default function App() {
  const [activeId, setActiveId] = useState<PlaceId | null>(null);
  const [hoverId, setHoverId] = useState<PlaceId | null>(null);
  const [idleIndex, setIdleIndex] = useState(0);
  const clocky = useClocky();
  const [visited, setVisited] = useState<PlaceId[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);

  // Enlace directo: #dibujo abre ese lugar al entrar, y el hash sigue al lugar abierto.
  useEffect(() => {
    try {
      const id = window.location.hash.replace("#", "");
      if (site.map.places.some((place) => place.id === id)) setActiveId(id as PlaceId);
    } catch {
      /* sin hash, no pasa nada */
    }
  }, []);

  useEffect(() => {
    try {
      if (activeId) window.history.replaceState(null, "", `#${activeId}`);
      else if (window.location.hash) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    } catch {
      /* algunos entornos no dejan cambiar la dirección */
    }
  }, [activeId]);

  useEffect(() => {
    if (activeId) {
      setShowWelcome(false);
      setVisited((list) => (list.includes(activeId) ? list : [...list, activeId]));
    }
  }, [activeId]);

  const places = site.map.places;
  const idleLines = useMemo(() => [site.mascot.greeting, ...site.mascot.idle], []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIdleIndex((index) => (index + 1) % idleLines.length);
    }, 9000);
    return () => window.clearInterval(timer);
  }, [idleLines.length]);

  // Number keys open a place, matching the menu order.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      const index = Number.parseInt(event.key, 10);
      if (!Number.isNaN(index) && index >= 1 && index <= places.length) {
        setActiveId(places[index - 1].id);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [places]);

  const speakingPlace = hoverId ?? activeId;
  const placeOrIdle = speakingPlace
    ? site.mascot.lines[speakingPlace]
    : idleLines[idleIndex % idleLines.length];
  // Clocky's own moments win over the usual lines.
  const clockyLine: Partial<Record<typeof clocky.state, string>> = {
    asleep: site.mascot.asleep,
    eye1: site.mascot.asleep,
    eye2: site.mascot.asleep,
    hide: site.mascot.asleep,
    stretch: hints.yawn,
    sneeze: site.mascot.sneeze,
  };
  const line = clockyLine[clocky.state] ?? placeOrIdle;

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-paper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />

      <MapStage
        places={places}
        activeId={activeId}
        onOpen={(id) => setActiveId(id)}
        onHover={setHoverId}
      />

      <SiteHeader activeId={activeId} onOpen={(id) => setActiveId(id)} />

      <GuideCompanion line={line} dimmed={activeId !== null} state={clocky.state} onPoke={clocky.poke} />

      {showWelcome && activeId === null && (
        <div className="bubble-in absolute left-1/2 top-[76px] z-30 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border-2 border-ink bg-chalk px-4 py-3 shadow-[0_3px_0_rgba(75,58,42,0.7)] sm:top-20">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-[16px] font-extrabold leading-tight text-ink">{hints.welcomeTitle}</p>
              <p className="mt-0.5 text-[13px] font-semibold leading-snug text-ink-soft">{hints.welcomeSub}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowWelcome(false)}
              className="stamp-btn min-h-[44px] shrink-0 rounded-full border-2 border-ink bg-orange-soft px-3 font-display text-[12.5px] font-bold text-ink"
            >
              {hints.welcomeDismiss}
            </button>
          </div>
          <ul className="mt-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {hints.paths.map((path) => (
              <li key={path.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(path.id)}
                  className="stamp-btn min-h-[44px] w-full rounded-xl border-2 border-ink bg-paper px-3 py-1.5 text-left font-display text-[13px] font-bold leading-tight text-ink hover:bg-paper-deep"
                >
                  {path.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p
        className="pointer-events-none absolute right-3 top-[76px] z-20 hidden rounded-full border-2 border-ink/20 bg-chalk/90 px-3 py-1 font-display text-[12px] font-bold text-ink-soft sm:block"
        aria-live="polite"
      >
        {visited.length === places.length
          ? hints.allDiscovered
          : hints.discovered(visited.length, places.length)}
      </p>

      <MobileDock activeId={activeId} onOpen={(id) => setActiveId(id)} />

      {activeId && (
        <PlacePanel
          placeId={activeId}
          onClose={() => setActiveId(null)}
          onNavigate={(id) => setActiveId(id)}
        />
      )}
    </main>
  );
}
