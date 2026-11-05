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
  jobTitle: "Digital illustrator",
  description: site.meta.description,
  email: `mailto:${site.contact.email}`,
  sameAs: site.contact.links.filter((link) => Boolean(link.url)).map((link) => link.url),
});

export default function App() {
  const [activeId, setActiveId] = useState<PlaceId | null>(null);
  const [hoverId, setHoverId] = useState<PlaceId | null>(null);
  const [idleIndex, setIdleIndex] = useState(0);
  const clocky = useClocky();
  const [visited, setVisited] = useState<PlaceId[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);

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
        <div className="bubble-in absolute left-1/2 top-[76px] z-30 flex w-[min(92vw,380px)] -translate-x-1/2 items-center gap-3 rounded-2xl border-2 border-ink bg-chalk px-4 py-2.5 shadow-[0_3px_0_rgba(75,58,42,0.7)] sm:top-20">
          <p className="flex-1 text-[14px] font-semibold leading-snug text-ink">{hints.welcome}</p>
          <button
            type="button"
            onClick={() => setShowWelcome(false)}
            className="stamp-btn min-h-[44px] shrink-0 rounded-full border-2 border-ink bg-orange-soft px-3.5 font-display text-[13px] font-bold text-ink"
          >
            {hints.welcomeDismiss}
          </button>
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
