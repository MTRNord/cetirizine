import type { Preview } from "@storybook/react";
import "../src/index.scss";
import "./tailwindcss.scss";
import { DEFAULT_THEME, withTailwindTheme } from "./withTailwindTheme.decorator";
import { initAsync, start } from "@mtrnord/matrix-sdk-crypto-js";

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
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global theme for components",
      defaultValue: DEFAULT_THEME,
      toolbar: {
        icon: "paintbrush",
        // Array of plain string values or MenuItem shape (see below)
        items: [
          { value: "light", title: "Light", left: "🌞" },
          { value: "dark", title: "Dark", left: "🌛" },
        ],
        // Change title based on selected value
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    withTailwindTheme,
  ],
};

export default preview;
