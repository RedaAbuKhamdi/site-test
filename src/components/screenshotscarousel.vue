<template>
  <Carousel
      :class="hasMaxWidth ? 'carousel-max-width' : ''"
      :items-to-show="toggleLarge ? 2 : numberOfItems"
      :wrapAround="false"
      ref="carousel"
  >
    <Slide class="carousel-inner" v-for="slide in (gameVideoUrl ? screenshotsCount + 1 : screenshotsCount)" :key="slide">
      <div class="carousel-item-container"
           :class="toggleLarge ? '' : 'screenshot-carousel-container-normal'"
           :style="{ '--element-width': itemWidth + 'px' }"
      >
        <template v-if="gameVideoUrl && slide === 1">
          <div class="video-wrapper" @click="toggleScreenshotPreview(slide - 1)">
            <EmbeddedVideo :gameName="gameName" />
          </div>
        </template>
        <template v-else>
          <img :src="gameScreenshot(slide - 1, true)" @click="toggleScreenshotPreview(slide - 1)" alt="Screenshot">
        </template>
      </div>
    </Slide>

    <template #addons>
      <Navigation/>
    </template>
  </Carousel>
</template>

<script>

    import { Carousel, Navigation, Slide, Pagination } from 'vue3-carousel';
    import 'vue3-carousel/dist/carousel.css';
    import EmbeddedVideo from './embeddedvideo';
    import YouTube from 'vue3-youtube'

    import portalData from './../../portal.json';
    import AnimatedPlaceholder from "@/components/animatedplaceholder.vue";

    export default {
        name: 'ScreenshotsCarousel',
        props: {
            hasMaxWidth: {
                type: Boolean,
                required: false,
                default: true
            },
            itemWidth: {
              type: Number,
              required: true
            }
        },
        components: {
            AnimatedPlaceholder,
            Carousel,
            Navigation,
            Slide,
            Pagination,
            YouTube,
            EmbeddedVideo
        },
        data() {
            return {
                portalData: portalData,
                screenWidth: 1000,
                modalImage: false,
                modalVideo: false,
                videoLoaded: false,
                videoWidth: "960px",
                videoHeight: "540px",
                containerWidth: 0,
                toggleLarge: false
            }
        },
        mounted() {
            this.$refs.carousel.slideTo(0);

            window.addEventListener("resize", this.updateWidth);
            this.updateWidth();
        },
        unmounted() {
            window.removeEventListener("resize", this.updateWidth);
        },
        computed: {
            lang() {
                return this.language;
            },
            isMobile() {
                return this.screenWidth <= 760;
            },
            screenshotLanguages() {
                return Object.keys(this.portalData.games[this.$route.params.game].screenshots).filter(lang => {
                    var images = this.portalData.games[this.$route.params.game].screenshots[lang];
                    return images && images.length > 0;
                });
            },
            screenshotsCount() {
                var result;
                if (this.isMobile) {
                    result = this.portalData.games[this.$route.params.game].screenshots_portrait && this.portalData.games[this.$route.params.game].screenshots_portrait['en'].length;
                }

                return result ? result : this.portalData.games[this.$route.params.game].screenshots['en'].length;
            },
            gameVideoUrl() {
                return this.portalData.games[this.$route.params.game].video;
            },
            gameName(){
              return this.$route.params.game;
            },
            numberOfItems() {
              return Math.floor(this.containerWidth / this.itemWidth);
            }
        },
        methods: {
            gameScreenshot(index, minimal) {
                index = index - (this.gameVideoUrl !== undefined);
                var takePortrait = this.isMobile && this.portalData.games[this.$route.params.game].screenshots_portrait && this.portalData.games[this.$route.params.game].screenshots_portrait['en'].length;
                if (index >= this.portalData.games[this.$route.params.game].screenshots['en'].length) {
                    takePortrait = true;
                    index -= this.portalData.games[this.$route.params.game].screenshots['en'].length;
                }

                var portraitImages, images;
                if (minimal) {
                    portraitImages = require.context('./../../assets/screenshots_portrait/minimal', false, /\.jpg$/);
                    images = require.context('./../../assets/screenshots/minimal', false, /\.jpg$/);
                } else {
                    portraitImages = require.context('./../../assets/screenshots_portrait', false, /\.jpg$/);
                    images = require.context('./../../assets/screenshots', false, /\.jpg$/);
                }

                var lang = this.screenshotLanguages.indexOf(this.lang + '') === -1 ? 'en' : this.lang;
                if (takePortrait && this.portalData.games[this.$route.params.game].screenshots_portrait) {
                    return portraitImages('./' + this.$route.params.game + '_' + index + '_' + lang + '.jpg');
                } else {
                    return images('./' + this.$route.params.game + '_' + index + '_' + lang + '.jpg');
                }
            },
            updateWidth() {
                if (this.$refs.carousel) {
                  this.containerWidth = this.$refs.carousel.$el.offsetWidth;
                }
            },
            carouselNext(event) {
                event.preventDefault();
                event.stopPropagation();
                var currentIndex = this.$refs.carousel.data.currentSlide.value;
                this.$refs.carousel.next();
                if (currentIndex === this.$refs.carousel.data.currentSlide.value) {
                    this.$refs.carousel.data.currentSlide.value++;
                }
                this.modalImage = this.gameScreenshot(this.$refs.carousel.data.currentSlide.value);
            },
            carouselPrev(event) {
                event.preventDefault();
                event.stopPropagation();
                this.$refs.carousel.prev();
                this.modalImage = this.gameScreenshot(this.$refs.carousel.data.currentSlide.value);
            },
            toggleScreenshotPreview(index) {
                this.$refs.carousel.data.currentSlide.value = index;
                this.toggleLarge = !this.toggleLarge;
            },
            onVideoReady() {
                this.videoLoaded = true;
            },
            openVideoPreview() {
                this.modalVideo = true;
                setTimeout(function () {
                    if (!this.$refs.youtube.initiated) {
                        this.$refs.youtube.initPlayer();
                    }
                    if (this.screenWidth < 1000) {
                        // this.$refs.youtube.$el.styles.width = this.screenWidth * 0.9;
                    }
                    this.$refs.modalVideo.focus();
                }.bind(this), 500);
            }
        }
    }
</script>
<style>
    .carousel-inner > img{
        margin: 10px;
        border-radius: 16px;
        width: 96%;

    }

    .video-wrapper {
      width: 100%;
      height: 100%;
      position: relative;
      border-radius: 8px;
      overflow: hidden;
    }

    .video-wrapper .video-container {
      position: relative !important; /* Override absolute from EmbeddedVideo */
      width: 100% !important;
      height: 100% !important;
      border-radius: 0 !important;
      z-index: auto !important;
    }

    .video-wrapper video {
      border-radius: 16px;
    }

    .carousel-item-container {
      overflow: hidden;
      border-radius: 8px;  /* Optional: add your desired border radius */
    }

    .screenshot-carousel-container-normal {
      height: 160px!important;       /* Fixed height */
      width: var(--element-width);
    }

    /* Ensure any direct child (image, video, etc.) fills the container */
    .carousel-item-container > *, .carousel-item-container > * > * {
      width: 100%;
      height: 100%;
      object-fit: cover;   /* Fills the container while preserving aspect ratio (cropping if needed) */
    }


    /* Optionally, if the slide content is an image inside the container */
    .carousel-inner img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }


    .carousel-inner > div {
        width: 96%;
        margin: 10px;
    }


    .carousel-inner > div > img {
        border-radius: 16px;
        width: 100%;
    }

    .carousel-inner:hover {
        cursor: pointer;
        transform: scale(1.03);
    }
    .carousel-inner:active {
        opacity: 0.8;
    }
    .carousel {
        width: 100%;
        margin: 0 auto;
    }

    .carousel__prev, .carousel__next {
        background-color: var(--primary-brand-color);
        border-radius: 40px;
        width: 40px;
        height: 40px;
        text-align: center;
        font-size: 36px;
        padding: 0;
        color: var(--primary-text-color);
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        border: 0;
        top: 50%;
        cursor: pointer;
    }
    .carousel__prev--in-active,
    .carousel__next--in-active {
        display: none;
    }

    .carousel__prev {
        left: 8px;
    }
    .carousel__next {
        right: 8px;
    }

    @media (max-width: 994px) {
        .imagepreview {
            max-width: 90vw;
            max-height: 90vh;
        }
    }

</style>