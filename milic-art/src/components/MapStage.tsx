import { useCallback, useEffect, useRef, useState } from "react";
import { site, type PlaceId } from "../content";
import { LandmarkArt } from "./WorldArt";
import { IsoIsland, type IslaControl, type IslaMode } from "./isla/IsoIsland";
import { isoLayout } from "./isla/config";
import { ClockyArt, type ClockyState } from "./ClockyArt";

type View = { x: number; y: number; s: number };

type MapStageProps = {
  places: typeof site.map.places;
  activeId: PlaceId | null;
  onOpen: (id: PlaceId) => void;
  onHover: (id: PlaceId | null) => void;
  portrait: boolean;
  /** Dónde está Clocky en el mapa (null: en el centro). */
  clockyAt: PlaceId | null;
  clockyState: ClockyState;
  walking: boolean;
  onPokeClocky: () => void;
};

/**
 * The illustrated map. Custom pan and zoom: pointer drag, wheel, two finger
 * pinch, and the round zoom pegs for people who would rather not drag.
 */
export function MapStage({ places, activeId, onOpen, onHover, portrait, clockyAt, clockyState, walking, onPokeClocky }: MapStageProps) {
  const layout = isoLayout(portrait);
  const WORLD_W = layout.worldW;
  const WORLD_H = layout.worldH;
  const [mode, setMode] = useState<IslaMode>("auto");
  const [nightShown, setNightShown] = useState(() => {
    const h = new Date().getHours();
    return h >= 19 || h < 6;
  });
  const [music, setMusic] = useState(false);
  const isla = useRef<IslaControl | null>(null);
  const pointerPar = useRef({ x: 0, y: 0 });
  const stageRef = useRef<HTMLDivElement | null>(null);
  const layerRef = useRef<HTMLDivElement | null>(null);
  const labelRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const view = useRef<View>({ x: 0, y: 0, s: 1 });
  const minScale = useRef(0.3);
  const maxScale = useRef(2.5);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; cx: number; cy: number } | null>(null);
  const frame = useRef<number | null>(null);
  const dragMoved = useRef(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const interacted = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [hoveredId, setHoveredId] = useState<PlaceId | null>(null);
  const zoomLabelRef = useRef<HTMLSpanElement | null>(null);

  const paint = useCallback(() => {
    const el = layerRef.current;
    if (!el) return;
    const { x, y, s } = view.current;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
    el.style.opacity = "1";
    // Alejado, los nombres se esconden (tapan las casitas) salvo el del lugar tocado.
    stageRef.current?.setAttribute("data-far", s < 0.62 ? "true" : "false");
    // Place names stay readable at every zoom level.
    const counter = Math.min(2.6, Math.max(0.42, 1 / s));
    for (const label of labelRefs.current) {
      if (label) label.style.transform = `scale(${counter})`;
    }
    if (zoomLabelRef.current) {
      zoomLabelRef.current.textContent = `${Math.round(s * 100)}%`;
    }
    // Parallax: hacia dónde se está mirando (centro de pantalla respecto del centro del mundo).
    const stage = stageRef.current;
    if (stage && isla.current) {
      const cxw = (stage.clientWidth / 2 - x) / s;
      const cyw = (stage.clientHeight / 2 - y) / s;
      isla.current.setParallax(
        (cxw - WORLD_W / 2) / (WORLD_W / 2) * 2 + pointerPar.current.x * 0.5,
        (cyw - WORLD_H / 2) / (WORLD_H / 2) * 2 + pointerPar.current.y * 0.5,
      );
    }
  }, [WORLD_W, WORLD_H]);

  const schedule = useCallback(() => {
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      paint();
    });
  }, [paint]);

  const clamp = useCallback((next: View): View => {
    const stage = stageRef.current;
    if (!stage) return next;
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const worldW = WORLD_W * next.s;
    const worldH = WORLD_H * next.s;
    // El mapa siempre cubre la pantalla: no se puede arrastrar fuera de los bordes.
    next.x = worldW <= w ? (w - worldW) / 2 : Math.min(0, Math.max(w - worldW, next.x));
    next.y = worldH <= h ? (h - worldH) / 2 : Math.min(0, Math.max(h - worldH, next.y));
    return next;
  }, [WORLD_W, WORLD_H]);

  const setView = useCallback(
    (next: View) => {
      view.current = clamp(next);
      schedule();
    },
    [clamp, schedule],
  );

  const zoomAt = useCallback(
    (factor: number, px: number, py: number) => {
      const cur = view.current;
      const nextScale = Math.min(maxScale.current, Math.max(minScale.current, cur.s * factor));
      if (Math.abs(nextScale - cur.s) < 0.0005) return;
      interacted.current = true;
      const k = nextScale / cur.s;
      setView({
        s: nextScale,
        x: px - (px - cur.x) * k,
        y: py - (py - cur.y) * k,
      });
    },
    [setView],
  );

  const limits = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return { fitAll: 0.5, cover: 0.5 };
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const fitAll = Math.min(w / WORLD_W, h / WORLD_H);
    const cover = Math.max(w / WORLD_W, h / WORLD_H);
    return { fitAll, cover };
  }, [WORLD_W, WORLD_H]);

  /** Frames the sheet: full bleed on wide screens, a paper map with margins on tall ones. */
  const welcomeView = useCallback(
    (animate: boolean) => {
      const stage = stageRef.current;
      if (!stage) return;
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (w < 2 || h < 2) return;
      const { cover } = limits();
      minScale.current = cover;
      maxScale.current = Math.max(cover * 2.2, 1.4);
      // La isla entera entra en pantalla (con aire arriba para el menú).
      const fit = Math.min((w * 0.98) / (layout.islaW * layout.z), (h * 0.86) / (layout.islaH * layout.z));
      const s = Math.min(maxScale.current, Math.max(minScale.current, fit));

      const next = clamp({
        s,
        x: w / 2 - layout.focus.x * s,
        y: h / 2 + Math.min(34, h * 0.04) - layout.focus.y * s,
      });

      if (animate && layerRef.current) {
        layerRef.current.style.transition = "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)";
        window.setTimeout(() => {
          if (layerRef.current) layerRef.current.style.transition = "";
        }, 460);
      }
      view.current = next;
      interacted.current = false;
      paint();
    },
    [clamp, limits, paint, layout],
  );

  useEffect(() => {
    welcomeView(false);
    const onResize = () => {
      const box = stageRef.current;
      if (!box || box.clientWidth < 2 || box.clientHeight < 2) return;
      const { cover } = limits();
      minScale.current = cover;
      maxScale.current = Math.max(cover * 2, 1.2);
      if (interacted.current) {
        setView(view.current);
      } else {
        welcomeView(false);
      }
    };
    window.addEventListener("resize", onResize);
    // En un marco que cambia de tamaño después de cargar, el mapa se vuelve a encuadrar.
    const stage = stageRef.current;
    const observer = typeof ResizeObserver !== "undefined" && stage ? new ResizeObserver(onResize) : null;
    if (observer && stage) observer.observe(stage);
    return () => {
      window.removeEventListener("resize", onResize);
      observer?.disconnect();
    };
  }, [limits, setView, welcomeView, portrait]);

  // Wheel zoom, registered by hand so the page never scrolls behind the map.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = stage.getBoundingClientRect();
      const factor = Math.exp(-event.deltaY * 0.0016);
      zoomAt(factor, event.clientX - rect.left, event.clientY - rect.top);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  // A pointer released outside the stage must not leave the map stuck mid drag.
  useEffect(() => {
    const release = () => {
      pointers.current.clear();
      pinch.current = null;
      dragStart.current = null;
      setDragging(false);
      window.setTimeout(() => {
        dragMoved.current = false;
      }, 0);
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointers.current.set(event.pointerId, {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
    dragMoved.current = false;
    dragStart.current = { x: event.clientX, y: event.clientY };
    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      pinch.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        cx: (a.x + b.x) / 2,
        cy: (a.y + b.y) / 2,
      };
    }
    setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") {
      const r = event.currentTarget.getBoundingClientRect();
      pointerPar.current = { x: ((event.clientX - r.left) / r.width - 0.5) * 2, y: ((event.clientY - r.top) / r.height - 0.5) * 2 };
      schedule();
    }
    if (!pointers.current.has(event.pointerId)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;

    const start = dragStart.current;
    if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 7) {
      dragMoved.current = true;
      interacted.current = true;
    }

    const previous = pointers.current.get(event.pointerId)!;
    pointers.current.set(event.pointerId, { x: px, y: py });

    if (pointers.current.size >= 2 && pinch.current) {
      const [a, b] = Array.from(pointers.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      if (pinch.current.dist > 4) {
        zoomAt(dist / pinch.current.dist, cx, cy);
      }
      const cur = view.current;
      setView({
        s: cur.s,
        x: cur.x + (cx - pinch.current.cx),
        y: cur.y + (cy - pinch.current.cy),
      });
      pinch.current = { dist, cx, cy };
      dragMoved.current = true;
      return;
    }

    if (!dragMoved.current) return;
    const cur = view.current;
    setView({ s: cur.s, x: cur.x + (px - previous.x), y: cur.y + (py - previous.y) });
  };

  const endPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) {
      setDragging(false);
      dragStart.current = null;
      window.setTimeout(() => {
        dragMoved.current = false;
      }, 0);
    }
  };

  return (
    <div
      ref={stageRef}
      className="map-stage relative h-full w-full overflow-hidden"
      data-dragging={dragging}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") onHover(null);
      }}
      role="group"
      aria-label={`${site.brand.mapName}. Un mapa ilustrado con ${places.length} lugares: ${places
        .map((place) => place.name)
        .join(", ")}. Arrastrá para moverte, pellizcá o usá scroll para acercar, o abrí un lugar desde el menú.`}
    >
      <div
        ref={layerRef}
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: WORLD_W, height: WORLD_H, willChange: "transform", opacity: 0 }}
      >
        <IsoIsland
          portrait={portrait}
          mode={mode}
          hoverId={hoveredId ?? activeId}
          onReady={(api) => {
            isla.current = api;
            schedule();
          }}
        />

        {places.map((place, index) => {
          const isActive = activeId === place.id;
          const isHovered = hoveredId === place.id;
          return (
            <button
              key={place.id}
              type="button"
              onClick={() => {
                if (dragMoved.current) return;
                onOpen(place.id);
              }}
              onPointerDown={(event) => {
                if (event.pointerType !== "mouse") setHoveredId(place.id);
              }}
              onPointerEnter={(event) => {
                if (event.pointerType !== "mouse") return;
                setHoveredId(place.id);
                onHover(place.id);
              }}
              onPointerLeave={(event) => {
                if (event.pointerType !== "mouse") return;
                setHoveredId(null);
                onHover(null);
              }}
              onFocus={() => {
                setHoveredId(place.id);
                onHover(place.id);
              }}
              onBlur={() => {
                setHoveredId(null);
                onHover(null);
              }}
              aria-haspopup="dialog"
              aria-label={`${place.name}. ${place.blurb}.`}
              className="group absolute z-10 block h-[186px] w-[186px] cursor-pointer text-center focus-visible:outline-none"
              style={{ left: `${place.x}%`, top: `${place.y}%`, transform: "translate(-50%, -100%)" }}
            >
              <span
                ref={(node) => {
                  labelRefs.current[index] = node;
                }}
                style={{ transformOrigin: "top center", willChange: "transform" }}
                data-on={isActive || isHovered}
                className={`place-label absolute left-1/2 top-[calc(100%-2px)] z-10 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full border-2 border-ink px-3 py-1 font-display text-[15px] font-bold leading-none shadow-[0_3px_0_rgba(75,58,42,0.8)] transition-colors duration-200 ${
                  isActive || isHovered ? "bg-orange-deep text-chalk" : "bg-chalk text-ink"
                } group-focus-visible:ring-4 group-focus-visible:ring-orange/60`}
              >
                {place.name}
              </span>
            </button>
          );
        })}

        {/* Clocky camina por el mapa hasta el lugar que abrís */}
        {(() => {
          const spot = places.find((place) => place.id === clockyAt) ?? { x: 50, y: 54 };
          const near = clockyAt !== null;
          return (
            <button
              type="button"
              onClick={onPokeClocky}
              aria-label={site.mascot.poke}
              className="clocky-walker absolute z-20 block w-[132px] cursor-pointer"
              data-walking={walking}
              style={{
                left: `calc(${spot.x}% + ${near ? 104 : 0}px)`,
                top: `calc(${spot.y}% + ${near ? 46 : 0}px)`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <span className="clocky-walk-inner block aspect-[220/200] w-full">
                <ClockyArt state={walking ? "stand" : clockyState} />
              </span>
            </button>
          );
        })()}
      </div>

      {/* Zoom pegs */}
      <div className="absolute bottom-[86px] right-3 z-20 flex flex-col items-center gap-2 sm:bottom-7 sm:right-6">
        <button
          type="button"
          onClick={() => {
            const stage = stageRef.current;
            if (!stage) return;
            zoomAt(1.25, stage.clientWidth / 2, stage.clientHeight / 2);
          }}
          className="zoom-peg flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-chalk text-ink shadow-[0_3px_0_rgba(75,58,42,0.8)]"
          aria-label={site.labels.zoomIn}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => {
            const stage = stageRef.current;
            if (!stage) return;
            zoomAt(0.8, stage.clientWidth / 2, stage.clientHeight / 2);
          }}
          className="zoom-peg flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-chalk text-ink shadow-[0_3px_0_rgba(75,58,42,0.8)]"
          aria-label={site.labels.zoomOut}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path d="M5 12h14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => welcomeView(true)}
          className="zoom-peg flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-paper text-ink shadow-[0_3px_0_rgba(75,58,42,0.8)]"
          aria-label={site.labels.resetView}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              d="M4 9V4h5M20 15v5h-5M20 9V4h-5M4 15v5h5"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => {
            const next: IslaMode = nightShown ? "day" : "night";
            setMode(next);
            setNightShown(next === "night");
          }}
          className="zoom-peg flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-chalk text-ink shadow-[0_3px_0_rgba(75,58,42,0.8)]"
          aria-label={nightShown ? "Cambiar a día" : "Cambiar a noche"}
          aria-pressed={nightShown}
        >
          {nightShown ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <circle cx="12" cy="12" r="4.2" fill="currentColor" />
              <path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M5.6 18.4l1.7-1.7M16.7 7.3l1.7-1.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" fill="currentColor" />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={() => setMusic((m) => !m)}
          className="zoom-peg flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-paper text-ink shadow-[0_3px_0_rgba(75,58,42,0.8)]"
          aria-label={music ? "Música: encendida (todavía sin audio)" : "Música: apagada"}
          aria-pressed={music}
          title="Música lofi: próximamente"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path d="M9 18V6l10-2v12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="6.5" cy="18" r="2.6" fill="currentColor" />
            <circle cx="16.5" cy="16" r="2.6" fill="currentColor" />
            {!music && <path d="M3 21 21 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />}
          </svg>
        </button>
        <span
          ref={zoomLabelRef}
          className="mt-1 rounded-full border border-ink/20 bg-chalk/80 px-2 py-[2px] font-display text-[11px] font-bold text-ink-soft"
          aria-hidden="true"
        >
          100%
        </span>
      </div>

      <p className="pointer-events-none absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 rounded-full border-2 border-ink/15 bg-chalk/85 px-3 py-1.5 text-[12px] font-semibold text-ink-soft sm:block">
        {site.map.dragHint} · {site.map.zoomHint}
      </p>
    </div>
  );
}
