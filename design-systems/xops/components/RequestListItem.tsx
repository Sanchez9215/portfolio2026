import React from "react";
import Button from "./Button";
import Icon from "./Icon";
import { StatusIconStatus, StatusIcon } from "./StatusIcon";
import { ProgressBar } from "./ProgressBar";
import { Indicator } from "./Indicator";
import { Tag } from "./Tag";
import { deriveRequestStatus, requestStatusTag, RequestStatusInputs } from "./requestStatus";
import styles from "./RequestListItem.module.css";

export type RequestItem = {
  id: string;
  runbookName: string;
  status: StatusIconStatus;
};

export type RequestListItemProps = RequestStatusInputs & {
  id: string;
  /** Last-updated time, pre-formatted (e.g. "08:43 am"). */
  lastUpdated: string;
  runbookName: string;
  items: RequestItem[];
  selected?: boolean;
  expanded?: boolean;
  onSelect?: () => void;
  onToggleExpanded?: () => void;
  onFullView?: () => void;
  /** Opens an item's drill-down. */
  onSelectItem?: (itemId: string) => void;
  /** The item whose drill-down is open, if it belongs to this request. */
  selectedItemId?: string;
};

export function RequestListItem({
  id,
  lastUpdated,
  runbookName,
  items,
  closure,
  suspended,
  selected = false,
  expanded = false,
  onSelect,
  onToggleExpanded,
  onFullView,
  onSelectItem,
  selectedItemId,
}: RequestListItemProps) {
  const status = deriveRequestStatus(items, { closure, suspended });
  const exceptionCount = items.filter((item) => item.status === "exception").length;
  const warningCount = items.filter((item) => item.status === "warning").length;
  const completeCount = items.filter((item) => item.status === "complete").length;
  const percent = items.length === 0 ? 0 : (completeCount / items.length) * 100;

  return (
    <div className={[styles.container, selected && styles.selected].filter(Boolean).join(" ")}>
      <button type="button" className={styles.summary} onClick={onSelect} aria-pressed={selected}>
        <span className={styles.header}>
          <span className={styles.id}>{id}</span>
          <span className={styles.time}>{lastUpdated}</span>
        </span>
        <span className={styles.details}>
          <span className={styles.runbookName} title={runbookName}>{runbookName}</span>
          <Tag status={requestStatusTag[status]}>
            {status}
          </Tag>
        </span>
      </button>

      <div className={styles.panel} onClick={onToggleExpanded}>
        <div className={styles.progressRow}>
          <div className={styles.progress}>
            <ProgressBar value={percent} status="info" height="6" />
            <p className={styles.caption}>
              <span>
                {completeCount}/{items.length}
              </span>
              <span>Items Complete</span>
              {exceptionCount > 0 && (
                <Indicator variant="count" status="danger" glyph={<StatusIcon status="exception" size="12" />} count={exceptionCount} />
              )}
              {warningCount > 0 && (
                <Indicator variant="count" status="warning" glyph={<StatusIcon status="warning" size="12" />} count={warningCount} />
              )}
            </p>
          </div>
          <Button
            iconOnly
            size="small"
            ariaLabel={expanded ? "Collapse request items" : "Expand request items"}
            aria-expanded={expanded}
            className={styles.chevron}
            icon={<Icon name="keyboard_arrow_down" size="18" className={[styles.chevronIcon, expanded && styles.chevronOpen].filter(Boolean).join(" ")} />}
          />
        </div>

        {/* Always rendered so its height can animate; inert while collapsed keeps it out of focus and the accessibility tree. */}
        <div className={[styles.drawer, expanded && styles.drawerOpen].filter(Boolean).join(" ")} {...({ inert: expanded ? undefined : "" } as object)}>
          <div className={styles.drawerContent}>
            <ul className={styles.items} onClick={(event) => event.stopPropagation()}>
              {items.map((item) => (
                <li key={item.id} className={styles.item}>
                  <button
                    type="button"
                    className={[styles.itemButton, item.id === selectedItemId && styles.itemSelected].filter(Boolean).join(" ")}
                    aria-pressed={item.id === selectedItemId}
                    onClick={() => onSelectItem?.(item.id)}
                  >
                    <span className={styles.itemId}>{item.id}</span>
                    <span className={styles.itemDetails}>
                      <StatusIcon status={item.status} />
                      <span className={styles.itemRunbookName}>{item.runbookName}</span>
                    </span>
                    <Icon name="chevron_forward" size="16" className={styles.itemChevron} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestListItem;
