import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import Button from '../../design-systems/xops/components/Button';

const FilterIcon = () => <img src="/xops/icons/Filter.svg" alt="" />;
const AddCircleIcon = () => <img src="/xops/icons/add_circle.svg" alt="" />;

const meta: Meta<typeof Button> = {
  title: 'XOPS/Button',
  component: Button,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'xops-canvas' },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Global',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Add Filter',
  },
};

export const SecondaryWithIcon: Story = {
  args: {
    variant: 'secondary',
    icon: <AddCircleIcon />,
    children: 'Add Filter',
  },
};

export const IconOnly: Story = {
  args: {
    iconOnly: true,
    icon: <FilterIcon />,
    ariaLabel: 'Filter',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="primary">Global</Button>
      <Button variant="secondary">Add Filter</Button>
      <Button variant="secondary" icon={<AddCircleIcon />}>
        Add Filter
      </Button>
      <Button iconOnly icon={<FilterIcon />} ariaLabel="Filter" />
    </div>
  ),
};
