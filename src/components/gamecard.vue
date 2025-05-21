<template>
  <div v-if="loaded">
    <div
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        :title="gameTitle(gameName)"
        :class="squareMode ? 'card-square': 'card'"
        @click.stop="handleClick"
        ref="main"
    >
      <img
          :alt="gameName"
          :src="gameImageUrl"
          class="card-img-top"
          :class="{'square-mode-img': squareMode}"
      >
      <!-- On hover, show background and overlay -->
      <div v-show="hovered && !squareMode">
        <template v-if="hasVideo">
          <!-- Video container separately -->
          <EmbeddedVideo :gameName="gameName" />
          <!-- Info overlay container separately -->
          <div class="position-absolute info-container">
            <div class="info-overlay">
              <img @click.stop="gotoGame" alt="" :src="getImage('i')" class="info-button">
            </div>
          </div>
        </template>
        <template v-else>
          <!-- If no video, use blackout container with overlay -->
          <div class="position-absolute blackout-container">
            <div class="info-overlay">
              <img @click.stop="gotoGame" alt="" :src="getImage('i')" class="info-button">
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="game-title" :class="{'game-title-square': squareMode}">
        {{ portalData.games[gameName].title_short[lang] }}
    </div>
  </div>
  <div v-else>
      <GameCardSkeleton :gameName="gameName" />
  </div>
</template>


<script>
import portalData from '../../portal.json';
import Cookies from 'js-cookie';
import utils from "@/src/utils";

import EmbeddedVideo from "@/components/embeddedvideo.vue";
import GameCardSkeleton from "@/components/gamecardskeleton.vue";

export default {
  name: "GameCard",
  props: ["gameName", "squareMode"],
  components: {GameCardSkeleton, EmbeddedVideo },
  data() {
    return {
      portalData: portalData,
      hovered: false,
      buttonWidth: "120px",
      titleFontSize: "18px",
      baseFontSize: "16px",
      infoImageHeight: "30px",
      borderRadius: "1em",
      loaded: false
    }
  },
  mounted() {
    window.addEventListener("resize", this.onResize);
    window.scrollTo({top: 0, behavior: 'smooth'});
    setTimeout(function () {
      this.onResize();
    }.bind(this), 100);
    const images = require.context('./../../assets/banners', false, /\.jpg$/);
    const img = new Image();
    img.src = this.squareMode
        ? images('./' + this.gameName + '_promo.jpg')
        : images('./' + this.gameName + '.jpg');

    img.onload = () => {
      this.loaded = true;
      this.onResize();
    };

    window.addEventListener("resize", this.onResize);
    setTimeout(() => this.onResize(), 100);
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
      return this.language;
    },
    gamePlatforms() {
      var gamesData = this.portalData.games;
      var gamePlatforms = {};
      Object.keys(gamesData).forEach(function (gameName) {
        gamePlatforms[gameName] = Object.keys(gamesData[gameName].links)
            .sort()
            .reverse()
            .filter(function (platform) {
              return ['android', 'ios'].includes(platform);
            });
      });
      return gamePlatforms;
    },
    // Computed property for gameImageUrl
    gameImageUrl() {
      const images = require.context('./../../assets/banners', false, /\.jpg$/);
      return this.squareMode
          ? images('./' + this.gameName + '_promo.jpg')
          : images('./' + this.gameName + '.jpg');
    },
    // Computed property for gameVideoUrl
    gameVideoUrl() {
      const videos = require.context('./../../assets/previews', false, /\.mp4$/);
      try {
        return videos('./' + this.gameName + '.mp4');
      } catch (e) {
        return undefined;
      }
    },
    // Check if a video exists for this game.
    hasVideo() {
      try {
        const videos = require.context('./../../assets/previews', false, /\.mp4$/);
        // Attempt to require the video file
        videos('./' + this.gameName + '.mp4');
        return true;
      } catch (e) {
        return false;
      }
    }
  },
  methods: {
    // New hover event handlers that check if squareMode is active.
    handleMouseEnter() {
      if (!this.squareMode && !this.isMobile()) {
        this.hovered = true;
      }
    },
    handleMouseLeave() {
      if (!this.squareMode) {
        this.hovered = false;
      }
    },
    handleClick() {
      if (this.hovered) {
        var isPlayed = this.isPlayed();
        this.registerGame();
        this.playGame(isPlayed);
      } else {
        this.hovered = true;
      }
    },
    gotoStore(store) {
      window.open(this.storeLink(store), '_blank');
    },
    gotoGame() {
      utils.logEvent("viewinfo", this.gameName);
      this.$router.push({
        name: 'Game Info',
        params: {
          game: this.gameName
        }
      });
    },
    playGame(isPlayed) {
      let routeData;
      if (isPlayed) {
        routeData = this.$router.resolve({
          name: 'Play',
          params: {
            game: this.gameName
          }
        });
      } else {
        routeData = this.$router.resolve({
          name: 'Play Now',
          params: {
            game: this.gameName
          }
        });
      }
      utils.logEvent("click", this.gameName);
      window.open(routeData.href, '_blank');
    },
    storeLink(store) {
      return this.portalData.games[this.gameName].links[store];
    },
    gameTitle(game) {
      return this.portalData.games[game].title_long[this.lang];
    },
    getImage(image) {
      const images = require.context('./../../assets/gamecard', false, /\.png$/);
      return images('./' + image + '.png');
    },
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    isPlayed() {
      let data = Cookies.get("mygames") || "";
      let currentGames = data.split(":").filter(function (item) {
        return item !== "";
      });
      return currentGames.indexOf(this.gameName) !== -1;
    },
    registerGame() {
      let data = Cookies.get("mygames") || "";
      let currentGames = data.split(":").filter(function (item) {
        return item !== "";
      });
      if (currentGames.indexOf(this.gameName) === -1) {
        currentGames.push(this.gameName);
        Cookies.set("mygames", currentGames.join(":"));
        this.$emit("onMyGamesUpdate", currentGames);
      }
    },
    onResize() {
      if (this.$refs.main) {
        var width = this.$refs.main.clientWidth;
      } else {
        return;
      }
      this.buttonWidth = width / 3 + "px";
      this.baseFontSize = width / (398 / 16) + "px";
      this.titleFontSize = width / (398 / 18) + "px";
      this.infoImageHeight = width / (398 / 30) + "px";
    }
  }
}
</script>

<style scoped>
a {
  text-decoration: none;
}

.blackout-container {
  cursor: default;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: v-bind(borderRadius);
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  width: 100%;
  height: 100%;
}

/* Updated card styles remain the same */
.card {
  border-radius: v-bind(borderRadius);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  transition: all .2s ease-in-out;
  max-width: 300px;
  height: auto;
}
.card-square {
  width: 100px;
  height: 100px;
  border-radius: v-bind(borderRadius);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  transition: all .2s ease-in-out;
}
.card-img-top {
  border-radius: v-bind(borderRadius);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}
.card:hover {
  cursor: pointer;
  box-shadow: unset;
  transform: scale(1.03);
}

.info-container {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;  /* On top of video */
  pointer-events: none; /* So that underlying video doesn’t interfere; allow clicks to pass into overlay elements if desired */
}

.info-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: all;  /* Ensures the overlay is clickable */
}


/* Info button styling */
.info-button {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 25px;
  height: 25px;
}

/* Additional styling */
.info-image img {
  opacity: 0.5;
  animation: 0.5s showWithHalfOpacity;
}

@keyframes show {
  0% { opacity: 0; transform: scale(0.95); }
  50% { opacity: 1; }
  100% { transform: scale(1); }
}

@keyframes showWithHalfOpacity {
  0% { opacity: 0; transform: scale(0.95); }
  50% { opacity: 0.5; }
  100% { transform: scale(1); }
}

.info div {
  padding-left: 10%;
  color: var(--primary-text-color);
}

.card-img-top.square-mode-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: v-bind(borderRadius);
}


.info-image img {
  opacity: 0.5;
  height: v-bind(infoImageHeight);
}

.info-image img:hover {
  opacity: 1;
  cursor: pointer;
}

.game-title {
  font-size: 12pt;
  margin-left: 2px;
  margin-top: 2px;
  text-align: center;
  width: 100%;
}

.game-title-square {
  width: 106px;
  margin-left: 0!important;
  font-size: 12pt;
}

</style>
