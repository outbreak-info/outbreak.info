import {
  cleanEpi, nestRegions
} from "@/js/importEpi";

import {
  from,

} from "rxjs";
import {
  tap,
  finalize,
  catchError,
  map
} from "rxjs/operators";
import {
  csv
} from 'd3';

// initial state
const state = {
  casesUrl: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv",
  cases: [],
  // casesByRegion: []
}

// getters --> computed props
const getters = {
  getCases: state => state.cases,
}

// actions --> async props
const actions = {
  loadCases(store, rootState) {
    this.state.admin.loading = true;

    from(csv(store.state.casesUrl)).pipe(
        tap(data => {
          const cleaned = cleanEpi(data);
          const nestedRegions = nestRegions(cleaned.flatMap(d => d.data));
          store.commit("setCases", cleaned)
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
  }
}

// mutations
const mutations = {
  setCases(state, data) {
    state.cases = data
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
