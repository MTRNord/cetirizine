import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    '@storybook/addon-a11y',
    '@geometricpanda/storybook-addon-badges',
    '@storybook/addon-styling',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  core: {
    disableTelemetry: true,
  },
  async viteFinal(config) {
    // Merge custom configuration into the default config
    return mergeConfig(config, {
      // https://github.com/storybookjs/storybook/issues/22223
      build: {
        target: 'esnext'
      }
    });
  },
  docs: {
    autodocs: true,
    defaultName: 'Documentation'
  },
  typescript: {
    reactDocgen: 'react-docgen',

    check: true,
    skipBabel: true,
  },
  staticDirs: ["../public"]
};
export default config;