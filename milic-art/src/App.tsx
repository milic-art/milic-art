import { useEffect, useMemo, useState } from "react";
import { site, type PlaceId } from "./content";
import { GuideCompanion, MobileDock, SiteHeader } from "./components/SiteChrome";
import { MapStage } from "./components/MapStage";
import { PlacePanel } from "./components/PlacePanel";

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
  const line = speakingPlace
    ? site.mascot.lines[speakingPlace]
    : idleLines[idleIndex % idleLines.length];

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

      <GuideCompanion line={line} dimmed={activeId !== null} />

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
