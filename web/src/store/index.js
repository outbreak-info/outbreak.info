import Vue from "vue";
import Vuex from "vuex";

import admin from "./modules/admin";
import epidata from "./modules/epidata";
import geo from "./modules/geo";
import colors from "./modules/colors";
import linkedvis from "./modules/linkedvis";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  getters: {},
  modules: {
    admin,
    epidata,
    geo,
    colors,
    linkedvis
  }
});
