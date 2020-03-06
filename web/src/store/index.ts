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
    cases: [],
    countryCases: [],
    countryBarHeight: 15,
    regionDict: [
      {
        display: false,
        region: "China",
        countries: ["Mainland China",]
      },
      {
        display: false,
        region: "Asia (outside China)",
        countries: ["Thailand", "Japan", "South Korea", "Taiwan", "Macau", "Hong Kong", "Singapore", "Vietnam",
          "Nepal", "Malaysia", "Cambodia", "Sri Lanka", "Philippines", "India", "Indonesia"
        ]
      },
      {
        display: false,
        region: "North America",
        countries: ["US", "Canada", "Mexico", "Dominican Republic", "Saint Barthelemy"]
      },
      {
        display: false,
        region: "South America",
        countries: ["Brazil", "Ecuador", "Chile", "Argentina"]
      },
      {
        display: false,
        region: "Europe",
        countries: ["Germany", "Finland", "France", "Croatia", "Austria", "Italy", "UK", "Russia", "Sweden", "Spain", "Belgium", "Switzerland", "Greece", "Georgia", "North Macedonia", "Norway",
          "Romania", "Denmark", "Estonia", "Netherlands", "San Marino", "Belarus", "Iceland", "Lithuania", "Ireland",
          "Luxembourg", "Monaco", "Azerbaijan", "Czech Republic", "Armenia", "Portugal", "Andorra", "Latvia", "Hungary", "Liechtenstein", "Poland", "Gibraltar", "Faroe Islands", "Ukraine"
        ]
      },
      {
        display: false,
        region: "Middle East",
        countries: ["Egypt", "Iran", "United Arab Emirates", "Israel", "Lebanon", "Iraq", "Oman", "Afghanistan", "Bahrain", "Kuwait", "Pakistan", "Qatar", "Saudi Arabia", "Jordan"]
      },
      {
        display: false,
        region: "Africa",
        countries: ["Algeria", "Nigeria", "Morocco", "Senegal", "Tunisia"]
      },
      {
        display: false,
        region: "Diamond Princess Cruise",
        countries: ["Others",]
      },

      {
        display: false,
        region: "Australia/Oceania",
        countries: ["Australia", "New Zealand"]
      }
    ]
  },
  mutations: {
    setLocations(state, payload) {
      state.epiLocations = payload;
      state.scale = scaleOrdinal(schemeTableau10).domain(state.epiLocations);
    },
    setCases(state, payload) {
      state.cases = payload;
    },
    setCountryCases(state, payload) {
      state.countryCases = payload;
    },
    setRegionTooltip(state: any, payload: Record<string, boolean>) {
      const idx = state.regionDict.findIndex((d: any) => d.region === payload['region']);
      if (idx > -1) {
        state.regionDict[idx]['display'] = payload['display'];
        state.regionDict[idx]['x'] = payload['x'];
        state.regionDict[idx]['y'] = payload['y'];
      }
    }
  },
  getters: {
    getLocations: state => state.epiLocations,
    getBarHeight: state => state.countryBarHeight,
    getCountryCases: state => state.countryCases,
    //   return(state.countryCases.filter(d => d.region === region))
    // },
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
    },
    getRegionColorPalette: state => (region: string, numEntries: number, idx: number) => {
      const scale = scaleOrdinal(["#BBB"].concat(schemeTableau10)).domain(state.regionDict.map(d => d.region));
      const color = scale(region);

      const colorScale = chroma.scale([chroma(color).luminance(0.5), color, chroma(color).darken(1.25)]).domain([0, numEntries - 1]);
      return (colorScale(idx));
    }
  },
  actions: {},
  modules: {}
});
