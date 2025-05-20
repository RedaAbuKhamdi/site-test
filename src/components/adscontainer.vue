

<script setup>
</script>

<template>
  <section
      class="ads-container d-flex"
      ref="adContainer"
      :class="adVisible ? '' : 'hide-ads-container'"
  >
    <ins
        class="adsbygoogle"
        style="display:block; width: 100%"
        data-ad-client="ca-pub-9277187477340577"
        data-ad-slot="9155878243"
        data-ad-format="auto"
        :data-adbreak-test="isStaging ? 'on' : null"
        data-full-width-responsive="true"
    ></ins>
  </section>
</template>

<script>
export default {
  name: 'AdsContainer',
  props: ["horizontal"],
  data() {
    return {
      isStaging: process.env.NODE_ENV !== 'production',
      adVisible: true
    };
  },
  mounted() {
    const adsContainer = this.$refs.adContainer.querySelector('ins.adsbygoogle');
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.attributeName === 'data-ad-status') {
          const status = adsContainer.getAttribute('data-ad-status');
          if (status === 'filled') {
            this.adVisible = true;
          } else if (status === 'unfilled') {
            this.adVisible = false;
          }
        }
      }
    });
    observer.observe(adsContainer, {
      attributes: true,
      attributeFilter: ['data-ad-status']
    });
    this.$nextTick(() => {
      const adsContainer = this.$refs.adContainer.querySelector('ins.adsbygoogle');

      // Step 1: let it initialize visibly
      setTimeout(() => {
        if (window.adsbygoogle && adsContainer) {
          try {
            (adsbygoogle = window.adsbygoogle || []).push({});
          } catch (e) {
            console.warn('AdSense push error:', e);
            this.adVisible = false;
          }
        }
      }, 100);
    });
  },
  methods: {

  }
};
</script>

<style scoped>
.ads-container {
  padding: 5px;
  width: 100%;
}

.hide-ads-container {
  overflow: hidden;
  position: absolute;
  visibility: hidden;
}
</style>
