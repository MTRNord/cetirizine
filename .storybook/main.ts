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
    {
      name: '@storybook/addon-styling',
      options: {
        // Check out https://github.com/storybookjs/addon-styling/blob/main/docs/api.md
        // For more details on this addon's options.
        postCss: true,
        sass: {
          // Require your preprocessor
          implementation: require("sass"),
        },
      },
    },
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  core: {
    disableTelemetry: true,
    builder: '@storybook/builder-vite',
  },
  async viteFinal(config) {
    // Merge custom configuration into the default config
    return mergeConfig(config, {
      // https://github.com/storybookjs/storybook/issues/22223
      build: {
        target: 'esnext'
      },
    });
  },
  docs: {
    autodocs: true,
    defaultName: 'Documentation',
  },
  staticDirs: ["../public"],
};
export default config;
