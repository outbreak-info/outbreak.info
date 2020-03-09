import {
  cleanEpi,
  nestEpiTrace
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
  max,
  sum
} from 'd3';

// initial state
const state = {
  // case count variables
  casesUrl: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv",
  cases: [],
  allCases: [],
  countryCases: [],
  currentTotalCases: null,
  numCountries: null,
  allPlaces: [],
  mostCases: [],
  firstCases: [],
  caseThreshold: 50,
  barHeight: 15,
  countriesAboveThreshold: [],
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
  getDateUpdated: state => state.dateUpdated,
  getCountryFromRegion: state => regionName => {
    return (state.countryCases.filter(d => d.region === regionName)).map(d => d.locationName).join(";");
  }
}

// actions --> async props
const actions = {
  loadCases(store) {
    console.log("GETTING DATA FROM GITHUB")
    this.state.admin.loading = true;

    from(csv(store.state.casesUrl)).pipe(
        tap(data => {
          const cleanedCases = cleanEpi(data);
          const lastDate = max(cleanedCases, d => d.currentDate);

          // calculate summaries
          // For regional summaries, remove China, Princess Cruise (since duplicative with "Mainland China")
          const regionTotals = nestEpiTrace(cleanedCases.flatMap(d => d.data), "region", "region").filter(d => !["Diamond Princess Cruise", "China"].includes(d.locationName));
          const countryTotals = nestEpiTrace(cleanedCases.flatMap(d => d.data), "country", "country");
          const subnationals = cleanedCases.filter(d => d.locationType === "sub-national");
          const cleaned = [regionTotals, countryTotals, subnationals].reduce((flat, next) => flat.concat(next), []);

          store.commit("setCases", {
            cases: cleanedCases,
            all: cleaned
          });
          store.commit("setRecentDate", lastDate);
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
  setCases(state, payload) {
    state.cases = payload.cases;
    state.allCases = payload.all;

    const countryCases = payload.all.filter(d => d.locationType === "country");

    state.currentTotalCases = sum(payload.cases, d => d.currentCases);
    state.countryCases = countryCases;
    state.numCountries = countryCases.length;
    state.mostCases = countryCases.sort((a, b) => b.currentCases - a.currentCases).slice(0, 5);
    state.firstCases = countryCases.filter(d => d.newToday);
    state.countriesAboveThreshold = countryCases.filter(d => d.numIncrease > state.caseThreshold);

    state.allPlaces = [...new Set(payload.all.map(d => d.locationName))];
  },
  // Github commit date
  setDateUpdated(state, newDate) {
    state.dateUpdated = newDate;
  },
  setRecentDate(state, newDate) {
    state.mostRecentDate = newDate;
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
