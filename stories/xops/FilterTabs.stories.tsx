import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { FilterTabs, FilterTabOption } from '../../design-systems/xops/components/FilterTabs';

const meta: Meta<typeof FilterTabs> = {
  title: 'XOPS/FilterTabs',
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'xops-canvas' },
  },
};

export default meta;

type Story = StoryObj<typeof FilterTabs>;

const licenseModelOptions: FilterTabOption[] = [
  { value: 'enterprise-agreements', label: 'Enterprise Agreements' },
  { value: 'open-source', label: 'Open Source' },
  { value: 'perpetual', label: 'Perpetual' },
  { value: 'consumption-based', label: 'Consumption-based', disabled: true },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('enterprise-agreements');
    return (
      <FilterTabs
        options={licenseModelOptions}
        value={value}
        onChange={setValue}
        ariaLabel="Filter by license model"
      />
    );
  },
};

const lifecycleOptions: FilterTabOption[] = [
  { value: 'in-evaluation', label: 'In Evaluation', stat: '120' },
  { value: 'rollout', label: 'Rollout', stat: '75' },
  { value: 'operational', label: 'Operational', stat: '1,200' },
  { value: 'renewal', label: 'Renewal', stat: '300' },
];

export const Large: Story = {
  render: () => {
    const [value, setValue] = useState('in-evaluation');
    return (
      <FilterTabs
        variant="large"
        options={lifecycleOptions}
        value={value}
        onChange={setValue}
        ariaLabel="Filter by lifecycle stage"
      />
    );
  },
};

export const Small: Story = {
  render: () => {
    const [value, setValue] = useState('enterprise-agreements');
    return (
      <FilterTabs
        size="small"
        options={licenseModelOptions}
        value={value}
        onChange={setValue}
        ariaLabel="Filter by license model"
      />
    );
  },
};
