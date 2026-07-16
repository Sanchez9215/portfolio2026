import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Menu, MenuOption } from '../../design-systems/xops/components/Menu';

const meta: Meta<typeof Menu> = {
  title: 'XOPS/Menu',
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'xops-canvas' },
  },
};

export default meta;

type Story = StoryObj<typeof Menu>;

const options: MenuOption[] = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '50', label: '50' },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('20');
    return <Menu options={options} value={value} onSelect={setValue} ariaLabel="Items per page" />;
  },
};
