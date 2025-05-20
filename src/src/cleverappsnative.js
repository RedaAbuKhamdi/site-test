/**
 * Created by andrey on 16.05.2025
 */

const debugMode = process.env.VUE_APP_MODE === "staging";

const plugins = {};

const CODE_SUCCEED = 0;
const CODE_FAILED = 1;
const CODE_CANCELLED = 2;

const supported = [
    "GoogleAds.connect",
    "GoogleAds.cacheRewarded",
    "GoogleAds.cacheInterstitial",
    "GoogleAds.play",
    "GoogleAds.showSticky",
    "GoogleAds.closeSticky"
];

const callCallback = (event, method, code, options) => {
    event.source.postMessage({
        callCallback: true,
        method,
        code,
        options
    }, event.origin);
};

const postMessageHandler = (event) => {
    const data = event.data || {};
    const options = data.options || {};

    if (!data.callNative) {
        return;
    }

    debugMode && console.log("native call received", data);

    if (!supported.includes(data.method)) {
        const error = `Unsupported callNative - ${data.method} - ${supported.join(", ")}`;
        console.error(error);

        if (options._hasCallback) {
            callCallback(event, data.method, error);
        }

        return;
    }

    const [pluginCode, methodName] = data.method.split(".");

    const plugin = plugins[pluginCode];
    const method = plugin[methodName];

    const args = [];

    if (options._hasOptions) {
        args.push(options);
    }

    if (options._hasCallback) {
        args.push((code, options) => {
            callCallback(event, data.method, code, options);
        });
    }

    delete options._hasOptions;
    delete options._hasCallback;

    method.call(plugin, ...args);
};

window.addEventListener("message", postMessageHandler, false);

export default {
    addPlugin: function (code, plugin) {
        plugins[code] = plugin;
    },

    CODE_SUCCEED,
    CODE_FAILED,
    CODE_CANCELLED
};