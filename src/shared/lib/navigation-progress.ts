// The top progress bar listens for this event: navigations started in code
// (router.push/replace) announce themselves through `startNavigation()`;
// links and GET forms are detected by the bar itself.
export const NAVIGATION_START_EVENT = "dora:navigation-start";

/** Call right before router.push/replace so the bar shows the wait. */
export function startNavigation(): void {
  window.dispatchEvent(new Event(NAVIGATION_START_EVENT));
}
