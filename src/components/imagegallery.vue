<template>
  <div class="image-gallery">
    <!-- Main image or video -->
    <div class="image-gallery__image">
      <div class="image-gallery__image__video-wrapper"
           v-if="currentSlide === 0 && videoUrl !== undefined">
        <video autoplay muted loop playsinline
               @click="onClick()">
          <source :src="videoUrl" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>
      <img
          :src="gameScreenshot(currentSlide, true)"
          @click="onClick()"
          alt="Screenshot"
          v-else
      />
    </div>

    <!-- Custom vertical carousel -->
    <div class="image-gallery__thumbnails">
      <div
          class="arrow up"
          @click="scrollThumbnails(-1)"
          :class="canScrollUp ? '' : 'hide'"
      >
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <path :d="getArrow" fill="currentColor" />
        </svg>
      </div>

      <div
          class="thumbnails-scroll"
          ref="thumbnailList"
          @scroll="updateArrowVisibility"
          @mousedown="startDrag"
          @touchstart="startDrag"
          @touchmove="onDrag"
          @touchend="stopDrag"
      >
        <div
            v-for="(slide, index) in totalSlides"
            :key="index"
            class="thumbnail"
            :class="{ active: currentSlide === index }"
            @click="selectScreenshot(index)"
        >
          <div class="thumbnail-inner"
               :class="{ 'thumbnails-scroll__item__active': currentSlide === index }">
            <img
                :src="gameScreenshot(index, true)"
                alt="Thumbnail"
                class="thumbnails-scroll__item"
            />
          </div>
        </div>
      </div>

      <div
          class="arrow down"
          @click="scrollThumbnails(1)"
          :class="canScrollDown ? '' : 'hide'"
      >
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <path :d="getArrow" fill="currentColor" />
        </svg>
      </div>
    </div>

    <!-- Hidden elements for thumbnail extraction -->
    <video
        ref="hiddenVideo"
        :src="videoUrl"
        style="display: none;"
        preload="auto"
        muted
        playsinline
    ></video>
    <canvas ref="thumbnailCanvas" style="display: none;"></canvas>
  </div>
</template>

<script>
import portalData from './../../portal.json';
import icons from './../../assets/icons.json';

export default {
  name: 'ImageGallery',
  props: {
    onClick: {
      type: Function,
      required: true
    },
    videoUrl: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      currentSlide: 0,
      isDragging: false,
      dragStartY: 0,
      scrollStartTop: 0,
      videoThumbnail: null,
      canScrollUp: false,
      canScrollDown: true
    };
  },
  computed: {
    lang() {
      return this.language;
    },
    isMobile() {
      return this.screenWidth <= 760;
    },
    screenshotLanguages() {
      return Object.keys(portalData.games[this.$route.params.game].screenshots).filter(lang => {
        const images = portalData.games[this.$route.params.game].screenshots[lang];
        return images && images.length > 0;
      });
    },
    screenshotsCount() {
      const enScreens = portalData.games[this.$route.params.game].screenshots['en'];
      const portraitScreens = portalData.games[this.$route.params.game].screenshots_portrait?.['en'];
      return this.isMobile && portraitScreens?.length ? portraitScreens.length : enScreens.length;
    },
    totalSlides() {
      return this.videoUrl ? this.screenshotsCount + 1 : this.screenshotsCount;
    },
    getArrow() {
      return icons["arrow"];
    }
  },
  mounted() {
    this.extractVideoThumbnail();
    this.updateArrowVisibility();
  },
  methods: {
    extractVideoThumbnail() {
      const video = this.$refs.hiddenVideo;
      const canvas = this.$refs.thumbnailCanvas;

      video.addEventListener('loadeddata', () => {
        video.currentTime = 1;
      });

      video.addEventListener('seeked', () => {
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        this.videoThumbnail = canvas.toDataURL('image/jpeg');
      });
    },
    gameScreenshot(index, minimal) {
      if (index === 0 && this.videoUrl) {
        return this.videoThumbnail || '';
      }

      index = index - (this.videoUrl !== undefined);

      const gameId = this.$route.params.game;
      const lang = this.screenshotLanguages.includes(this.lang) ? this.lang : 'en';
      const usePortrait = this.isMobile &&
          portalData.games[gameId].screenshots_portrait &&
          portalData.games[gameId].screenshots_portrait[lang];

      const path = usePortrait
          ? (minimal
              ? require.context('./../../assets/screenshots_portrait/minimal', false, /\.jpg$/)
              : require.context('./../../assets/screenshots_portrait', false, /\.jpg$/))
          : (minimal
              ? require.context('./../../assets/screenshots/minimal', false, /\.jpg$/)
              : require.context('./../../assets/screenshots', false, /\.jpg$/));

      return path(`./${gameId}_${index}_${lang}.jpg`);
    },
    scrollThumbnails(direction) {
      const container = this.$refs.thumbnailList;
      const scrollAmount = 40;
      container.scrollBy({ top: scrollAmount * direction, behavior: 'smooth' });
    },
    scrollTo(index) {
      const container = this.$refs.thumbnailList;
      const thumbnails = container.querySelectorAll('.thumbnail');
      const target = thumbnails[index];

      if (target) {
        const containerTop = container.getBoundingClientRect().top;
        const targetTop = target.getBoundingClientRect().top;
        const offset = targetTop - containerTop;

        container.scrollBy({
          top: offset - container.clientHeight / 2 + target.clientHeight / 2,
          behavior: 'smooth'
        });
      }
    },
    updateArrowVisibility() {
      const container = this.$refs.thumbnailList;
      this.canScrollUp = container.scrollTop > 0;
      this.canScrollDown = container.scrollTop + container.clientHeight < container.scrollHeight - 1;
    },
    selectScreenshot(index) {
      this.currentSlide = index;
      this.scrollTo(index);
    },
    startDrag(event) {
      this.isDragging = true;
      this.dragStartY = event.type.includes('mouse') ? event.clientY : event.touches[0].clientY;
      this.scrollStartTop = this.$refs.thumbnailList.scrollTop;

      if (event.type === 'mousedown') {
        document.addEventListener('mousemove', this.onDrag);
        document.addEventListener('mouseup', this.stopDrag);
      }
    },
    onDrag(event) {
      if (!this.isDragging) return;
      event.preventDefault();
      const currentY = event.type.includes('mouse') ? event.clientY : event.touches[0].clientY;
      const distance = this.dragStartY - currentY;
      this.$refs.thumbnailList.scrollTop = this.scrollStartTop + distance;
      this.updateArrowVisibility();
    },
    stopDrag() {
      this.isDragging = false;
      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup', this.stopDrag);
    }
  }
};
</script>

<style scoped>
.image-gallery {
  display: flex;
  height: 560px;
  gap: 16px;
}

.image-gallery__image {
  flex: 1;
  width: 73%;
  height: 100%;
  padding-top: 30px;
  padding-bottom: 30px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-gallery__thumbnails {
  width: 27%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.thumbnails-scroll__item__active {
  border: 4px solid var(--primary-brand-color);
}

.thumbnails-scroll__item {
  object-fit: fill;
}

.image-gallery__image > img,
.image-gallery__image__video-wrapper > video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  margin: auto;
  image-rendering: auto;
}

.image-gallery__image,
.image-gallery__image__video-wrapper {
  border-radius: 32px;
  overflow: hidden;
}

.arrow {
  border: none;
  cursor: pointer;
  color: var(--primary-text-color);
  width: 30px;
  height: 30px;
  background-color: var(--primary-brand-color);
  border-radius: 100%;
  transition: opacity 0.2s;
  display: flex;
  margin: 5px;
  justify-content: center;
  align-items: center;
}
.arrow:hover {
  opacity: 0.8;
}
.arrow > svg {
  width: 20px;
  height: 20px;
  display: block;
  margin-top: 10px;
}
.up {
  rotate: 180deg;
}

.thumbnails-scroll {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
  scroll-behavior: smooth;
  scrollbar-width: none;
  width: 100%;
  cursor: grab;
}
.thumbnails-scroll:active {
  cursor: grabbing;
  user-select: none;
}

.thumbnail {
  cursor: pointer;
  width: 100%;
}

.thumbnail-inner {
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
  height: 160px;
}

.thumbnail-inner img {
  width: 100%;
  height: auto;
  display: block;
  opacity: 0.8;
  transition: transform 0.2s, opacity 0.2s;
}

.thumbnail.active img {
  opacity: 1;
  transform: scale(1.05);
}

.hide {
  visibility: hidden;
}
</style>
