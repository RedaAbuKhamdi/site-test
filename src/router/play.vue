<template>
    <nav id="navbar" v-if="isNavBarVisible()" class="navbar navbar-expand navbar-light bg-light">
        <div class="col-4"><img class="navbar-brand" :src="require(isMobile ? './../../assets/logo_mobile.png' : './../../assets/logo.png')" @click="gotoGames()"></div>
        <div class="col-4"><p class="navbar-gamename" @click="gotoDescription()">{{this.localizedData.title_short}}</p></div>
        <div class="col-4 d-flex justify-content-end">
            <div class="back-wrapper d-flex">
                <img class="navbar-back-img" :src="require('./../../assets/home.png')" @click="gotoGames()">
                <p class="navbar-back" @click="gotoGames()">Other Games</p>
            </div>
        </div>
    </nav>
    <nav id="sidebar" v-if="isSideBarVisible()" class="sidebar bg-light flex-column justify-content-between">
        <div class="sidebar-brand">
            <img v-show="!haveNotch" class="sidebar-brand-img" :src="require('./../../assets/logo_mobile_vertical.png')" @click="gotoGames()">
        </div>
        <div class="sidebar-back d-flex align-items-center flex-column">
            <img class="sidebar-back-img" :src="require('./../../assets/home.png')" @click="gotoGames()">
            <p class="" @click="gotoGames()">Other Games</p>
        </div>
    </nav>
    <iframe id="gameFrame" class="gameFrame" :src="frameLink('xsolla')" @load="onFrameLoaded" allow="fullscreen"></iframe>
    <div v-if="this.debugInfo.length > 0" @click="onResize()" class="debug-info">{{this.debugInfo}}</div>
</template>

<script>
    import {computed} from 'vue';
    import GoogleAnalytics from '@/src/googleanalytics'

    import portalData from './../../portal.json';

    import {useHead} from '@vueuse/head';

    export default {
        name: "Play",
        components: {},
        data() {
            return {
                portalData: portalData,
                screenWidth: 1000,
                screenHeight: 1000,
                debugData: ""
            }
        },
        beforeMount() {
            useHead(computed(() => this.head));
        },
        mounted() {
            var counter = 0;
            var timeoutHandler = undefined;
            var timeouts = [50, 100, 200, 300, 500, 1000, 2000, 4000];

            var scheduleCheck = function () {
                if (counter === timeouts.length) {
                    timeoutHandler = undefined;
                    return;
                }

                if (timeoutHandler) {
                    clearTimeout(timeoutHandler);
                }

                timeoutHandler = setTimeout(function () {
                    if (this.screenWidth !== document.documentElement.clientWidth || this.screenHeight !== document.documentElement.clientHeight) {
                        this.onResize();
                    }

                    counter++;
                    scheduleCheck();
                }.bind(this), timeouts[counter]);
            }.bind(this);

            var resizeHandler = function () {
                this.onResize();

                counter = 0;
                scheduleCheck();
            }.bind(this);

            window.addEventListener("resize", resizeHandler, false);
            window.addEventListener('orientationchange', resizeHandler, false);

            window.scrollTo({top: 0, behavior: 'smooth'});

            document.body.style.overflow = 'hidden';

            if (this.$route.params.game) {
              GoogleAnalytics.setGameParams(
                  this.$route.params.game,
                  this.localizedData["title_short"]
              )
            }

            this.onResize();
        },
        unmounted() {
            window.removeEventListener("resize", this.onResize.bind(this));
            document.body.style.overflow = '';
            useHead({});
        },
        computed: {
            head() {
                if (!this.$route.params.game) {
                    return {};
                }

                return {
                    title: this.localizedData.title_long,
                    meta: [
                        {name: 'description', content: this.localizedData.description_text_1},
                        {property: 'og:title', content: this.localizedData.title_long},
                        {property: 'og:site_name', content: 'Clever Apps Games'},
                        {property: 'og:description', content: this.localizedData.description_text_2},
                        {property: 'og:type', content: 'website'},
                        {
                            property: 'og:url',
                            content: 'https://cleverappssg.com/play/' + this.$route.params.game + '/' + this.lang + '/'
                        },
                        {property: 'og:image', content: this.getGameBanner()},
                        {property: 'twitter:title', content: this.localizedData.title_long},
                        {property: 'twitter:description', content: this.localizedData.description_text_2},
                        {property: 'twitter:card', content: this.getGameBanner()}
                    ],
                    link: Object.keys(this.portalData.languages).map(lang => {
                        return {
                            rel: lang === this.lang ? "canonical" : "alternate",
                            hreflang: lang,
                            href: 'https://cleverappssg.com/play/' + this.$route.params.game
                        }
                    })
                };
            },
            lang() {
                return this.language;
            },
            localizedData() {
                var data = this.portalData.games[this.$route.params.game];

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
            debugInfo() {
                return this.debugData;
            },
            haveNotch() {
                return getComputedStyle(document.documentElement).getPropertyValue("--sat") !== "0px"
                    || getComputedStyle(document.documentElement).getPropertyValue("--sal") !== "0px"
                    || getComputedStyle(document.documentElement).getPropertyValue("--sar") !== "0px"
                    || getComputedStyle(document.documentElement).getPropertyValue("--sab") !== "0px";
            }
        },
        methods: {
            isNavBarVisible() {
                return !this.isMobile() || this.isPortrait();
            },
            isSideBarVisible() {
                return this.isMobile() && this.isLandscape();
            },
            isMobile() {
                return this.isPortrait() && this.screenWidth <= 640
                    || this.isLandscape() && this.screenHeight <= 640;
            },
            gotoGames() {
                this.$router.push({
                    name: 'Games',
                    params: {
                        category: 'games'
                    }
                });
            },
            gotoDescription() {
                const routeData = this.$router.resolve({
                    name: 'Game', params: {
                        game: this.$route.params.game
                    }
                });
                window.open(routeData.href, '_blank');
            },
            frameLink() {
                var link = this.portalData.games[this.$route.params.game].links.xsolla;

                if (process.env.VUE_APP_MODE === "staging") {
                    link = link.replace("cleverappssg.com", "labsystech.ru").replace(".labsystech.ru", "-staging.labsystech.ru").replace("html5", "html5-staging");
                }

                if (process.env.VUE_APP_MODE === "production" && navigator.language.includes("ru")) {
                    link = link.replace("/?source=cleverapps", "/index-ru2.html?source=cleverapps");
                }

                link += "?source=xsolla";

                var params = new URLSearchParams(window.location.search);
                if (params.get("channel")) {
                    link += "&channel=" + params.get("channel");
                }
                if (params.get("push_code")) {
                    link += "&push_code=" + params.get("push_code");
                }

                // if (process.env.VUE_APP_MODE === "staging") {
                //     link += "&fc=alwaysshow&fctype=gdpr";
                // }
                return link;
            },
            getGameBanner(wide) {
                var images = require.context('./../../assets/banners', false, /\.jpg$/);
                return images('./' + this.$route.params.game + (wide ? '_wide.jpg' : '.jpg'));
            },
            isLandscape() {
                return window.matchMedia("(orientation: landscape)").matches;
            },
            isPortrait() {
                return window.matchMedia("(orientation: portrait)").matches;
            },
            onResize() {
                this.screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                this.screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

                var sizeChanged = false;

                var showNavbar = !this.isMobile() || this.isPortrait();

                var iframe = document.getElementById("gameFrame");
                var navbar = document.getElementById("navbar");
                var sidebar = document.getElementById("sidebar");

                if (iframe && showNavbar && navbar) {
                    var barHeight = navbar.clientHeight;
                    iframe.style.top = barHeight + "px";
                    iframe.style.left = 0;
                    iframe.style.height = this.screenHeight - barHeight + "px";
                    iframe.style.width = this.screenWidth + "px";

                    sizeChanged = true;
                } else if (iframe && !showNavbar && sidebar) {
                    var barWidth = sidebar.clientWidth;
                    iframe.style.top = 0;
                    iframe.style.left = barWidth + "px";
                    iframe.style.height = this.screenHeight + "px";
                    iframe.style.width = this.screenWidth -  barWidth + "px";

                    sizeChanged = true;
                }

                if (sizeChanged) {
                    if (process.env.VUE_APP_MODE === "staging") {
                        this.debugData += "w: " + Math.floor(this.screenWidth);
                        this.debugData += " h: " + Math.floor(this.screenHeight) + ";";

                        this.debugData = this.debugData.split(";").slice(-5).join("; ");
                    }
                } else {
                    setTimeout(this.onResize.bind(this), 50);
                }
            }
        }
    }
</script>

<style scoped>

.gameFrame {
    position: fixed;
}

.navbar-brand {
  cursor: pointer;
  height: 40px;
  margin: 0;
}

.navbar-back {
  cursor: pointer;
  display: inline-block;
  text-align: right;
  margin: 0;
}

@media (max-width: 386px) {
    .navbar-back {
        width: min-content;
    }
}

.navbar-back-img {
  height: 22px;
  margin: auto 5px;
  padding-bottom: 4px;
}

.navbar-gamename {
  cursor: pointer;
  text-align: center;
  margin: auto;
}

.navbar {
  font-size: 20px;
  box-shadow: 0 1px 5px 2px rgba(56, 118, 138, 0.2);
  color: #393939;
  padding: 0.25rem 0.5rem;
}

.sidebar {
    display: flex;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    color: #393939;
    min-width: 38px;
    width: 4.5%;
    padding: 20px 5px;
}

.sidebar-brand {
    width: 100%;
}

.sidebar-brand-img {
    width: 100%;
}

.sidebar-back {
    padding-bottom: 10px;
}

.sidebar-back > p {
    font-size: 1.3vw;
    text-align: center;
    margin-bottom: 0;
}

.sidebar-back-img {
    max-width: 20px;
}

.debug-info {
    position: absolute;
    left: 0;
    bottom: 0;
    overflow: hidden;
    background: white;
}

@media (max-width: 576px) {
    .navbar {
        font-size: unset;
        min-height: 48px;
    }

    .navbar-brand {
        height: auto;
        width: 100%;
        max-width: 120px;
    }
}

</style>

