import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hints, site, type PlaceId } from "./content";
import { GuideCompanion, ListView, MobileDock, SiteHeader } from "./components/SiteChrome";
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

const WALK_MS = 950;

function usePortrait() {
  const [portrait, setPortrait] = useState(() => window.innerWidth < window.innerHeight);
  useEffect(() => {
    const onResize = () => setPortrait(window.innerWidth < window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return portrait;
}

export default function App() {
  const [activeId, setActiveId] = useState<PlaceId | null>(null);
  const [hoverId, setHoverId] = useState<PlaceId | null>(null);
  const [idleIndex, setIdleIndex] = useState(0);
  const clocky = useClocky();
  const [visited, setVisited] = useState<PlaceId[]>([]);
  const [clockyAt, setClockyAt] = useState<PlaceId | null>(null);
  const [walking, setWalking] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [casitaTab, setCasitaTab] = useState<"sobre" | "contacto">("sobre");
  const [preset, setPreset] = useState<string | null>(null);
  const portrait = usePortrait();
  const walkTimer = useRef<number | null>(null);

  const mapPlaces = useMemo(
    () => site.map.places.map((place) => ({ ...place, x: portrait ? place.px : place.x, y: portrait ? place.py : place.y })),
    [portrait],
  );

  /** Abre un lugar. Si todavía no hay página abierta, Clocky camina primero. */
  const openPlace = useCallback(
    (id: PlaceId) => {
      setListOpen(false);
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (walkTimer.current !== null) window.clearTimeout(walkTimer.current);
      if (activeId !== null || reduce || clockyAt === id) {
        setClockyAt(id);
        setActiveId(id);
        return;
      }
      setClockyAt(id);
      setWalking(true);
      walkTimer.current = window.setTimeout(() => {
        walkTimer.current = null;
        setWalking(false);
        setActiveId(id);
      }, WALK_MS);
    },
    [activeId, clockyAt],
  );

  const openContact = useCallback(
    (presetId?: string) => {
      setPreset(presetId ?? null);
      setCasitaTab("contacto");
      openPlace("casita");
    },
    [openPlace],
  );

  // Enlace directo: #dibujo abre ese lugar al entrar, y el hash sigue al lugar abierto.
  useEffect(() => {
    try {
      const id = window.location.hash.replace("#", "");
      if (site.map.places.some((place) => place.id === id)) {
        setClockyAt(id as PlaceId);
        setActiveId(id as PlaceId);
      }
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
      if (event.key === "Escape" && listOpen) {
        setListOpen(false);
        return;
      }
      const index = Number.parseInt(event.key, 10);
      if (!Number.isNaN(index) && index >= 1 && index <= places.length) {
        openPlace(places[index - 1].id);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [places, openPlace, listOpen]);

  const speakingPlace = hoverId ?? clockyAt;
  const placeOrIdle =
    (hoverId || walking || activeId) && speakingPlace
      ? site.mascot.lines[speakingPlace]
      : idleLines[idleIndex % idleLines.length];
  // Las animaciones de Clocky no se narran: el globo solo dice cosas, nunca describe acciones.
  const line = placeOrIdle;

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-paper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />

      <MapStage
        places={mapPlaces}
        activeId={activeId}
        onOpen={openPlace}
        onHover={setHoverId}
        portrait={portrait}
        clockyAt={clockyAt}
        clockyState={clocky.state}
        walking={walking}
        onPokeClocky={clocky.poke}
      />

      <SiteHeader
        activeId={activeId}
        onOpen={openPlace}
        onList={() => setListOpen(true)}
        onWrite={() => openContact()}
      />

      <GuideCompanion line={line} dimmed={activeId !== null} onPoke={clocky.poke} />

      <p
        className="pointer-events-none absolute right-3 top-[76px] z-20 hidden rounded-full border-2 border-ink/20 bg-chalk/90 px-3 py-1 font-display text-[12px] font-bold text-ink-soft sm:block"
        aria-live="polite"
      >
        {visited.length === places.length
          ? hints.allDiscovered
          : hints.discovered(visited.length, places.length)}
      </p>

      <MobileDock activeId={activeId} onOpen={openPlace} />

      {listOpen && <ListView onPick={openPlace} onClose={() => setListOpen(false)} onWrite={() => openContact()} />}

      {activeId && (
        <PlacePanel
          placeId={activeId}
          onClose={() => setActiveId(null)}
          onNavigate={openPlace}
          casitaTab={casitaTab}
          onCasitaTab={setCasitaTab}
          preset={preset}
          onContact={openContact}
        />
      )}
    </main>
  );
}
