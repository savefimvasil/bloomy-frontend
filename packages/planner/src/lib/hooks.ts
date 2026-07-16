import { useEffect, useRef, useState } from "react";

/** Tracks the pixel dimensions of an element via ResizeObserver. */
export function useCanvasSize(ref: React.RefObject<HTMLElement | null>): { width: number; height: number } {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(el);
    setSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

/**
 * Runs `callback` after `delay` ms whenever `deps` change, skipping the
 * initial render. Returns a ref you can use to get the latest save status.
 */
export function useDebouncedEffect(
  callback: () => void | Promise<void>,
  deps: React.DependencyList,
  delay: number,
): void {
  const isFirst = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { void callback(); }, delay);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
