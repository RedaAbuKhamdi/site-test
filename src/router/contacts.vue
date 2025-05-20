<template>
    <NavBar/>
    <div class="contacts mb-5 text-center">
        <div class="my-3 display-5 fw-bold">{{localizedData.contacts_title}}</div>
        <p class="fs-4 mb-2">{{localizedData.contacts_address}}</p>
        <div class="gmap_canvas mb-2">
            <iframe class="container-fluid" width="600" height="500" id="gmap_canvas"
                    src="https://maps.google.com/maps?q=Clever%20Apps%20Pte.%20Ltd.&t=&z=17&ie=UTF8&iwloc=&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0">
            </iframe>
        </div>
        <div class="my-2 display-5 fw-bold">{{localizedData.inquiries_title}}</div>
        <div class="fs-4 ms-3">{{localizedData.inquiries_text}} <a :href="'mailto:'+portalData.inquiries_address">{{portalData.inquiries_address}}</a>
        </div>
    </div>

    <PageFooter/>
</template>

<script>
    import NavBar from "../components/navbar";
    import PageFooter from "../components/pagefooter";
    import portalData from './../../portal.json';

    export default {
        name: "Contacts",
        data() {
            return {
                portalData: portalData
            }
        },
        created() {
            window.scrollTo({ top: 0});
        },
        components: {PageFooter, NavBar},
        computed: {
            localizedData() {
                var result = {};
                ['contacts_title', 'contacts_address', 'inquiries_title', 'inquiries_text'].forEach(propName => {
                    result[propName] = this.portalData[propName][this.lang];
                });
                return result;
            },
            lang() {
                return this.language;
            }
        }
    }
</script>

<style scoped>
.contacts {
    margin-top: 100px;
}

</style>
