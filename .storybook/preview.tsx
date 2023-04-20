import type { Preview } from "@storybook/react";
import React from "react";
import { Provider } from "react-redux";
import { store } from "../src/app/store";
import { withThemeByDataAttribute } from '@storybook/addon-styling';
import './tailwindcss.scss'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
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
      <Provider store={store} >
        <Story />
      </Provider>
    ),
  ]
};

export default preview;
