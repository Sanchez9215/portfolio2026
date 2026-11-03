import React, { useState } from "react";
import Button from "./Button";
import { RequestListItem, RequestListItemProps } from "./RequestListItem";
import styles from "./RequestList.module.css";

export type RequestListRequest = Omit<
  RequestListItemProps,
  "selected" | "expanded" | "onSelect" | "onToggleExpanded" | "onFullView" | "onSelectItem" | "selectedItemId"
> & {
  /** The date the request falls under ("Today", "Yesterday", "Jan 12, 2026"); the list heading shows the one at the top of the scroll. */
  dateGroup: string;
};

export type RequestListProps = {
  requests: RequestListRequest[];
  selectedId?: string;
  /** The open item's id; highlighted in its request's drawer. */
  selectedItemId?: string;
  onSelect?: (id: string) => void;
  /** Id of the initially-expanded request, if any. */
  defaultExpandedId?: string;
  onFullView?: (id: string) => void;
  /** An item row was clicked: opens that item's drill-down. */
  onSelectItem?: (requestId: string, itemId: string) => void;
  /** Date groups shown at first, and added by each "Load Older". A group is never split. */
  groupsPerPage?: number;
};

export function RequestList({
  requests,
  selectedId,
  selectedItemId,
  onSelect,
  defaultExpandedId,
  onFullView,
  onSelectItem,
  groupsPerPage = 3,
}: RequestListProps) {
  const [expandedId, setExpandedId] = useState<string | undefined>(defaultExpandedId);
  // The top fade shows while items are scrolled out of view above the heading.
  const [showTopFade, setShowTopFade] = useState(false);
  const [visibleGroups, setVisibleGroups] = useState(groupsPerPage);

  // Requests arrive newest first, so each date group is a consecutive run.
  const groupLabels = Array.from(new Set(requests.map((request) => request.dateGroup)));
  const shown = new Set(groupLabels.slice(0, visibleGroups));
  const hasOlder = groupLabels.length > visibleGroups;
  const visible = requests.filter((request) => shown.has(request.dateGroup));
  // The heading is the date: it follows whichever request is at the top of the scroll area.
  const [topIndex, setTopIndex] = useState(0);
  const heading = visible[Math.min(topIndex, visible.length - 1)]?.dateGroup ?? "";

  return (
    <div className={styles.list}>
      <div className={styles.heading}>
        <span>{heading}</span>
        <span>Last Updated</span>
      </div>
      <div
        className={styles.scroll}
        onScroll={(event) => {
          const area = event.currentTarget;
          setShowTopFade(area.scrollTop > 0);
          // Children: the fade, then one element per visible request. The top one is the first still reaching below the top edge.
          const rows = Array.from(area.children).slice(1, 1 + visible.length) as HTMLElement[];
          const areaTop = area.getBoundingClientRect().top;
          const top = rows.findIndex((row) => row.getBoundingClientRect().bottom > areaTop);
          setTopIndex(top === -1 ? 0 : top);
        }}
      >
        <div className={[styles.scrollFade, showTopFade ? styles.scrollFadeVisible : ""].filter(Boolean).join(" ")} aria-hidden="true" />
        {visible.map(({ dateGroup, ...request }) => (
          <RequestListItem
            key={request.id}
            {...request}
            selected={request.id === selectedId}
            selectedItemId={request.id === selectedId ? selectedItemId : undefined}
            expanded={request.id === expandedId}
            // Selecting a request opens its drawer (single-open, so any other closes); the chevron still toggles it.
            onSelect={() => {
              onSelect?.(request.id);
              setExpandedId(request.id);
            }}
            // Only the selected request can be folded and unfolded by hand: expanding any other request selects it instead.
            onToggleExpanded={() => {
              if (request.id !== selectedId) {
                onSelect?.(request.id);
                setExpandedId(request.id);
              } else setExpandedId(request.id === expandedId ? undefined : request.id);
            }}
            onFullView={() => onFullView?.(request.id)}
            onSelectItem={(itemId) => {
              onSelectItem?.(request.id, itemId);
              setExpandedId(request.id);
            }}
          />
        ))}
        {hasOlder && (
          <Button variant="secondary" size="medium" className={styles.loadOlder} onClick={() => setVisibleGroups((count) => count + groupsPerPage)}>
            Load Older
          </Button>
        )}
      </div>
    </div>
  );
}

export default RequestList;
