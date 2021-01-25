import Vue from "vue";
import Vuex from "vuex";

import admin from "./modules/admin";
import genomics from "./modules/genomics";
import geo from "./modules/geo";
import colors from "./modules/colors";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  getters: {},
  modules: {
    admin,
    geo,
    genomics,
    colors
  }
});
