<template>
    <div class="landing-header text-center">
        <div class="header-image w-100" :style="{ backgroundImage: `url(${require('./../../assets/landing/banner_' + gameName +'.png')})` }"></div>

        <div class="container overlay-block">
            <div class="row w-80 shadow p-3 mb-5 bg-body rounded">

                <div class="col col-md-2 d-lg-flex d-md-none d-sm-none">
                    <img class="game-logo my-auto" :src="gameSmallImage">
                </div>

                <div class="col col-md-7 col-sm-9 mt-1 text-start">
                    <h1 class="fw-bold">{{localizedData.title_long}}</h1>
                    <div class="text-left">
                        <div class="text-left landing-header-text">{{localizedData.landing_header}}</div>
                    </div>
                    <div class="more-link fs-5 pt-3 text-left" @click="gotoStore()">More info ></div>
                </div>

                <div class="col col-md-3 col-sm-2 d-flex">
                    <ms-store-badge class="align-middle my-auto" productid="9pgvxwxrwx7s" size="large"></ms-store-badge>
<!--                    <div class="play-button align-middle my-auto" @click="gotoStore()">-->
<!--                        PLAY-->
<!--                    </div>-->
                </div>
            </div>
        </div>
    </div>

    <div class="container text-black">
        <h2 class="px-2 fw-bold text-start">{{localizedData.description_title}}</h2>
        <p class="landing-description fs-5 m-2 text-justify">{{localizedData.landing_description}}</p>

        <ScreenshotsCarousel :has-max-width="false"/>

        <div class="play-button my-3" @click="gotoStore()">
            DOWNLOAD
        </div>

    </div>
</template>

<script>
    import portalData from './../../portal.json';

    import ScreenshotsCarousel from "../components/screenshotscarousel";
    import axios from "axios";

export default {
    name: "Microsoft",
    components: {
        ScreenshotsCarousel,
    },
    data() {
        return {
            portalData: portalData,
            adjustMap: {
              mergecraft: {
                click: 'eflrih',
                install: 'hb0n0q'
              }
            }
        }
    },
    mounted() {
        Adjust.initSdk({
          appToken: '41l7m0hkbzwg',
          environment: 'production',
          logLevel: 'verbose'
        });

        this.logEvent('click');
    },
    computed: {
        localizedData() {
            var data = this.portalData.games[this.gameName];

            var result = {};
            Object.keys(data).forEach(propName => {
                var propValue = data[propName];
                if (typeof propValue === 'object' && propValue[this.lang]) {
                    result[propName] = propValue[this.lang];
                } else {
                    result[propName] = propValue;
                }
            });
            return result;
        },
        lang() {
            return this.$route.params.lang || "en";
        },
        gameImageUrl() {
            return this.portalData.games[this.gameName].banner;
        },
        gameName() {
            return this.$route.params.game;
        },
        gameSmallImage() {
            var images = require.context('./../../assets/landing', false, /\.png$/);
            return images('./icon_' + this.gameName + '.png');
        },
        gameFeatures() {
            return this.portalData.games[this.gameName].features_list[this.lang]
        }
    },
    methods: {
        getGameBanner(wide) {
            var images = require.context('./../../assets/banners', false, /\.jpg$/);
            return images('./' + this.gameName + (wide ? '_wide.jpg' : '.jpg'));
        },
        gameImage(game) {
            var images = require.context('./../../assets/banners', false, /\.jpg$/);
            return images('./' + game + '_promo.jpg');
        },
        gotoStore() {
            this.logEvent('install');

            var link = this.portalData.games[this.gameName].links['microsoft'];
            if (this.$route.query.cid) {
                if (link.indexOf('?') === -1) {
                    link += '?';
                } else {
                    link += '&';
                }
                link += "cid=" + this.$route.query.cid;
            }

            setTimeout(function () {
                window.location.href = link;
            }.bind(this), 500);
        },
        logEvent(eventName) {
            var fullEvent = `${eventName}_microsoft_${this.gameName}`

            fbq('track', fullEvent);

            if (this.adjustMap[this.gameName] && this.adjustMap[this.gameName][eventName]) {
                Adjust.trackEvent({ eventToken: this.adjustMap[this.gameName][eventName]});
            }

            var url = `https://${this.gameName}.cleverappssg.com`;//`https://${this.gameName}-staging.labsystech.ru`
            var path = `/${this.gameName}-rest/events/`;

            axios.post(url + path, {
                events: fullEvent,
                params: [],
                source: "microsoft_landing"
            }).then(response => console.log(response.status));

            // debugging full URL
            // axios.post(url + `/${this.gameName}-rest/console/log/`, {
            //   message: "MicrosoftLandingUrl " + window.location.href + " " + window.location.search
            // }).then(response => console.log(response.status));
        }
    }
}
</script>

<style scoped>

.header-image {
    height: 600px;
    background-repeat: no-repeat;
    background-size: cover;
}

.overlay-block {
    margin-top: -180px;
}

.play-button {
    -webkit-border-radius: 6px;
    border-radius: 6px;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 40px;
    font-weight: 900;
    text-align: center;
    text-decoration: none;
    padding: 6px 0;
    width: 280px;
    background-color: #33b134;
    margin: 0 auto;
}

.play-button:active {
    background-color: #248d07;
}

.play-button:hover {
    transform: scale(1.02);
    cursor: pointer;
}

.text-justify {
    text-align: justify!important;
}

.game-logo {
    width: auto;
    height: auto;
    min-width: 140px;
    min-height: 140px;
}

.more-link {
    color: #00a1eb;
    font-weight: bold;
}
.more-link:hover {
    cursor: pointer;
    color: #0066eb;
}

.landing-header-text {
    font-size: 22px;
    line-height: 50px;
    padding: 10px 0;
}

.landing-description {
    white-space: pre-line
}

</style>

