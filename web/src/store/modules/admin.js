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
  geoSources: [{
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
  ],
  updates: [
    {
    date: new Date("2020-04-06 0:0"),
    category: "data",
    title: "Changed United States epidemiology data source",
    description: 'Switched the data source for U.S. epidemiological data from <a href="https://github.com/CSSEGISandData/COVID-19" target="_blank" rel="noreferrer">Johns Hopkins</a> to the <a href="https://github.com/nytimes/covid-19-data" target="_blank" rel="noreferrer">New York Times</a>.',
    route: {
      name: 'Epidemiology',
      query: {
        location: 'USA;USA_US-CA;METRO_41940;USA_US-CA_06085',
        variable: 'confirmed'
      }
    }
  },
    {
    date: new Date("2020-04-06 0:0"),
    category: "feature",
    title: "Added United States Metropolitan Areas aggregations",
    description: "Using the U.S. Census Bureau's Core Based Statistical Areas, calculated case and death totals for metropolitan areas, which are groups of U.S. counties.",
    route: {
      name: 'Epidemiology',
      query: {
        location: 'METRO_28140;METRO_41180',
        variable: 'confirmed'
      }
    }
  },
    {
    date: new Date("2020-03-31 0:0"),
    category: "feature",
    title: "Added daily case and death counts",
    description: "Created daily histograms of confirmed cases or deaths pre day by location.",
    route: {
      name: 'Epidemiology',
      query: {
        location: 'METRO_35620;ITA;ESP;USA',
        variable: 'dead'
      }
    }},
    {
    date: new Date("2020-03-31 0:0"),
    category: "feature",
    title: "Created iframe-embeddable summary boxes",
    description: "Added customizable summary boxes, which can be embedded within iframes. Locations should be specified by `location_id` (usually the ISO3 or FIPS code) and should be separated by semicolons.",
    route: {
      name: 'Summary',
      query: {
        location: 'USA;USA_US-CA;USA_US-CA_06037;USA_US-CA_06073'
      }
    }},
    {
    date: new Date("2020-03-24 0:0"),
    category: "feature",
    title: "Added doubling rates",
    description: "Created summary of the doubling rates for a location in the last five days compared to the previous five days.",
    route: {
      name: 'Doubling Rates',
      query: {
        location: 'USA'
      }
    }
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
