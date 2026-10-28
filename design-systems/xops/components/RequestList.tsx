import React, { useState } from "react";
import { RequestListItem, RequestListItemProps } from "./RequestListItem";
import styles from "./RequestList.module.css";

export type RequestListRequest = Omit<
  RequestListItemProps,
  "selected" | "expanded" | "onSelect" | "onToggleExpanded" | "onFullView"
>;

export type RequestListProps = {
  requests: RequestListRequest[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  /** Id of the initially-expanded request, if any. */
  defaultExpandedId?: string;
  onFullView?: (id: string) => void;
  /** Left column heading — the date group the list is showing. */
  groupLabel?: string;
};

export function RequestList({
  requests,
  selectedId,
  onSelect,
  defaultExpandedId,
  onFullView,
  groupLabel = "Today",
}: RequestListProps) {
  const [expandedId, setExpandedId] = useState<string | undefined>(defaultExpandedId);
  // The top fade shows while items are scrolled out of view above the heading.
  const [showTopFade, setShowTopFade] = useState(false);

  return (
    <div className={styles.list}>
      <div className={styles.heading}>
        <span>{groupLabel}</span>
        <span>Last Updated</span>
      </div>
      <div className={styles.scroll} onScroll={(event) => setShowTopFade(event.currentTarget.scrollTop > 0)}>
        <div className={[styles.scrollFade, showTopFade ? styles.scrollFadeVisible : ""].filter(Boolean).join(" ")} aria-hidden="true" />
        {requests.map((request) => (
          <RequestListItem
            key={request.id}
            {...request}
            selected={request.id === selectedId}
            expanded={request.id === expandedId}
            onSelect={() => onSelect?.(request.id)}
            onToggleExpanded={() => setExpandedId(request.id === expandedId ? undefined : request.id)}
            onFullView={() => onFullView?.(request.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default RequestList;
