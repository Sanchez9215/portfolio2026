import type { Preview } from '@storybook/react';
import '../styles/globals.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0B0B0D' },
        { name: 'surface-card', value: '#151719' },
      ],
    },
    layout: 'fullscreen',
  },
};

export default preview;
