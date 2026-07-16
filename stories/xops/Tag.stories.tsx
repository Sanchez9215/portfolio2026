import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
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
    </div>
  ),
};
