/**
 * Created by Andrey Popov on 12/9/20.
 */

import { createApp } from "vue";
import { createHead } from "@vueuse/head";
import PerfectScrollbar from "vue3-perfect-scrollbar";
import App from "./app.vue";
import router from "./router";
import "vue3-perfect-scrollbar/dist/vue3-perfect-scrollbar.css";
// eslint-disable-next-line
import GoogleAnalytics from "@/src/googleanalytics";
// eslint-disable-next-line
import InitServiceWorker from "@/src/initserviceworker";
// eslint-disable-next-line
import ConsentTcfApi from "@/src/consenttcfapi";
// eslint-disable-next-line
import GoogleAds from "@/src/googleads";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

const app = createApp(App);
const head = createHead();
app.use(head);
app.config.globalProperties.language = "en";
app.use(PerfectScrollbar);

app.use(router);

app.mount("#app");

GoogleAnalytics.init();
InitServiceWorker.init();
ConsentTcfApi.init();
GoogleAds.init();
