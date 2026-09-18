import React, { CSSProperties, ReactNode } from "react";
import Icon from "./Icon";
import { Tag, TagStatus } from "./Tag";
import { Tooltip, TooltipProps } from "./Tooltip";
import { MagicSurface } from "./MagicSurface";
import styles from "./Stat.module.css";

export type StatValueSize = "medium" | "small";
export type StatSurface = "filled" | "white" | "magic";

export type StatProps = {
  label: string;
  value: string;
  meta?: string;
  tag?: { status: TagStatus; label: string };
  icon?: boolean;
  tooltip?: Omit<TooltipProps, "children" | "className">;
  valueSize?: StatValueSize;
  surface?: StatSurface;
  // Only applies when surface="magic" — scales the blob background proportionally
  // for smaller tiles (see MagicSurface's `scale` prop). Defaults to full size.
  magicScale?: number;
  spaceBetween?: boolean;
  /** Optional leading color swatch before the label — reuses Legend's own swatch size/radius tokens. */
  legendColor?: string;
  /** Optional content rendered below the value row — e.g. a ProgressBar + caption. */
  content?: ReactNode;
  /** Colors the value text with the matching status-*-solid token. Omit for the default text-primary. */
  valueStatus?: "danger" | "warning" | "success";
  className?: string;
  style?: CSSProperties;
  /** Sets `data-hotspot` on the outer tile element, for hotspot targeting. */
  hotspotId?: string;
};

export function Stat({
  label,
  value,
  meta,
  tag,
  icon,
  tooltip,
  valueSize = "medium",
  surface = "filled",
  magicScale = 1,
  spaceBetween,
  legendColor,
  content,
  valueStatus,
  className,
  style,
  hotspotId,
}: StatProps) {
  const body = (
    <>
      <div className={styles.labelRow}>
        {legendColor && (
          <span className={styles.legendSwatch} style={{ backgroundColor: legendColor }} />
        )}
        <p className={styles.label}>{label}</p>
        {tooltip ? (
          <Tooltip {...tooltip}>
            <Icon name="InfoCircle" color="var(--xops-text-secondary)" className={styles.icon} />
          </Tooltip>
        ) : (
          icon && <Icon name="InfoCircle" color="var(--xops-text-secondary)" className={styles.icon} />
        )}
      </div>
      <div className={[styles.valueRow, spaceBetween && styles.valueRowBetween].filter(Boolean).join(" ")}>
        {value && (
          <span
            className={[
              styles.value,
              valueSize === "small" && styles.valueSmall,
              valueStatus && styles[`value${valueStatus.charAt(0).toUpperCase()}${valueStatus.slice(1)}`],
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {value}
          </span>
        )}
        {meta && <span className={styles.meta}>{meta}</span>}
        {tag && <Tag status={tag.status}>{tag.label}</Tag>}
      </div>
      {content}
    </>
  );

  return (
    <div
      className={[
        styles.stat,
        surface === "white" && styles.statWhite,
        surface === "magic" && styles.statMagic,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      data-hotspot={hotspotId}
    >
      {surface === "magic" ? (
        <MagicSurface contentClassName={styles.magicInner} scale={magicScale}>
          {body}
        </MagicSurface>
      ) : (
        body
      )}
    </div>
  );
}

export default Stat;
