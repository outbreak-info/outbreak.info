import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueGtag from "vue-gtag";

Vue.config.productionTip = false;

Vue.use(VueGtag, {
  config: {
    id: "UA-159949707-1"
  }
}, router);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
