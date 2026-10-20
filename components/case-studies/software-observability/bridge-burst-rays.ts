// The 31 burst rays as [x1, y1, x2, y2] in the 1248 × 1066 burst space, in
// clockwise order starting at the top ray. Centre lines of the Figma burst's
// outlined rays (public/SVG/burst-lines.svg); each ray is stroked individually
// so BridgeOpener can light them one by one.
export const BURST_VIEWBOX = { width: 1248, height: 1066 };
export const BURST_RAY_STROKE_WIDTH = 0.93;

const FULL_BURST_RAYS: [number, number, number, number][] = [
  [624.000, 0.000, 624.000, 297.143],
  [675.131, 301.168, 721.614, 7.683],
  [816.827, 30.541, 725.005, 313.140],
  [772.390, 332.769, 907.290, 68.013],
  [816.121, 359.567, 990.778, 119.173],
  [1065.235, 182.766, 855.123, 392.877],
  [888.432, 431.879, 1128.825, 257.222],
  [1179.990, 340.709, 915.232, 475.610],
  [1217.460, 431.173, 934.861, 522.995],
  [946.832, 572.869, 1240.315, 526.386],
  [1248.000, 624.000, 950.857, 624.000],
  [1240.320, 721.614, 946.833, 675.131],
  [934.859, 725.005, 1217.455, 816.827],
  [1179.990, 907.289, 915.233, 772.389],
  [888.433, 816.121, 1128.825, 990.778],
  [1065.235, 1065.235, 855.122, 855.123],
  [182.766, 1065.235, 392.877, 855.122],
  [359.568, 816.121, 119.174, 990.778],
  [68.012, 907.289, 332.768, 772.389],
  [313.139, 725.005, 30.540, 816.827],
  [301.168, 675.131, 7.683, 721.614],
  [0.000, 624.000, 297.143, 624.000],
  [301.166, 572.869, 7.682, 526.386],
  [30.542, 431.173, 313.142, 522.995],
  [332.768, 475.611, 68.012, 340.711],
  [359.567, 431.879, 119.173, 257.222],
  [182.766, 182.766, 392.877, 392.877],
  [257.224, 119.173, 431.880, 359.567],
  [340.711, 68.012, 475.611, 332.768],
  [522.996, 313.140, 431.174, 30.541],
  [572.868, 301.166, 526.385, 7.682],
];

// Drawn length of every ray (viewbox px), kept from its inner end — the outer end
// is cut. Rays already shorter than this are left as they are.
const BURST_RAY_LENGTH = 64;
const BURST_CENTRE = { x: 624, y: 624 };

// The outer end is whichever end is farther from the centre (the data alternates
// which end comes first).
export const BURST_RAYS: [number, number, number, number][] = FULL_BURST_RAYS.map(
  ([x1, y1, x2, y2]) => {
    const distance = (x: number, y: number) =>
      Math.hypot(x - BURST_CENTRE.x, y - BURST_CENTRE.y);
    const outerIsFirst = distance(x1, y1) > distance(x2, y2);
    const [ox, oy, ix, iy] = outerIsFirst ? [x1, y1, x2, y2] : [x2, y2, x1, y1];
    const length = Math.hypot(ox - ix, oy - iy);
    const keep = Math.min(length, BURST_RAY_LENGTH) / length;
    const tx = ix + (ox - ix) * keep;
    const ty = iy + (oy - iy) * keep;
    return outerIsFirst ? [tx, ty, ix, iy] : [ix, iy, tx, ty];
  },
);
