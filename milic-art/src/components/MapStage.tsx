import { useCallback, useEffect, useRef, useState } from "react";
import { site, type PlaceId } from "../content";
import { LandmarkArt, WorldBackdrop } from "./WorldArt";

const WORLD_W = 1600;
const WORLD_H = 1000;

type View = { x: number; y: number; s: number };

type MapStageProps = {
  places: typeof site.map.places;
  activeId: PlaceId | null;
  onOpen: (id: PlaceId) => void;
  onHover: (id: PlaceId | null) => void;
};

/**
 * The illustrated map. Custom pan and zoom: pointer drag, wheel, two finger
 * pinch, and the round zoom pegs for people who would rather not drag.
 */
export function MapStage({ places, activeId, onOpen, onHover }: MapStageProps) {
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
    // Place names stay readable at every zoom level.
    const counter = Math.min(2.6, Math.max(0.42, 1 / s));
    for (const label of labelRefs.current) {
      if (label) label.style.transform = `scale(${counter})`;
    }
    if (zoomLabelRef.current) {
      zoomLabelRef.current.textContent = `${Math.round(s * 100)}%`;
    }
  }, []);

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
    const edge = 96;

    next.x =
      worldW <= w ? (w - worldW) / 2 : Math.min(w - edge, Math.max(-(worldW - edge), next.x));
    next.y =
      worldH <= h ? (h - worldH) / 2 : Math.min(h - edge, Math.max(-(worldH - edge), next.y));
    return next;
  }, []);

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
  }, []);

  /** Frames the sheet: full bleed on wide screens, a paper map with margins on tall ones. */
  const welcomeView = useCallback(
    (animate: boolean) => {
      const stage = stageRef.current;
      if (!stage) return;
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const { fitAll, cover } = limits();
      minScale.current = Math.max(0.18, fitAll * 0.94);
      maxScale.current = Math.max(cover * 2.6, 1.4);
      const start = Math.min(cover * 1.02, fitAll * 2.1);
      const s = Math.min(maxScale.current, Math.max(minScale.current, start));

      const next = clamp({
        s,
        x: w / 2 - (WORLD_W * s) / 2,
        y: h / 2 - (WORLD_H * s) / 2,
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
    [clamp, limits, paint],
  );

  useEffect(() => {
    welcomeView(false);
    const onResize = () => {
      const { fitAll, cover } = limits();
      minScale.current = Math.max(0.18, fitAll * 0.94);
      maxScale.current = Math.max(cover * 2.6, 1.4);
      if (interacted.current) {
        setView(view.current);
      } else {
        welcomeView(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [limits, setView, welcomeView]);

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
      aria-label={`${site.brand.mapName}. An illustrated map with four landmarks: ${places
        .map((place) => place.name)
        .join(", ")}. Drag to pan, pinch or scroll to zoom, or use the menu to open a place.`}
    >
      <div
        ref={layerRef}
        className="absolute left-0 top-0 origin-top-left overflow-hidden rounded-[22px] shadow-[0_18px_44px_rgba(75,58,42,0.16)]"
        style={{ width: WORLD_W, height: WORLD_H, willChange: "transform", opacity: 0 }}
      >
        <WorldBackdrop places={places} />

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
              className="group absolute z-10 block w-[172px] cursor-pointer text-center"
              style={{ left: `${place.x}%`, top: `${place.y}%`, transform: "translate(-50%, -92%)" }}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute left-1/2 top-[46%] z-0 h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,135,74,0.55),rgba(232,135,74,0)_68%)] transition-opacity duration-200 ${
                  isActive || isHovered ? "opacity-100" : "opacity-0"
                }`}
              />
              <span
                className={`relative z-10 block transition-transform duration-200 ${
                  isActive ? "scale-[1.07]" : isHovered ? "scale-[1.05]" : "scale-100"
                }`}
              >
                {place.image ? (
                  <img
                    src={place.image}
                    alt=""
                    draggable={false}
                    className={`sticker h-[156px] w-full object-contain transition-[filter] duration-200 ${
                      isActive ? "sticker-glow" : "group-hover:sticker-glow group-focus-visible:sticker-glow"
                    }`}
                  />
                ) : (
                  <span
                    style={{ animationDelay: `${index * 0.9}s` }}
                    className={`landmark-idle sticker block h-[156px] w-full transition-[filter] duration-200 ${
                      isActive ? "sticker-glow" : "group-hover:sticker-glow group-focus-visible:sticker-glow"
                    }`}
                  >
                    <LandmarkArt id={place.id} />
                  </span>
                )}
              </span>
              <span
                ref={(node) => {
                  labelRefs.current[index] = node;
                }}
                style={{ transformOrigin: "top center", willChange: "transform" }}
                className={`relative z-10 mt-1 inline-flex items-center gap-1 rounded-full border-2 border-ink px-3 py-1 font-display text-[15px] font-bold leading-none shadow-[0_3px_0_rgba(75,58,42,0.8)] transition-colors duration-200 ${
                  isActive ? "bg-orange-deep text-chalk" : "bg-chalk text-ink"
                }`}
              >
                {place.name}
              </span>
            </button>
          );
        })}
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
