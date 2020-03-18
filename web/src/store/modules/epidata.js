import { cleanEpi, nestEpiTrace } from "@/js/importEpi";

import { from } from "rxjs";
import axios from "axios";
import { tap, finalize, catchError } from "rxjs/operators";
import { csv, isoParse, max, sum } from "d3";

// initial state
const state = {
  allPlaces: [],
  mostCases: [],
  caseThreshold: 50,
  barHeight: 15,
  mostRecentDate: null,
  dateUpdated: null,
  ghAPI: "https://api.github.com/repos/",
  casesPath:
    "CSSEGISandData/COVID-19/commits?path=csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv"
};

// getters --> computed props
const getters = {
  getDateUpdated: state => state.dateUpdated
  // getCountryFromRegion: state => regionName => {
  //   return state.countryCases
  //     .filter(d => d.region === regionName)
  //     .map(d => d.locationName)
  //     .join(";");
  // }
};

// actions --> async props
const actions = {
  getDateUpdated(store) {
    const apiUrl = `${store.state.ghAPI}${store.state.casesPath}&page=1&per_page=1`;
    axios.get(apiUrl).then(response => {
      const dateUpdated = isoParse(response.data[0].commit.author.date);
      store.commit("setDateUpdated", dateUpdated);
    });
  }
};

// mutations
const mutations = {
  // Github commit date
  setDateUpdated(state, newDate) {
    state.dateUpdated = newDate;
  },
  setRecentDate(state, newDate) {
    state.mostRecentDate = newDate;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
