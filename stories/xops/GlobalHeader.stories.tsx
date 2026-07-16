import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import GlobalHeader from '../../design-systems/xops/components/GlobalHeader';

const meta: Meta<typeof GlobalHeader> = {
  title: 'XOPS/GlobalHeader',
  component: GlobalHeader,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'xops-canvas' },
  },
};

export default meta;

type Story = StoryObj<typeof GlobalHeader>;

export const Default: Story = {
  args: {
    userName: 'John Doe',
    notificationCount: 19,
  },
};

export const NoNotifications: Story = {
  args: {
    userName: 'John Doe',
  },
};
