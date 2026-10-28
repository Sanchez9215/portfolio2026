// Where the BridgeCards category label's left edge sits at rest (screen px), taken
// from the label's width as first measured — NOT from the live label. The live label
// changes with every category (different text width) and rides the arc with
// transforms, so aligning to it makes whatever follows it move during the scroll.
// The width is stored as a fraction of the cards' own native width, so it holds at
// any scale.
let widthRatio = 0;

export function restingLabelLeft(scope: HTMLElement): number | null {
  const header = scope.querySelector<HTMLElement>("[data-bridge-cards-header]");
  const pin = header?.parentElement;
  const label = header?.querySelector<HTMLElement>(":scope > div > span");
  if (!pin || !label || !pin.offsetWidth) return null;
  // offsetWidth is the layout width (unaffected by the arc ride's transforms).
  if (!widthRatio && label.offsetWidth) {
    widthRatio = label.offsetWidth / pin.offsetWidth;
  }
  if (!widthRatio) return null;
  const rect = pin.getBoundingClientRect();
  return rect.left + rect.width / 2 - (widthRatio * rect.width) / 2;
}
