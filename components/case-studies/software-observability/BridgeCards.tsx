"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Label from "@/components/Label";
import Block from "@/components/Block";
import Title from "@/components/Title";
import {
  QUESTIONS_BY_CATEGORY,
  type RoleName,
} from "./questions-roles-prism-data";
import { BRIDGE_TIP_VIEWPORT_POSITION } from "./bridgeScroll";
import { scheduleScrollTriggerRefresh } from "./scrollTriggerRefresh";
import styles from "./BridgeCards.module.css";

gsap.registerPlugin(Flip, ScrollTrigger);

// Figma node 2387:1003. The section pins when the snake's last elbow ends; as you
// scroll, the current category's cards fade out along the arc to the left and the
// next category's cards come in from the right, with the questions (and header)
// changing in between. Focus stays on the same role across categories.
// Clicking a background card swaps it with the focused (centre) card: the card
// slides into the centre and its questions resolve from crisp vector pixels to
// legible text, while the old focus pixelates away.
type QuestionSet = Record<RoleName, string[]>;

// Order: Own → Used → Cost → Compliant.
const CATEGORIES: { label: string; questions: QuestionSet }[] = [
  { label: "What do we own?", questions: QUESTIONS_BY_CATEGORY[0] },
  { label: "How is it used?", questions: QUESTIONS_BY_CATEGORY[1] },
  { label: "What does it cost?", questions: QUESTIONS_BY_CATEGORY[2] },
  { label: "Are we compliant?", questions: QUESTIONS_BY_CATEGORY[3] },
];

// Live-tweak. How far (degrees) the category label and diamond travel around the
// arc as they leave / arrive, and how many viewport heights of scroll each change
// takes.
const ARC_DEGREES = 30;
const SCROLL_VIEWPORTS_PER_CATEGORY = 1;
// How long each category holds still at the centre before the next change, as a
// fraction of one change's scroll length. Holds come before every change and
// after the last category.
const CATEGORY_HOLD = 0.5;

// Live-tweak. false = background cards show plain legible text (no pixel
// effect); true brings the pixelate/resolve effect back.
const PIXELATE_BACKGROUND_CARDS = false;
// Live-tweak. Pixel size (px) on background cards.
const PIXEL_TILE = 8;
// The swap: cards slide (FLIP, transforms only) with a strong ease-out. The
// incoming card starts resolving 30% into the move and eases out so it lands
// sharp; the outgoing card pixelates a beat after it starts moving.
const SWAP_SECONDS = 0.45;
const SWAP_EASE = "expo.out";
const RESOLVE_DELAY_SECONDS = SWAP_SECONDS * 0.3;
const RESOLVE_SECONDS = SWAP_SECONDS * 0.7;
const PIXELATE_DELAY_SECONDS = 0.1;
const PIXELATE_SECONDS = SWAP_SECONDS * 0.6;
// Hover lift / press feedback on background cards.
const PRESS_SECONDS = 0.2;
// How fast the question lists scroll up (px/second), on a seamless loop. First
// guess — roughly one question every 3 seconds at this type size.
const SCROLL_PX_PER_SECOND = 22;
// A tile turns on when this share of it is covered by text (0–1). Lower keeps
// more of the text.
const PIXEL_ON_COVERAGE = 0.25;
// Pixel sizes the list steps through while resolving, as fractions of PIXEL_TILE
// (so the mosaic visibly sharpens before the real text fades in).
const RESOLVE_STEPS = [1, 2 / 3, 1 / 3];

// Question type matches Block lg + the card's line-height and gap (BridgeCards.module.css).
const QUESTION_SIZE_PX = 18;
const QUESTION_LINE_HEIGHT = 1.2;

// Fixed render order (stable keys); the slot each card sits in comes from state.
const ROLES: RoleName[] = [
  "Financial Specialist",
  "Software Asset Manager",
  "IT Operations Manager",
];
// Slots: 0 = left, 1 = centre (focused), 2 = right. SAM starts focused.
const INITIAL_SLOTS: RoleName[] = [
  "Financial Specialist",
  "Software Asset Manager",
  "IT Operations Manager",
];
const SLOT_CLASS = ["left", "center", "right"] as const;

// Role descriptions are the Our Target copy; shown on the focused card only.
const DESCRIPTIONS: Record<RoleName, string> = {
  "Software Asset Manager":
    "Responsible for inventory, vendor compliance, and license optimization, and defending the organization during vendor audits.",
  "Financial Specialist":
    "Controls spend and budgets across departments and cost centers, pushes to ensure max return on investments.",
  "IT Operations Manager":
    "Deploys, maintains, and retires software, while providing the data SAM and Finance depend on.",
};

type PixelGrid = { width: number; height: number; paths: string[] };

// Rasterizes a role's question list the way a background card lays it out
// (side-card width and gap), then turns the coverage into one crisp vector path
// per pixel size: a rect for every run of "on" tiles. Crisp edges, no filters.
function buildPixelGrid(
  questions: string[],
  width: number,
  gap: number,
  font: { family: string; weight: string },
): PixelGrid {
  const lineHeight = QUESTION_SIZE_PX * QUESTION_LINE_HEIGHT;
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = `${font.weight} ${QUESTION_SIZE_PX}px ${font.family}`;

  // Wrap every question to the list width and stack them with the card's gap.
  const lines: { text: string; y: number }[] = [];
  let y = 0;
  questions.forEach((question, index) => {
    if (index > 0) y += gap;
    let line = "";
    question.split(" ").forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (line && measure.measureText(next).width > width) {
        lines.push({ text: line, y });
        y += lineHeight;
        line = word;
      } else {
        line = next;
      }
    });
    lines.push({ text: line, y });
    y += lineHeight;
  });
  const height = Math.ceil(y);

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width);
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.font = measure.font;
  ctx.fillStyle = "#000";
  ctx.textBaseline = "middle";
  lines.forEach(({ text, y: top }) =>
    ctx.fillText(text, 0, top + lineHeight / 2),
  );
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const paths = RESOLVE_STEPS.map((fraction) => {
    const tile = Math.max(1, Math.round(PIXEL_TILE * fraction));
    const columns = Math.ceil(canvas.width / tile);
    const rows = Math.ceil(height / tile);
    let d = "";
    for (let row = 0; row < rows; row++) {
      let runStart = -1;
      for (let column = 0; column <= columns; column++) {
        let on = false;
        if (column < columns) {
          let covered = 0;
          for (
            let py = row * tile;
            py < Math.min((row + 1) * tile, height);
            py++
          ) {
            for (
              let px = column * tile;
              px < Math.min((column + 1) * tile, canvas.width);
              px++
            ) {
              covered += data[(py * canvas.width + px) * 4 + 3];
            }
          }
          on = covered / (tile * tile * 255) >= PIXEL_ON_COVERAGE;
        }
        if (on && runStart < 0) runStart = column;
        if (!on && runStart >= 0) {
          d += `M${runStart * tile} ${row * tile}h${(column - runStart) * tile}v${tile}h${-(column - runStart) * tile}z`;
          runStart = -1;
        }
      }
    }
    return d;
  });

  return { width: canvas.width, height, paths };
}

export default function BridgeCards() {
  const [slots, setSlots] = useState<RoleName[]>(INITIAL_SLOTS);
  const focused = slots[1];

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Card positions captured just before a swap, for the FLIP in the layout effect.
  const flipState = useRef<Flip.FlipState | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Each list is rendered twice (a second, aria-hidden copy follows the first) so
  // the scroll loops seamlessly; index [role][copy].
  const listRefs = useRef<(HTMLUListElement | null)[][]>(ROLES.map(() => []));
  const svgRefs = useRef<(SVGSVGElement | null)[][]>(ROLES.map(() => []));
  const pathRefs = useRef<(SVGPathElement | null)[][]>(ROLES.map(() => []));
  // [category][role]
  const grids = useRef<(PixelGrid | null)[][]>(
    CATEGORIES.map(() => ROLES.map(() => null)),
  );
  const [category, setCategory] = useState(0);
  const categoryRef = useRef(0);
  const pinRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const fannedRef = useRef(false);
  const domeRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const diamondRef = useRef<HTMLSpanElement>(null);
  const leadRef = useRef<HTMLSpanElement>(null);
  const stemRef = useRef<HTMLSpanElement>(null);
  const exitRef = useRef<HTMLSpanElement>(null);
  // 1 = fully pixelated, 0 = sharp text. Background cards start at 1.
  const progress = useRef(
    ROLES.map((role) => ({ value: role === INITIAL_SLOTS[1] ? 0 : 1 })),
  );
  const [gridsReady, setGridsReady] = useState(false);

  // Build the pixel grids once fonts are ready, from a side card's real width.
  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const sideList = listRefs.current[0][0];
      if (!sideList) return;
      const paragraph = sideList.querySelector("p");
      if (!paragraph) return;
      const style = getComputedStyle(paragraph);
      const gap = parseFloat(getComputedStyle(sideList).rowGap) || 0;
      CATEGORIES.forEach((cat, categoryIndex) => {
        ROLES.forEach((role, index) => {
          grids.current[categoryIndex][index] = buildPixelGrid(
            cat.questions[role],
            sideList.clientWidth,
            gap,
            { family: style.fontFamily, weight: style.fontWeight },
          );
        });
      });
      setGridsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!gridsReady) return;
    const apply = (index: number) => {
      const t = PIXELATE_BACKGROUND_CARDS ? progress.current[index].value : 0;
      const grid = grids.current[category][index];
      if (!grid) return;
      // Step through the pixel sizes as it sharpens, then cross-fade to text.
      const step = Math.min(
        grid.paths.length - 1,
        Math.floor((1 - t) * grid.paths.length),
      );
      const fade = 1 / grid.paths.length;
      const svgOpacity = t >= fade ? 1 : t / fade;
      [0, 1].forEach((copy) => {
        const svg = svgRefs.current[index][copy];
        const path = pathRefs.current[index][copy];
        const list = listRefs.current[index][copy];
        if (!svg || !path || !list) return;
        path.setAttribute("d", grid.paths[step]);
        svg.style.opacity = String(svgOpacity);
        list.style.opacity = String(1 - svgOpacity);
      });
    };
    const tweens = ROLES.map((role, index) => {
      apply(index);
      if (!PIXELATE_BACKGROUND_CARDS) return gsap.to({}, { duration: 0 });
      const resolving = role === focused;
      return gsap.to(progress.current[index], {
        value: resolving ? 0 : 1,
        delay: resolving ? RESOLVE_DELAY_SECONDS : PIXELATE_DELAY_SECONDS,
        duration: resolving ? RESOLVE_SECONDS : PIXELATE_SECONDS,
        ease: resolving ? "power2.out" : "power2.in",
        onUpdate: () => apply(index),
      });
    });
    return () => tweens.forEach((tween) => tween.kill());
  }, [focused, gridsReady, category]);

  // Scroll every question list up on a seamless loop. Loop height (one copy plus
  // the gap) is re-measured whenever focus changes, since a card's width and gap
  // change with its slot. Paused while the section is off screen.
  useEffect(() => {
    if (!gridsReady) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const offsets = ROLES.map(() => 0);
    const loops = ROLES.map(() => 0);
    ROLES.forEach((_, index) => {
      const track = trackRefs.current[index];
      const copy = listRefs.current[index][0]?.parentElement;
      if (!track || !copy) return;
      loops[index] =
        copy.offsetHeight + (parseFloat(getComputedStyle(track).rowGap) || 0);
    });
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    if (stageRef.current) observer.observe(stageRef.current);
    const tick = (_time: number, deltaTime: number) => {
      if (!visible) return;
      ROLES.forEach((_role, index) => {
        const track = trackRefs.current[index];
        if (!track || !loops[index]) return;
        offsets[index] =
          (offsets[index] + (SCROLL_PX_PER_SECOND * deltaTime) / 1000) %
          loops[index];
        track.style.transform = `translateY(${-offsets[index]}px)`;
      });
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      observer.disconnect();
    };
  }, [focused, gridsReady, category]);

  // The cards fan out (CSS, keyed on data-fanned) while the pointer is inside
  // the arc's half-disc — not the dome's whole box, which is taller and wider
  // than the arc. Tested against the dome's own rect, so the cards' rotation
  // while changing category doesn't move the hover area.
  useEffect(() => {
    const dome = domeRef.current;
    const cards = cardsRef.current;
    if (!dome || !cards) return;
    const setFanned = (on: boolean) => {
      fannedRef.current = on;
      if (on) cards.setAttribute("data-fanned", "");
      else cards.removeAttribute("data-fanned");
    };
    const onMove = (event: PointerEvent) => {
      const rect = dome.getBoundingClientRect();
      const radius = rect.width / 2;
      const dx = event.clientX - rect.left - radius;
      const dy = event.clientY - rect.top - radius;
      // Half circle: centre at (radius, radius) below the arc's top, upper half.
      setFanned(dy <= 0 && dx * dx + dy * dy <= radius * radius);
    };
    const onLeave = () => setFanned(false);
    dome.addEventListener("pointermove", onMove);
    dome.addEventListener("pointerleave", onLeave);
    return () => {
      dome.removeEventListener("pointermove", onMove);
      dome.removeEventListener("pointerleave", onLeave);
      setFanned(false);
    };
  }, [gridsReady]);

  // Pin the section when the snake's last elbow ends (the stage's top then sits
  // at its own margin-top from the viewport top, so a short straight line shows
  // above the header) and drive the category switch from scroll.
  useEffect(() => {
    if (!gridsReady) return;
    const stage = stageRef.current;
    const pin = pinRef.current;
    const cards = cardsRef.current;
    const dome = domeRef.current;
    const header = headerRef.current;
    const label = labelRef.current;
    const diamond = diamondRef.current;
    const lead = leadRef.current;
    const stem = stemRef.current;
    const exit = exitRef.current;
    if (!stage || !pin || !cards || !dome || !header) return;
    if (!label || !diamond || !lead || !stem || !exit) return;

    const lastIndex = CATEGORIES.length - 1;
    // Scroll length in "units": one unit per change, plus a hold per category.
    const totalUnits = CATEGORIES.length * CATEGORY_HOLD + lastIndex;
    // Maps scroll units to p (0 → lastIndex): whole numbers are the holds.
    const toP = (units: number) => {
      let cursor = 0;
      for (let index = 0; index <= lastIndex; index++) {
        cursor += CATEGORY_HOLD;
        if (units <= cursor || index === lastIndex) return index;
        if (units <= cursor + 1) return index + (units - cursor);
        cursor += 1;
      }
      return lastIndex;
    };
    const smooth = (t: number) => t * t * (3 - 2 * t);

    const ctx = gsap.context(() => {
      const marginTop = parseFloat(getComputedStyle(stage).marginTop) || 0;

      // The header label and the diamond ride the arc: each is carried around the
      // arc's centre (the label on a concentric circle, tilted along the
      // tangent). Distances are measured once, before anything has moved: R is
      // the arc's radius, D how far above the arc's top the label sits.
      const arcRadius = dome.clientWidth / 2;
      const labelRect = label.getBoundingClientRect();
      const labelAbove =
        dome.getBoundingClientRect().top -
        (labelRect.top + labelRect.height / 2);
      gsap.set(diamond, { xPercent: -50, yPercent: -50, rotation: 45 });
      const rideArc = (radius: number, degrees: number) => {
        const angle = (degrees * Math.PI) / 180;
        return {
          x: radius * Math.sin(angle),
          y: radius * (1 - Math.cos(angle)),
          rotation: degrees,
        };
      };

      // p runs 0 → lastIndex. Each whole step: the first half carries the old
      // category's label out along the arc to the left, the second half brings
      // the next one in from the right. The questions swap at the midpoint
      // (fading through it); the cards themselves don't move.
      const render = (p: number) => {
        const step = Math.min(Math.floor(p), lastIndex - 1);
        const local = p - step;
        let next: number;
        let degrees: number;
        let opacity: number;
        if (local < 0.5) {
          const out = smooth(local / 0.5);
          next = step;
          degrees = -ARC_DEGREES * out;
          opacity = 1 - out;
        } else {
          const incoming = smooth((local - 0.5) / 0.5);
          next = step + 1;
          degrees = ARC_DEGREES * (1 - incoming);
          opacity = incoming;
        }
        if (categoryRef.current !== next) {
          categoryRef.current = next;
          setCategory(next);
        }
        gsap.set(label, {
          ...rideArc(arcRadius + labelAbove, degrees),
          opacity,
        });
        const ride = rideArc(arcRadius, degrees);
        gsap.set(diamond, {
          x: ride.x,
          y: ride.y,
          rotation: 45 + degrees,
          opacity,
        });
        gsap.set(cards.querySelectorAll(`.${styles.questionsWindow}`), {
          opacity,
        });
      };

      ScrollTrigger.create({
        trigger: pin,
        start: () => `top ${marginTop}px`,
        end: () =>
          `+=${totalUnits * SCROLL_VIEWPORTS_PER_CATEGORY * window.innerHeight}`,
        pin: true,
        // Explicit: ScrollTrigger switches spacing off by itself when a pin's
        // parent is a flex container, which let the content below ride up over
        // the pinned section. refreshPriority: this pin sits above triggers that
        // were created earlier, so it must be measured first.
        pinSpacing: true,
        refreshPriority: 1,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => render(toP(self.progress * totalUnits)),
      });

      // The straight line above the header and the stem below it draw with the
      // page line (same tip point), finishing before the pin starts.
      const gap = parseFloat(getComputedStyle(stem).top) - header.offsetHeight;
      const leadLength = lead.offsetHeight;
      const stemLength = stem.offsetHeight;
      const draw = gsap.timeline({
        defaults: { ease: "none", transformOrigin: "top" },
        scrollTrigger: {
          trigger: stage,
          start: () => `top-=${marginTop} ${BRIDGE_TIP_VIEWPORT_POSITION}`,
          end: () =>
            `top+=${header.offsetHeight + gap + stemLength} ${BRIDGE_TIP_VIEWPORT_POSITION}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      draw
        .fromTo(lead, { scaleY: 0 }, { scaleY: 1, duration: leadLength })
        .fromTo(
          stem,
          { scaleY: 0 },
          { scaleY: 1, duration: stemLength },
          leadLength + header.offsetHeight + gap * 2,
        );

      // Exit line: leaves the centre of the focused card's bottom edge (the
      // dome's bottom) and runs to this section's bottom edge, where the
      // Insights & Goals spine picks up. Drawn with the same tip point once the
      // pin has released (the stage's bottom is then the dome's bottom).
      const section = stage.closest("section");
      const sizeExit = () => {
        if (!section) return 0;
        const length =
          section.getBoundingClientRect().bottom -
          stage.getBoundingClientRect().bottom;
        exit.style.height = `${length}px`;
        return length;
      };
      sizeExit();
      gsap.fromTo(
        exit,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top",
          scrollTrigger: {
            trigger: stage,
            start: () => `bottom ${BRIDGE_TIP_VIEWPORT_POSITION}`,
            end: () => `bottom+=${sizeExit()} ${BRIDGE_TIP_VIEWPORT_POSITION}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    }, stage);
    // The pin adds scroll length below this section, so re-measure the page.
    scheduleScrollTriggerRefresh();
    return () => ctx.revert();
  }, [gridsReady]);

  // Slide every card from where it was to its new slot with transforms only (no
  // layout animation, so the text never re-wraps mid-move). The 4:3 card sizes
  // scale uniformly, so nothing stretches.
  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state) return;
    flipState.current = null;
    Flip.from(state, {
      duration: SWAP_SECONDS,
      ease: SWAP_EASE,
      scale: true,
      overwrite: true,
    });
    const cards = cardsRef.current;
    if (cards) {
      cards.style.removeProperty("--fan-duration");
      if (fannedRef.current) cards.setAttribute("data-fanned", "");
    }
  }, [slots]);

  const focus = (role: RoleName) => {
    const slot = slots.indexOf(role);
    if (slot === 1) return;
    // Measure the cards un-fanned (no tilt/lift, no transition) so the swap's
    // transforms don't inherit the fan's rotation; the fan is restored once the
    // swap has been set up (see the layout effect below).
    const cards = cardsRef.current;
    if (cards) {
      cards.style.setProperty("--fan-duration", "0s");
      cards.removeAttribute("data-fanned");
      void cards.offsetHeight;
    }
    flipState.current = Flip.getState(
      cardRefs.current.filter((el): el is HTMLDivElement => el !== null),
    );
    const next = [...slots];
    [next[slot], next[1]] = [next[1], next[slot]];
    setSlots(next);
  };

  return (
    <div className={styles.stage} ref={stageRef}>
      <div className={styles.pin} ref={pinRef}>
        <div
          className={styles.header}
          data-bridge-cards-header="true"
          ref={headerRef}
        >
          <span className={styles.lead} ref={leadRef} aria-hidden="true" />
          <div ref={labelRef}>
            <Label size="xl">{CATEGORIES[category].label}</Label>
          </div>
          <span className={styles.stem} ref={stemRef} aria-hidden="true" />
        </div>
        <div className={styles.dome} ref={domeRef}>
          <span
            className={styles.diamond}
            ref={diamondRef}
            aria-hidden="true"
          />
          <div className={styles.cards} ref={cardsRef}>
            {ROLES.map((role, index) => {
              const slot = slots.indexOf(role);
              const isFocused = slot === 1;
              const grid = grids.current[category][index];
              return (
                <div
                  key={role}
                  className={`${styles.card} ${styles[SLOT_CLASS[slot]]}`}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  style={
                    {
                      "--swap-seconds": `${SWAP_SECONDS}s`,
                      "--press-seconds": `${PRESS_SECONDS}s`,
                    } as React.CSSProperties
                  }
                  role={isFocused ? undefined : "button"}
                  tabIndex={isFocused ? undefined : 0}
                  aria-label={isFocused ? undefined : `Focus ${role}`}
                  onClick={() => focus(role)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      focus(role);
                    }
                  }}
                >
                  <div className={styles.cardHeader}>
                    <Title
                      className={styles.roleTitle}
                      size={isFocused ? "lg" : "sm"}
                      color="primary"
                    >
                      {role}
                    </Title>
                    <div
                      className={`${styles.description}${isFocused ? ` ${styles.descriptionOpen}` : ""}`}
                      aria-hidden={!isFocused}
                    >
                      <div>
                        <Block size="lg">{DESCRIPTIONS[role]}</Block>
                      </div>
                    </div>
                  </div>
                  <div className={styles.questionsWindow}>
                    <div
                      className={styles.track}
                      ref={(el) => {
                        trackRefs.current[index] = el;
                      }}
                    >
                      {[0, 1].map((copy) => (
                        <div
                          key={copy}
                          className={styles.copy}
                          aria-hidden={copy === 1 ? true : undefined}
                        >
                          <ul
                            className={styles.questions}
                            ref={(el) => {
                              listRefs.current[index][copy] = el;
                            }}
                          >
                            {CATEGORIES[category].questions[role].map(
                              (question) => (
                                <li key={question}>
                                  <Block size={isFocused ? "lg" : "xs"}>{question}</Block>
                                </li>
                              ),
                            )}
                          </ul>
                          <svg
                            className={styles.pixels}
                            ref={(el) => {
                              svgRefs.current[index][copy] = el;
                            }}
                            width={grid?.width}
                            height={grid?.height}
                            shapeRendering="crispEdges"
                            aria-hidden="true"
                          >
                            <path
                              ref={(el) => {
                                pathRefs.current[index][copy] = el;
                              }}
                            />
                          </svg>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <span className={styles.exit} ref={exitRef} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
