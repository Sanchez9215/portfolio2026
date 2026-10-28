import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { StatusIcon } from '../../design-systems/xops/components/StatusIcon';
import { Tag } from '../../design-systems/xops/components/Tag';

const meta: Meta<typeof Tag> = {
  title: 'XOPS/Tag',
  component: Tag,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'xops-canvas' },
  },
};

export default meta;

type Story = StoryObj<typeof Tag>;

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--xops-spacing-8)' }}>
      <Tag status="success">Active</Tag>
      <Tag status="warning">32 days</Tag>
      <Tag status="danger">Expired</Tag>
      <Tag status="neutral">Unassigned</Tag>
      <Tag status="info">In-Progress</Tag>
    </div>
  ),
};

export const Small: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--xops-spacing-8)' }}>
      <Tag status="success" size="small">Active</Tag>
      <Tag status="warning" size="small">Suspended</Tag>
      <Tag status="danger" size="small">Expired</Tag>
      <Tag status="neutral" size="small">Unassigned</Tag>
      <Tag status="info" size="small">In-Progress</Tag>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--xops-spacing-8)' }}>
      <Tag status="danger" size="small" icon={<StatusIcon status="exception" size="12" />}>1</Tag>
      <Tag status="warning" size="small" icon={<StatusIcon status="warning" size="12" />}>2</Tag>
    </div>
  ),
};
