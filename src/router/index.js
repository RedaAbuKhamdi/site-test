/**
 * Created by Andrey Popov on 12/11/20.
 */

import {createWebHistory, createRouter} from "vue-router";
import Games from "./games.vue";
import GameInfo from "./gameinfo.vue";
import PlayNow from "./playnow.vue";
import Play from "./play.vue";
import Microsoft from "../landing/microsoft.vue";
import Privacy from "./privacy.vue";
import Terms from "./terms.vue";
import Contacts from "./contacts.vue";

const routes = [
    {
        path: "/",
        redirect: to => {
            return { name: 'Games', params: {category: 'games'}}
        }
    }, {
        path: "/game/:game/:lang?",
        name: "Game Info",
        component: GameInfo
    }, {
        path: "/playnow/:game/:lang?",
        name: "Play Now",
        component: PlayNow
    }, {
        path: "/play/:game/:lang?",
        name: "Play",
        component: Play
    }, {
        path: "/contacts/:lang?",
        name: "Contacts",
        component: Contacts
    }, {
        path: "/privacy/:lang?",
        name: "Privacy",
        component: Privacy
    }, {
        path: "/terms/:lang?",
        name: "Terms",
        component: Terms
    }, {
        path: "/game/:game/:lang/microsoft",
        name: "Microsoft",
        component: Microsoft
    }, {
        path: "/:category/:lang?",
        name: "Games",
        component: Games
    }
];


const router = createRouter({
    history: createWebHistory(process.env.BASE_URL.length === 0 ? '/' : process.env.BASE_URL),
    routes
});

export default router;