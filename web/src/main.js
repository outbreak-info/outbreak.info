import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueGtag from "vue-gtag";
import VueRx from "vue-rx";
import VueCookies from "vue-cookies";
import VueMeta from "vue-meta";

import "leaflet/dist/leaflet.css";
import "tippy.js/dist/tippy.css";

Vue.config.productionTip = false;
// Vue.prototype.$apiurl = "http://kenny.scripps.edu:8000/";
Vue.prototype.$apiurl = "https://api.outbreak.info/covid19/";
Vue.prototype.$resourceurl = "https://api.outbreak.info/resources/";

Vue.use(VueRx);
Vue.use(VueCookies);
Vue.use(VueMeta);https://www.dropbox.com/s/82v6ch025nbucpp/Screenshot%202020-06-23%2014.32.14.png?dl=0

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
