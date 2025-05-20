<template>
    <router-view></router-view>
</template>

<script>

export default {
  name: 'App'
};
</script>

<style>

:root {
    --sat: env(safe-area-inset-top);
    --sar: env(safe-area-inset-right);
    --sab: env(safe-area-inset-bottom);
    --sal: env(safe-area-inset-left);
}
body {
    --bs-body-color: #495057;
}
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100svh;
}

@import '../assets/styles/variablesdark.css';

</style>
