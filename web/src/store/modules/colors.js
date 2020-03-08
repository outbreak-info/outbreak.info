import {
  schemeTableau10
} from 'd3-scale-chromatic';
import {
  scaleOrdinal
} from 'd3';
import * as chroma from 'chroma-js';

const blankFunc = function(location) {
  return (null)
}

// initial state
const state = {
  scale: blankFunc,
  locationScale: blankFunc,
  epiLocations: []
}

// getters --> computed props
const getters = {
  getColor: state => (location) => {
    return state.locationScale ? state.locationScale(location) : null;
  },
  getLightColor: state => (location, pct = 0.65) => {
    const color = state.locationScale(location);
    return state.scale && color ? chroma(color).luminance(pct) : null;
  },
  getDarkColor: state => (location, pct = 1.25) => {
    const color = state.locationScale(location);
    return state.scale && color ? chroma(color).darken(pct) : null;
  },
  getRegionColor: state => (location, pct = null) => {
    //this.state.geo.regionDict.map(d => d.region)
    const scale = scaleOrdinal(["#BBB"].concat(schemeTableau10)).domain(["China", "Asia (outside China)", "North America", "South America", "Europe", "Middle East", "Africa", "Diamond Princess Cruise", "Australia/Oceania"]);

    if(pct) {
      return(chroma(scale(location)).luminance(pct))
    }
    return scale(location);
  },
  getRegionColorPalette: state => (region, numEntries, idx) => {
    // console.log(state.geo.regionDict.map(d => d.region))
    const scale = scaleOrdinal(["#BBB"].concat(schemeTableau10)).domain(["China", "Asia (outside China)", "North America", "South America", "Europe", "Middle East", "Africa", "Diamond Princess Cruise", "Australia/Oceania"]);
    // const scale = scaleOrdinal(["#BBB"].concat(schemeTableau10)).domain(state.geo.regionDict.map(d => d.region));
    const color = scale(region);

    const colorScale = chroma.scale([chroma(color).luminance(0.5), color, chroma(color).darken(1.25)]).domain([0, numEntries - 1]);
    return (colorScale(idx));
  }
}

// actions --> async props
const actions = {}

// mutations
const mutations = {
  setLocations(state, payload) {
    state.epiLocations = payload;
    state.locationScale = scaleOrdinal(schemeTableau10).domain(state.epiLocations);
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
