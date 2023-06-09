import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    '@storybook/addon-a11y',
    'storybook-addon-react-router-v6',
    {
      name: '@storybook/addon-coverage',
      options: {
        istanbul: {
          exclude: [
            'src/mocks/*.ts'
          ],
          excludeNodeModules: true,
        }
      }
    }
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
        target: 'esnext',
        sourceMap: false,
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
  staticDirs: ["../public"],
  features: {
    storyStoreV7: false,
  }
};
export default config;