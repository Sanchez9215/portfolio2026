import styles from './DataGlossaryTable.module.css'

export interface GlossaryRow {
  dataPoint: string
  definition: string
  criticality: string
  calculation: string
  painPointsSolved: string
  sourceIntegration: string
}

export const glossaryRows: GlossaryRow[] = [
  {
    dataPoint: 'Entitlement Quantity',
    definition: 'The total number of licenses legally owned under contract.',
    criticality: 'Critical: establishes baseline ownership.',
    calculation: 'Direct value from procurement/vendor entitlement (no calculation)',
    painPointsSolved: 'Eliminates entitlement uncertainty for SAM and enables accurate budgeting for Finance.',
    sourceIntegration: 'Procurement, Vendor portal',
  },
  {
    dataPoint: 'Cost per License',
    definition: 'Per-seat spend.',
    criticality: 'High: enables pricing validation and negotiation leverage.',
    calculation: 'Total Contract Cost ÷ Total Licenses Purchased',
    painPointsSolved: 'Informs pricing negotiations for Procurement and helps Finance evaluate spend efficiency.',
    sourceIntegration: 'Procurement',
  },
  {
    dataPoint: 'Total Contract Cost',
    definition: 'Total spend for the contract term.',
    criticality: 'High: defines financial exposure and budgeting impact.',
    calculation: 'Direct value from procurement contract record (no calculation)',
    painPointsSolved: "Supports Finance's forecasting and strengthens Procurement's negotiating position.",
    sourceIntegration: 'Procurement',
  },
  {
    dataPoint: 'Assigned Licenses',
    definition: 'The number of licenses currently assigned to employees.',
    criticality: 'Critical: shows who has access and prevents operational delays.',
    calculation: 'Direct value from identity provisioning assignments (no calculation)',
    painPointsSolved: 'Improves onboarding speed for IT Ops and prevents waste from over-assignment.',
    sourceIntegration: 'Okta/AD, Provisioning',
  },
  {
    dataPoint: 'Unassigned Licenses',
    definition: 'Licenses remaining to assign.',
    criticality: 'Critical: prevents onboarding delays and unnecessary spending.',
    calculation: 'Total Licenses Purchased − Assigned Licenses',
    painPointsSolved: 'Removes onboarding blockers and avoids unnecessary purchasing.',
    sourceIntegration: 'Derived',
  },
  {
    dataPoint: 'Active Licenses',
    definition: 'The number of users actively using the product within a defined period (30/60/90 days).',
    criticality: 'Critical: measures value vs waste for financial and operational decision-making.',
    calculation: 'Users with activity < 30 / 60 / 90 days',
    painPointsSolved: 'Reveals utilization against spend and identifies reclaim opportunities.',
    sourceIntegration: 'Telemetry, Analytics',
  },
  {
    dataPoint: 'Inactive Licenses',
    definition: 'The number of users who have not used the product within a defined period (30/60/90 days).',
    criticality: 'Critical: establishes the reclaim opportunity baseline.',
    calculation: 'Users with no activity > 30 / 60 / 90 days',
    painPointsSolved: 'Enables reclaiming unused licenses, prevents overspend, and improves spend efficiency and ROI visibility.',
    sourceIntegration: 'Telemetry, Analytics',
  },
  {
    dataPoint: 'Cost per Active User',
    definition: 'Spend efficiency metric.',
    criticality: 'High: measures true ROI relative to usage.',
    calculation: 'Total Contract Cost ÷ Active Users',
    painPointsSolved: 'Identifies overspend and validates optimization efforts.',
    sourceIntegration: 'Derived',
  },
  {
    dataPoint: 'Usage Frequency / Adoption',
    definition: 'How often the product is used.',
    criticality: 'High: enables dependency insight and adoption evaluation.',
    calculation: 'Count(activity events) ÷ Time Period',
    painPointsSolved: 'Identifies critical reliance on a tool and supports value justification.',
    sourceIntegration: 'Telemetry',
  },
  {
    dataPoint: 'Adoption Tier',
    definition: 'Expected usage breadth for a title: universal, broad, departmental, or niche.',
    criticality: 'High: sets the utilization baseline a title should be judged against.',
    calculation: 'Assigned from catalog classification (no calculation)',
    painPointsSolved: 'Avoids flagging niche tools as underutilized against a universal baseline.',
    sourceIntegration: 'Catalog',
  },
  {
    dataPoint: 'Contract Term Length',
    definition: 'Length of the current contract commitment, in months.',
    criticality: 'High: shapes renewal cadence and negotiation timing.',
    calculation: 'Direct value from contract record (no calculation)',
    painPointsSolved: 'Informs multi-year negotiation strategy and impacts cash flow planning.',
    sourceIntegration: 'Procurement',
  },
  {
    dataPoint: 'Auto-Renewal Status',
    definition: 'Whether the contract renews automatically or requires manual action at term end.',
    criticality: 'Critical: determines urgency of the renewal review.',
    calculation: 'Direct value from contract terms (no calculation)',
    painPointsSolved: 'Flags contracts needing proactive negotiation and prevents passive spend continuation.',
    sourceIntegration: 'Procurement',
  },
  {
    dataPoint: 'Renewal Date & Notice Period',
    definition: 'Contract expiration date and the cancel-by deadline before auto-renewal locks in.',
    criticality: 'Critical: prevents unwanted auto-renewal spend.',
    calculation: 'Contract Expiration Date − Notice Period Deadline',
    painPointsSolved: 'Avoids surprise renewals and creates negotiation lead time.',
    sourceIntegration: 'Procurement',
  },
  {
    dataPoint: 'License Model',
    definition: 'How the software is licensed: enterprise, perpetual, open-source, or consumption.',
    criticality: 'Critical: determines which cost and utilization calculations apply.',
    calculation: 'Direct value from procurement record (no calculation)',
    painPointsSolved: 'Routes each title through the correct governance model and prevents misapplied cost formulas.',
    sourceIntegration: 'Procurement',
  },
  {
    dataPoint: 'Compliance / Audit Status',
    definition: 'Alignment of total purchased vs assigned.',
    criticality: 'Critical: prevents audit penalties and financial risk.',
    calculation: 'Assigned Licenses ÷ Total Purchased',
    painPointsSolved: 'Supports proactive audit readiness and reduces financial risk exposure.',
    sourceIntegration: 'Procurement + Usage',
  },
  {
    dataPoint: 'Authorized / Unauthorized Software Status',
    definition: 'Indicates whether the software is approved or unapproved for use.',
    criticality: 'Critical: prevents risk exposure from shadow IT.',
    calculation: 'Installed Software ∉ Approved Software List',
    painPointsSolved: 'Reduces attack surface and enforces provisioning boundaries.',
    sourceIntegration: 'Telemetry + Identity + MDM',
  },
  {
    dataPoint: 'Version & Patch Status',
    definition: 'Whether installations are current, outdated, or vulnerable.',
    criticality: 'Critical: reduces vulnerability exposure and patch failure risk.',
    calculation: 'Installed Version ≠ Approved Version',
    painPointsSolved: 'Exposes outdated versions and improves patch success.',
    sourceIntegration: 'Telemetry / Endpoint / CMDB',
  },
  {
    dataPoint: 'Publisher / Vendor',
    definition: 'The company that owns and licenses the software.',
    criticality: 'High: anchors vendor relationship and renewal conversations.',
    calculation: 'Direct value from procurement record (no calculation)',
    painPointsSolved: 'Consolidates vendor-level spend across titles and flags vendor concentration risk.',
    sourceIntegration: 'Procurement',
  },
  {
    dataPoint: 'Lifecycle Stage',
    definition: 'Where a title sits in its lifecycle: evaluation, rollout, operational, or renewal.',
    criticality: 'Critical: determines what data exists and what actions are relevant.',
    calculation: 'Derived from contract effective/expiration dates and evaluation status',
    painPointsSolved: 'Prioritizes attention by stage and anticipates onboarding vs. offboarding load.',
    sourceIntegration: 'Derived',
  },
  {
    dataPoint: 'Department / Cost Center Attribution',
    definition: 'Which department and cost center owns the spend for a given license.',
    criticality: 'Critical: enables budget accountability at the point of decision.',
    calculation: 'Joined from employee assignment records to org taxonomy',
    painPointsSolved: 'Attributes waste to the right budget owner and gives department leads visibility into their own software footprint.',
    sourceIntegration: 'HR + Config',
  },
]

export const glossaryColumns: { key: keyof GlossaryRow; label: string }[] = [
  { key: 'dataPoint', label: 'Data Point' },
  { key: 'definition', label: 'Definition' },
  { key: 'criticality', label: 'Criticality' },
  { key: 'calculation', label: 'Calculation' },
  { key: 'painPointsSolved', label: 'Pain Points Solved' },
  { key: 'sourceIntegration', label: 'Source/Integration' },
]

export default function DataGlossaryTable() {
  return (
    <div className={styles.scrollWrapper}>
      <div className={styles.table} role="table">
        <div className={styles.headerRow} role="row">
          {glossaryColumns.map((col) => (
            <div key={col.key} className={styles.headerCell} role="columnheader">
              {col.label}
            </div>
          ))}
        </div>
        {glossaryRows.map((row) => (
          <div key={row.dataPoint} className={styles.bodyRow} role="row">
            {glossaryColumns.map((col) => (
              <div key={col.key} className={styles.bodyCell} role="cell">
                {row[col.key]}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
