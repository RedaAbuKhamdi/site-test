<template>
  <div class="games-carousel-wrapper">
    <Carousel
        :items-to-show="numberOfItems"
        :wrapAround="false"
        ref="carousel"
        class="carousel"
    >
      <Slide class="carousel-inner" v-for="gameName in gameNames" :key="gameName">
        <div class="carousel-item-container game-carousel-container-normal">
          <div>
            <GameCard :gameName="gameName" @onMyGamesUpdate="onUpdateMyGames"  :squareMode="squareMode" />
          </div>
        </div>
      </Slide>

      <template #addons>
        <Navigation/>
      </template>
    </Carousel>
  </div>
</template>

<script>

    import { Carousel, Navigation, Slide, Pagination } from 'vue3-carousel';
    import 'vue3-carousel/dist/carousel.css';
    import EmbeddedVideo from './embeddedvideo';
    import YouTube from 'vue3-youtube'

    import portalData from './../../portal.json';
    import AnimatedPlaceholder from "@/components/animatedplaceholder.vue";
    import GameCard from "@/components/gamecard.vue";
    import GameCardSkeleton from "@/components/gamecardskeleton.vue";

    export default {
        name: 'GamesCarousel',
        props: {
            hasMaxWidth: {
                type: Boolean,
                required: false,
                default: true
            },

          gameNames: {
              type: Array,
              required: true
            },
            squareMode: {
              type: Boolean,
              required: false
            },
            elementWidth: {
              type: Number,
              required: true
            }
        },
        components: {
          GameCardSkeleton,
          GameCard,
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
                containerWidth: 0
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
            numberOfItems() {
              return Math.floor(this.containerWidth / this.elementWidth);
            }
        },
        watch: {
          gameNames: {
            immediate: true,
            handler() {
              this.$nextTick(() => {
                if (this.$refs.carousel?.updateSlideWidth) {
                  this.$refs.carousel.updateSlideWidth(); // ensures recalculation
                }
              });
            }
          }
        },
        methods: {
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
          onUpdateMyGames(currentMyGames) {
              this.$emit('onUpdateMyGames', currentMyGames);
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

    .game-carousel-container-normal {
      min-height: 160px;
      width: 220px
      !important;
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

    .games-carousel-wrapper .carousel__prev,
    .games-carousel-wrapper .carousel__next {
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
      cursor: pointer;
      top: 55px;
    }

    .games-carousel-wrapper .carousel__prev {
      left: 8px;
    }
    .games-carousel-wrapper .carousel__next {
      right: 8px;
    }

    .games-carousel-wrapper .carousel__prev--in-active,
    .games-carousel-wrapper .carousel__next--in-active {
      display: none;
    }

</style>