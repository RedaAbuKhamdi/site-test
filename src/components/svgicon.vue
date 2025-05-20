<template>
  <svg preserveAspectRatio="xMidYMid meet" :viewBox="viewBox" class="tag-image">
    <path :d="image" fill="currentColor"></path>
  </svg>
</template>

<script>

export default {
  name: 'SvgIcon',
  props: ['image', 'name'],
  data() {
    return {}
  },
  computed: {
    viewBox(){
      if (this.name === "games") {
        return "0 0 20 20";
      } else {
        return  "0 0 32 32";
      }
    }
  },
  methods: {}
}
</script>

<style scoped>
.tag-image {
  width: 100%;
  height: 100%;
  display: block; /* Removes any extra inline spacing */
}
</style>