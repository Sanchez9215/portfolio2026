import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Table, Column, SortDirection } from '../../design-systems/xops/components/Table';
import Button from '../../design-systems/xops/components/Button';
import { LogoTile } from '../../design-systems/xops/components/LogoTile';
import { Tag, TagStatus } from '../../design-systems/xops/components/Tag';

const placeholderLogo =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#1677ff"/></svg>'
  );

type SoftwareRow = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  cost: string;
  status: TagStatus;
  statusLabel: string;
};

const rows: SoftwareRow[] = [
  { id: '1', name: 'Adobe Inc.', category: 'Design', quantity: 24, cost: '$12,400', status: 'success', statusLabel: 'Active' },
  { id: '2', name: 'Workday Inc.', category: 'HR', quantity: 8, cost: '$41,200', status: 'warning', statusLabel: '32 days' },
  { id: '3', name: 'Zoom Video Communications', category: 'Collaboration', quantity: 120, cost: '$9,600', status: 'danger', statusLabel: 'Expired' },
  { id: '4', name: 'Tableau Software', category: 'Analytics', quantity: 15, cost: '$18,000', status: 'neutral', statusLabel: 'Unassigned' },
];

const meta: Meta<typeof Table> = {
  title: 'XOPS/Table',
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'xops-canvas' },
  },
};

export default meta;

type Story = StoryObj<typeof Table>;

export const Default: Story = {
  render: () => {
    const columns: Column<SoftwareRow>[] = [
      {
        key: 'name',
        label: 'Software',
        width: 'flex',
        render: (row) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--xops-spacing-12)' }}>
            <LogoTile src={placeholderLogo} alt={row.name} size="medium" />
            <span>{row.name}</span>
          </div>
        ),
      },
      { key: 'category', label: 'Category', width: 'auto' },
      {
        key: 'quantity',
        label: 'Quantity',
        width: 140,
        align: 'right',
        sortable: true,
        render: (row) => (
          <Button variant="text" onClick={() => alert(`Drill into ${row.name}`)}>
            {row.quantity}
          </Button>
        ),
      },
      { key: 'cost', label: 'Annual Cost', width: 160, align: 'right', sortable: true },
      {
        key: 'status',
        label: 'Status',
        width: 140,
        render: (row) => <Tag status={row.status}>{row.statusLabel}</Tag>,
      },
    ];

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
      <Table
        columns={columns}
        data={rows}
        rowKey={(row) => row.id}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
      />
    );
  },
};
