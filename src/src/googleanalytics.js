/**
 * Created by andrey on 04.06.2024.
 */
const debugMode = process.env.VUE_APP_MODE === "staging";
let gameParams = {};

const postMessageHandler = function (event) {
    const googleAnalytics = event.data && event.data.googleAnalytics;
    if (!googleAnalytics) {
        return;
    }

    const message = event.data && event.data.message || {};

    if (debugMode) {
        console.log("google analytics", message);
    }

    const name = message.name;
    let params = message.params || {};

    switch (message.type) {
        case "event":
            params = { ...params, ...gameParams };
            gtag("event", name, params);
            break;
        case "set":
            if (name) {
                gtag("set", name, params);
            } else {
                gtag("set", params);
            }
            break;
    }
};

export default {
    init: function () {
        window.addEventListener("message", postMessageHandler, false);
    },
    setGameParams: function (gameId, gameName) {
        gameParams = {
            game_id: gameId,
            game_name: gameName
        };

        if (debugMode) {
            console.log("Google analytics game params", gameParams);
        }
    }
};