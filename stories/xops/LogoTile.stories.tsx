import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { LogoTile } from '../../design-systems/xops/components/LogoTile';

const placeholder =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="#1677ff"/></svg>'
  );

const meta: Meta<typeof LogoTile> = {
  title: 'XOPS/LogoTile',
  component: LogoTile,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'xops-canvas' },
  },
};

export default meta;

type Story = StoryObj<typeof LogoTile>;

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--xops-spacing-16)', alignItems: 'center' }}>
      <LogoTile src={placeholder} alt="Zoom" size="small" />
      <LogoTile src={placeholder} alt="Zoom" size="medium" />
      <LogoTile src={placeholder} alt="Zoom" size="large" />
    </div>
  ),
};
