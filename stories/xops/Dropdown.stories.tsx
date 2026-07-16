import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Dropdown, DropdownOption } from '../../design-systems/xops/components/Dropdown';

const meta: Meta<typeof Dropdown> = {
  title: 'XOPS/Dropdown',
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'xops-canvas' },
  },
};

export default meta;

type Story = StoryObj<typeof Dropdown>;

const options: DropdownOption[] = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '50', label: '50' },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('20');
    return (
      <Dropdown
        value={value}
        options={options}
        onChange={setValue}
        ariaLabel="Items per page"
      />
    );
  },
};

export const Small: Story = {
  render: () => {
    const [value, setValue] = useState('20');
    return (
      <Dropdown
        size="small"
        value={value}
        options={options}
        onChange={setValue}
        ariaLabel="Items per page"
      />
    );
  },
};
