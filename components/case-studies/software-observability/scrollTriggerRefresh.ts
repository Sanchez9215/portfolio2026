import { ScrollTrigger } from "gsap/ScrollTrigger";

let timeoutId: ReturnType<typeof setTimeout> | null = null;

// Coalesces every section's own post-mount ScrollTrigger.refresh() call
// into a single one, fired shortly after the last section requests it.
// This page mounts ~10 sections at once, each measuring its own layout and
// calling refresh() in its mount effect — refresh() forces a full-page
// layout recalculation across every ScrollTrigger registered so far, so
// calling it once per section meant ~10 compounding synchronous reflows
// racing the intro's entrance animation on the main thread.
export function scheduleScrollTriggerRefresh() {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    timeoutId = null;
    ScrollTrigger.refresh();
  }, 50);
}
