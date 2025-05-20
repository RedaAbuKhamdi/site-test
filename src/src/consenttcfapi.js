/**
 * Created by andrey on 15.05.2025
 */
const postMessageHandler = (event) => {
    const data = event.data || {};

    if (!data.consentTcfApiCall || typeof __tcfapi === "undefined") {
        return;
    }

    __tcfapi(data.command, data.version, (returnValue, success) => {
        event.source.postMessage({
            consentTcfApiReturn: true,
            returnValue,
            success,
            callId: data.callId
        }, event.origin);
    }, data.parameter);
};

export default {
    init: function () {
        window.addEventListener("message", postMessageHandler);
    }
};