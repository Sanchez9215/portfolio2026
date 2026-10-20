"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Block from "@/components/Block";
import Label from "@/components/Label";
import { QUESTION_LABELS } from "./SoftwareSystemMap";
import { QUESTIONS_BY_CATEGORY, type RoleName } from "./questions-roles-prism-data";
import styles from "./QuestionsRolesPrism.module.css";

// ── Geometry — vertices copied from public/SVG/prism.svg (viewBox 818×714) ──
type Point = { x: number; y: number };
const VIEWBOX = { width: 818, height: 714 };

// Where each question starts, as a fraction of the way from its face's inner
// edge to its outer edge. The vanishing point is the outer edge's midpoint.
const START_FRACTION = 0.25;
// Where each role name sits along the same inner → outer line.
const ROLE_LABEL_FRACTION = 0.1;
// Question box width as a share of its face's bounding box.
const ITEM_WIDTH_PERCENT = 70;

// ── Motion (tunable by eye) ──
// Seconds for one question to travel from its face to the vanishing point.
const LOOP_SECONDS = 28;
// Screen scale at the end of the trip is 1 / (1 + DEPTH): 9 → 0.1.
const DEPTH = 9;
// Share of the trip used to fade a question in at the face (avoids a pop).
const FADE_IN_FRACTION = 0.06;
const HOVER_SCALE = 1.3;
const HOVER_DURATION = 0.3;
const CATEGORY_SWITCH_FADE = 0.3;

type Edge = [Point, Point];

interface FaceDefinition {
  role: RoleName;
  vertices: Point[];
  inner: Edge;
  outer: Edge;
}

const FACE_DEFINITIONS: FaceDefinition[] = [
  {
    role: "Financial Specialist",
    vertices: [
      { x: 473.314, y: 0.5 },
      { x: 570.514, y: 333.964 },
      { x: 241.468, y: 333.964 },
      { x: 327.062, y: 0.5 },
    ],
    inner: [
      { x: 241.468, y: 333.964 },
      { x: 570.514, y: 333.964 },
    ],
    outer: [
      { x: 327.062, y: 0.5 },
      { x: 473.314, y: 0.5 },
    ],
  },
  {
    role: "Software Asset Manager",
    vertices: [
      { x: 405.331, y: 620.105 },
      { x: 73.746, y: 712.712 },
      { x: 0.62, y: 586.054 },
      { x: 240.808, y: 335.145 },
    ],
    inner: [
      { x: 240.808, y: 335.145 },
      { x: 405.331, y: 620.105 },
    ],
    outer: [
      { x: 0.62, y: 586.054 },
      { x: 73.746, y: 712.712 },
    ],
  },
  {
    role: "IT Operations Manager",
    vertices: [
      { x: 817.197, y: 575.983 },
      { x: 744.07, y: 702.641 },
      { x: 406.684, y: 620.087 },
      { x: 571.206, y: 335.125 },
    ],
    inner: [
      { x: 571.206, y: 335.125 },
      { x: 406.684, y: 620.087 },
    ],
    outer: [
      { x: 817.197, y: 575.983 },
      { x: 744.07, y: 702.641 },
    ],
  },
];

const midpoint = (edge: Edge): Point => ({
  x: (edge[0].x + edge[1].x) / 2,
  y: (edge[0].y + edge[1].y) / 2,
});

const lerpPoint = (from: Point, to: Point, t: number): Point => ({
  x: from.x + (to.x - from.x) * t,
  y: from.y + (to.y - from.y) * t,
});

const toPercentX = (x: number) => `${(x / VIEWBOX.width) * 100}%`;
const toPercentY = (y: number) => `${(y / VIEWBOX.height) * 100}%`;

// Reading angle of the inner edge, kept in (-90°, 90°] so text never renders
// upside down.
const readingAngle = (edge: Edge): number => {
  let angle =
    (Math.atan2(edge[1].y - edge[0].y, edge[1].x - edge[0].x) * 180) / Math.PI;
  if (angle > 90) angle -= 180;
  if (angle <= -90) angle += 180;
  return angle;
};

const FACES = FACE_DEFINITIONS.map((face) => {
  const xs = face.vertices.map((vertex) => vertex.x);
  const ys = face.vertices.map((vertex) => vertex.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const boxWidth = Math.max(...xs) - minX;
  const boxHeight = Math.max(...ys) - minY;

  const innerMid = midpoint(face.inner);
  const vanishing = midpoint(face.outer);
  const start = lerpPoint(innerMid, vanishing, START_FRACTION);
  const roleLabel = lerpPoint(innerMid, vanishing, ROLE_LABEL_FRACTION);

  const angle = readingAngle(face.inner);

  return {
    role: face.role,
    angle,
    path: `M${face.vertices.map((v) => `${v.x} ${v.y}`).join("L")}Z`,
    laneStyle: {
      left: toPercentX(minX),
      top: toPercentY(minY),
      width: toPercentX(boxWidth),
      height: toPercentY(boxHeight),
    },
    start,
    vanishing,
    // Start position inside the lane box, as a share of the lane.
    startInLane: {
      left: `${((start.x - minX) / boxWidth) * 100}%`,
      top: `${((start.y - minY) / boxHeight) * 100}%`,
    },
    roleLabelStyle: {
      left: toPercentX(roleLabel.x),
      top: toPercentY(roleLabel.y),
      "--role-angle": `${angle}deg`,
    } as React.CSSProperties,
  };
});

interface FaceDriver {
  tween: gsap.core.Tween;
  hovered: boolean;
}

export default function QuestionsRolesPrism() {
  const rootRef = useRef<HTMLDivElement>(null);
  const prismRef = useRef<HTMLDivElement>(null);
  const laneRefs = useRef<(HTMLUListElement | null)[]>([]);
  const drivers = useRef<FaceDriver[]>([]);
  const syncRef = useRef<() => void>(() => {});
  const pinnedRef = useRef<{ faceIndex: number; item: HTMLElement } | null>(null);
  const lastPointerType = useRef("mouse");
  const isFirstCategory = useRef(true);
  const pxPerUnit = useRef(1);
  const visibleRef = useRef(true);
  const [activeCategory, setActiveCategory] = useState(0);

  // Observers live for the component's lifetime; the crawl itself is rebuilt
  // per category below (each category has its own question counts).
  useEffect(() => {
    const root = rootRef.current;
    const prism = prismRef.current;
    if (!root || !prism) return;

    // One uniform scale from SVG units to px — the prism's aspect ratio is
    // locked to the viewBox, so width alone is enough.
    pxPerUnit.current = prism.clientWidth / VIEWBOX.width;
    const resizeObserver = new ResizeObserver(() => {
      pxPerUnit.current = prism.clientWidth / VIEWBOX.width;
    });
    resizeObserver.observe(prism);

    // Pause everything while off-screen.
    syncRef.current = () => {
      drivers.current.forEach((driver) =>
        driver.tween.paused(!visibleRef.current || driver.hovered),
      );
    };
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      syncRef.current();
    });
    intersectionObserver.observe(root);

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  // A new category rebuilds every face's crawl with a quick fade-in.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    clearPinned();

    const ctx = gsap.context(() => {
      FACES.forEach((face, faceIndex) => {
        const lane = laneRefs.current[faceIndex];
        if (!lane) return;
        const items = Array.from(lane.querySelectorAll<HTMLElement>("li"));
        // Questions share their role label's angle (the face's inner-edge reading angle).
        gsap.set(items, { xPercent: -50, yPercent: -50, rotation: face.angle });

        const travelX = face.vanishing.x - face.start.x;
        const travelY = face.vanishing.y - face.start.y;
        const state = { progress: 0 };

        // Each question sits 1/N of a loop behind the previous one; wrap()
        // keeps the loop seamless.
        const render = () => {
          items.forEach((item, index) => {
            const u = gsap.utils.wrap(0, 1, state.progress + index / items.length);
            const scale = 1 / (1 + u * DEPTH);
            gsap.set(item, {
              x: travelX * pxPerUnit.current * (1 - scale),
              y: travelY * pxPerUnit.current * (1 - scale),
              scale,
              autoAlpha: (1 - u) * gsap.utils.clamp(0, 1, u / FADE_IN_FRACTION),
            });
          });
        };

        const tween = gsap.to(state, {
          progress: 1,
          duration: LOOP_SECONDS,
          ease: "none",
          repeat: -1,
          onUpdate: render,
        });
        render();
        drivers.current[faceIndex] = { tween, hovered: false };
      });
    }, root);
    syncRef.current();

    if (!isFirstCategory.current) {
      gsap.fromTo(
        laneRefs.current.filter(Boolean),
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: CATEGORY_SWITCH_FADE },
      );
    }
    isFirstCategory.current = false;

    return () => {
      gsap.killTweensOf(root.querySelectorAll("li > p"));
      ctx.revert();
      drivers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const setQuestionActive = (
    faceIndex: number,
    item: HTMLElement,
    active: boolean,
  ) => {
    const driver = drivers.current[faceIndex];
    if (driver) driver.hovered = active;
    syncRef.current();
    gsap.set(item, { zIndex: active ? 1 : 0 });
    gsap.to(item.querySelector("p"), {
      scale: active ? HOVER_SCALE : 1,
      duration: HOVER_DURATION,
      ease: "power2.out",
      overwrite: true,
    });
  };

  const clearPinned = () => {
    const pinned = pinnedRef.current;
    if (!pinned) return;
    setQuestionActive(pinned.faceIndex, pinned.item, false);
    pinnedRef.current = null;
  };

  const handleQuestionEnter =
    (faceIndex: number) => (event: React.PointerEvent<HTMLLIElement>) => {
      if (event.pointerType !== "mouse") return;
      setQuestionActive(faceIndex, event.currentTarget, true);
    };

  const handleQuestionLeave =
    (faceIndex: number) => (event: React.PointerEvent<HTMLLIElement>) => {
      if (event.pointerType !== "mouse") return;
      setQuestionActive(faceIndex, event.currentTarget, false);
    };

  // Touch has no hover: a tap pins the question enlarged and pauses its face;
  // tapping it again (or switching category) releases it.
  const handleQuestionClick =
    (faceIndex: number) => (event: React.MouseEvent<HTMLLIElement>) => {
      if (lastPointerType.current === "mouse") return;
      const item = event.currentTarget;
      const wasPinned = pinnedRef.current?.item === item;
      clearPinned();
      if (wasPinned) return;
      pinnedRef.current = { faceIndex, item };
      setQuestionActive(faceIndex, item, true);
    };

  return (
    <div ref={rootRef} className={styles.root}>
      <div ref={prismRef} className={styles.prism}>
        <svg
          className={styles.outline}
          viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
          aria-hidden="true"
        >
          {FACES.map((face) => (
            <path key={face.role} d={face.path} />
          ))}
        </svg>

        {FACES.map((face, faceIndex) => (
          <ul
            key={face.role}
            ref={(element) => {
              laneRefs.current[faceIndex] = element;
            }}
            className={styles.lane}
            style={face.laneStyle}
            aria-hidden="true"
          >
            {QUESTIONS_BY_CATEGORY[activeCategory][face.role].map((question) => (
              <li
                key={question}
                className={styles.question}
                style={{
                  ...face.startInLane,
                  width: `${ITEM_WIDTH_PERCENT}%`,
                }}
                onPointerDown={(event) => {
                  lastPointerType.current = event.pointerType;
                }}
                onPointerEnter={handleQuestionEnter(faceIndex)}
                onPointerLeave={handleQuestionLeave(faceIndex)}
                onClick={handleQuestionClick(faceIndex)}
              >
                <Block size="lg">{question}</Block>
              </li>
            ))}
          </ul>
        ))}

        {FACES.map((face) => (
          <span
            key={face.role}
            className={styles.roleLabel}
            style={face.roleLabelStyle}
          >
            <Label size="sm" color="secondary">
              {face.role}
            </Label>
          </span>
        ))}

        <div className={styles.categories}>
          {QUESTION_LABELS.map((label, index) => (
            <button
              key={label}
              type="button"
              className={styles.category}
              aria-pressed={index === activeCategory}
              onMouseEnter={() => setActiveCategory(index)}
              onFocus={() => setActiveCategory(index)}
              onClick={() => setActiveCategory(index)}
            >
              <Label size="xl" color={index === activeCategory ? "default" : "secondary"}>
                {label}
              </Label>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
