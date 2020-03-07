import {
  cleanEpi,
  nestRegions
} from "@/js/importEpi";

import {
  from
} from "rxjs";
import axios from 'axios';
import {
  tap,
  finalize,
  catchError
} from "rxjs/operators";
import {
  csv,
  isoParse,
  max, sum
} from 'd3';

// initial state
const state = {
  // case count variables
  casesUrl: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv",
  cases: [],
  currentTotalCases: null,
  allPlaces: [],
  mostCases: [],
  firstCases: [],
  // date updated
  mostRecentDate: null,
  dateUpdated: null,
  ghAPI: "https://api.github.com/repos/",
  casesPath: "CSSEGISandData/COVID-19/commits?path=csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv",
  // casesByRegion: []
}

// getters --> computed props
const getters = {
  getCases: state => state.cases,
  getDateUpdated: state => state.dateUpdated
}

// actions --> async props
const actions = {
  loadCases(store) {
    this.state.admin.loading = true;

    from(csv(store.state.casesUrl)).pipe(
        tap(data => {
          const cleaned = cleanEpi(data);
          const lastDate = max(cleaned, d => d.currentDate);
          store.commit("setCases", cleaned);
          store.commit("setRecentDate", lastDate);
          // const nestedRegions = nestRegions(cleaned.flatMap(d => d.data));
          // store.commit("setRegionCases", nestedRegions)
        }),
        catchError(e => {
          console.log("%c Error in getting case counts!", "color: red")
          console.log(e)
          return (from([]))
        }),
        finalize(() => this.state.admin.loading = false)
      )
      .subscribe(_ => null) // necessary to execute the Observable...
  },
  getDateUpdated(store) {
    const apiUrl = `${store.state.ghAPI}${store.state.casesPath}&page=1&per_page=1`;
    axios.get(apiUrl).then((response) => {
      const dateUpdated = isoParse(response.data[0].commit.author.date);
      store.commit("setDateUpdated", dateUpdated)
    })
  }
}

// mutations
const mutations = {
  setCases(state, data) {
    state.cases = data;
    console.log(data)

    state.currentTotalCases = sum(data, d => d.currentCases);
    state.mostCases = data.sort((a,b) => b.currentCases - a.currentCases).slice(0,5);
    state.allPlaces = [...new Set(data.map(d => d.placeName))];;
  },
  setDateUpdated(state, newDate) {
    state.dateUpdated = newDate;
  },
  setRecentDate(state, newDate) {
    state.mostRecentDate = newDate;
  },
  // setRegionCases(state, data) {
  //   state.casesByRegion = data
  // }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
