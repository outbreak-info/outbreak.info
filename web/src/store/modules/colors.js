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
  scale: blankFunc
}

// getters --> computed props
const getters = {
  getColor: state => (location) => {
    return state.scale ? state.scale(location) : null;
  },
  getLightColor: state => (location, pct = 0.65) => {
    const color = state.scale(location);
    return state.scale && color ? chroma(color).luminance(pct) : null;
  },
  getDarkColor: state => (location, pct = 1.25) => {
    const color = state.scale(location);
    return state.scale && color ? chroma(color).darken(pct) : null;
  },
  getRegionColor: state => (location) => {
    //this.state.geo.regionDict.map(d => d.region)
    const scale = scaleOrdinal(["#BBB"].concat(schemeTableau10)).domain(["China", "Asia (outside China)", "North America", "South America", "Europe", "Middle East", "Africa", "Diamond Princess Cruise", "Australia/Oceania"]);
    return scale(location);
  },
  getRegionColorPalette: state => (region, numEntries, idx) => {
    console.log(this.state)
    const scale = scaleOrdinal(["#BBB"].concat(schemeTableau10)).domain(this.state.geo.regionDict.map(d => d.region));
    const color = scale(region);

    const colorScale = chroma.scale([chroma(color).luminance(0.5), color, chroma(color).darken(1.25)]).domain([0, numEntries - 1]);
    return (colorScale(idx));
  }
}

// actions --> async props
const actions = {}

// mutations
const mutations = {

}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
