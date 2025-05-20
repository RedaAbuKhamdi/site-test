<template>
    <NavBar/>
    <div v-html="privacyContent" class="privacy pt-5 container-fluid"/>
    <PageFooter/>
</template>

<script>
    import NavBar from "../components/navbar";
    import PageFooter from "../components/pagefooter";
    import portalData from './../../portal.json';

    export default {
        name: "Privacy",
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
                return portalData.footer_links.privacy.replaceAll('terms.html', '/terms' + (this.$route.params.lang ? ("/" + this.$route.params.lang) : ""));
            }
        }
    }
</script>

<style scoped>
.privacy {
    margin-top: 40px;
}
</style>
