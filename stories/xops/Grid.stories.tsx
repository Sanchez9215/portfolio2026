import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Grid, GridItem } from '../../design-systems/xops/components/Grid';

const meta: Meta<typeof Grid> = {
  title: 'XOPS/Grid',
  component: Grid,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'xops-canvas' },
  },
};

export default meta;

type Story = StoryObj<typeof Grid>;

const swatch: React.CSSProperties = {
  background: 'var(--xops-brand-100)',
  border: '1px solid var(--xops-brand-300)',
  borderRadius: 'var(--xops-radius-8)',
  padding: 'var(--xops-spacing-16)',
  textAlign: 'center',
};

export const Default: Story = {
  render: () => (
    <Grid>
      <GridItem colSpan={4}>
        <div style={swatch}>4</div>
      </GridItem>
      <GridItem colSpan={4}>
        <div style={swatch}>4</div>
      </GridItem>
      <GridItem colSpan={4}>
        <div style={swatch}>4</div>
      </GridItem>
      <GridItem colSpan={8}>
        <div style={swatch}>8</div>
      </GridItem>
      <GridItem colSpan={4}>
        <div style={swatch}>4</div>
      </GridItem>
      <GridItem colSpan={12}>
        <div style={swatch}>12</div>
      </GridItem>
    </Grid>
  ),
};

export const TightGutter: Story = {
  render: () => (
    <Grid gutter="tight">
      <GridItem colSpan={6}>
        <div style={swatch}>6</div>
      </GridItem>
      <GridItem colSpan={6}>
        <div style={swatch}>6</div>
      </GridItem>
    </Grid>
  ),
};
