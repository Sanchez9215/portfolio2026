import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Legend } from '../../design-systems/xops/components/Legend';

const meta: Meta<typeof Legend> = {
  title: 'XOPS/Legend',
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'xops-canvas' },
  },
};

export default meta;

type Story = StoryObj<typeof Legend>;

export const Default: Story = {
  render: () => (
    <Legend
      items={[
        { label: 'Active', value: '289,000', meta: '70.1%', color: 'var(--xops-status-success-solid)' },
        { label: 'Inactive', value: '52,000', meta: '12.6%', color: 'var(--xops-status-warning-solid)' },
        { label: 'Unassigned', value: '71,000', meta: '17.2%', color: 'var(--xops-grey-300)' },
      ]}
    />
  ),
};
