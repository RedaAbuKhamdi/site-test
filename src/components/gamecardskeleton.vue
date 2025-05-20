<template>
    <AnimatedPlaceholder :id="'card_' + gameName" class="card my-3 mx-1" width="100%" borderRadius="2em"/>
    <AnimatedPlaceholder class="title" width="60%" height="20px" border-radius="2em" />
</template>

<script>
    import AnimatedPlaceholder from "@/components/animatedplaceholder.vue";
    export default {
        name: 'GameCardSkeleton',
        components: {AnimatedPlaceholder},
        props: ["gameName"],
        mounted() {
            var card = document.getElementById("card_" + this.gameName);
            card.style.height = card.clientWidth * (315 / 560) + "px";
        }
    }
</script>

<style scoped>
    .card {
        border: none;
    }

    .title {
        margin-left: 35px;
    }
</style>