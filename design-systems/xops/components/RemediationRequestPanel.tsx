"use client";

import React, { useMemo, useState } from "react";
import Icon from "./Icon";
import Button from "./Button";
import { Stat } from "./Stat";
import { Tag } from "./Tag";
import { Table, Column } from "./Table";
import { Toggle } from "./Toggle";
import { MagicSurface } from "./MagicSurface";
import styles from "./RemediationRequestPanel.module.css";

export type RemediationOtherFailure = {
  category: string;
  attribute: string;
};

export type RemediationEntityRow = {
  entityId: string;
  type: string;
  make: string;
  model: string;
  serialNumber: string;
  location: string;
  remediationLabel: string;
  remediationDot: "single" | "multi";
  otherFailures?: RemediationOtherFailure[];
  lifecycleStatus: string;
};

export type RemediationAttributeRow = {
  attribute: string;
  totalRecords: number;
  singleFailure: number;
  multiFailure: number;
  entities?: RemediationEntityRow[];
  entitiesTotal?: number;
};

export type RemediationRequestFilter = {
  attribute?: string;
  failureType?: "single" | "multi";
};

export type RemediationRequestPanelProps = {
  domain: string;
  attributes: RemediationAttributeRow[];
  filter?: RemediationRequestFilter;
  onCancel: () => void;
};

const recordFilterOptions = [
  { value: "all" as const, label: "All CIs" },
  { value: "single" as const, label: "Single-Issue Only" },
];

export function RemediationRequestPanel({ domain, attributes, filter, onCancel }: RemediationRequestPanelProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<Set<string>>(
    new Set(attributes.map((row) => row.attribute))
  );
  const [openAttribute, setOpenAttribute] = useState<string | undefined>(
    filter?.attribute ?? attributes.find((row) => row.entities)?.attribute
  );
  const [entitySearch, setEntitySearch] = useState("");
  const [recordFilter, setRecordFilter] = useState<"all" | "single">(
    filter?.failureType === "single" ? "single" : "all"
  );
  const [selectedEntities, setSelectedEntities] = useState<Set<string>>(new Set());
  const [expandedOtherFailures, setExpandedOtherFailures] = useState<Set<string>>(new Set());

  const toggleAttribute = (attribute: string) => {
    setSelectedAttributes((prev) => {
      const next = new Set(prev);
      if (next.has(attribute)) next.delete(attribute);
      else next.add(attribute);
      return next;
    });
  };

  const toggleEntity = (entityId: string) => {
    setSelectedEntities((prev) => {
      const next = new Set(prev);
      if (next.has(entityId)) next.delete(entityId);
      else next.add(entityId);
      return next;
    });
  };

  const toggleOtherFailures = (entityId: string) => {
    setExpandedOtherFailures((prev) => {
      const next = new Set(prev);
      if (next.has(entityId)) next.delete(entityId);
      else next.add(entityId);
      return next;
    });
  };

  const openAttributeRow = attributes.find((row) => row.attribute === openAttribute);

  const entityRows = useMemo(() => {
    if (!openAttributeRow?.entities) return [];
    let rows = openAttributeRow.entities;
    if (filter?.attribute === openAttributeRow.attribute && filter.failureType) {
      rows = rows.filter((row) =>
        filter.failureType === "single" ? row.remediationDot === "single" : row.remediationDot === "multi"
      );
    }
    if (recordFilter === "single") {
      rows = rows.filter((row) => row.remediationDot === "single");
    }
    if (entitySearch.trim()) {
      const q = entitySearch.trim().toLowerCase();
      rows = rows.filter(
        (row) =>
          row.entityId.toLowerCase().includes(q) ||
          row.type.toLowerCase().includes(q) ||
          row.make.toLowerCase().includes(q) ||
          row.model.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [openAttributeRow, filter, recordFilter, entitySearch]);

  type EntityTableRow =
    | ({ kind: "entity" } & RemediationEntityRow)
    | { kind: "otherFailures"; entityId: string; otherFailures: RemediationOtherFailure[] };

  const entityTableData: EntityTableRow[] = [];
  entityRows.forEach((row) => {
    entityTableData.push({ kind: "entity", ...row });
    if (row.otherFailures?.length && expandedOtherFailures.has(row.entityId)) {
      entityTableData.push({ kind: "otherFailures", entityId: row.entityId, otherFailures: row.otherFailures });
    }
  });

  const entityColumns: Column<EntityTableRow>[] = [
    {
      key: "selected",
      label: "",
      width: 44,
      render: (row) =>
        row.kind === "entity" ? (
          <input
            type="checkbox"
            checked={selectedEntities.has(row.entityId)}
            onChange={() => toggleEntity(row.entityId)}
            aria-label={`Select ${row.entityId}`}
          />
        ) : null,
    },
    {
      key: "entityId",
      label: "Entity ID",
      width: "flex",
      sortable: true,
      render: (row) =>
        row.kind === "entity" ? (
          <Button variant="link" size="small">
            {row.entityId}
          </Button>
        ) : (
          <div className={styles.otherFailures}>
            <p className={styles.otherFailuresTitle}>Other Failures :</p>
            <div className={styles.otherFailuresList}>
              {row.otherFailures.map((failure, index) => (
                <div key={index} className={styles.otherFailuresRow}>
                  <span className={styles.otherFailuresCategory}>{failure.category}</span>
                  <span className={styles.otherFailuresAttribute}>{failure.attribute}</span>
                </div>
              ))}
            </div>
          </div>
        ),
    },
    { key: "type", label: "Type", width: 130, sortable: true, render: (row) => (row.kind === "entity" ? row.type : "") },
    { key: "make", label: "Make", width: 110, sortable: true, render: (row) => (row.kind === "entity" ? row.make : "") },
    { key: "model", label: "Model", width: 140, sortable: true, render: (row) => (row.kind === "entity" ? row.model : "") },
    {
      key: "serialNumber",
      label: "Serial Number",
      width: 130,
      sortable: true,
      render: (row) =>
        row.kind === "entity" ? (
          row.serialNumber ? row.serialNumber : <span className={styles.emptyValue}>Empty</span>
        ) : (
          ""
        ),
    },
    { key: "location", label: "Location", width: 120, sortable: true, render: (row) => (row.kind === "entity" ? row.location : "") },
    {
      key: "remediationPath",
      label: "Remediation Path",
      width: 150,
      sortable: true,
      render: (row) => {
        if (row.kind !== "entity") return "";
        const dotColor =
          row.remediationDot === "single" ? "var(--xops-brand-primary)" : "var(--xops-status-warning-solid)";
        const isExpandable = Boolean(row.otherFailures?.length);
        return (
          <button
            type="button"
            className={styles.remediationPath}
            onClick={isExpandable ? () => toggleOtherFailures(row.entityId) : undefined}
            disabled={!isExpandable}
          >
            <span className={styles.remediationDot} style={{ backgroundColor: dotColor }} />
            {row.remediationLabel}
          </button>
        );
      },
    },
    {
      key: "lifecycleStatus",
      label: "Lifecycle Status",
      width: 120,
      render: (row) => (row.kind === "entity" ? <Tag status="success">{row.lifecycleStatus}</Tag> : ""),
    },
  ];

  const totalRecords = attributes.reduce(
    (sum, row) => (selectedAttributes.has(row.attribute) ? sum + row.totalRecords : sum),
    0
  );
  const singleFailureTotal = attributes.reduce(
    (sum, row) => (selectedAttributes.has(row.attribute) ? sum + row.singleFailure : sum),
    0
  );
  const multiFailureTotal = attributes.reduce(
    (sum, row) => (selectedAttributes.has(row.attribute) ? sum + row.multiFailure : sum),
    0
  );
  const singleFailurePercent = totalRecords ? Math.round((singleFailureTotal / totalRecords) * 100) : 0;
  const multiFailurePercent = totalRecords ? Math.round((multiFailureTotal / totalRecords) * 100) : 0;

  return (
    <div className={styles.panel}>
      <div className={styles.topBar}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <div className={styles.topBarRight}>
          <span className={styles.selectedSummary}>
            Selected: <strong>{totalRecords.toLocaleString("en-US")}</strong> (100% of Batch)
          </span>
          <MagicSurface className={styles.projectedPill} contentClassName={styles.projectedPillContent} scale={0.3}>
            <span>
              Projected Healthy CIs:{" "}
              <strong>{singleFailureTotal.toLocaleString("en-US")}</strong> ({singleFailurePercent}% of Selection)
            </span>
          </MagicSurface>
          <Button variant="primary">Request</Button>
        </div>
      </div>

      <h1 className={styles.title}>Remediation Request: {domain}</h1>

      <div className={styles.statRow}>
        <Stat label="Attributes Selected" value={String(selectedAttributes.size)} icon />
        <Stat label="Total CIs" value={totalRecords.toLocaleString("en-US")} icon />
        <Stat
          label="Single-Failure CIs"
          value={singleFailureTotal.toLocaleString("en-US")}
          meta={`(${singleFailurePercent}%)`}
          icon
          legendColor="var(--xops-brand-primary)"
        />
        <Stat
          label="Multi-Failure CIs"
          value={multiFailureTotal.toLocaleString("en-US")}
          meta={`(${multiFailurePercent}%)`}
          icon
          legendColor="var(--xops-status-warning-solid)"
        />
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchField}>
          <Icon name="search" color="var(--xops-text-disabled)" />
          <input
            type="text"
            placeholder="Search by Entity ID, Type, Make, Model..."
            value={entitySearch}
            onChange={(e) => setEntitySearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.toolbarRight}>
          <span className={styles.toolbarLabel}>Show Only Single-Issue CIs</span>
          <Toggle
            options={recordFilterOptions}
            value={recordFilter}
            onChange={setRecordFilter}
            ariaLabel="CI filter"
            size="small"
          />
        </div>
      </div>

      <div className={styles.attributeList}>
        {attributes.map((row) => {
          const isOpen = openAttribute === row.attribute;
          const isExpandable = Boolean(row.entities);
          return (
            <div key={row.attribute} className={styles.attributeRow}>
              <div className={styles.attributeHeader}>
                <input
                  type="checkbox"
                  checked={selectedAttributes.has(row.attribute)}
                  onChange={() => toggleAttribute(row.attribute)}
                  aria-label={`Select ${row.attribute}`}
                />
                {isExpandable ? (
                  <button
                    type="button"
                    className={styles.attributeToggle}
                    aria-expanded={isOpen}
                    onClick={() => setOpenAttribute(isOpen ? undefined : row.attribute)}
                  >
                    <span className={[styles.chevron, isOpen && styles.chevronOpen].filter(Boolean).join(" ")}>
                      <Icon name="keyboard_arrow_down" color="var(--xops-text-secondary)" />
                    </span>
                    <span className={styles.attributeLabel}>{row.attribute}</span>
                  </button>
                ) : (
                  <span className={[styles.attributeLabel, styles.attributeLabelStatic].join(" ")}>
                    {row.attribute}
                  </span>
                )}
                <div className={styles.attributeCounts}>
                  <span className={styles.attributeRecords}>{row.totalRecords.toLocaleString("en-US")} CIs</span>
                  <span className={styles.attributeCount}>
                    <span className={styles.remediationDot} style={{ backgroundColor: "var(--xops-brand-primary)" }} />
                    {row.singleFailure.toLocaleString("en-US")}
                  </span>
                  <span className={styles.attributeCount}>
                    <span
                      className={styles.remediationDot}
                      style={{ backgroundColor: "var(--xops-status-warning-solid)" }}
                    />
                    {row.multiFailure.toLocaleString("en-US")}
                  </span>
                </div>
              </div>

              {isOpen && isExpandable && (
                <div className={styles.attributeDetail}>
                  <p className={styles.showingLabel}>
                    Showing {entityRows.length} of {(row.entitiesTotal ?? row.totalRecords).toLocaleString("en-US")} CIs
                  </p>
                  <Table
                    columns={entityColumns}
                    data={entityTableData}
                    rowKey={(row) => (row.kind === "entity" ? row.entityId : `${row.entityId}-other-failures`)}
                    chrome={false}
                    headerLabelSize="subheading-12"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RemediationRequestPanel;
