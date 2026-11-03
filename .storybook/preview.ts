import type { Preview } from '@storybook/react';
import '../styles/globals.css';
import '../design-systems/xops/tokens.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'XOPS theme',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (Story, context) => {
      document.documentElement.setAttribute('data-theme', context.globals.theme);
      return Story();
    },
  ],
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0B0B0D' },
        { name: 'surface-card', value: '#151719' },
        { name: 'xops-canvas', value: '#F9FAFB' },
      ],
    },
    layout: 'fullscreen',
  },
};

export default preview;
