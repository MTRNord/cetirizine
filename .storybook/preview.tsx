import type { Preview } from "@storybook/react";
import React from "react";
import { withThemeByDataAttribute } from '@storybook/addon-styling';
import "../src/index.scss";
import "./tailwindcss.scss";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: {
        order: ['Introduction', 'Fundamentals', '*'],
      },
    },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
      attributeName: 'data-mode',
    }),
    (Story) => (
      <Story />
    ),
  ]
};

export default preview;
