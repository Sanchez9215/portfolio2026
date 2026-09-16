import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
  RemediationRequestList,
  RemediationRequest,
} from '../../design-systems/xops/components/RemediationRequestList';
import { Card } from '../../design-systems/xops/components/Card';

const meta: Meta<typeof RemediationRequestList> = {
  title: 'XOPS/RemediationRequestList',
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'xops-canvas' },
  },
};

export default meta;

type Story = StoryObj<typeof RemediationRequestList>;

const requests: RemediationRequest[] = [
  {
    id: '#INF-9912',
    percent: 65,
    percentLabel: '65% Complete',
    recordsLabel: '1,475/2,270 Records',
    departments: [
      { department: 'Network Engineering', percent: 100, remediatedTotalLabel: '300/300 Records' },
      { department: 'Global Data Centers', percent: 82, remediatedTotalLabel: '590/720 Records' },
      { department: 'Cloud & Virtualization', percent: 60, remediatedTotalLabel: '240/400 Records' },
      { department: 'Cloud & Virtualization', percent: 40, remediatedTotalLabel: '340 / 850 Records' },
    ],
  },
  {
    id: '#INF-9911',
    percent: 92,
    percentLabel: '92% Complete',
    recordsLabel: '1,104/1,200 Records',
    departments: [],
  },
  {
    id: '#INF-9910',
    percent: 8,
    percentLabel: '8% Complete',
    recordsLabel: '24/310 Records',
    departments: [],
  },
];

export const Default: Story = {
  render: () => (
    <Card title="Open Remediation Requests">
      <RemediationRequestList requests={requests} defaultOpenId="#INF-9912" />
    </Card>
  ),
};

export const AllCollapsed: Story = {
  render: () => (
    <Card title="Open Remediation Requests">
      <RemediationRequestList requests={requests} />
    </Card>
  ),
};

export const EmptyDepartments: Story = {
  render: () => (
    <Card title="Open Remediation Requests">
      <RemediationRequestList
        requests={[requests[1]]}
        defaultOpenId="#INF-9911"
      />
    </Card>
  ),
};
