import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Pagination } from '../../design-systems/xops/components/Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'XOPS/Pagination',
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'xops-canvas' },
  },
};

export default meta;

type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    return (
      <Pagination
        page={page}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 50]}
        totalItems={3267}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    );
  },
};
