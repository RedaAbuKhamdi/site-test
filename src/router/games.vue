<template>
  <NavBar
      @onChangeSearch="filterGames"
      @onToggleSidebar="toggleSidebar"
      class="navbar"
  />

  <div class="d-flex flex-row page-container">
    <SideBar
        class="sidebar"
        :toggle="sideBarVisible"
        :selectedGenre="selectedGenre"
        @onSelectedGenre="handleSelectedGenre"
        :class="{ 'sticky-sidebar': sidebarSticky }"
    />
    <div class="content">
        <GamesSection :gameCardSquareMode="gameCardSquareMode" />
    </div>
  </div>

  <PageFooter />
</template>

<script>
import { computed } from 'vue';
import portalData from './../../portal.json';
import NavBar from "../components/navbar";
import PageFooter from "../components/pagefooter";
import { useHead } from '@vueuse/head';
import SideBar from "@/components/sidebar.vue";
import AdsContainer from "@/components/adscontainer.vue";
import SvgIcon from "@/components/svgicon.vue";
import GamesSection from "@/components/gamessection.vue";

export default {
  name: "Games",
  components: {GamesSection, SvgIcon, AdsContainer, SideBar, PageFooter, NavBar },
  data() {
    return {
      portalData,
      screenWidth: 1000,
      sideBarVisible: true,
      gameCardSquareMode: false,
      sidebarSticky: false
    };
  },
  beforeMount() {
    useHead(computed(() => this.head));
  },
  mounted() {
    window.addEventListener("resize", this.onResize);
    window.addEventListener("scroll", this.onScroll);
    setTimeout(() => this.onResize(), 100);
    const floatContainer = document.getElementById('float-container');
    if (!floatContainer) return;
    if (this.$route.params.category === "search" && !this.$route.query.sq) {
      this.$router.push({
        name: 'Games',
        params: {
          category: "all"
        },
        query: {}
      });
    }
    setTimeout(() => {
      floatContainer.classList.remove('float-container-start');
      floatContainer.classList.add('float-container-end');
    }, 300);
  },
  unmounted() {
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("scroll", this.onScroll);
    useHead({});
  },
  computed: {
    head() {
      return {
        title: 'Clever Apps Games',
        meta: [
          { name: 'description', content: this.portalData.description[this.lang] },
          { property: 'og:title', content: this.portalData.title[this.lang] },
          { property: 'og:site_name', content: 'Clever Apps Games' },
          { property: 'og:description', content: this.portalData.description[this.lang] },
          { property: 'og:type', content: 'website' },
          { property: 'og:url', content: `https://cleverappssg.com/games/${this.lang}/` },
          { property: 'og:image', content: require('./../../assets/logo.png') },
          { property: 'twitter:title', content: this.portalData.title[this.lang] },
          { property: 'twitter:description', content: this.portalData.description[this.lang] },
          { property: 'twitter:card', content: require('./../../assets/logo.png') }
        ],
        link: Object.keys(this.portalData.languages).map(lang => ({
          rel: lang === this.lang ? "canonical" : "alternate",
          hreflang: lang,
          href: `https://cleverappssg.com/games`
        }))
      };
    },
    lang() {
      return this.language;
    },
    selectedGenre() {
      return this.$route.params.category === 'search'
          ? ''
          : this.$route.params.category;
    }
  },
  methods: {
    toggleFilter(filter) {
      if (filter === 'genres' || filter === 'platform' || this.isActiveFilter(filter)) {
        filter = "genres";
      }
      this.$router.push({
        name: 'Games',
        params: {
          category: filter
        }
      });
    },
    isActiveFilter(genre) {
      return genre === this.$route.params.category ||
          (genre === "genres" && this.$route.params.category === "genres");
    },
    filterGames(value) {
      if (value === undefined || value === null || value === "") {
        this.$router.push({
          name: 'Games',
          params: {
            category: "genres"
          },
          query: {}
        });
      } else {
        this.$router.push({
          name: 'Games',
          params: {
            category: "search"
          },
          query: { sq: value }
        });
      }
    },
    handleSelectedGenre(genre) {
      this.$router.push({
        name: 'Games',
        params: {
          category: genre
        },
        query: {}
      });
    },
    toggleSidebar() {
      this.sideBarVisible = !this.sideBarVisible;
    },
    onResize() {
      this.screenWidth =
          window.innerWidth ||
          document.documentElement.clientWidth ||
          document.body.clientWidth;
      this.sideBarVisible = this.screenWidth > 760;
      this.gameCardSquareMode = this.screenWidth <= 760;
    },
    onScroll() {
      // Set sidebarSticky to true if scrolled more than 80px, else false
      this.sidebarSticky = window.pageYOffset > 80;
    }
  },
  created() {
    window.addEventListener("scroll", this.onScroll);
  }
};
</script>

<style scoped>
/* Sidebar defaults */
.sidebar {
  z-index: 2;
}

/* When sticky, apply a shadow divider (using box-shadow) */
.sticky-sidebar {
  position: sticky;
  top: 0;
}

/* Navbar styling */
.navbar {
  background-color: var(--primary-background-color);
  z-index: 3;
}

/* Page and content container */
.page-container {
  background-color: var(--primary-background-color);
  width: 100%;
}
.content {
  width: 100%;
  min-height: 100svh;
}


</style>
