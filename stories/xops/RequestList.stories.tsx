import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { RequestList } from '../../design-systems/xops/components/RequestList';
import { getRequestsDataset, REQUESTS_AS_OF } from '../../design-systems/xops/data/requests/generate';
import { listRequests } from '../../design-systems/xops/data/requests/metrics';

const meta: Meta<typeof RequestList> = {
  title: 'XOPS/RequestList',
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'xops-canvas' },
  },
};

export default meta;

type Story = StoryObj<typeof RequestList>;

const requests = listRequests(getRequestsDataset(), { day: REQUESTS_AS_OF, limit: 30 });

export const Default: Story = {
  render: () => {
    const [selectedId, setSelectedId] = useState<string | undefined>(requests[0].id);
    return (
      <div style={{ width: 344, height: 800, background: 'var(--xops-surface-page)' }}>
        <RequestList
          requests={requests}
          selectedId={selectedId}
          onSelect={setSelectedId}
          defaultExpandedId={requests[0].id}
        />
      </div>
    );
  },
};
