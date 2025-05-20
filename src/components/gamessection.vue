<template>
  <div
      id="float-container"
      class="float-container-start"
      v-for="(genre, index) in organisedGenres"
      :key="genre"
  >
    <div>
      <div class="section-title">
        <span class="tag-image"><SvgIcon :image="getGenreImage(genre)"/></span>
        <span>{{ genre }}</span></div>
      <div class="gamecards-row" v-if="!isMyGames(genre)">
        <div class="game-card" v-for="game in getGamesByGenre(genre)" :key="game.name">
          <div>
            <GameCard :gameName="game.name" @onMyGamesUpdate="updateMyGames" :squareMode="isMyGames(genre) ? true : gameCardSquareMode" />
          </div>
        </div>
      </div>
      <div v-else>
        <GamesCarousel :gameNames="myGames" class="gamecards-row-square" :elementWidth="120" :style="{width: contentWidth + 'px'}" :squareMode="true" />
      </div>
      <AdsContainer v-if="index === 1 * (myGames.length > 0)" horizontal="true" />
    </div>
  </div>

</template>

<script>
import portalData from './../../portal.json';
import GameCard from "@/components/gamecard.vue";
import AdsContainer from "@/components/adscontainer.vue";
import icons from './../../assets/icons.json';
import SvgIcon from "@/components/svgicon.vue";
import GameCardSkeleton from "@/components/gamecardskeleton.vue";
import Cookies from 'js-cookie';
import GamesCarousel from "@/components/gamescarousel.vue";

export default {
  name: 'GamesSection',
  props: ["gameCardSquareMode"],
  components: {GamesCarousel, GameCardSkeleton, SvgIcon, AdsContainer, GameCard},
  data() {
      return {
          portalData: portalData,
          myGames: [],
          contentWidth: window.innerWidth - 200
      }
  },
  mounted() {
    let data = Cookies.get("mygames");
    let result = [];
    if (data) {
      result = data.split(":").filter(function (code) {
        return code !== "";
      });
    }
    this.myGames = result;
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize);
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  computed: {
      lang() {
          return this.language;
      },
      gameNames() {
        const gamesData = this.portalData.games;
        const searchQuery = this.$route.query.sq ? this.$route.query.sq.trim().toLowerCase() : "";
        let filteredGames = [];
        Object.keys(gamesData).forEach(gameName => {
          if (this.$route.params.category === 'search' && searchQuery) {
            const titleLong = gamesData[gameName].title_long[this.lang];
            if (titleLong.toLowerCase().includes(searchQuery)) {
              filteredGames.push({
                name: gameName,
                genre: this.getGenreTitle(gamesData[gameName].genre)
              });
            }
          } else if (this.$route.params.category === "genres" || this.$route.params.category === "games") {
            filteredGames.push({
              name: gameName,
              genre: this.getGenreTitle(gamesData[gameName].genre)
            });
          } else if (
              gamesData[gameName].genre === this.$route.params.category ||
              Object.keys(gamesData[gameName].links).includes(this.$route.params.category)
          ) {
            filteredGames.push({
              name: gameName,
              genre: this.getGenreTitle(gamesData[gameName].genre)
            });
          } else if (this.myGames.indexOf(gameName) !== -1) {
            filteredGames.push({
              name: gameName
            });
          }
        });
        return filteredGames;
      },
      genreCodeTitleMap() {
        var res = {};
        var codes = Object.keys(this.portalData.genres);
        for (var i = 0; i < codes.length; i++) {
          res[this.portalData.genres[codes[i]][this.lang]] = codes[i];
        }
        res[this.portalData["mygames"][this.lang]] = "mygames";
        return res;
      },
      organisedGenres() {
        let genres = this.gameNames
            .map(game => game.genre)
            .filter((value, index, self) => self.indexOf(value) === index && value);
        if (this.myGames.length > 0 && !(this.$route.params.category === 'search' && this.$route.params.sq)) {
          genres.unshift(this.portalData["mygames"][this.lang]);
        }
        return genres;
      }
  },
  methods: {
    getGamesByGenre(genre) {
      return this.gameNames.filter(function (game) {
        return this.isMyGames(genre) ? this.myGames.indexOf(game.name) !== -1 :  game.genre === genre;
      }.bind(this));
    },
    getGenreImage(genre) {
      return icons[this.genreCodeTitleMap[genre]];
    },
    gameImageUrl(game) {
      const images = require.context('./../../assets/banners', false, /\.jpg$/);
      return images('./' + game + '.jpg');
    },
    getGenreTitle(code) {
      return this.portalData.genres[code][this.lang];
    },
    gameTitle(game) {
      return this.portalData.games[game].title_long[this.lang];
    },
    gameLink(game) {
      return `/game/${game}${this.$route.params.lang ? '/' + this.lang : ''}`;
    },
    isMyGames(genre) {
      return genre === this.portalData["mygames"][this.lang];
    },
    updateMyGames(currentMyGames) {
      this.myGames = currentMyGames;
    },
    onResize() {
      this.contentWidth = window.innerWidth - 200;
    }
  }
}
</script>

<style scoped>
.section-title {
  color: var(--primary-text-color);
  fill: var(--primary-text-color);
  font-weight: bold;
  font-size: 16pt;
  font-family: Roboto,'Helvetica Neue',Arial,sans-serif;
  display: flex;
  align-items: center;
}
.tag-image {
  margin-right: 15px;
  height: 25px;
  width: 25px;
  display: block;
}
.game-card {
  padding: 10px;
}
.gamecards-row {
  display: grid;
  gap: 7px; /* Adjust gap between cards as needed */
  width: 100%;
}

/* For non-mobile: auto-fit columns with a minimum width */
@media (min-width: 761px) {
  .gamecards-row {
    grid-template-columns: minmax(180px, 320px) repeat(auto-fit, minmax(180px, 320px));
  }
}

/* For mobile: force a single column */
@media (max-width: 760px) {
  .gamecards-row {
    grid-template-columns: repeat(auto-fit, minmax(80px, 120px));
  }

}

#float-container {
  color: var(--primary-text-color);
  padding: 20px;
  width: 100%;
  box-sizing: border-box; /* ensures padding is included in width */
}

</style>