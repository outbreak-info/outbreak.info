// initial state
const state = {
  loading: false,
  sources: [{
      id: "JHU",
      name: "Johns Hopkins University Center for Systems Science and Engineering",
      scope: "(non-U.S. data)",
      description: "Confirmed cases, recovered cases, and deaths over time for countries outside the United States, and provinces in Australia, Canada, and China",
      url: "https://github.com/CSSEGISandData/COVID-19"
    },
    {
      id: "NYT",
      name: "The New York Times",
      scope: "(U.S. data)",
      description: 'Confirmed cases and deaths over time for the United States, U.S. States, U.S. Metropolitan Areas, U.S. cities and U.S. counties. Note that "New York City" refers to the combined totals for New York, Kings, Queens, Bronx and Richmond Counties; "Kansas City" refers to cases within the Missouri portion of the Kansas City Metropolitan area and values for Jackson, Cass, Clay, and Platte counties are the totals excluding the KCMO data; cities like St. Louis that are administered separately from their containing county are reported separately. See other <a target="_blank" rel="noreferrer" href="https://github.com/nytimes/covid-19-data#geographic-exceptions">geographic exceptions</a>.',
      url: "https://github.com/nytimes/covid-19-data"
    }
  ],
  geoSources: [
    {
      id: "naturaleath",
      name: "Natural Earth",
      scope: "(country names)",
      description: 'Country names and World Bank region locations',
      url: "https://www.naturalearthdata.com/downloads/"
    },
    {
      id: "census",
      name: "United States Census Bureau",
      scope: "(Metropolitan areas)",
      description: "Metropolitan areas are defined by the U.S. Census Bureau's Core Based Statistical Areas. Totals for Metro areas are calculated by aggregating the component U.S. counties into the Core Based Statistical Areas.",
      url: "https://www.census.gov/geographies/mapping-files/time-series/geo/carto-boundary-file.html"
    }
  ]
};

// getters
const getters = {};

// actions
const actions = {};

// mutations
const mutations = {
  setLoading(state, isLoading) {
    state.loading = isLoading;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
