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
    scale: blankFunc,
    regionDict: [
      {
        region: "China",
        countries: ["Mainland China",]
      },
      {
        region: "Asia (outside China)",
        countries: ["Thailand", "Japan", "South Korea", "Taiwan", "Macau", "Hong Kong", "Singapore", "Vietnam",
          "Nepal", "Malaysia", "Cambodia", "Sri Lanka", "Philippines", "India", "Indonesia"
        ]
      },
      {
        region: "North America",
        countries: ["US", "Canada", "Mexico", "Dominican Republic", "Saint Barthelemy"]
      },
      {
        region: "South America",
        countries: ["Brazil", "Ecuador"]
      },
      {
        region: "Europe",
        countries: ["Germany", "Finland", "France", "Croatia", "Austria", "Italy", "UK", "Russia", "Sweden", "Spain", "Belgium", "Switzerland", "Greece", "Georgia", "North Macedonia", "Norway",
          "Romania", "Denmark", "Estonia", "Netherlands", "San Marino", "Belarus", "Iceland", "Lithuania", "Ireland",
          "Luxembourg", "Monaco", "Azerbaijan", "Czech Republic", "Armenia", "Portugal", "Andorra", "Latvia", "Hungary", "Liechtenstein", "Poland", "Gibraltar", "Faroe Islands"
        ]
      },
      {
        region: "Africa",
        countries: ["Algeria", "Nigeria", "Morocco", "Senegal"]
      },
      {
        region: "Diamond Princess Cruise",
        countries: ["Others",]
      },
      {
        region: "Middle East",
        countries: ["Egypt", "Iran", "United Arab Emirates", "Israel", "Lebanon", "Iraq", "Oman", "Afghanistan", "Bahrain", "Kuwait", "Pakistan", "Qatar", "Saudi Arabia"]
      },
      {
        region: "Australia/Oceania",
        countries: ["Australia", "New Zealand"]
      }
    ]
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
    },
    getRegionColor: state => (location: string) => {
      const scale = scaleOrdinal(["#BBB"].concat(schemeTableau10)).domain(state.regionDict.map(d => d.region));
      return scale(location);
    }
  },
  actions: {},
  modules: {}
});
