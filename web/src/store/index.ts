import Vue from "vue";
import Vuex from "vuex";
import { schemeTableau10 } from 'd3-scale-chromatic';
import { scaleOrdinal } from 'd3';
import * as chroma from 'chroma-js';

Vue.use(Vuex);

const blankFunc = function(location: string) {
  return (null)
}

export default new Vuex.Store({
  state: {
    epiLocations: [],
    scale: blankFunc
  },
  mutations: {
    setLocations(state, payload) {
      state.epiLocations = payload;
      state.scale = scaleOrdinal(schemeTableau10).domain(state.epiLocations);
    }
  },
  getters: {
    getLocations: state => state.epiLocations,
    // Pretty sure I'm meant to have used a mixin/plugin, but this works so sticking with it for now...
    getColor: state => (location: string) => {
      return state.scale ? state.scale(location) : null;
    },
    getLightColor: state => (location: string, pct = 0.65) => {
      const color = state.scale(location);
      return state.scale && color ? chroma(color).luminance(pct) : null;
    },
    getDarkColor: state => (location: string, pct = 1.25) => {
      const color = state.scale(location);
      return state.scale && color ? chroma(color).darken(pct) : null;
    }
  },
  actions: {},
  modules: {}
});
