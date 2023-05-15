
import { injectAxe, checkA11y } from 'axe-playwright';

import type { TestRunnerConfig } from '@storybook/test-runner';
import { defaultMatrixClient } from "../src/app/sdk/client";

/*
 * See https://storybook.js.org/docs/react/writing-tests/test-runner#test-hook-api-experimental
 * to learn more about the test-runner hooks API.
 */
export const a11yConfig: TestRunnerConfig = {
    async preRender(page) {
        await injectAxe(page);
    },
    async postRender(page) {

        await checkA11y(page, '#storybook-root', {
            detailedReport: true,
            detailedReportOptions: {
                html: true,
            },
        });
    },
};