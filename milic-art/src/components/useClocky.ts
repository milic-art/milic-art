import { useCallback, useEffect, useRef, useState } from "react";
import type { ClockyState } from "./ClockyArt";

/** How long nothing happens before Clocky lies down again. */
const IDLE_MS = 25000;

/**
 * Clocky's little story:
 * sleeping -> opens one eye -> the other -> stretches -> stands -> waves.
 * Poke him and he sneezes. Leave him alone and he lies down, face in paws.
 */
export function useClocky() {
  const [state, setState] = useState<ClockyState>("asleep");
  const timers = useRef<number[]>([]);
  const lastActive = useRef(Date.now());
  const stateRef = useRef<ClockyState>("asleep");
  stateRef.current = state;

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  const later = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setState("awake");
    } else {
      const steps: [number, ClockyState][] = [
        [1400, "eye1"],
        [2100, "eye2"],
        [2900, "stretch"],
        [4200, "stand"],
        [4900, "wave"],
        [7300, "awake"],
      ];
      steps.forEach(([ms, s]) => later(ms, () => setState(s)));
    }

    const onActivity = () => {
      lastActive.current = Date.now();
      if (stateRef.current === "hide") setState("awake");
    };
    window.addEventListener("pointerdown", onActivity);
    window.addEventListener("keydown", onActivity);
    window.addEventListener("pointermove", onActivity, { passive: true });

    const watcher = window.setInterval(() => {
      if (stateRef.current === "awake" && Date.now() - lastActive.current > IDLE_MS) {
        setState("hide");
      }
    }, 3000);

    return () => {
      clear();
      window.clearInterval(watcher);
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("pointermove", onActivity);
    };
  }, []);

  const poke = useCallback(() => {
    clear();
    lastActive.current = Date.now();
    setState("sneeze");
    later(1100, () => setState("awake"));
  }, []);

  return { state, poke };
}
