import Vue from "vue";
import Vuex from "vuex";

import admin from "./modules/admin";
import epidata from "./modules/epidata";
import geo from "./modules/geo";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    admin,
    epidata,
    geo
  }
});
