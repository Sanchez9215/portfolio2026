import styles from "./SquareGrid.module.css";

// Live-tweak: how many small squares make up each side of the big square
// (squares × squares in total), the big square's side in px, and the overall
// usage (percent of licenses in use — the rest are unused).
const SQUARES_PER_SIDE = 20;
const SQUARE_SIZE_PX = 300;
const USAGE_PERCENT = 60;
// Fixed seed so the pattern is identical on the server and client, every load.
const SEED = 7;

// Small seeded random number generator (mulberry32) — deterministic, no
// hydration mismatch.
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Which squares are unused: a seeded scatter where (100 − usage)% are unused.
function unusedFlags(count: number, usagePercent: number) {
  const random = seededRandom(SEED);
  const unusedShare = 1 - Math.min(Math.max(usagePercent, 0), 100) / 100;
  return Array.from({ length: count }, () => random() < unusedShare);
}

// A square composed of smaller outlined squares. Each small square is a license:
// in use (stays surface-black) or unused (marked data-unused). UsageBeamReveal
// animates the entrance and, when the beam hits, turns the unused ones solid
// red. Fixed size for now.
export default function SquareGrid({
  squares = SQUARES_PER_SIDE,
  size = SQUARE_SIZE_PX,
  usage = USAGE_PERCENT,
  className,
}: {
  squares?: number;
  size?: number;
  usage?: number;
  className?: string;
}) {
  const unused = unusedFlags(squares * squares, usage);
  return (
    <div
      className={`${styles.grid}${className ? ` ${className}` : ""}`}
      style={
        { "--squares": squares, "--side": `${size}px` } as React.CSSProperties
      }
      aria-hidden="true"
    >
      {unused.map((isUnused, index) => (
        <span
          key={index}
          className={styles.square}
          data-unused={isUnused ? "true" : undefined}
        />
      ))}
    </div>
  );
}
