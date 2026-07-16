import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import PageHeader from '../../design-systems/xops/components/PageHeader';

const meta: Meta<typeof PageHeader> = {
  title: 'XOPS/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'xops-canvas' },
  },
};

export default meta;

type Story = StoryObj<typeof PageHeader>;

export const WithCount: Story = {
  args: {
    title: 'All Software',
    count: 524,
    metaIcon: 'cloud_download',
    metaText: 'Data last updated Jan 14, 2025 at 02:06PM',
  },
};

export const WithoutCount: Story = {
  args: {
    title: 'Overview',
    metaIcon: 'cloud_download',
    metaText: 'Data last updated Jan 14, 2025 at 02:06PM',
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'Overview',
  },
};
