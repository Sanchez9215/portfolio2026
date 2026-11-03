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
import { Card } from "@/design-systems/xops/components/Card";
import { Section } from "@/design-systems/xops/components/Section";
import { SectionStack } from "@/design-systems/xops/components/SectionStack";
import { KeyValueList } from "@/design-systems/xops/components/KeyValueList";
import { EventLog } from "@/design-systems/xops/components/EventLog";
import { DeviceTable } from "@/design-systems/xops/components/DeviceTable";
import { employeeInformation, eventLogEvents, eventLogLaneOptions, itemDevices, listRequests, orchestrationGraph, requestHeader } from "@/design-systems/xops/data/requests/metrics";
import { stressEvents, stressLanes } from "@/design-systems/xops/data/requests/stress";
import styles from "./AllRequestsScreen.module.css";
import { DateRangePicker, type DateRange } from "@/design-systems/xops/components/DateRangePicker";


const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export function AllRequestsScreen() {
  const dataset = getRequestsDataset();
  // The picker spans the data itself: the earliest request's creation day through the as-of day.
  const dataStart = useMemo(
    () => startOfDay(new Date(dataset.requests.reduce((earliest, request) => (request.createdAt < earliest ? request.createdAt : earliest), dataset.generatedAt))),
    [dataset],
  );
  const dataEnd = useMemo(() => startOfDay(REQUESTS_AS_OF), []);
  const [range, setRange] = useState<DateRange>({ from: dataStart, to: dataEnd });
  const [selectedId, setSelectedId] = useState<string | undefined>(dataset.scriptedRequestId);
  // The open item's drill-down; it replaces the request detail until you go back up or pick another request.
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);
  // The graph's staged draw-in plays once, on first open — not on every request switch or return from an item.
  const [entrancePlayed, setEntrancePlayed] = useState(false);
  // Temporary: the three pinned test requests (the only executive onboardings) lead the list so they are easy to reach.
  const requests = useMemo(() => {
    const pinned = new Set(dataset.requests.filter((request) => request.templateKey === "executive-onboarding").map((request) => request.id));
    const all = listRequests(dataset);
    return [...all.filter((request) => pinned.has(request.id)), ...all.filter((request) => !pinned.has(request.id))];
  }, [dataset]);
  const selected = dataset.requests.find((request) => request.id === selectedId);
  const selectedItem = selected?.items.find((item) => item.id === selectedItemId);
  // `?stress=1` swaps the graph for the 14-item pressure-test data (not a real request).
  const [stress, setStress] = useState(false);
  useEffect(() => setStress(new URLSearchParams(window.location.search).get("stress") === "1"), []);
  const graph = useMemo(
    () => (stress ? { lanes: stressLanes, events: stressEvents } : selected ? orchestrationGraph(dataset, selected) : null),
    [dataset, selected, stress],
  );
  const employee = useMemo(() => (selected ? employeeInformation(selected) : null), [selected]);
  const devices = useMemo(() => (selected && selectedItem ? itemDevices(dataset, selected, selectedItem) : null), [dataset, selected, selectedItem]);
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
        <DateRangePicker value={range} onChange={setRange} min={dataStart} max={dataEnd} />
      </div>
      <Grid className={styles.grid}>
        <GridItem colSpan={3}>
          <RequestList
            requests={requests}
            selectedId={selectedId}
            selectedItemId={selectedItemId}
            onSelect={(id) => {
              setSelectedId(id);
              setSelectedItemId(undefined);
            }}
            onSelectItem={(requestId, itemId) => {
              setSelectedId(requestId);
              setSelectedItemId(itemId);
            }}
            defaultExpandedId={dataset.scriptedRequestId}
          />
        </GridItem>
        <GridItem colSpan={9} className={styles.detail}>
          {selected && selectedItem && (
            <SectionStack>
              <Section>
                <RequestDetailHeader
                  {...requestHeader(dataset, selected)}
                  runbookName={selectedItem.runbookName}
                  breadcrumb={[{ label: selected.id, onClick: () => setSelectedItemId(undefined) }, { label: selectedItem.id }]}
                  showTiles={false}
                />
              </Section>
              <Section>
                <EventLog key={selectedItem.id} events={events} laneOptions={[]} lockedLane={selectedItem.id} />
              </Section>
              {devices && (
                <Section>
                  <Card title={devices.title} titleSize="subheading-16" className={styles.deviceCard}>
                    <DeviceTable rows={devices.rows} mode={devices.mode} />
                  </Card>
                </Section>
              )}
            </SectionStack>
          )}
          {selected && !selectedItem && (
            <SectionStack>
              <Section className={styles.headerSection}>
                <RequestDetailHeader {...requestHeader(dataset, selected)} />
              </Section>
              {graph && (
                <Section>
                  <OrchestrationGraph lanes={graph.lanes} events={graph.events} entrance={!entrancePlayed} onEntranceComplete={() => setEntrancePlayed(true)} />
                </Section>
              )}
              <Section>
                <EventLog key={selected.id} events={events} laneOptions={eventLogLaneOptions(selected)} />
              </Section>
              {employee && (
                <Section>
                  <Card title="Employee Information" titleSize="subheading-16" className={styles.employeeCard}>
                    <KeyValueList
                      items={[
                        { label: "Name", value: <Button variant="inline-link">{employee.name}</Button> },
                        { label: "Department", value: employee.department },
                        { label: "Start Date", value: employee.startDate },
                        { label: "Persona", value: employee.persona },
                        { label: "Employee ID", value: <Button variant="inline-link">{employee.employeeId}</Button> },
                        { label: "Cost Center", value: employee.costCenters },
                      ]}
                    />
                  </Card>
                </Section>
              )}
            </SectionStack>
          )}
        </GridItem>
      </Grid>
    </AppShell>
  );
}
