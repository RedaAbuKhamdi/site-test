<script setup>

import SvgIcon from "@/components/svgicon.vue";
</script>

<template>
<aside class="sidebar" :class="toggle ? '' : 'hidden'">
  <ul class="sidebar-links">
    <li v-for="category in allGenres">
      <a class="d-flex flex-row align-items-center" @click="onSelectGenre(category.code)" :class="selectedGenre === category.code?'active':''">
        <SvgIcon  class="links-image" :image="getIcon(category.code)" :name="category.code"/>
        <span class="links-span">{{category.title}}</span>
      </a>
    </li>
  </ul>

  <div class="divider"/>

  <ul class="sidebar-text-links">
    <li>
      <a @click="gotoContacts()">{{localizedData.contact}}</a>
    </li>
    <li>
      <a @click="gotoPrivacy()">{{privacy}}</a>
    </li>
    <li>
      <a @click="gotoTerms()">{{terms}}</a>
    </li>
    <li>
      <a @click="gotoConnectorSDK()">{{portalData.connector_sdk_title}}</a>
    </li>
  </ul>

</aside>
</template>

<script>
import portalData from "../../portal.json";
import icons from "../../assets/icons.json";
import SvgIcon  from "@/components/svgicon.vue";



export default {
  name: 'SideBar',
  props: ['toggle', 'selectedGenre'],
  data() {
    return {
      portalData: portalData
    }
  },
  computed: {
    localizedData() {
      var result = {};
      Object.keys(this.portalData.header).forEach(propName => {
        var propValue = this.portalData.header[propName];
        if (typeof propValue === 'object' && propValue[this.lang]) {
          result[propName] = propValue[this.lang];
        } else {
          result[propName] = propValue;
        }
      });
      return result;
    },
    languages() {
      return Object.keys(this.portalData.languages).map((l) => ({
        code: l,
        title: this.portalData.languages[l],
      }));
    },
    currentLanguageString() {
      const availableLanguages = this.portalData.languages;
      return Object.keys(availableLanguages)
          .filter((l) => l === this.lang)
          .map((l) => availableLanguages[l])[0];
    },
    lang() {
      return this.language;
    },
    privacy() {
      return this.portalData.footer.privacy[this.lang];
    },
    terms() {
      return this.portalData.footer.terms[this.lang];
    },
    allGenres() {
      var genres = Object.keys(this.portalData.genres).filter(genreName => {
        return genreName !== "all";
      }).map(genreName => {
        return {
          code: genreName,
          title: this.portalData.genres[genreName][this.lang]
        }
      });
      return genres;
    }
  },
  methods: {
    gotoContacts() {
      this.$router.push({
        name: 'Contacts',
        params: {}
      });
    },
    gotoPrivacy() {
      this.$router.push({
        name: 'Privacy',
        params: {}});
    },
    isActiveLanguage(lang) {
      return lang === this.lang;
    },
    gotoTerms() {
      this.$router.push({
        name: 'Terms',
        params: {}});
    },
    setLanguage(langCode) {
      const routerData = {
        name: this.$route.name,
        params: {
          game: this.$route.params.game,
          category: this.$route.params.category || "games",
        },
      };
      this.$router.push(routerData);
      this.$emit("onChangeLanguage", langCode);
    },
    gotoConnectorSDK() {
      window.open(this.portalData.connector_sdk_link, '_blank');
    },
    onSelectGenre(genre) {
      this.$emit("onSelectedGenre", genre);
    },
    getIcon(name) {
      return icons[name];
    }
  }
}
</script>

<style scoped>
.hidden {
  display: none !important;
}
.sidebar {
  width: 182px;
  height: 100svh;
  background-color: var(--primary-background-color);
  padding: 6px;
}
.sidebar-links, .sidebar-text-links {
  color: var(--secondary-text-color);
  padding-top: 10px;
  padding-left: 0;
}

.sidebar-text-links li {
  margin-bottom: 16px;
}
.sidebar-links li, .sidebar-text-links li{
  display: block;
  font-size: 11pt;
}
.sidebar-links li a:hover {
  cursor: pointer;
  background-color: var(--secondary-background-color);
}
.sidebar-text-links li a:hover {
  cursor: pointer;
  color: var(--primary-text-color);
}

.active, .active:hover {
  cursor: pointer;
  background-color: var(--primary-text-color)!important;
  color: var(--primary-text-color-contrast)!important;
}
.sidebar-links li a {
  text-decoration: none;
  border-radius: 8px;
  padding: 6px 12px;
  color: var(--secondary-text-color-variation-1);
  height: 30px;
}
.divider {
  margin: auto;
  width: 100%;
  height: 1px;
  background-color: var(--secondary-background-color);
}
.links-span {
  display: inline-block;
  text-align: left;
  padding-left: 10px;
  color: inherit;
  flex: 0 0 70%;
}
.links-image {
  flex: 0 0 20%;
  background-size: contain;
}

/* Container: stack label and trigger vertically */
.language-dropdown {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.language-label:hover {
  background-color: transparent!important;
  outline: none;
}


/* Label: icon and text on the same line */
.language-label {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
}

.language-label svg {
  margin-right: 15px;
  margin-left: 10px;
}

/* Dropdown trigger: style as a block element */
.language-current {
  display: block;
  width: 90%;
  position: relative;
  margin: 0 auto;
  background-color: var(--secondary-background-color-variation-1);
  color: white!important;
  padding: 0 12px!important;
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  font-size: 11pt;
}

.language-current::after {
  display: none !important;
}


/* Style the SVG arrow */
.language-current svg {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  fill: var(--primary-text-color);
  width: 11px;   /* Adjust size as needed */
  height: 11px;
  transition: transform 0.3s ease-in-out;
}

.language-current span {
  display: block;
  padding-top: 3px;
}

/* Rotate the arrow when dropdown is active.
   Bootstrap sets aria-expanded to "true" when open */
.language-current[aria-expanded="true"] svg {
  transform: translateY(-50%) rotate(180deg);
}

.language-dropdown {
  position: relative; /* Needed so the dropdown positions relative to this container */
}

.dropdown-menu {
  background-color: var(--secondary-background-color-variation-1);
  border: none;
  margin-top: 5px !important;
  height: 300px;            /* Fixed height */
  overflow-y: auto;         /* Enable vertical scrolling */
  scrollbar-color: var(--secondary-background-color-variation-2) var(--secondary-background-color-variation-1); /* Scrollbar colors */
  width: 85%;               /* Match the trigger's width */
  left: 50%;                /* Center horizontally */
  transform: translateX(-50%);
  min-width: 0;             /* Override any default min-width */
}



.dropdown-menu .dropdown-item {
  background-color: var(--secondary-background-color-variation-1);
  padding: 4px 6px!important;
}

.language-dropdown a {
  border-radius: 0.5em!important;
}

.dropdown-menu .dropdown-item:hover,
.dropdown-menu .dropdown-item:focus {
  background-color: #444;
}

.active-lang {
  background-color: var(--secondary-background-color-variation-2) !important;
  color: var(--primary-text-color) !important;
}


</style>