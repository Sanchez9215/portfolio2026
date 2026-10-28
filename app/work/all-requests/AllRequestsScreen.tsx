"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/design-systems/xops/components/AppShell";
import Button from "@/design-systems/xops/components/Button";
import Icon from "@/design-systems/xops/components/Icon";
import { Grid, GridItem } from "@/design-systems/xops/components/Grid";
import { RequestList } from "@/design-systems/xops/components/RequestList";
import { getRequestsDataset, REQUESTS_AS_OF } from "@/design-systems/xops/data/requests/generate";
import { OrchestrationGraph } from "@/design-systems/xops/components/OrchestrationGraph";
import { RequestDetailHeader } from "@/design-systems/xops/components/RequestDetailHeader";
import { EventLog } from "@/design-systems/xops/components/EventLog";
import { eventLogEvents, eventLogLaneOptions, listRequests, orchestrationGraph, requestHeader } from "@/design-systems/xops/data/requests/metrics";
import { stressEvents, stressLanes } from "@/design-systems/xops/data/requests/stress";
import styles from "./AllRequestsScreen.module.css";
import { DateRangePicker, type DateRange } from "@/design-systems/xops/components/DateRangePicker";

const DATA_START = new Date(2024, 0, 1);
const DATA_END = new Date(2025, 9, 31);
const SELECTED_REQUEST_ID = "REQ-232";

export function AllRequestsScreen() {
  const [range, setRange] = useState<DateRange>({ from: DATA_START, to: DATA_END });
  const [selectedId, setSelectedId] = useState<string | undefined>(SELECTED_REQUEST_ID);
  const dataset = getRequestsDataset();
  const requests = useMemo(() => listRequests(dataset, { day: REQUESTS_AS_OF }), [dataset]);
  const selected = dataset.requests.find((request) => request.id === selectedId);
  // `?stress=1` swaps the graph for the 14-item pressure-test data (not a real request).
  const [stress, setStress] = useState(false);
  useEffect(() => setStress(new URLSearchParams(window.location.search).get("stress") === "1"), []);
  const graph = useMemo(
    () => (stress ? { lanes: stressLanes, events: stressEvents } : selected ? orchestrationGraph(dataset, selected) : null),
    [dataset, selected, stress],
  );
  const events = useMemo(() => (selected ? eventLogEvents(dataset, selected) : []), [dataset, selected]);

  return (
    <AppShell
      title="All Requests"
      metaIcon="cloud_download"
      metaText="Data last updated Jan 14, 2026 at 02:06PM"
      sidebarProps={{ activeRequestsItem: "all-requests" }}
      fillViewport
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <Button variant="secondary" icon={<Icon name="Filter" />}>
          Filters
          <Icon name="keyboard_arrow_down" />
        </Button>
        <DateRangePicker value={range} onChange={setRange} min={DATA_START} max={DATA_END} />
      </div>
      <Grid className={styles.grid}>
        <GridItem colSpan={3}>
          <RequestList
            requests={requests}
            selectedId={selectedId}
            onSelect={setSelectedId}
            defaultExpandedId={SELECTED_REQUEST_ID}
          />
        </GridItem>
        <GridItem colSpan={9} className={styles.detail}>
          {selected && (
            <>
              <RequestDetailHeader {...requestHeader(dataset, selected)} />
              {graph && <OrchestrationGraph lanes={graph.lanes} events={graph.events} />}
              <EventLog key={selected.id} events={events} laneOptions={eventLogLaneOptions(selected)} />
            </>
          )}
        </GridItem>
      </Grid>
    </AppShell>
  );
}
