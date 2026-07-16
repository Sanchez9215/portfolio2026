import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import Sidebar from '../../design-systems/xops/components/Sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'XOPS/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'xops-canvas' },
  },
};

export default meta;

type Story = StoryObj<typeof Sidebar>;

export const OverviewActive: Story = {
  args: {
    activeSoftwareItem: 'overview',
  },
};

export const AllSoftwareActive: Story = {
  args: {
    activeSoftwareItem: 'all-software',
  },
};

export const Collapsed: Story = {
  args: {
    activeItem: 'employees',
  },
};
