/**
 * Created by Vladislav on 19.11.2024.
 */

var debugMode = process.env.VUE_APP_MODE === "staging";

const urlBase64ToUint8Array = (base64String) => {
    var padding = "=".repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

const registerServiceWorker = () => {
    let publicKey = "BED82xvyl8l52g76VMDfnRwRuREI1FB382ug8CS6xd2OavnQAO8_YvSTFJ1r1XyPXqZNuI2yO4XG9RbJH5kRIMU";
    let scriptURL = location.origin + "/serviceworker.js";

    if (process.env.NODE_ENV === "staging") {
        scriptURL = location.origin + "/staging/serviceworker.js";
        publicKey = "BFTFkcqW5V4aG72A5e7OJOQQWh5tJwHUz-CBlX3-mKYwpOggRmBa_0Qm6KtxJhcDthDhNBpRAEi1zOwHk2vvSJk"
    }

    return navigator.serviceWorker.register(scriptURL , {

    }).then(function (registration) {
        console.log("Service worker registered");

        return registration.pushManager.getSubscription()
            .then(function (subscription) {
                if (subscription) {
                    return subscription;
                }

                const applicationServerKey = urlBase64ToUint8Array(publicKey);

                return registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey
                });
            });
    });
}

const running = {};

const postMessageHandler = (event) => {
    const initServiceWorker = event.data && event.data.initServiceWorker;
    if (!initServiceWorker) {
        return;
    }

    const frameOrigin = event.origin;

    if (running[frameOrigin]) {
        return;
    }
    running[frameOrigin] = true;

    if (debugMode) {
        console.log("initServiceWorker receive message", event);
    }

    const callback = (error, subscription) => {
        delete running[frameOrigin];

        if (error) {
            console.error("initServiceWorker error", error);
        }

        var iframe = document.getElementById("gameFrame");

        if (iframe) {
            iframe.contentWindow.postMessage({
                initServiceWorker: true,
                subscription: subscription && JSON.parse(JSON.stringify(subscription))
            }, frameOrigin);
        }
    };

    registerServiceWorker()
        .then((subscription) => callback(undefined, subscription))
        .catch(callback);
}

export default {
    init: function () {
        window.addEventListener("message", postMessageHandler, false);
    }
}