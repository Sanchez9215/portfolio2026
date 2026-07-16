import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Card } from '../../design-systems/xops/components/Card';
import { Grid, GridItem } from '../../design-systems/xops/components/Grid';
import { Table, Column, SortDirection } from '../../design-systems/xops/components/Table';
import { Stat } from '../../design-systems/xops/components/Stat';
import { Legend } from '../../design-systems/xops/components/Legend';
import { DonutChart } from '../../design-systems/xops/components/DonutChart';
import { LogoTile } from '../../design-systems/xops/components/LogoTile';
import { Tag, TagStatus } from '../../design-systems/xops/components/Tag';
import { FilterTabs, FilterTabOption } from '../../design-systems/xops/components/FilterTabs';

const meta: Meta<typeof Card> = {
  title: 'XOPS/Card',
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'xops-canvas' },
  },
};

export default meta;

type Story = StoryObj<typeof Card>;

type NonCompliantRow = {
  id: string;
  software: string;
  logo: string;
  instances: number;
  type: string;
};

const nonCompliantRows: NonCompliantRow[] = [
  {
    id: '1',
    software: 'Adobe CC',
    logo: '/xops/publisher-logos/adobe-inc.jpg',
    instances: 4820,
    type: 'Over-Assigned',
  },
  {
    id: '2',
    software: 'Visio Pro',
    logo: '/xops/publisher-logos/microsoft-corporation.jpg',
    instances: 3640,
    type: 'Unauthorized Installations',
  },
  {
    id: '3',
    software: 'Zoom Pro',
    logo: '/xops/publisher-logos/zoom-video-communications-inc.jpg',
    instances: 3110,
    type: 'Outdated Version',
  },
];

const nonCompliantColumns: Column<NonCompliantRow>[] = [
  {
    key: 'software',
    label: 'Software',
    width: 'flex',
    render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--xops-spacing-8)' }}>
        <LogoTile src={row.logo} alt={row.software} size="medium" />
        <span>{row.software}</span>
      </div>
    ),
  },
  { key: 'instances', label: 'Instances', width: 70, align: 'right' },
  { key: 'type', label: 'Type', width: 'flex' },
];

export const Default: Story = {
  render: () => (
    <Card title="License Utilization">
      <p style={{ color: 'var(--xops-text-secondary)' }}>Chart content goes here.</p>
    </Card>
  ),
};

export const LicenseUtilization: Story = {
  render: () => (
    <Grid style={{ alignItems: 'start', alignContent: 'start' }}>
      <GridItem colSpan={4} style={{ alignSelf: 'start' }}>
        <Card title="License Utilization">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--xops-spacing-16)' }}>
            <div style={{ display: 'flex', gap: 'var(--xops-spacing-8)' }}>
              <Stat label="Total Owned" value="412,000" meta="100%" />
              <Stat label="Assigned" value="357,000" meta="86.7%" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <DonutChart
                segments={[
                  { value: 289000, color: 'var(--xops-status-success-solid)' },
                  { value: 52000, color: 'var(--xops-status-warning-solid)' },
                  { value: 71000, color: 'var(--xops-grey-300)' },
                ]}
              />
            </div>
            <Legend
              items={[
                { label: 'Active', value: '289,000', meta: '70.1%', color: 'var(--xops-status-success-solid)' },
                { label: 'Inactive', value: '52,000', meta: '12.6%', color: 'var(--xops-status-warning-solid)' },
                { label: 'Unassigned', value: '71,000', meta: '17.2%', color: 'var(--xops-grey-300)' },
              ]}
            />
          </div>
        </Card>
      </GridItem>
    </Grid>
  ),
};

export const SecurityCompliance: Story = {
  render: () => (
    <Grid style={{ alignItems: 'start', alignContent: 'start' }}>
      <GridItem colSpan={4} style={{ alignSelf: 'start' }}>
        <Card title="Security Compliance">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--xops-spacing-16)' }}>
            <div style={{ display: 'flex', gap: 'var(--xops-spacing-8)' }}>
              <Stat label="Total Instances Scanned" value="248,000" meta="100%" />
              <Stat label="Non-Compliant" value="38,200" meta="15.4%" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <DonutChart
                segments={[
                  { value: 209800, color: 'var(--xops-status-success-solid)' },
                  { value: 18400, color: 'var(--xops-status-danger-solid)' },
                  { value: 11900, color: 'var(--xops-grey-300)' },
                  { value: 5200, color: 'var(--xops-chart-7)' },
                  { value: 2700, color: 'var(--xops-status-warning-solid)' },
                ]}
              />
            </div>
            <Legend
              items={[
                { label: 'Compliant', value: '209,800', meta: '84.6%', color: 'var(--xops-status-success-solid)' },
                { label: 'Patch Required', value: '18,400', meta: '7.4%', color: 'var(--xops-status-danger-solid)' },
                { label: 'Outdated Version', value: '11,900', meta: '4.8%', color: 'var(--xops-grey-300)' },
                { label: 'Support Ended', value: '5,200', meta: '2.1%', color: 'var(--xops-chart-7)' },
                { label: 'Policy Violation', value: '2,700', meta: '1.1%', color: 'var(--xops-status-warning-solid)' },
              ]}
            />
          </div>
        </Card>
      </GridItem>
    </Grid>
  ),
};

type LicenseModelRow = {
  id: string;
  software: string;
  logo: string;
  totalSpend: string;
  totalPurchasedLicenses: string;
  unassigned: string;
  inactive: string;
  active: string;
  utilization: number;
};

function utilizationStatus(percent: number): TagStatus {
  if (percent >= 85) return 'success';
  if (percent >= 75) return 'warning';
  return 'danger';
}

const licenseModelRows: LicenseModelRow[] = [
  { id: '1', software: 'Microsoft 365 E3', logo: '/xops/publisher-logos/microsoft-corporation.jpg', totalSpend: '$18.6M', totalPurchasedLicenses: '-', unassigned: '-', inactive: '-', active: '-', utilization: 71 },
  { id: '2', software: 'SAP Enterprise', logo: '/xops/publisher-logos/sap-ag.jpg', totalSpend: '$14.2M', totalPurchasedLicenses: '-', unassigned: '-', inactive: '-', active: '-', utilization: 80 },
  { id: '3', software: 'Oracle ULA', logo: '/xops/publisher-logos/oracle-corporation.jpg', totalSpend: '$11.8M', totalPurchasedLicenses: '-', unassigned: '-', inactive: '-', active: '-', utilization: 55 },
  { id: '4', software: 'Salesforce Sales Cloud', logo: '/xops/publisher-logos/salesforce-inc.jpg', totalSpend: '$9.7M', totalPurchasedLicenses: '-', unassigned: '-', inactive: '-', active: '-', utilization: 70 },
  { id: '5', software: 'ServiceNow Enterprise', logo: '/xops/publisher-logos/servicenow-inc.jpg', totalSpend: '$8.3M', totalPurchasedLicenses: '-', unassigned: '-', inactive: '-', active: '-', utilization: 38 },
  { id: '6', software: 'VMware ELA', logo: '/xops/publisher-logos/vmware-inc.jpg', totalSpend: '$7.4M', totalPurchasedLicenses: '-', unassigned: '-', inactive: '-', active: '-', utilization: 85 },
  { id: '7', software: 'Workday HCM', logo: '/xops/publisher-logos/workday-inc.jpg', totalSpend: '$6.1M', totalPurchasedLicenses: '-', unassigned: '-', inactive: '-', active: '-', utilization: 82 },
  { id: '8', software: 'Adobe ETLA', logo: '/xops/publisher-logos/adobe-inc.jpg', totalSpend: '$5.2M', totalPurchasedLicenses: '-', unassigned: '-', inactive: '-', active: '-', utilization: 67 },
  { id: '9', software: 'Cisco EA', logo: '/xops/publisher-logos/cisco-systems-inc.jpg', totalSpend: '$4.3M', totalPurchasedLicenses: '-', unassigned: '-', inactive: '-', active: '-', utilization: 62 },
  { id: '10', software: 'Atlassian Cloud', logo: '/xops/publisher-logos/atlassian-corporation.jpg', totalSpend: '$2.8M', totalPurchasedLicenses: '-', unassigned: '-', inactive: '-', active: '-', utilization: 48 },
];

const licenseModelColumns: Column<LicenseModelRow>[] = [
  {
    key: 'software',
    label: 'Software',
    width: 'flex',
    sortable: true,
    render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--xops-spacing-8)' }}>
        <LogoTile src={row.logo} alt={row.software} size="medium" />
        <span>{row.software}</span>
      </div>
    ),
  },
  { key: 'totalSpend', label: 'Total Spend', width: 'auto', align: 'right', sortable: true },
  { key: 'totalPurchasedLicenses', label: 'Purchased Licenses', width: 'auto', align: 'right', sortable: true },
  { key: 'unassigned', label: 'Unassigned', width: 'auto', align: 'right', sortable: true },
  { key: 'inactive', label: 'Inactive', width: 'auto', align: 'right', sortable: true },
  { key: 'active', label: 'Active', width: 'auto', align: 'right', sortable: true },
  {
    key: 'utilization',
    label: 'Utilization',
    width: 'auto',
    sortable: true,
    render: (row) => <Tag status={utilizationStatus(row.utilization)}>{row.utilization}%</Tag>,
  },
];

const licenseModelOptions: FilterTabOption[] = [
  { value: 'enterprise-agreements', label: 'Enterprise Agreements' },
  { value: 'open-source', label: 'Open Source' },
  { value: 'perpetual', label: 'Perpetual' },
  { value: 'consumption-based', label: 'Consumption-based', disabled: true },
];

export const TopSpendByLicenseModel: Story = {
  render: () => {
    const [tab, setTab] = useState('enterprise-agreements');
    const [sortKey, setSortKey] = useState<string | undefined>(undefined);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const handleSortChange = (key: string) => {
      if (key === sortKey) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortKey(key);
        setSortDirection('asc');
      }
    };

    return (
      <Grid>
        <GridItem colSpan={12}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--xops-spacing-16)',
              backgroundColor: 'var(--xops-white)',
              border: 'var(--xops-border-width-1) solid var(--xops-border-divider)',
              borderRadius: 'var(--xops-radius-6)',
              padding: 'var(--xops-spacing-16)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--xops-spacing-16)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--xops-spacing-16)' }}>
                <p
                  style={{
                    margin: 0,
                    fontFamily: 'var(--xops-font-family)',
                    fontWeight: 'var(--xops-font-weight-medium)',
                    fontSize: 'var(--xops-typography-subheading-16-font-size)',
                    lineHeight: 'var(--xops-typography-subheading-16-line-height)',
                    color: 'var(--xops-text-primary)',
                  }}
                >
                  Top Spend By License Model
                </p>
                <FilterTabs
                  options={licenseModelOptions}
                  value={tab}
                  onChange={setTab}
                  ariaLabel="Filter by license model"
                />
              </div>
              <Stat
                label="Total Annual Spend"
                value="$132.2M"
                meta="(13%)"
                style={{ flex: '0 0 auto' }}
              />
            </div>
            <Table
              chrome={false}
              columns={licenseModelColumns}
              data={licenseModelRows}
              rowKey={(row) => row.id}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
            />
          </div>
        </GridItem>
      </Grid>
    );
  },
};

export const WithEmbeddedTable: Story = {
  render: () => (
    <Card title="Top Non-Compliant Software">
      <Table
        chrome={false}
        columns={nonCompliantColumns}
        data={nonCompliantRows}
        rowKey={(row) => row.id}
      />
    </Card>
  ),
};

export const ThreeUpRow: Story = {
  render: () => (
    <Grid>
      <GridItem colSpan={4}>
        <Card title="License Utilization">
          <p style={{ color: 'var(--xops-text-secondary)' }}>Donut chart</p>
        </Card>
      </GridItem>
      <GridItem colSpan={4}>
        <Card title="Top Non-Compliant Software">
          <Table
            chrome={false}
            columns={nonCompliantColumns}
            data={nonCompliantRows}
            rowKey={(row) => row.id}
          />
        </Card>
      </GridItem>
      <GridItem colSpan={4}>
        <Card title="Renewal Timeline">
          <p style={{ color: 'var(--xops-text-secondary)' }}>Short content</p>
        </Card>
      </GridItem>
    </Grid>
  ),
};
