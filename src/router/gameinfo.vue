<template>
  <div class="content">
    <div class="container">
      <div class="row">
        <div :class="screenWidth <= 384 ? 'mb-3 d-flex justify-content-center' : 'col-2 game-icon-wrapper'">
          <img class="game-icon" :src="getGameIcon()" />
        </div>
        <div :class="screenWidth <= 384 ? 'col' : 'col-8 top-info-wrapper'">
          <h1 class="game-title">{{ localizedData.title_long }}</h1>
          <div class="genre-container">
            <span>{{ getGenreTitle() }}</span>
          </div>
          <button class="play-game-button" @click="playGame">
            {{ localizedData.cta }}
          </button>
        </div>
      </div>
    </div>

    <div class="divider" />

    <ScreenshotsCarousel :has-max-width="false" :item-width="280" />

    <div :class="screenWidth < 768 ? 'm-2' : ''">
      <h1 class="fs-5 fw-bold mt-2">{{ portalData.description_title[lang] }}</h1>
      <div class="fs-6 m-2 text-justify" style="white-space: break-spaces;">
        {{ localizedData.description_text_1 }}
      </div>
      <h1 class="fs-5 fw-bold mt-4">{{ portalData.features_title[lang] }}</h1>
      <ul>
        <li class="fs-6 me-2 text-justify" v-for="feature in gameFeatures" :key="feature">
          {{ feature }}
        </li>
      </ul>
      <div class="fs-6 m-2 text-justify">{{ localizedData.description_text_2 }}</div>
    </div>

    <div class="divider" />

    <div class="container" :class="screenWidth < 768 ? 'm-2' : ''">
      <h1 class="fs-5 fw-bold">{{ portalData.game_info[lang] }}</h1>
      <div class="row">
        <div :class="screenWidth > 768 ? 'col-3 ps-0' : 'row'">
          <h2 class="fs-6 mt-3 fw-bold">{{ requirementHeader() }}</h2>
          <ul>
            <li class="fs-6"><b>iOS:</b> {{ requirement('iOs') }}</li>
            <li class="fs-6"><b>MacOS:</b> {{ requirement('MacOS') }}</li>
            <li class="fs-6"><b>Android:</b> {{ requirement('Android') }}</li>
            <li class="fs-6"><b>Windows:</b> {{ requirement('Windows OS') }}</li>
          </ul>
        </div>
        <div v-if="stores.length" :class="screenWidth > 768 ? 'col-3' : 'row'">
          <h2 class="fs-6 mt-3 fw-bold">{{ availableHeader() }}</h2>
          <div class="stores">
            <div
                v-for="storeName in stores"
                :key="storeName"
                class="store"
                :id="storeName"
                @click="gotoStore(storeName)"
            >
              <img v-if="storeLink(storeName)" :src="getPlatformImage(storeName)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="divider" />

    <div :class="screenWidth < 768 ? 'm-2' : ''">
      <h1 class="fs-5 fw-bold">{{ otherGames() }}</h1>
      <GamesCarousel :gameNames="gameNames" :elementWidth="160" />
    </div>
  </div>
</template>


<script>
import { computed } from 'vue';
import { useHead } from '@vueuse/head';

import portalData from './../../portal.json';
import icons from './../../assets/icons.json';

import ScreenshotsCarousel from "../components/screenshotscarousel";
import GamesCarousel from "../components/gamescarousel";
export default {
  name: "GameInfo",
  components: {
    ScreenshotsCarousel,
    GamesCarousel
  },
  data() {
    return {
      portalData,
      screenWidth: 1000
    };
  },
  computed: {
    lang() {
      return this.language;
    },
    localizedData() {
      const data = this.portalData.games[this.$route.params.game];
      return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, typeof v === 'object' && v[this.lang] ? v[this.lang] : v]));
    },
    head() {
      if (!this.$route.params.game) return {};
      const game = this.$route.params.game;
      return {
        title: this.localizedData.title_long,
        meta: [
          { name: 'description', content: this.localizedData.description_text_1 },
          { property: 'og:title', content: this.localizedData.title_long },
          { property: 'og:description', content: this.localizedData.description_text_2 },
          { property: 'og:image', content: this.getGameBanner() },
          { property: 'og:url', content: `https://cleverappssg.com/game/${game}/${this.lang}/` },
          { property: 'og:site_name', content: 'Clever Apps Games' },
          { property: 'og:type', content: 'website' },
          { property: 'twitter:title', content: this.localizedData.title_long },
          { property: 'twitter:description', content: this.localizedData.description_text_2 },
          { property: 'twitter:card', content: this.getGameBanner() }
        ],
        link: Object.keys(this.portalData.languages).map(lang => ({
          rel: lang === this.lang ? 'canonical' : 'alternate',
          hreflang: lang,
          href: `https://cleverappssg.com/game/${game}`
        }))
      };
    },
    gameFeatures() {
      return this.portalData.games[this.$route.params.game].features_list[this.lang];
    },
    gameGenre() {
      return this.portalData.games[this.$route.params.game].genre;
    },
    stores() {
      const base = Object.keys(this.portalData.platforms)
          .filter(store => this.storeLink(store) && !["xsolla", "ios"].includes(store));

      const ruOnly = ["ok", "vk", "mm", "yandex", "rustore"];
      return this.lang !== "ru" ? base.filter(s => !ruOnly.includes(s)) : base;
    },
    gameNames() {
      return Object.keys(this.portalData.games).filter(name => name !== this.$route.params.game);
    }
  },
  mounted() {
    useHead(computed(() => this.head));
    window.addEventListener("resize", this.onResize);
    this.onResize();
  },
  unmounted() {
    window.removeEventListener("resize", this.onResize);
    useHead({});
  },
  methods: {
    onResize() {
      this.screenWidth = window.innerWidth;
    },
    getGameIcon() {
      const images = require.context('./../../assets/banners', false, /\.jpg$/);
      return images(`./${this.$route.params.game}_promo.jpg`);
    },
    getGameBanner(wide) {
      const images = require.context('./../../assets/banners', false, /\.jpg$/);
      return images(`./${this.$route.params.game}${wide ? '_wide.jpg' : '.jpg'}`);
    },
    storeLink(store) {
      return this.portalData.games[this.$route.params.game].links[store];
    },
    getPlatformImage(platform) {
      const images = require.context('./../../assets/platforms', false, /\.png$/);
      return images(`./${platform}.png`);
    },
    requirement(store) {
      return this.portalData.requirements[store][this.lang];
    },
    gotoStore(store) {
      window.location.href = this.storeLink(store);
    },
    requirementHeader() {
      return this.portalData.requirements_header[this.lang];
    },
    availableHeader() {
      return this.portalData.available[this.lang];
    },
    otherGames() {
      return this.portalData.other_games[this.lang];
    },
    getGenreTitle() {
      return this.portalData.genres[this.gameGenre][this.lang];
    },
    playGame() {
      const route = {
        name: 'Play',
        params: {
          game: this.$route.params.game
        }
      };
      window.location.href = this.$router.resolve(route).href;
    }
  }
};
</script>

<style scoped>
.game-icon-wrapper {
    min-width: 120px;
}

.game-icon {
  border-radius: 12px;
  width: 120px;
  height: 120px;
}

.top-info-wrapper {
    margin-left: 2em;
}


.tag > p {
    padding-top: 2px;
    margin: 0 8px 0 0;
}

.tag-image {
    height: 14px;
    margin: auto 8px;
}

.platforms {
    overflow: hidden;
}

.platform-tag {
    border-radius: 30px;
    background: rgb(240, 240, 240);
    text-align: center;
    display: inline-block;
    font-size: 14px;
    padding: 0 10px;
    margin-left: 20px;
}

.platform-tag:hover {
    cursor: pointer;
    background: rgb(220, 220, 220);
    transform: scale(1.05);
}

.platform-tag > p {
    padding-top: 2px;
    margin: 0 8px 0 0;
}

.platform-tag-image {
    height: 20px;
    margin: 6px 8px;
}

.stores {
    display: flex;
    flex-wrap: wrap;
    justify-content: start;
}
.store {
    flex-basis: 25%;
}
.store img {
    margin: 4px;
    padding: 4px;
    height: 38px;
}
.store:hover {
    cursor: pointer;
    transform: scale(1.05);
}
.store:active {
    opacity: 0.8;
}

.video {
    margin: 10px auto;
    width: 100% !important;
    height: 100% !important;
    display: flex;
    justify-content: center;
}

.play-game-button:active, .play-game-button:hover {
  background-color: var(--primary-brand-color-active);
}

.play-game-button:hover {
    transform: scale(1.02);
    cursor: pointer;
}

.horizontal-scroll {
    position: relative;
    overflow: hidden;
}

.games {
    display: flex;
    padding: 15px 0;
}

.game-tile {
    width: auto;
    min-width: 100px;
    min-height: 100px;
    max-width: 180px;
    margin-left: 0.8vw;
    margin-right: 0.8vw;
}

.game-img {
    width: 100%;
    height: auto;
    min-width: 80px;
    min-height: 80px;
    border-radius: 30px;
}

.game-name {
    text-align: center;
    margin-top: 6px;
    font-weight: 700;
    font-size: 14px;
    transition: opacity .2s ease,color .3s ease;
}

.game-tile:hover {
    cursor: pointer;
    transform: scale(1.03);
}

.text-justify {
    text-align: justify!important;
}
.content {
  background-color: var(--primary-background-color);
  height: 100vh;
  padding: 32px;
  color: white;
}

.game-title {
  font-size: 28px!important;
  font-weight: 500;
}

.genre-container {
  color: var(--secondary-text-color);
  width: 120px;
  vertical-align: center;
  display: flex;
  padding: 2px;
  height: 24px;
}

.play-game-button {
  background-color: var(--primary-brand-color);
  border: none;
  border-radius: 8px;
  height: 40px;
  width: 170px;
  font-weight: 600!important;
  margin-top: 12px;
}

.divider {
  border-bottom: 1px solid #333;
  margin: 20px 30px 20px 0;
}

</style>

