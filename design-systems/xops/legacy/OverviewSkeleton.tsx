"use client";

import React from "react";
import { Grid, GridItem } from "../components/Grid";
import styles from "./OverviewSkeleton.module.css";

/*
 * Overview Skeleton — the "Designing for Data Uncertainty" block-build (pass 1: static).
 *
 * A pure-shape reduction of OverviewLegacy: every data element becomes a filled block,
 * colored by the SOURCE that feeds it. No content, no live data — just layout + source.
 * Dropping a source (removing its blocks + Flip reflow) is a later pass; this pass only
 * establishes the shapes and the color-coding. Each removable block carries `data-source`
 * so the reflow pass can query and drop by source.
 *
 * Source families: financial (blue) · usage (green) · org (purple) · compliance (red) ·
 * neutral (grey chrome — frames/labels/anchor column, never drops).
 */

type Source = "financial" | "usage" | "org" | "compliance" | "neutral";

// A block whose descendant shapes inherit its source color via the --sc custom property.
function Block({
  source,
  className,
  children,
  style,
}: {
  source: Source;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div className={className} data-source={source} data-block style={style}>
      {children}
    </div>
  );
}

function LegendRows({ source, count }: { source: Source; count: number }) {
  return (
    <div className={styles.legend}>
      {Array.from({ length: count }).map((_, i) => (
        <Block key={i} source={source} className={styles.legendRow}>
          <span className={styles.legendSwatch} />
          <span className={styles.legendLabel} />
          <span className={styles.legendValue} />
        </Block>
      ))}
    </div>
  );
}

function Stat({ source }: { source: Source }) {
  return (
    <Block source={source} className={styles.stat}>
      <span className={styles.statLabel} />
      <span className={styles.statValue} />
    </Block>
  );
}

// Lifecycle table columns — Active stage (the richest multi-source column set).
// Software is the always-present neutral anchor; the rest drop with their source.
const TABLE_COLUMNS: { source: Source; flex: number; anchor?: boolean }[] = [
  { source: "neutral", flex: 2.4, anchor: true }, // Software
  { source: "financial", flex: 1.3 }, // Publisher
  { source: "financial", flex: 1 }, // Vendor
  { source: "financial", flex: 1 }, // Category
  { source: "org", flex: 1.3 }, // B.U Owner
  { source: "financial", flex: 1 }, // Total Spend
  { source: "financial", flex: 1 }, // Licenses Purchased
  { source: "usage", flex: 1 }, // Utilization
  { source: "usage", flex: 1 }, // Inactive
  { source: "financial", flex: 1.3 }, // Renewal Date
];

const TABLE_ROWS = 6;

export default function OverviewSkeleton() {
  return (
    <div className={styles.root}>
      {/* Sidebar — neutral chrome */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarLogo} />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.sidebarItem} />
        ))}
      </div>

      <div className={styles.mainCol}>
        {/* Global header — neutral chrome */}
        <div className={styles.header}>
          <div className={styles.headerSearch} />
          <div className={styles.headerRight}>
            <div className={styles.headerDot} />
            <div className={styles.headerDot} />
          </div>
        </div>

        <main className={styles.main}>
          {/* Page header — neutral */}
          <div className={styles.pageHeader}>
            <div className={styles.phTitle} />
            <div className={styles.phMeta} />
          </div>

          <Grid>
            {/* Filter bar — org */}
            <GridItem colSpan={12}>
              <div className={styles.filterBar}>
                {[0, 1, 2, 3].map((i) => (
                  <React.Fragment key={i}>
                    <Block source="org" className={styles.filterField}>
                      <span className={styles.filterFieldLabel} />
                      <span className={styles.filterDropdown} />
                    </Block>
                    {i === 0 && <span className={styles.filterDivider} />}
                  </React.Fragment>
                ))}
              </div>
            </GridItem>

            {/* Row 1 — License Overview / Spend / Usage */}
            <GridItem colSpan={4}>
              <div className={styles.panel}>
                <span className={styles.sectionTitle} />

                <div className={styles.licenseBlocksGroup}>
                {/* Total Licensed Software — all financial */}
                <Block source="financial" className={styles.licenseBlock}>
                  <div className={styles.blockHeader}>
                    <span className={styles.blockHeaderLabel} />
                    <span className={styles.blockHeaderValue} />
                  </div>
                  <div className={styles.hbar}>
                    <span className={styles.hbarSeg} style={{ flex: 3 }} />
                    <span className={styles.hbarSeg} style={{ flex: 1 }} />
                  </div>
                  <LegendRows source="financial" count={2} />
                </Block>

                {/* Total Licenses Owned — financial, with one usage (OSS) segment */}
                <div className={styles.licenseBlock}>
                  <Block source="financial" className={styles.blockHeader}>
                    <span className={styles.blockHeaderLabel} />
                    <span className={styles.blockHeaderValue} />
                  </Block>
                  <div className={styles.hbar}>
                    <span className={styles.hbarSeg} data-source="financial" style={{ flex: 4 }} />
                    <span className={styles.hbarSeg} data-source="usage" style={{ flex: 1 }} />
                    <span className={styles.hbarSeg} data-source="financial" style={{ flex: 1 }} />
                  </div>
                  <div className={styles.legend}>
                    <Block source="financial" className={styles.legendRow}>
                      <span className={styles.legendSwatch} />
                      <span className={styles.legendLabel} />
                      <span className={styles.legendValue} />
                    </Block>
                    <Block source="usage" className={styles.legendRow}>
                      <span className={styles.legendSwatch} />
                      <span className={styles.legendLabel} />
                      <span className={styles.legendValue} />
                    </Block>
                    <Block source="financial" className={styles.legendRow}>
                      <span className={styles.legendSwatch} />
                      <span className={styles.legendLabel} />
                      <span className={styles.legendValue} />
                    </Block>
                  </div>
                  <Block source="financial" className={styles.expiringBanner}>
                    <span className={styles.expiringBannerLabel} />
                    <span className={styles.expiringBannerValue} />
                  </Block>
                </div>
                </div>
              </div>
            </GridItem>

            {/* Spend — all financial */}
            <GridItem colSpan={4}>
              <div className={styles.panel}>
                <span className={styles.sectionTitle} />
                <div className={styles.statRow}>
                  <Stat source="financial" />
                  <Stat source="financial" />
                </div>
                <span className={styles.subLabel} />
                <Block source="financial" className={styles.miniTable}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={styles.miniRow}>
                      <span className={styles.miniCellFlex} />
                      <span className={styles.miniCellAuto} />
                      <span className={styles.miniCellAuto} />
                    </div>
                  ))}
                </Block>
              </div>
            </GridItem>

            {/* Usage — all green */}
            <GridItem colSpan={4}>
              <div className={styles.panel}>
                <span className={styles.sectionTitle} />
                <div className={styles.cardContent}>
                  <div className={styles.statRow}>
                    <Stat source="usage" />
                    <Stat source="usage" />
                  </div>
                  <span className={styles.subLabel} />
                  <Block source="usage" className={styles.donutWrap}>
                    <span className={styles.donut} />
                  </Block>
                  <LegendRows source="usage" count={3} />
                </div>
              </div>
            </GridItem>

            {/* Row 2 — Compliance / Top Non-Compliant (both red) */}
            <GridItem colSpan={5}>
              <div className={styles.panel}>
                <span className={styles.sectionTitle} />
                <div className={styles.cardContent}>
                  <Block source="compliance" className={styles.donutWrap}>
                    <span className={styles.donut} />
                  </Block>
                  <LegendRows source="compliance" count={4} />
                </div>
              </div>
            </GridItem>

            <GridItem colSpan={7}>
              <div className={styles.panel}>
                <span className={styles.sectionTitle} />
                <Block source="compliance" className={styles.miniTable}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={styles.miniRow}>
                      <span className={styles.miniCellFlex} />
                      <span className={styles.miniCellAuto} />
                      <span className={styles.miniCellAuto} />
                    </div>
                  ))}
                </Block>
              </div>
            </GridItem>

            {/* Row 3 — Lifecycle: stage tabs + toolbar + column table */}
            <GridItem colSpan={12}>
              <div className={styles.panel}>
                <span className={styles.sectionTitle} />
                <div className={styles.stageTabs}>
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className={styles.stageTab} data-source="financial" data-block />
                  ))}
                </div>

                <div className={styles.toolbarRow}>
                  <div className={styles.toolbarLeft}>
                    <span className={styles.searchBox} />
                    <span className={styles.toolbarBtn} />
                  </div>
                  <span className={styles.toolbarBtnSm} />
                </div>

                <div className={styles.columnTable}>
                  {TABLE_COLUMNS.map((col, i) => (
                    <Block
                      key={i}
                      source={col.source}
                      className={styles.tableCol}
                      style={{ flex: col.flex }}
                    >
                      <span className={styles.colHeader} />
                      {Array.from({ length: TABLE_ROWS }).map((_, r) =>
                        col.anchor ? (
                          <span key={r} className={styles.anchorCell}>
                            <span className={styles.anchorChip} />
                            <span className={styles.anchorName} />
                          </span>
                        ) : (
                          <span key={r} className={styles.colCell} />
                        ),
                      )}
                    </Block>
                  ))}
                </div>
              </div>
            </GridItem>
          </Grid>
        </main>
      </div>
    </div>
  );
}
