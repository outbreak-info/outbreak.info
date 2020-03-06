import Vue from "vue";
import Vuex from "vuex";

import admin from "./modules/admin";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    admin
  }
});
