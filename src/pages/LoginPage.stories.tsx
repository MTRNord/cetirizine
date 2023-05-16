import { Meta, StoryObj } from '@storybook/react';
import LoginPage from './LoginPage';
import { withRouter } from 'storybook-addon-react-router-v6';
import { initAsync, start } from '@mtrnord/matrix-sdk-crypto-js';

const meta: Meta<typeof LoginPage> = {
    title: 'Pages/LoginPage',
    component: LoginPage,
    decorators: [
        withRouter,
        (Story) => {
            initAsync().then(() => {
                // if (Tracing.isAvailable()) {
                //   console.log("Tracing is available, turning on");
                //   let tracing = new Tracing(LoggerLevel.Info);
                //   tracing.turnOn();
                // }
                console.log("Crypto starting")
                start();
                console.log("Crypto started")


                import('../app/sdk/client').then(({ defaultMatrixClient }) => {
                    import('@mtrnord/matrix-sdk-crypto-js').then(({ UserId, DeviceId }) => {
                        // @ts-ignore
                        defaultMatrixClient.user.mxid = "@example:example.com";
                        // @ts-ignore
                        defaultMatrixClient.user.device_id = "test";
                        // @ts-ignore
                        defaultMatrixClient.user.e2ee.initOlmMachine(new UserId(defaultMatrixClient.user.mxid), new DeviceId(defaultMatrixClient.user.device_id)).then(() => {
                            console.log("OlmMachine initialized")
                        });
                        // @ts-ignore
                        defaultMatrixClient.user.hostname = "https://matrix.example.com";
                        // @ts-ignore
                        defaultMatrixClient.user.slidingSyncHostname = "https://sliding.matrix.example.com";
                        // @ts-ignore
                        defaultMatrixClient.sync.user.slidingSyncHostname = "https://sliding.matrix.example.com";
                        // @ts-ignore
                        defaultMatrixClient.user.access_token = "111";
                        import('../mocks/browser').then((module) => {
                            module.worker.start();
                        });
                    })
                })
            })
            // @ts-ignore
            return <Story />
        }
    ]
};

export default meta;
type Story = StoryObj<typeof LoginPage>;

export const Default: Story = {};