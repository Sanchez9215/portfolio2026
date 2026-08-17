"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Label from "@/components/Label";
import DataGlossaryTable, {
  glossaryColumns,
  glossaryRows,
} from "@/components/case-studies/software-observability/DataGlossaryTable";
import styles from "./DataDictionaryScene.module.css";
import { scheduleScrollTriggerRefresh } from "./scrollTriggerRefresh";

gsap.registerPlugin(ScrollTrigger);

// How long (px) the phase-2 structural build (header wipes → divider draws
// → cell text) takes to complete, starting the instant the scene pins.
const PHASE2_BUILD_LENGTH = 900;
// How long (px), once phase 2's scaffold finishes, the scaffold takes to
// shrink into the real table's actual corner dimensions — text, column
// widths, and row heights all reduce together to match the real
// DataGlossaryTable's own measured geometry (not a crossfade to a second,
// separate table element).
const PHASE3_TRANSITION_LENGTH = 500;
// How long (px), once the corner has settled, columns 4–6 take to wipe in
// one by one (like phase 2), growing the table back out to full width.
const PHASE4_BUILD_LENGTH = 700;

const COLUMN_COUNT = 6;

// All timeline positions/durations below are in the SAME unit as RUNWAY
// (raw scroll px) — not normalized 0–1 fractions. A scrubbed ScrollTrigger
// maps scroll progress to timeline progress (0 → tl.duration()), so mixing
// units (e.g. a 0–1 fraction alongside a small arbitrary "seconds" value)
// desyncs the two scales. Matches TheProblemPinnedScene's convention of
// using its px constants directly as timeline position/duration values.
//
// Each column's own beats (header wipe → divider draw → text fade) run
// sequentially, and each column only starts once the previous one has
// fully completed. The 3 columns' total must fit within PHASE2_BUILD_LENGTH.
const HEADER_WIPE_DURATION = 120;
const DIVIDER_DRAW_DURATION = 120;
const CELL_TEXT_FADE_DURATION = 90;
// Phase 3: how long the shrink-to-corner takes (text scale, column widths,
// row heights all tween together) — within PHASE3_TRANSITION_LENGTH.
const SHRINK_DURATION = 450;
// Phase 4: each of columns 4–6 grows the table width + wipes its header fill
// + draws its left divider — sequentially, same pattern as phase 2.
const COLUMN_GROW_DURATION = 150;
// Phase 5: the old scaffold content (header label + 3 diagonal statements)
// fades up out of sight; the table grows however many more real, measured
// rows fit in one viewport; then each column's real header label + those
// row values fade up top to bottom, one column fully finishing before the
// next starts. Once the pin releases, the remaining rows (that didn't fit)
// continue below in normal scroll — no entrance animation, since they're
// only reachable already scrolled into place.
const PHASE5_FADE_OUT_DURATION = 150;
const PHASE5_ROW_GROW_DURATION = 300;
const CONTENT_ITEM_DURATION = 40;

// Explicitly authored (not auto-wrapped) — same reasoning as
// TheProblemPinnedScene's PROBLEM_BODY_LINES: this cell's width changes
// continuously via scrub, so a layout-detected wrap would measure a stale
// width mid-animation.
const STATEMENT_CELL1_LINES = ["To align on terminology", "and concepts..."];
const STATEMENT_CELL2_LINES = [
  "I always paired the latest",
  "prototype with a living",
  "document...",
];
const STATEMENT_CELL3_LINES = [
  "...covering definitions,",
  "calculations and intent",
  "behind each data point.",
];

// Fixed row heights (px) — sum defines the table/divider-SVG height. Static
// (not measured) since grid-template-rows below hardcodes the same values.
// Each row height = its tallest cell's real content: N lines at
// --text-body-display-sm-lh (1.2 x 40px font) + .oldStatement's own padding
// (--spacing-lg x2) + .bodyCell's padding (--spacing-md x2). Row 2 (col 1,
// 2 lines) = 2x48 + 48 + 32 = 176. Rows 3/4 (col 2/3, 3 lines each) =
// 3x48 + 48 + 32 = 224.
const TABLE_HEIGHT = 64 + 176 + 224 + 224;
// Column 1's fixed width — matches grid-template-columns below. Columns 2/3
// split the remainder evenly (1fr 1fr), so their shared boundary is measured
// at mount from the table's real rendered width.
const COL1_WIDTH = 437;

export default function DataDictionaryScene({
  className,
}: {
  className?: string;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tableWrapRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const headerFill1Ref = useRef<HTMLDivElement>(null);
  const headerFill2Ref = useRef<HTMLDivElement>(null);
  const headerFill3Ref = useRef<HTMLDivElement>(null);
  const headerFill4Ref = useRef<HTMLDivElement>(null);
  const headerFill5Ref = useRef<HTMLDivElement>(null);
  const headerFill6Ref = useRef<HTMLDivElement>(null);
  const divider1Ref = useRef<SVGLineElement>(null);
  const divider2Ref = useRef<SVGLineElement>(null);
  const divider3Ref = useRef<SVGLineElement>(null);
  const divider4Ref = useRef<SVGLineElement>(null);
  const divider5Ref = useRef<SVGLineElement>(null);
  const statementCell1Ref = useRef<HTMLDivElement>(null);
  const statementCell2Ref = useRef<HTMLParagraphElement>(null);
  const statementCell3Ref = useRef<HTMLParagraphElement>(null);
  const headerLabelRef = useRef<HTMLSpanElement>(null);
  // Real DataGlossaryTable mounted invisibly (opacity:0, out of flow) purely
  // to measure its actual rendered header/row/column dimensions at this
  // viewport width — the scaffold shrinks/grows to match these exactly.
  const measureRef = useRef<HTMLDivElement>(null);
  // Phase 5's incoming real content — 6 header labels, N×6 body-cell values.
  const realHeaderLabelRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const realBodyCellRefs = useRef<Array<HTMLParagraphElement | null>>([]);

  // How many of the real 20 rows fit in one viewport — measured, not
  // guessed. Null until measured; nothing body-row-related renders before
  // then, since we don't yet know how many cells/refs to create.
  const [visibleRowCount, setVisibleRowCount] = useState<number | null>(null);

  // Phase A: measure how many real rows fit in one viewport (100vh minus
  // nav clearance minus the header row's own height), using the always-
  // mounted hidden measureEl. Runs once; visibleRowCount then drives the
  // second render pass that creates the actual animated row cells.
  useEffect(() => {
    const measureEl = measureRef.current;
    if (!measureEl) return;

    const realRows = Array.from(
      measureEl.querySelectorAll<HTMLElement>('[role="row"]'),
    );
    const realHeaderRow = realRows[0];
    const realBodyRows = realRows.slice(1);
    const headerHeight = realHeaderRow.getBoundingClientRect().height;
    const navHeightPx =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--nav-height",
        ),
      ) || 80;
    const availableHeight = window.innerHeight - navHeightPx - headerHeight;

    let cumulative = 0;
    let count = 0;
    for (const row of realBodyRows) {
      const rowHeight = row.getBoundingClientRect().height;
      if (cumulative + rowHeight > availableHeight) break;
      cumulative += rowHeight;
      count++;
    }

    setVisibleRowCount(Math.min(Math.max(count, 3), glossaryRows.length));
  }, []);

  const visibleRows =
    visibleRowCount !== null ? glossaryRows.slice(0, visibleRowCount) : [];

  useEffect(() => {
    if (visibleRowCount === null) return;

    const sceneEl = sceneRef.current;
    const stageEl = stageRef.current;
    const tableWrapEl = tableWrapRef.current;
    const tableEl = tableRef.current;
    const headerFill1El = headerFill1Ref.current;
    const headerFill2El = headerFill2Ref.current;
    const headerFill3El = headerFill3Ref.current;
    const headerFill4El = headerFill4Ref.current;
    const headerFill5El = headerFill5Ref.current;
    const headerFill6El = headerFill6Ref.current;
    const divider1El = divider1Ref.current;
    const divider2El = divider2Ref.current;
    const divider3El = divider3Ref.current;
    const divider4El = divider4Ref.current;
    const divider5El = divider5Ref.current;
    const statementCell1El = statementCell1Ref.current;
    const statementCell2El = statementCell2Ref.current;
    const statementCell3El = statementCell3Ref.current;
    const headerLabelEl = headerLabelRef.current;
    const measureEl = measureRef.current;
    const realHeaderLabelEls = realHeaderLabelRefs.current;
    const realBodyCellEls = realBodyCellRefs.current;
    if (
      !sceneEl ||
      !stageEl ||
      !tableWrapEl ||
      !tableEl ||
      !headerFill1El ||
      !headerFill2El ||
      !headerFill3El ||
      !headerFill4El ||
      !headerFill5El ||
      !headerFill6El ||
      !divider1El ||
      !divider2El ||
      !divider3El ||
      !divider4El ||
      !divider5El ||
      !statementCell1El ||
      !statementCell2El ||
      !statementCell3El ||
      !headerLabelEl ||
      !measureEl ||
      realHeaderLabelEls.length !== COLUMN_COUNT ||
      realHeaderLabelEls.some((el) => !el) ||
      realBodyCellEls.length !== visibleRowCount * COLUMN_COUNT ||
      realBodyCellEls.some((el) => !el)
    )
      return;

    const PHASE5_CONTENT_LENGTH =
      COLUMN_COUNT * (1 + visibleRowCount) * CONTENT_ITEM_DURATION;
    const PHASE5_LENGTH =
      PHASE5_FADE_OUT_DURATION + PHASE5_ROW_GROW_DURATION + PHASE5_CONTENT_LENGTH;
    const RUNWAY =
      PHASE2_BUILD_LENGTH + PHASE3_TRANSITION_LENGTH + PHASE4_BUILD_LENGTH + PHASE5_LENGTH;

    sceneEl.style.height = `calc(100vh + ${RUNWAY}px)`;

    const ctx = gsap.context(() => {
      const tableWidth = tableEl.getBoundingClientRect().width;
      const remainingWidth = tableWidth - COL1_WIDTH;
      const col2Width = remainingWidth / 2;
      const dividerX1 = COL1_WIDTH;
      const dividerX2 = COL1_WIDTH + col2Width;

      gsap.set(divider1El, { attr: { x1: dividerX1, x2: dividerX1, y1: 0, y2: TABLE_HEIGHT } });
      gsap.set(divider2El, { attr: { x1: dividerX2, x2: dividerX2, y1: 0, y2: TABLE_HEIGHT } });
      gsap.set([divider1El, divider2El], {
        strokeDasharray: TABLE_HEIGHT,
        strokeDashoffset: TABLE_HEIGHT,
      });

      gsap.set(
        [
          headerFill1El,
          headerFill2El,
          headerFill3El,
          headerFill4El,
          headerFill5El,
          headerFill6El,
        ],
        { scaleY: 0, transformOrigin: "top" },
      );
      gsap.set([statementCell1El, statementCell2El, statementCell3El], {
        opacity: 0,
        y: 12,
      });
      gsap.set(realHeaderLabelEls, { opacity: 0, y: 12 });
      gsap.set(realBodyCellEls, { opacity: 0, y: 12 });

      // Resolve the real table's body-sm type scale from the token itself
      // (not hardcoded px) so the shrink target always tracks globals.css.
      const rootStyle = getComputedStyle(document.documentElement);
      const bodySmSize = rootStyle.getPropertyValue("--text-body-sm-size").trim();
      const bodySmLh = rootStyle.getPropertyValue("--text-body-sm-lh").trim();
      // The real table's header cells use heading-xs, not body-sm.
      const headingXsSize = rootStyle
        .getPropertyValue("--text-heading-xs-size")
        .trim();
      const headingXsLh = rootStyle.getPropertyValue("--text-heading-xs-lh").trim();
      const headingXsLetterSpacing = rootStyle
        .getPropertyValue("--text-heading-xs-ls")
        .trim();

      // Measure the real, hidden DataGlossaryTable's actual rendered corner
      // — header row height, first N body-row heights, and all 6 header
      // cells' widths — at this viewport width, so the scaffold shrinks/
      // grows to its real target geometry instead of a guessed value.
      const realRows = Array.from(
        measureEl.querySelectorAll<HTMLElement>('[role="row"]'),
      );
      const realHeaderRow = realRows[0];
      const realBodyRows = realRows.slice(1, 1 + visibleRowCount);
      const realHeaderCells = Array.from(
        realHeaderRow.querySelectorAll<HTMLElement>('[role="columnheader"]'),
      );
      const realColWidths = realHeaderCells.map(
        (el) => el.getBoundingClientRect().width,
      );
      const cornerColWidths = realColWidths.slice(0, 3);
      const remainingColWidths = realColWidths.slice(3, 6);

      // Column 1's shrink target isn't the real table's measured column —
      // this diagonal placeholder statement is decorative, different text
      // entirely from the real cell content. Its 2 lines are explicitly
      // authored (STATEMENT_CELL1_LINES, not auto-wrapped — same reasoning
      // as TheProblemPinnedScene's PROBLEM_BODY_LINES: a width that changes
      // continuously via scrub makes layout-detected wraps measure a stale
      // width). Size the column to the wider of the 2 real authored lines
      // (plus the cell's own padding) so it always hugs them exactly, never
      // clipping or leaving excess space.
      const probeEl = document.createElement("span");
      probeEl.style.position = "absolute";
      probeEl.style.visibility = "hidden";
      probeEl.style.whiteSpace = "nowrap";
      probeEl.style.fontFamily = getComputedStyle(statementCell1El).fontFamily;
      probeEl.style.fontWeight = getComputedStyle(statementCell1El).fontWeight;
      probeEl.style.fontSize = bodySmSize;
      probeEl.style.lineHeight = bodySmLh;
      document.body.appendChild(probeEl);
      const lineWidths = STATEMENT_CELL1_LINES.map((line) => {
        probeEl.textContent = line;
        return probeEl.getBoundingClientRect().width;
      });
      const widestStatementLine = Math.max(...lineWidths);
      const rootStyleForSpacing = getComputedStyle(document.documentElement);
      const bodyCellPaddingX =
        2 * parseFloat(rootStyleForSpacing.getPropertyValue("--spacing-md"));
      const statementRequiredWidth = Math.ceil(widestStatementLine) + bodyCellPaddingX;

      // The header label ("The Data Dictionary" → "Data Point") must also
      // fit without clipping — measure it at its own target style (heading-xs,
      // uppercase, the header's own wider horizontal padding) and use
      // whichever of the two (header label vs. statement lines) is wider.
      const headerLabelStyle = getComputedStyle(headerLabelEl);
      probeEl.style.fontFamily = headerLabelStyle.fontFamily;
      probeEl.style.fontWeight = headerLabelStyle.fontWeight;
      probeEl.style.textTransform = headerLabelStyle.textTransform;
      probeEl.style.letterSpacing = headingXsLetterSpacing;
      probeEl.style.fontSize = headingXsSize;
      probeEl.style.lineHeight = headingXsLh;
      probeEl.textContent = headerLabelEl.textContent ?? "";
      const headerLabelWidth = probeEl.getBoundingClientRect().width;
      probeEl.remove();
      const headerCellPaddingX =
        2 * parseFloat(rootStyleForSpacing.getPropertyValue("--spacing-lg"));
      const headerRequiredWidth = Math.ceil(headerLabelWidth) + headerCellPaddingX;

      cornerColWidths[0] = Math.max(statementRequiredWidth, headerRequiredWidth);
      const allRowHeights = [
        realHeaderRow.getBoundingClientRect().height,
        ...realBodyRows.map((el) => el.getBoundingClientRect().height),
      ];
      const cornerRowHeights = allRowHeights.slice(0, 4);
      const cornerHeight = cornerRowHeights.reduce((a, b) => a + b, 0);
      const cornerRowsCss = cornerRowHeights.map((h) => `${h}px`).join(" ");
      const extraRowsCount = allRowHeights.length - 4;
      const fullRowsCss = `${allRowHeights.map((h) => `${h}px`).join(" ")}`;

      // End state: rather than continuing into a second table for the rows
      // that didn't fit, the bottom 3 (real, measured) rows fade into the
      // section background — implying the table continues beyond what's
      // shown, without actually rendering/animating more rows.
      const totalTableHeight = allRowHeights.reduce((a, b) => a + b, 0);
      const bottomThreeHeight = allRowHeights.slice(-3).reduce((a, b) => a + b, 0);
      const fadeStartPercent =
        ((totalTableHeight - bottomThreeHeight) / totalTableHeight) * 100;
      const fadeMaskImage = `linear-gradient(to bottom, black 0%, black ${fadeStartPercent}%, transparent 100%)`;

      // Dividers 3–5 only draw in during phase 4, by which point the table
      // has already shrunk to cornerHeight (phase 3) — target that, not the
      // scaffold's original pre-shrink TABLE_HEIGHT, or they'd extend past
      // the table's actual (now much shorter) bottom edge.
      gsap.set([divider3El, divider4El, divider5El], {
        attr: { x1: tableWidth, x2: tableWidth, y1: 0, y2: cornerHeight },
        strokeDasharray: cornerHeight,
        strokeDashoffset: cornerHeight,
      });

      // Scaffold's current geometry, resolved to explicit px (matching what's
      // already visually rendered) so the shrink tween has a same-unit start
      // — grid-template-columns mixes "437px 1fr 1fr" otherwise, which GSAP
      // can't interpolate against a target px string. Columns 4–6 start at
      // 0 width — present in the DOM, invisible, grown in during phase 4.
      // The extra rows beyond the initial 4 start at 0 height, grown in
      // phase 5.
      gsap.set(tableEl, {
        width: tableWidth,
        gridTemplateColumns: `${COL1_WIDTH}px ${col2Width}px ${col2Width}px 0px 0px 0px`,
        gridTemplateRows: `64px 176px 224px 224px ${Array(extraRowsCount).fill("0px").join(" ")}`,
      });

      void sceneEl.offsetHeight;
      scheduleScrollTriggerRefresh();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sceneEl,
          start: "top top",
          end: `+=${RUNWAY}`,
          scrub: true,
        },
      });

      // All positions below are raw px along RUNWAY (see constants above).
      const phase2Start = 0;
      const phase3Start = phase2Start + PHASE2_BUILD_LENGTH;
      const phase4Start = phase3Start + PHASE3_TRANSITION_LENGTH;
      const phase5Start = phase4Start + PHASE4_BUILD_LENGTH;

      // Phase 2: one column completes fully — header fill wipe, then (for
      // columns 2/3) the divider bordering its left edge draws in, then its
      // statement fades in — before the next column starts. Sequential, not
      // overlapping: each .to() with no position arg inserts right after the
      // previous one ends.
      tl.addLabel("col1", phase2Start)
        .to(headerFill1El, {
          scaleY: 1,
          duration: HEADER_WIPE_DURATION,
          ease: "none",
        })
        .to(statementCell1El, {
          opacity: 1,
          y: 0,
          duration: CELL_TEXT_FADE_DURATION,
          ease: "none",
        })
        .addLabel("col2")
        .to(headerFill2El, {
          scaleY: 1,
          duration: HEADER_WIPE_DURATION,
          ease: "none",
        })
        .to(divider1El, {
          strokeDashoffset: 0,
          duration: DIVIDER_DRAW_DURATION,
          ease: "none",
        })
        .to(statementCell2El, {
          opacity: 1,
          y: 0,
          duration: CELL_TEXT_FADE_DURATION,
          ease: "none",
        })
        .addLabel("col3")
        .to(headerFill3El, {
          scaleY: 1,
          duration: HEADER_WIPE_DURATION,
          ease: "none",
        })
        .to(divider2El, {
          strokeDashoffset: 0,
          duration: DIVIDER_DRAW_DURATION,
          ease: "none",
        })
        .to(statementCell3El, {
          opacity: 1,
          y: 0,
          duration: CELL_TEXT_FADE_DURATION,
          ease: "none",
        });

      // Phase 3: the scaffold itself shrinks to the real table's corner,
      // anchored top-left (see .tableWrap's align-self/justify-self:start)
      // — text, column widths, and row heights all reduce together to the
      // measured target. No second table, no crossfade.
      tl.to(
        [statementCell1El, statementCell2El, statementCell3El],
        {
          fontSize: bodySmSize,
          lineHeight: bodySmLh,
          duration: SHRINK_DURATION,
          ease: "none",
        },
        phase3Start,
      )
        .to(
          headerLabelEl,
          {
            fontSize: headingXsSize,
            lineHeight: headingXsLh,
            duration: SHRINK_DURATION,
            ease: "none",
          },
          phase3Start,
        )
        .to(
          tableEl,
          {
            width: cornerColWidths[0] + cornerColWidths[1] + cornerColWidths[2],
            gridTemplateColumns: `${cornerColWidths[0]}px ${cornerColWidths[1]}px ${cornerColWidths[2]}px 0px 0px 0px`,
            gridTemplateRows: `${cornerRowsCss} ${Array(extraRowsCount).fill("0px").join(" ")}`,
            duration: SHRINK_DURATION,
            ease: "none",
          },
          phase3Start,
        )
        .to(
          divider1El,
          {
            attr: { x1: cornerColWidths[0], x2: cornerColWidths[0], y2: cornerHeight },
            duration: SHRINK_DURATION,
            ease: "none",
          },
          phase3Start,
        )
        .to(
          divider2El,
          {
            attr: {
              x1: cornerColWidths[0] + cornerColWidths[1],
              x2: cornerColWidths[0] + cornerColWidths[1],
              y2: cornerHeight,
            },
            duration: SHRINK_DURATION,
            ease: "none",
          },
          phase3Start,
        );

      // Phase 4: columns 4, 5, 6 wipe in one by one — same header-fill-wipe
      // pattern as phase 2 — each growing the table's width by its own real
      // measured width, until the table is back to full width.
      const col4Width = cornerColWidths[0] + cornerColWidths[1] + cornerColWidths[2] + remainingColWidths[0];
      const col5Width = col4Width + remainingColWidths[1];
      const col6Width = col5Width + remainingColWidths[2];
      const dividerX3 = cornerColWidths[0] + cornerColWidths[1] + cornerColWidths[2];
      const dividerX4 = col4Width;
      const dividerX5 = col5Width;

      tl.addLabel("col4", phase4Start)
        .to(
          tableEl,
          {
            width: col4Width,
            gridTemplateColumns: `${cornerColWidths[0]}px ${cornerColWidths[1]}px ${cornerColWidths[2]}px ${remainingColWidths[0]}px 0px 0px`,
            duration: COLUMN_GROW_DURATION,
            ease: "none",
          },
          "col4",
        )
        .to(
          divider3El,
          {
            attr: { x1: dividerX3, x2: dividerX3 },
            strokeDashoffset: 0,
            duration: COLUMN_GROW_DURATION,
            ease: "none",
          },
          "col4",
        )
        .to(
          headerFill4El,
          { scaleY: 1, duration: COLUMN_GROW_DURATION, ease: "none" },
          "col4",
        )
        .addLabel("col5", `col4+=${COLUMN_GROW_DURATION}`)
        .to(
          tableEl,
          {
            width: col5Width,
            gridTemplateColumns: `${cornerColWidths[0]}px ${cornerColWidths[1]}px ${cornerColWidths[2]}px ${remainingColWidths[0]}px ${remainingColWidths[1]}px 0px`,
            duration: COLUMN_GROW_DURATION,
            ease: "none",
          },
          "col5",
        )
        .to(
          divider4El,
          {
            attr: { x1: dividerX4, x2: dividerX4 },
            strokeDashoffset: 0,
            duration: COLUMN_GROW_DURATION,
            ease: "none",
          },
          "col5",
        )
        .to(
          headerFill5El,
          { scaleY: 1, duration: COLUMN_GROW_DURATION, ease: "none" },
          "col5",
        )
        .addLabel("col6", `col5+=${COLUMN_GROW_DURATION}`)
        .to(
          tableEl,
          {
            width: col6Width,
            gridTemplateColumns: `${cornerColWidths[0]}px ${cornerColWidths[1]}px ${cornerColWidths[2]}px ${remainingColWidths[0]}px ${remainingColWidths[1]}px ${remainingColWidths[2]}px`,
            duration: COLUMN_GROW_DURATION,
            ease: "none",
          },
          "col6",
        )
        .to(
          divider5El,
          {
            attr: { x1: dividerX5, x2: dividerX5 },
            strokeDashoffset: 0,
            duration: COLUMN_GROW_DURATION,
            ease: "none",
          },
          "col6",
        )
        .to(
          headerFill6El,
          { scaleY: 1, duration: COLUMN_GROW_DURATION, ease: "none" },
          "col6",
        );

      // Phase 5a: the old scaffold content (header label + 3 diagonal
      // statements) fades up out of sight, together.
      tl.addLabel("phase5FadeOut", phase5Start).to(
        [headerLabelEl, statementCell1El, statementCell2El, statementCell3El],
        {
          opacity: 0,
          y: -12,
          duration: PHASE5_FADE_OUT_DURATION,
          ease: "none",
        },
        "phase5FadeOut",
      );

      // Phase 5b: the table grows however many more real, measured rows fit
      // in one viewport (extraRowsCount, i.e. visibleRowCount - 3).
      tl.addLabel(
        "phase5RowGrow",
        `phase5FadeOut+=${PHASE5_FADE_OUT_DURATION}`,
      ).to(
        tableEl,
        {
          gridTemplateRows: fullRowsCss,
          duration: PHASE5_ROW_GROW_DURATION,
          ease: "none",
        },
        "phase5RowGrow",
      );

      // Once rows have grown to full height, the bottom 3 start fading into
      // the section background — the scene's end state, implying the table
      // continues beyond what's shown without rendering/animating more rows.
      tl.set(
        tableWrapEl,
        {
          maskImage: fadeMaskImage,
          webkitMaskImage: fadeMaskImage,
        },
        `phase5RowGrow+=${PHASE5_ROW_GROW_DURATION}`,
      );

      // Phase 5c: column by column, each column's real header label then its
      // visibleRowCount real row values fade up top to bottom — sequential,
      // one column fully finishing before the next starts (each .to() below
      // has no position arg, so it inserts right after the previous ends).
      for (let col = 0; col < COLUMN_COUNT; col++) {
        tl.to(realHeaderLabelEls[col], {
          opacity: 1,
          y: 0,
          duration: CONTENT_ITEM_DURATION,
          ease: "none",
        });
        for (let row = 0; row < visibleRowCount; row++) {
          tl.to(realBodyCellEls[row * COLUMN_COUNT + col], {
            opacity: 1,
            y: 0,
            duration: CONTENT_ITEM_DURATION,
            ease: "none",
          });
        }
      }
    }, sceneEl);

    return () => ctx.revert();
  }, [visibleRowCount]);

  return (
    <div
      className={`${styles.scene}${className ? ` ${className}` : ""}`}
      ref={sceneRef}
    >
      <div className={styles.stage} ref={stageRef}>
        <div className={styles.tableWrap} ref={tableWrapRef}>
          <div className={styles.table} role="table" ref={tableRef}>
            <div className={styles.headerCell1} role="columnheader">
              <div className={styles.headerFill} ref={headerFill1Ref} />
              <div className={styles.headerContent}>
                <Label ref={headerLabelRef} size="xl">
                  The Data Dictionary
                </Label>
              </div>
              <div className={styles.headerContent}>
                <span
                  className={styles.realHeaderLabel}
                  ref={(el) => {
                    realHeaderLabelRefs.current[0] = el;
                  }}
                >
                  {glossaryColumns[0].label}
                </span>
              </div>
            </div>
            {[1, 2, 3, 4, 5].map((colIndex) => {
              const headerFillRefs = [
                headerFill2Ref,
                headerFill3Ref,
                headerFill4Ref,
                headerFill5Ref,
                headerFill6Ref,
              ];
              return (
                <div
                  key={`header-${colIndex}`}
                  className={styles[`headerCell${colIndex + 1}`]}
                  role="columnheader"
                >
                  <div
                    className={styles.headerFill}
                    ref={headerFillRefs[colIndex - 1]}
                  />
                  <div className={styles.headerContent}>
                    <span
                      className={styles.realHeaderLabel}
                      ref={(el) => {
                        realHeaderLabelRefs.current[colIndex] = el;
                      }}
                    >
                      {glossaryColumns[colIndex].label}
                    </span>
                  </div>
                </div>
              );
            })}

            {visibleRowCount !== null &&
              Array.from({ length: visibleRowCount }).map((_, rowIndex) =>
                Array.from({ length: COLUMN_COUNT }).map((_, colIndex) => {
                  const isOld1 = rowIndex === 0 && colIndex === 0;
                  const isOld2 = rowIndex === 1 && colIndex === 1;
                  const isOld3 = rowIndex === 2 && colIndex === 2;
                  const columnKey = glossaryColumns[colIndex].key;
                  const cellValue = visibleRows[rowIndex][columnKey];
                  return (
                    <div
                      key={`cell-${rowIndex}-${colIndex}`}
                      className={styles.bodyCell}
                      style={{ gridRow: rowIndex + 2, gridColumn: colIndex + 1 }}
                      role="cell"
                    >
                      {isOld1 && (
                        <div className={styles.oldStatement} ref={statementCell1Ref}>
                          {STATEMENT_CELL1_LINES.map((line) => (
                            <p key={line} className={styles.oldStatementLine}>
                              {line}
                            </p>
                          ))}
                        </div>
                      )}
                      {isOld2 && (
                        <div className={styles.oldStatement} ref={statementCell2Ref}>
                          {STATEMENT_CELL2_LINES.map((line) => (
                            <p key={line} className={styles.oldStatementLine}>
                              {line}
                            </p>
                          ))}
                        </div>
                      )}
                      {isOld3 && (
                        <div className={styles.oldStatement} ref={statementCell3Ref}>
                          {STATEMENT_CELL3_LINES.map((line) => (
                            <p key={line} className={styles.oldStatementLine}>
                              {line}
                            </p>
                          ))}
                        </div>
                      )}
                      <p
                        className={styles.realBodyCellText}
                        ref={(el) => {
                          realBodyCellRefs.current[rowIndex * COLUMN_COUNT + colIndex] = el;
                        }}
                      >
                        {cellValue}
                      </p>
                    </div>
                  );
                }),
              )}
          </div>

          <svg
            className={styles.dividers}
            width="100%"
            height={TABLE_HEIGHT}
            aria-hidden="true"
          >
            <line className={styles.dividerLine} ref={divider1Ref} />
            <line className={styles.dividerLine} ref={divider2Ref} />
            <line className={styles.dividerLine} ref={divider3Ref} />
            <line className={styles.dividerLine} ref={divider4Ref} />
            <line className={styles.dividerLine} ref={divider5Ref} />
          </svg>
        </div>

        <div className={styles.measureWrap} ref={measureRef} aria-hidden="true">
          <DataGlossaryTable />
        </div>
      </div>
    </div>
  );
}
