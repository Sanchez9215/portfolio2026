import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ProgressBar } from '../../design-systems/xops/components/ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'XOPS/ProgressBar',
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'xops-canvas' },
  },
};

export default meta;

type Story = StoryObj<typeof ProgressBar>;

export const Statuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--xops-spacing-16)', width: 320 }}>
      <ProgressBar value={82} threshold={85} status="danger" valueLabel="82%" />
      <ProgressBar value={89} threshold={85} status="warning" valueLabel="89%" />
      <ProgressBar value={98} threshold={92} status="success" valueLabel="98%" />
      <ProgressBar value={65} status="info" valueLabel="65% Complete" />
    </div>
  ),
};

export const Heights: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--xops-spacing-16)', width: 320 }}>
      <ProgressBar value={65} status="info" valueLabel="65%" height="16" />
      <ProgressBar value={65} status="info" valueLabel="65%" height="8" />
    </div>
  ),
};

export const NoThresholdMarker: Story = {
  render: () => (
    <div style={{ width: 200 }}>
      <ProgressBar value={40} status="success" valueLabel="40%" />
    </div>
  ),
};

export const Info: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--xops-spacing-16)', width: 320 }}>
      <ProgressBar value={65} status="info" valueLabel="65% Complete" height="8" />
      <ProgressBar value={92} status="info" valueLabel="92% Complete" height="8" />
      <ProgressBar value={8} status="info" valueLabel="8% Complete" height="8" />
    </div>
  ),
};
