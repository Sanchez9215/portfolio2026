import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { RankedBarChart } from '../../design-systems/xops/components/RankedBarChart';

const meta: Meta<typeof RankedBarChart> = {
  title: 'XOPS/RankedBarChart',
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'xops-canvas' },
  },
};

export default meta;

type Story = StoryObj<typeof RankedBarChart>;

const chartColors = [
  'var(--xops-chart-1)',
  'var(--xops-chart-2)',
  'var(--xops-chart-3)',
  'var(--xops-chart-4)',
  'var(--xops-chart-5)',
  'var(--xops-chart-6)',
  'var(--xops-chart-7)',
  'var(--xops-chart-8)',
];

const departments = [
  { label: 'Engineering', value: 420 },
  { label: 'Sales', value: 365 },
  { label: 'Operations', value: 310 },
  { label: 'Customer Support', value: 265 },
  { label: 'Marketing', value: 220 },
  { label: 'Finance', value: 180 },
  { label: 'HR', value: 155 },
  { label: 'IT', value: 135 },
  { label: 'Product', value: 120 },
  { label: 'Legal', value: 110 },
];

export const Default: Story = {
  render: () => (
    <RankedBarChart
      rows={departments.map((row, index) => ({
        ...row,
        color: chartColors[index % chartColors.length],
      }))}
    />
  ),
};

export const Scrolling: Story = {
  render: () => (
    <RankedBarChart
      rows={[...departments, { label: 'Legal Ops', value: 95 }, { label: 'Facilities', value: 80 }].map(
        (row, index) => ({
          ...row,
          color: chartColors[index % chartColors.length],
        }),
      )}
    />
  ),
};
