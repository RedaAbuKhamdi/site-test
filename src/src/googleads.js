/**
 * Created by andrey on 16.05.2025
 */

import CleverAppsNative from "./cleverappsnative";
import router from "../router";

const debugMode = process.env.VUE_APP_MODE === "staging";

const client = "ca-pub-9277187477340577";
const slot = "2518779793";

const AD_BANNER_WIDTH = 728;
const AD_BANNER_HEIGHT = 90;

const GoogleAds = {
    showAdFn: undefined,
    showAdCallback: undefined,
    ready: false,

    cacheInterstitial: function (callback) {
        callback(CleverAppsNative.CODE_SUCCEED);
    },

    connect: function (callback) {
        if (this.ready) {
            callback(CleverAppsNative.CODE_SUCCEED);
            return;
        }

        window.adsbygoogle = window.adsbygoogle || [];

        window.adsbygoogle.push({
            preloadAdBreaks: "on",
            sound: "on",
            onReady: () => {
                this.ready = true;
                callback(CleverAppsNative.CODE_SUCCEED);
            }
        });
    },
    
    cacheRewarded: function (callback) {
        if (this.showAdFn) {
            callback(CleverAppsNative.CODE_SUCCEED);
            return;
        }

        let code = "rewarded_unknown_error";
        window.adsbygoogle.push({
            name: "rewarded",
            type: "reward",
            beforeReward: (showAdFn) => {
                this.showAdFn = showAdFn;
                callback(CleverAppsNative.CODE_SUCCEED);
            },
            adViewed: () => {
                code = CleverAppsNative.CODE_SUCCEED;
            },
            adDismissed: () => {
                code = "closed_by_user";
            },
            adBreakDone: () => {
                if (this.showAdCallback) {
                    this.showAdCallback(code);
                    this.showAdCallback = undefined;
                } else {
                    callback();
                }
            }
        });
    },

    play: function (options, callback) {
        const name = options.name;

        if (name === "interstitial") {
            window.adsbygoogle.push({
                name,
                type: "start",
                beforeAd: () => {
                    console.log("Interstitial started");
                },
                adBreakDone: () => {
                    console.log("Interstitial finished");
                    callback && callback(CleverAppsNative.CODE_SUCCEED);
                }
            });
            return;
        }

        if (typeof this.showAdFn !== "function") {
            callback && callback("rewarded_not_found");
            return;
        }

        this.showAdCallback = callback;
        this.showAdFn();

        this.showAdFn = undefined;
    },

    isStickyAvailable: function () {
        return window.innerWidth >= AD_BANNER_WIDTH;
    },

    showSticky: function (callback) {
        if (!this.isStickyAvailable()) {
            callback(CleverAppsNative.CODE_FAILED);
            return;
        }

        this.showStickyCallback = callback;

        this.addBannerContainer();
    },

    checkStickyStatus: function () {
        const ins = document.getElementById("google-ads-banner-container-ins");
        const status = ins && ins.getAttribute("data-ad-status");

        debugMode && console.log("banner status", status);

        if (!["filled", "unfilled"].includes(status)) {
            return;
        }

        let code = CleverAppsNative.CODE_SUCCEED;
        let params = {
            width: AD_BANNER_WIDTH,
            height: AD_BANNER_HEIGHT
        };

        if (status === "unfilled") {
            code = CleverAppsNative.CODE_FAILED;
            params = {};

            this.removeBannerContainer();
        }

        if (this.showStickyCallback) {
            this.showStickyCallback(code, params);
            this.showStickyCallback = undefined;
        }
    },

    closeSticky: function (callback) {
        this.removeBannerContainer();

        callback(CleverAppsNative.CODE_SUCCEED);
    },

    addBannerContainer: function () {
        if (document.getElementById("google-ads-banner-container")) {
            return;
        }

        const container = document.createElement("div");
        container.id = "google-ads-banner-container";
        container.style.display = "block";
        container.style.position = "absolute";
        container.style.bottom = "0";
        container.style.margin = "0 auto";
        container.style.right = "0";
        container.style.left = "0";
        container.style.height = `${AD_BANNER_HEIGHT}px`;
        container.style.width = `${AD_BANNER_WIDTH}px`;
        container.style.zIndex = "2";
        container.style.backgroundColor = "white";

        const ins = document.createElement("ins");
        ins.id = "google-ads-banner-container-ins";
        ins.className = "adsbygoogle";
        ins.style.zIndex = "2";
        ins.setAttribute("data-ad-client", client);
        ins.setAttribute("data-ad-slot", slot);

        if (debugMode) {
            ins.setAttribute("data-adbreak-test", "on");
        }

        ins.style.display = "inline-block";
        ins.style.position = "relative";
        ins.style.margin = "0 auto";
        ins.style.height = `${AD_BANNER_HEIGHT}px`;
        ins.style.width = `${AD_BANNER_WIDTH}px`;

        document.body.appendChild(container);
        container.appendChild(ins);

        const observer = this.observer = new MutationObserver(() => {
            this.checkStickyStatus();
        });
        observer.observe(ins, {
            attributes: true,
            attributeFilter: ["data-ad-status"]
        });

        window.adsbygoogle.push({});
    },

    removeBannerContainer: function () {
        console.log("google ads removeBannerContainer");

        if (this.observer) {
            this.observer.disconnect();
            this.observer = undefined;
        }

        const container = document.getElementById("google-ads-banner-container");
        if (container) {
            container.remove();
        }
    }
};

router.beforeEach((to, from, next) => {
    if (!to.path.startsWith("/play/")) {
        GoogleAds.removeBannerContainer();
    }
    next();
});

export default {
    init: function () {
        CleverAppsNative.addPlugin("GoogleAds", GoogleAds);
    }
};