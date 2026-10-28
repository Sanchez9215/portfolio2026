import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
  OrchestrationGraph,
  type GraphEvent,
  type GraphLane,
} from '../../design-systems/xops/components/OrchestrationGraph';
import { stressEvents, stressLanes } from '../../design-systems/xops/data/requests/stress';

const meta: Meta<typeof OrchestrationGraph> = {
  title: 'XOPS/OrchestrationGraph',
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'xops-canvas' },
  },
};

export default meta;

type Story = StoryObj<typeof OrchestrationGraph>;

const lanes: GraphLane[] = [
  { id: 'employee', label: 'US VIP Onboarding', color: 'var(--xops-chart-6)' },
  { id: 'ITM-01', label: 'Device Deployment', color: 'var(--xops-chart-7)', status: 'open', code: 'ITM-01' },
  { id: 'ITM-02', label: 'Software Deployment', color: 'var(--xops-chart-2)', status: 'open', code: 'ITM-02' },
  { id: 'ITM-03', label: 'Badge Access', color: 'var(--xops-chart-1)', status: 'open', code: 'ITM-03' },
  { id: 'ITM-04', label: 'Mobile Line Assignment', color: 'var(--xops-chart-3)', status: 'open', code: 'ITM-04' },
];

// Global event order. Planned events keep their column (they set the scale) but aren't drawn.
const planned = (id: string, lane: string, title: string): GraphEvent => ({ id, lane, title, time: '', status: 'open' });

const openEvents: GraphEvent[] = [
  { id: 'e1', lane: 'employee', title: 'Hire Confirmed', time: '', status: 'in-progress' },
  planned('e2', 'employee', 'Start Date Set'),
  planned('e3', 'ITM-01', 'Inventory Available'),
  planned('e4', 'ITM-03', 'Security Approval'),
  planned('e5', 'ITM-02', 'Licenses Assigned'),
  planned('e6', 'ITM-04', 'Eligibility Confirmed'),
  planned('e7', 'employee', 'Day-One Readiness'),
];

// Open view: nothing has started, so the trunk's first event is its head.
export const AllOpen: Story = {
  render: () => (
    <div style={{ width: 742, background: 'var(--xops-surface-page)', padding: 'var(--xops-spacing-16)' }}>
      <OrchestrationGraph
        lanes={lanes}
        events={openEvents.map((event) => ({ ...event, status: 'open' as const }))}
      />
    </div>
  ),
};

const oneInProgressEvents: GraphEvent[] = [
  { id: 'e1', lane: 'employee', title: 'Hire Confirmed', time: '', status: 'complete' },
  { id: 'e2', lane: 'employee', title: 'Request Created', time: '', status: 'complete' },
  { id: 'e3', lane: 'employee', title: 'Identity Created', time: '', status: 'complete' },
  { id: 'e4', lane: 'ITM-03', title: 'Profile & Identity Linked', time: '', status: 'complete', triggeredBy: 'e3' },
  { id: 'e5', lane: 'ITM-03', title: 'Security Approval', time: '', status: 'complete' },
  { id: 'e6', lane: 'ITM-03', title: 'Access Zones Assigned', time: '', status: 'in-progress' },
  planned('e7', 'employee', 'Background Check Cleared'),
  planned('e8', 'ITM-01', 'Inventory Available'),
  planned('e9', 'ITM-02', 'Licenses Assigned'),
  planned('e10', 'ITM-04', 'Eligibility Confirmed'),
  planned('e11', 'ITM-03', 'Badge Printed'),
  planned('e12', 'employee', 'Day-One Readiness'),
];

export const OneLaneInProgress: Story = {
  render: () => (
    <div style={{ width: 742, background: 'var(--xops-surface-page)', padding: 'var(--xops-spacing-16)' }}>
      <OrchestrationGraph
        lanes={lanes.map((lane) => (lane.id === 'ITM-03' ? { ...lane, status: 'in-progress' as const } : lane))}
        events={oneInProgressEvents}
      />
    </div>
  ),
};

const mergedEvents: GraphEvent[] = [
  { id: 'e1', lane: 'employee', title: 'Hire Confirmed', time: '', status: 'complete' },
  { id: 'e2', lane: 'employee', title: 'Request Created', time: '', status: 'complete' },
  { id: 'e3', lane: 'employee', title: 'Identity Created', time: '', status: 'complete' },
  { id: 'e4', lane: 'ITM-01', title: 'Inventory Available', time: '', status: 'complete', triggeredBy: 'e3' },
  { id: 'e5', lane: 'ITM-03', title: 'Profile & Identity Linked', time: '', status: 'complete', triggeredBy: 'e3' },
  { id: 'e6', lane: 'ITM-01', title: 'Asset Allocated', time: '', status: 'complete' },
  { id: 'e7', lane: 'ITM-03', title: 'Security Approval', time: '', status: 'complete' },
  { id: 'e8', lane: 'ITM-01', title: 'Dispatch Initiated', time: '', status: 'complete' },
  { id: 'e9', lane: 'ITM-03', title: 'Access Zones Assigned', time: '', status: 'complete' },
  { id: 'e10', lane: 'ITM-01', title: 'Package Delivered', time: '', status: 'complete' },
  { id: 'e11', lane: 'ITM-03', title: 'Badge Provisioned', time: '', status: 'complete' },
  { id: 'e12', lane: 'ITM-01', title: 'Deployment Complete', time: '', status: 'complete' },
  { id: 'e13', lane: 'ITM-03', title: 'Badge Access Complete', time: '', status: 'complete' },
  planned('e14', 'employee', 'Background Check Cleared'),
  planned('e15', 'ITM-02', 'Licenses Assigned'),
  planned('e16', 'ITM-04', 'Eligibility Confirmed'),
  planned('e17', 'employee', 'Day-One Readiness'),
];

// Device and Badge are done and merge back into the trunk; Software and Mobile are still open.
export const TwoLanesComplete: Story = {
  render: () => (
    <div style={{ width: 742, background: 'var(--xops-surface-page)', padding: 'var(--xops-spacing-16)' }}>
      <OrchestrationGraph
        lanes={lanes.map((lane) => (lane.id === 'ITM-01' || lane.id === 'ITM-03' ? { ...lane, status: 'complete' as const } : lane))}
        events={mergedEvents}
      />
    </div>
  ),
};

export const FourteenItems: Story = {
  render: () => (
    <div style={{ width: 960, background: 'var(--xops-surface-page)', padding: 'var(--xops-spacing-16)' }}>
      <OrchestrationGraph lanes={stressLanes} events={stressEvents} />
    </div>
  ),
};

export const FourteenItemsNarrow: Story = {
  render: () => (
    <div style={{ width: 560, background: 'var(--xops-surface-page)', padding: 'var(--xops-spacing-16)' }}>
      <OrchestrationGraph lanes={stressLanes} events={stressEvents} />
    </div>
  ),
};
