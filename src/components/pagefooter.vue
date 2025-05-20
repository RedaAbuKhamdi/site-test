<template>
    <footer class="bg-light footer-bs mt-auto" >
        <div class="container-fluid text-center" style="padding-top:0.6em">
            <a :href="portalData.social_links.facebook" class="mx-1"><img :src="require('./../../assets/stores/facebook.svg')"></a>
            <a :href="portalData.social_links.youtube" class="mx-1"><img :src="require('./../../assets/stores/youtube.svg')"></a>
        </div>
        <div class="container-fluid text-center">
            <a>{{portalData.footer.copyright}}</a>
        </div>
    </footer>
</template>

<script>

import portalData from './../../portal.json';

export default {
    name: 'PageFooter',
    data() {
        return {
            portalData: portalData
        }
    },
    computed: {
        lang() {
            return this.language;
        }
    },
    methods: {}
}
</script>

<style scoped>

</style>