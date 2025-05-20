<template>
    <NavBar/>
    <div v-html="privacyContent" class="terms pt-5 container-fluid"/>
    <PageFooter/>
</template>

<script>
    import NavBar from "../components/navbar";
    import PageFooter from "../components/pagefooter";
    import portalData from './../../portal.json';

    export default {
    name: "Terms",
    data() {
        return {
            portalData: portalData
        }
    },
    components: {PageFooter, NavBar},
    created() {
        window.scrollTo({ top: 0});
    },
    computed: {
        privacyContent() {
            return portalData.footer_links.terms
                .replaceAll('privacy.html', '/privacy' + (this.$route.params.lang ? ("/" + this.$route.params.lang) : ""))
                .replaceAll('class="h3"','')
                .replaceAll('class="h4"','');
        }
    }
}
</script>

<style scoped>
.terms {
    margin-top: 40px;
}

.h3,
.h4,
.h5 {
    font-size: 1rem!important;
}
</style>
