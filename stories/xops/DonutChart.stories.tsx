import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DonutChart } from '../../design-systems/xops/components/DonutChart';

const meta: Meta<typeof DonutChart> = {
  title: 'XOPS/DonutChart',
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'xops-canvas' },
  },
};

export default meta;

type Story = StoryObj<typeof DonutChart>;

export const Default: Story = {
  render: () => (
    <DonutChart
      segments={[
        { value: 289000, color: 'var(--xops-status-success-solid)' },
        { value: 52000, color: 'var(--xops-status-warning-solid)' },
        { value: 71000, color: 'var(--xops-grey-300)' },
      ]}
    />
  ),
};
