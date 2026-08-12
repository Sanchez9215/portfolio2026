import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import Button from '../../design-systems/xops/components/Button';
import Icon from '../../design-systems/xops/components/Icon';

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

export const Text: Story = {
  args: {
    variant: 'text',
    children: 'Back',
    icon: <Icon name="chevron_backward" color="var(--xops-text-secondary)" />,
  },
};

export const TextWithoutIcon: Story = {
  args: {
    variant: 'text',
    children: 'Back',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    size: 'small',
    children: 'Learn More',
  },
};

export const LinkEmployeeName: Story = {
  args: {
    variant: 'link',
    size: 'small',
    children: 'Jane Doe',
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
      <Button
        variant="text"
        icon={<Icon name="chevron_backward" color="var(--xops-text-secondary)" />}
      >
        Back
      </Button>
      <Button variant="link" size="small">
        Learn More
      </Button>
      <Button iconOnly icon={<FilterIcon />} ariaLabel="Filter" />
    </div>
  ),
};
