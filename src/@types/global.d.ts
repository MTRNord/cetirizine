
import "matrix-react-sdk/src/@types/global"; // load matrix-react-sdk's type extensions first
declare global {
    interface Window {
        OLM_OPTIONS: any;
    }
}