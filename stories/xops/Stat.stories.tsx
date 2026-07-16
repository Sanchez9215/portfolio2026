import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Stat } from '../../design-systems/xops/components/Stat';

const meta: Meta<typeof Stat> = {
  title: 'XOPS/Stat',
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'xops-canvas' },
  },
};

export default meta;

type Story = StoryObj<typeof Stat>;

export const Default: Story = {
  render: () => <Stat label="Total Owned" value="412,000" meta="100%" />,
};

export const NoMeta: Story = {
  render: () => <Stat label="Primary Owner" value="Cristofer Workman" />,
};

export const Row: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--xops-spacing-8)' }}>
      <Stat label="Total Owned" value="412,000" meta="100%" />
      <Stat label="Assigned" value="357,000" meta="86.7%" />
    </div>
  ),
};
