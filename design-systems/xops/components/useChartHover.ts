import { useRef, useState } from "react";

export type ChartHoverAnchor = { x: number; y: number };

const DEFAULT_DELAY = 200;

// Shared hover-delay state machine for chart tooltips (DonutChart, RankedBarChart, and
// future chart types): a short close delay lets the cursor travel from the hovered
// mark onto the tooltip panel (e.g. to click its action button) without the gap
// between them closing it first — cancelled by re-entering the mark or the panel.
// Same pattern as Tooltip.tsx's show/hide, generalized so charts don't hand-copy it.
export function useChartHover<T>(delay: number = DEFAULT_DELAY) {
  const [hovered, setHovered] = useState<T | null>(null);
  const [anchor, setAnchor] = useState<ChartHoverAnchor | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const show = (value: T, x: number, y: number) => {
    clearTimeout(hideTimeoutRef.current);
    setHovered(value);
    setAnchor({ x, y });
  };

  const cancelHide = () => clearTimeout(hideTimeoutRef.current);

  const hide = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setHovered(null);
      setAnchor(null);
    }, delay);
  };

  return { hovered, anchor, show, hide, cancelHide };
}

export default useChartHover;
