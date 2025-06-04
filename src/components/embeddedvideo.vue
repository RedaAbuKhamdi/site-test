<template>
    <div class="video-container">
      <video autoplay muted loop playsinline class="game-video">
        <source :src="getVideoUrl" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </div>
</template>

<script>
import {computed} from 'vue';

export default {
  name: 'EmbeddedVideo',
  props: ["gameName"],
  computed: {
    getVideoUrl() {
      const videos = require.context('./../../assets/previews', false, /\.mp4$/);
      try {
        return videos('./' + this.gameName + '.mp4');
      } catch (e) {
        return undefined;
      }
    }
  }
}
</script>

<style scoped>
.game-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.video-container {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 1;
  overflow: hidden;
  border-radius: 1em;
}
</style>