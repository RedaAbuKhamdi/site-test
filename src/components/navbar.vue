<template>
  <nav class="navbar navbar-expand">
    <div class="container-fluid">
      <!-- Left: Logo -->
      <div class="navbar-left">
        <img
            alt="menu"
            :src="require( './../../assets/menu.png')"
            class="menu-icon clickable"
            @click="toggleSidebar()"
            v-if="isMobile"
        >
        <img
            alt="cleverapps"
            class="navbar-brand"
            :src="require(isMobile ? './../../assets/logo_mobile.png' : './../../assets/logo.png')"
            @click="gotoGames()"
        >
      </div>
      <!-- Center: Search bar (only if route is 'Games') -->
      <div v-if="$route.name === 'Games'" class="navbar-center">
        <div class="input-group search d-flex align-items-center">
          <div class="search-icon">
          </div>
          <input
              class="search-input"
              type="text"
              :placeholder="portalData['search_placeholder'][lang]"
              v-model="searchQuery"
              id="navbar-search-input"
          >
          <button class="close-icon"
                v-if="hasSearch"
                @click="clearSearch()">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 14 14">
              <line x1="1" y1="1" x2="13" y2="13" stroke="#717171" stroke-width="2.5"/>
              <line x1="13" y1="1" x2="1" y2="13" stroke="#717171" stroke-width="2.5"/>
            </svg>
          </button>
          <button
              class="search-button"
              v-if="hasSearch"
              @click="triggerSearch()">
            Search
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import portalData from "./../../portal.json";

export default {
  name: "NavBar",
  data() {
    return {
      screenWidth: 1000,
      portalData: portalData,
      searchQuery: this.$route.query.sq || "",
    };
  },
  mounted() {
    window.addEventListener("resize", this.onResize);
    // Ensure the initial width is set
    setTimeout(() => {
      this.onResize();
    }, 500);
  },
  unmounted() {
    window.removeEventListener("resize", this.onResize);
  },
  computed: {
    lang() {
      return this.language;
    },
    isMobile() {
      return this.screenWidth <= 760;
    },
    hasSearch() {
      return this.searchQuery.length > 0;
    }
  },
  methods: {
    gotoGames() {
      this.$router.push({
        name: "Games",
        params: {
          category: "games"
        },
      });
    },
    toggleSidebar() {
      this.$emit("onToggleSidebar");
    },
    clearSearch() {
      this.searchQuery = "";
      this.triggerSearch();
    },
    triggerSearch() {
      this.$emit("onChangeSearch", this.searchQuery);
    },
    onResize() {
      this.screenWidth =
          window.innerWidth ||
          document.documentElement.clientWidth ||
          document.body.clientWidth;
    },
  },
};
</script>

<style scoped>
.navbar{
  background-color: var(--primary-background-color);
}
.container-fluid {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
}

.navbar-left {
  flex: 0 0 auto;  /* Only takes as much width as needed */
}

.navbar-center {
  flex: 1;         /* Takes all remaining space */
  display: flex;
  justify-content: center; /* Centers the search bar within this space */
}

.navbar-brand {
  height: 50px;
  cursor: pointer;
  padding: 10px 0;
}

.search {
  display: flex;
  align-items: center; /* Vertically centers the children */
  background: var(--secondary-background-color-variation-3);
  border-radius: 8px;
  padding: 2px 10px;   /* Reduced vertical padding */
  max-width: 80%;
  height: 30px;        /* Fixed height for the search bar */
}

.search-input, .search-input:focus {
  flex: 1;             /* Fill available space */
  height: 100%;        /* Match parent's height */
  border: none!important;
  outline: none;
  background: transparent;
  color: var(--primary-text-color);
  padding: 0 5px;      /* Adjust horizontal padding as needed */
  font-size: 14px;     /* Ensure font size works well with the fixed height */
}

.search-input:hover::placeholder {
  color: var(--primary-text-color);
}

.search-icon {
  height: 15px;        /* Adjust icon height to visually match the input */
  width: 25px;
  background-size: contain;
  background-repeat: no-repeat;
  background-image: url("data:image/svg+xml,%3csvg width='20' height='20' fill='none' xmlns='http://www.w3.org/2000/svg'%3e %3ccircle cx='8' cy='8' r='7' stroke='%23fff' stroke-width='2'/%3e %3cpath fill='%23fff' d='m12 13.414 5.879 5.88 1.414-1.415L13.414 12z'/%3e %3c/svg%3e");
}

/* Language dropdown icon size */
.nav-icon {
  height: 26px;
}

.clickable:hover {
  cursor: pointer;
  color: var(--primary-text-color);
}

.close-icon {
  height: 30px;
  width: 30px;
  background: none;
  border: none;
  padding-bottom: 5px;
  position: absolute;
  right: 65px;
}

.close-icon:hover {
  cursor: pointer;
}

.search-button {
  width: 65px;
  height: 30px;
  background-color:var(--primary-brand-color);
  border: none;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  position: absolute;
  right: 0;
}

/* Adjustments for mobile (vertical layout) */
@media (max-width: 768px) {
  .container-fluid {
    flex-direction: column;
    align-items: center;
    position: relative;
  }
  /* Stack sections vertically */
  .navbar-left,
  .navbar-center,
  .navbar-right {
    flex: 0 0 auto;
    margin-bottom: 10px;
  }
  .navbar-left {
    width: 100%;
    display: flex;
    justify-content: flex-start; /* Align items to the left */
    align-items: center;         /* Vertically center the items */
    padding-left: 10px;          /* Add left padding */
  }
  /* Add spacing to the menu icon */
  .menu-icon {
    height: 35px;  /* adjust as needed */
    width: auto;    /* maintain aspect ratio */
    margin-right: 10px; /* space between menu icon and logo */
    padding: 5px;
  }
  /* Adjust the logo (navbar-brand) for mobile */
  .navbar-brand {
    height: 50px;  /* adjust as needed */
    margin: 0;     /* remove extra margins */
    padding: 5px 0;
  }
  /* Center: search bar takes 80% width */
  .navbar-center {
    flex: 0 0 80%;
    width: 100%;
    justify-content: center;
  }
  /* Absolutely position the language widget */
  .search {
    max-width: 100%;
    border: none;
  }
}
</style>
