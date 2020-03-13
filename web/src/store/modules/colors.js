import { scaleOrdinal } from "d3";
import * as chroma from "chroma-js";

const blankFunc = function(location) {
  return null;
};

// initial state
const state = {
  scale: blankFunc,
  locationScale: blankFunc,
  epiLocations: []
};

// based off Tableau 10, sync'd with out color palette and with a slight increase in saturation for many.
const categoricalPalette = ["#507ea3",
"#f28e2c",
"#e15759",
"#76b7b2",
"#59a14f",
"#edc949",
"#b475a3",
"#ff98a8",
"#9c755f",
"#bab0ab",
"#154d7e",
"#ba6000",
"#aa2230",
"#418d88",
"#277223",
"#b7990e",
"#834874",
"#828282"];

// getters --> computed props
const getters = {
  getColor: state => (location, pct = 0) => {
    if (!state.locationScale) {
      return null;
    }
    return pct
      ? chroma(state.locationScale(location)).luminance(pct)
      : state.locationScale(location);
  },
  getLightColor: state => (location, pct = 0.65) => {
    const color = state.locationScale(location);
    return state.scale && color ? chroma(color).luminance(pct) : null;
  },
  getDarkColor: state => (location, pct = 1.25) => {
    const color = state.locationScale(location);
    return state.scale && color ? chroma(color).darken(pct) : null;
  },
  getRegionColor: (state, _, rootState) => (location, pct = null) => {
    const regions = rootState["geo"]["regionDict"].map(d => d.region);
    const scale = scaleOrdinal(["#BBB"].concat(categoricalPalette)).domain(
      regions
    );

    if (pct) {
      return chroma(scale(location)).luminance(pct);
    }
    return scale(location);
  },
  getRegionColorFromLocation: (
    state,
    getters,
    rootState,
    rootGetters
  ) => location => {
    const regions = rootState["geo"]["regionDict"].map(d => d.region);
    const scale = scaleOrdinal(["#BBB"].concat(categoricalPalette)).domain(
      regions
    );
    const regionFunc = rootGetters["epidata/getRegion"];
    const region = regionFunc(location);
    return scale(region);
  },
  getRegionColorPalette: (state, _, rootState) => (region, numEntries, idx) => {
    const regions = rootState["geo"]["regionDict"].map(d => d.region);
    const scale = scaleOrdinal(["#BBB"].concat(categoricalPalette)).domain(
      regions
    );
    const color = scale(region);

    const colorScale = chroma
      .scale([chroma(color).luminance(0.5), color, chroma(color).darken(1.25)])
      .domain([0, numEntries - 1]);
    return colorScale(idx);
  }
};

// actions --> async props
const actions = {};

// mutations
const mutations = {
  setLocations(state, payload) {
    state.epiLocations = payload;
    state.locationScale = scaleOrdinal(categoricalPalette).domain(
      state.epiLocations
    );
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
