import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import Count from '../../design-systems/xops/components/Count';

const meta: Meta<typeof Count> = {
  title: 'XOPS/Count',
  component: Count,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'xops-canvas' },
  },
};

export default meta;

type Story = StoryObj<typeof Count>;

export const Default: Story = {
  args: {
    value: 524,
  },
};
