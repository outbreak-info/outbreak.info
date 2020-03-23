import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueGtag from "vue-gtag";
import VueRx from "vue-rx";
import VueCookies from 'vue-cookies'

import "leaflet/dist/leaflet.css";
import "tippy.js/dist/tippy.css";

Vue.config.productionTip = false;
// Vue.prototype.$apiurl = "http://kenny.scripps.edu:8000/";
Vue.prototype.$apiurl = "https://api.outbreak.info/v1/";

Vue.use(VueRx);
Vue.use(VueCookies);

Vue.use(
  VueGtag,
  {
    config: {
      id: "UA-159949707-1"
    }
  },
  router
);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
