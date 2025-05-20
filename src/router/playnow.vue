<template>
  <section class="play-now">
    <NavBar class="play-now__navbar" />
    <div class="play-now__back-button-container" @click="closeTab()">
      <svg fill="none" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="IconSVG IconSVG_type_arrow-short-back"><path d="M8.32992 1.05053C7.93936 0.660239 7.30624 0.660207 6.91581 1.05063L2.67278 5.29367C2.28225 5.6842 2.28225 6.31736 2.67278 6.70788L6.91581 10.9509C7.30624 11.3413 7.93936 11.3413 8.32992 10.951C8.72068 10.5605 8.72094 9.92704 8.33031 9.53642L4.79467 6.00078L8.33031 2.46513C8.72093 2.07451 8.72068 1.44101 8.32992 1.05053Z" fill="currentColor"></path></svg>
      <span>{{ getBackButtonText }}</span>
    </div>
    <div class="play-now__content">
      <div class="play-now__info-button-container" @click="gotoGame()">
        <img :src="getImage('i')" :alt="getInfoText">
        <span>{{ getInfoText }}</span>
      </div>
      <div class="play-now__info">
        <img class="play-now__game-icon" :src="getGameIcon()" :alt="gameTitle" />
        <div class="play-now__info-container">
          <div>
            <h1 class="play-now__game-title">{{ localizedData.title_long }}</h1>
          </div>
          <div class="play-now__genre">
            <SvgIcon :image="gameGenreIcon" class="play-now__genre-icon" />
            <span>{{ getGenreTitle() }}</span>
          </div>
          <button class="play-now__play-button" @click="playGame">
            {{ localizedData.cta }}
          </button>
        </div>
      </div>

      <div>
        <ImageGallery style="margin: 0 0 25px 0" :onClick="playGame" :videoUrl="getVideoUrl" />
      </div>

      <div :class="screenWidth < 768 ? 'm-2' : ''">
        <h1 class="play-now__other-title fs-5 fw-bold">{{ otherGames() }}</h1>
        <div class="play-now__other-games">
          <div v-for="gameName in gameNames" :key="gameName">
            <GameCard :gameName="gameName" class="play-now__other-game-card" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>


<script>
import { computed } from 'vue';
import { useHead } from '@vueuse/head';

import portalData from './../../portal.json';
import icons from './../../assets/icons.json';

import SvgIcon from "@/components/svgicon.vue";
import NavBar from "@/components/navbar.vue";
import ImageGallery from "@/components/imagegallery.vue";
import GameCard from "@/components/gamecard.vue";

export default {
  name: "Game",
  components: {
    SvgIcon,
    NavBar,
    ImageGallery,
    GameCard
  },
  data() {
    return {
      portalData,
      screenWidth: 1000
    };
  },
  beforeMount() {
    useHead(computed(() => this.head));
  },
  mounted() {
    window.addEventListener("resize", this.onResize);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => this.onResize(), 500);
  },
  unmounted() {
    window.removeEventListener("resize", this.onResize);
    useHead({});
  },
  computed: {
    head() {
      if (!this.$route.params.game) return {};

      return {
        title: this.localizedData.title_long,
        meta: [
          { name: 'description', content: this.localizedData.description_text_1 },
          { property: 'og:title', content: this.localizedData.title_long },
          { property: 'og:site_name', content: 'Clever Apps Games' },
          { property: 'og:description', content: this.localizedData.description_text_2 },
          { property: 'og:type', content: 'website' },
          { property: 'og:url', content: `https://cleverappssg.com/game/${this.$route.params.game}/${this.lang}/` },
          { property: 'og:image', content: this.getGameBanner() },
          { property: 'twitter:title', content: this.localizedData.title_long },
          { property: 'twitter:description', content: this.localizedData.description_text_2 },
          { property: 'twitter:card', content: this.getGameBanner() }
        ],
        link: Object.keys(this.portalData.languages).map(lang => ({
          rel: lang === this.lang ? "canonical" : "alternate",
          hreflang: lang,
          href: `https://cleverappssg.com/game/${this.$route.params.game}`
        }))
      };
    },
    localizedData() {
      const data = this.portalData.games[this.$route.params.game];
      return Object.fromEntries(
          Object.entries(data).map(([key, value]) => [
            key,
            typeof value === 'object' && value[this.lang] ? value[this.lang] : value
          ])
      );
    },
    lang() {
      return this.language;
    },
    gameGenre() {
      return this.portalData.games[this.$route.params.game].genre;
    },
    gameGenreIcon() {
      return icons[this.gameGenre];
    },
    arrowIcon() {
      return icons["arrow"];
    },
    gameTitle() {
      return this.portalData.games[this.$route.params.game]["title_short"][this.lang];
    },
    gameNames() {
      return Object.keys(this.portalData.games).filter(name => name !== this.$route.params.game);
    },
    getVideoUrl() {
      const videos = require.context('./../../assets/previews', false, /\.mp4$/);
      try {
        return videos(`./${this.$route.params.game}.mp4`);
      } catch {
        return undefined;
      }
    },
    getBackButtonText() {
      return this.portalData.back_button[this.lang];
    },
    getInfoText(){
      return this.portalData.game_info[this.lang];
    }
  },
  methods: {
    getGameBanner(wide) {
      const images = require.context('./../../assets/banners', false, /\.jpg$/);
      return images(`./${this.$route.params.game}${wide ? '_wide.jpg' : '.jpg'}`);
    },
    getGameIcon() {
      const images = require.context('./../../assets/banners', false, /\.jpg$/);
      return images(`./${this.$route.params.game}_promo.jpg`);
    },
    otherGames() {
      return this.portalData.other_games[this.lang];
    },
    onResize() {
      this.screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      const videoContainer = document.getElementById("game-video-container");
      if (!videoContainer) return;

      const iframe = videoContainer.querySelector("iframe");
      if (iframe) {
        iframe.style.width = "84vw";
        iframe.style.height = `${(84 * 540) / 960}vw`;
        iframe.style.maxWidth = "960px";
        iframe.style.maxHeight = "540px";
        iframe.style.minWidth = "320px";
        iframe.style.minHeight = "180px";
      }
    },
    closeTab() {
      window.close();
    },
    goToGame(game, event) {
      const routerData = {
        name: 'Game',
        params: {
          game
        }
      };
      if (event.ctrlKey) {
        window.open(this.$router.resolve(routerData).href, '_blank');
      } else {
        this.$router.push(routerData);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    gotoGame() {
      this.$router.push({
        name: 'Game Info',
        params: {
          game: this.$route.params.game
        }
      });
    },
    playGame() {
      window.location.href = this.$router.resolve({
        name: 'Play',
        params: {
          game: this.$route.params.game
        }
      }).href;
    },
    getGenreTitle() {
      return this.portalData.genres[this.gameGenre][this.lang];
    },
    getImage(image) {
      const images = require.context('./../../assets/gamecard', false, /\.png$/);
      return images('./' + image + '.png');
    }
  }
};
</script>

<style scoped>
.play-now {
  background-color: var(--primary-background-color);
}

.play-now__navbar {
  background-color: var(--primary-background-color);
}

.play-now__content {
  padding: 32px;
  color: white;
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}

.play-now__info {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding-bottom: 10px;
}

.play-now__game-icon {
  border-radius: 12px;
  width: 120px;
  height: 120px;
  min-width: 120px;
}

.play-now__info-container {
  padding-left: 20px;
}

.play-now__game-title {
  font-size: 28px !important;
  font-weight: 500;
}

.play-now__genre {
  color: var(--secondary-text-color);
  display: flex;
  align-items: center;
  padding: 2px;
  height: 30px;
}

.play-now__genre-icon {
  width: 22px;
  height: 22px;
  fill: currentColor;
  margin-right: 8px;
}

.play-now__play-button {
  background-color: var(--primary-brand-color);
  border: none;
  border-radius: 8px;
  height: 40px;
  width: 170px;
  font-weight: 600 !important;
  margin-top: 12px;
  transition: transform 0.2s;
}

.play-now__play-button:hover {
  background-color: var(--primary-brand-color-active);
  transform: scale(1.02);
  cursor: pointer;
}

.play-now__other-title {
  margin-bottom: 12px;
}

.play-now__other-games {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  width: 100%;
}

.play-now__other-games > div {
  padding: 6px;
}

.play-now__other-game-card {
  width: 260px;
  padding: 3px;
}

.play-now__back-button-container {
  position: absolute;
  display: flex;
  flex-direction: row;
  font-size: 20px;
  font-weight: bold;
  color: var(--secondary-text-color);
  justify-content: center;
  align-items: center;
  margin: 24px;
}

.play-now__back-button-container:hover, .play-now__info-button-container:hover {
  cursor: pointer;
  color: var(--primary-text-color);
}

.play-now__back-button-container > svg {
  width: 16px;
  height: 16px;
}

.play-now__info-button-container {
  position: absolute;
  right: 0;
  display: flex;
  flex-direction: row;
  font-size: 20px;
  font-weight: bold;
  color: var(--primary-text-color);
  justify-content: center;
  align-items: center;
  margin: 24px;
}

.play-now__info-button-container > img {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

</style>

