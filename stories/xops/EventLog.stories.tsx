import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { EventLog } from '../../design-systems/xops/components/EventLog';
import { getRequestsDataset } from '../../design-systems/xops/data/requests/generate';
import { eventLogEvents, eventLogLaneOptions } from '../../design-systems/xops/data/requests/metrics';

const meta: Meta<typeof EventLog> = {
  title: 'XOPS/EventLog',
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'xops-canvas' },
  },
};

export default meta;

type Story = StoryObj<typeof EventLog>;

const dataset = getRequestsDataset();
const request = dataset.requests.find((r) => r.id === 'REQ-232')!;

export const Default: Story = {
  render: () => (
    <div style={{ width: 742, background: 'var(--xops-surface-page)', padding: 'var(--xops-spacing-16)' }}>
      <EventLog events={eventLogEvents(dataset, request)} laneOptions={eventLogLaneOptions(request)} />
    </div>
  ),
};
