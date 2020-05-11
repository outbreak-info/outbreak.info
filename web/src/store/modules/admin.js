// initial state
const state = {
  loading: false,
  sources: [
    {
      id: "JHU",
      name:
        "Johns Hopkins University Center for Systems Science and Engineering",
      scope: "(non-U.S. data)",
      description:
        'Confirmed cases, recovered cases, and deaths over time for countries outside the United States, and provinces in Australia, Canada, and China. See <a target="_blank" rel="noreferrer" href="https://systems.jhu.edu/research/public-health/2019-ncov-map-faqs/">data FAQ</a>.',
      url: "https://github.com/CSSEGISandData/COVID-19"
    },
    {
      id: "NYT",
      name: "The New York Times",
      scope: "(U.S. data)",
      description:
        'Confirmed cases and deaths over time for the United States, U.S. States, U.S. Metropolitan Areas, U.S. cities and U.S. counties. Note that "New York City" refers to the combined totals for New York, Kings, Queens, Bronx and Richmond Counties; "Kansas City" refers to cases within the Missouri portion of the Kansas City Metropolitan area and values for Jackson, Cass, Clay, and Platte counties are the totals excluding the KCMO data; cities like St. Louis that are administered separately from their containing county are reported separately. See other <a target="_blank" rel="noreferrer" href="https://github.com/nytimes/covid-19-data#geographic-exceptions">geographic exceptions</a>.',
      url: "https://github.com/nytimes/covid-19-data"
    },
    {
      id: "testing",
      name: "The COVID Tracking Project",
      scope: "(testing data)",
      description:
        'Testing and hospitalization at the state-level for the United States. See <a target="_blank" rel="noreferrer" href="https://covidtracking.com/about-data">data caveats</a>.',
      url: "https://github.com/nytimes/covid-19-data"
    }
  ],
  geoSources: [
    {
      id: "naturaleath",
      name: "Natural Earth",
      scope: "(country names)",
      description: "Country names and World Bank region locations",
      url: "https://www.naturalearthdata.com/downloads/"
    },
    {
      id: "census",
      name: "United States Census Bureau",
      scope: "(Metropolitan areas)",
      description:
        "Metropolitan areas are defined by the U.S. Census Bureau's Core Based Statistical Areas. Totals for Metro areas are calculated by aggregating the component U.S. counties into the Core Based Statistical Areas.",
      url:
        "https://www.census.gov/geographies/mapping-files/time-series/geo/carto-boundary-file.html"
    }
  ],
  resources: [
    {
      category: "Datasets",
      sources: [
        {
          id: "zenodo",
          name: "Zenodo",
          url: "https://zenodo.org/communities/covid-19/",
          description:
            "This community collects research outputs that may be relevant to the Coronavirus Disease (COVID-19) or the SARS-CoV-2. Scientists are encouraged to upload their outcome in this collection to facilitate sharing and discovery of information. Although Open Access articles and datasets are recommended, also closed and restricted access material are accepted. All types of research outputs can be included in this Community (Publication, Poster, Presentation, Dataset, Image, Video/Audio, Software, Lesson, Other)."
        }
      ]
    },
    {
      category: "Publications",
      sources: [
        {
          id: "litcovid",
          name: "LitCovid",
          url: "https://www.ncbi.nlm.nih.gov/research/coronavirus/",
          description:
            'LitCovid is a curated literature hub for tracking up-to-date scientific information about the 2019 novel Coronavirus. It is the most comprehensive resource on the subject, providing a central access to 4929 (and growing) relevant articles in PubMed. The articles are updated daily and are further categorized by different research topics and geographic locations for improved access. You can read more at <a href="https://www.nature.com/articles/d41586-020-00694-1" target="_blank" rel="noreferrer">Chen et al. Nature (2020)</a> and download their data <a href="https://www.ncbi.nlm.nih.gov/research/coronavirus/#data-download" rel="noreferrer" target="_blank">here</a>.'
        },
        {
          id: "biorxiv",
          name: "bioRixv & medRxiv",
          url: "https://connect.biorxiv.org/relate/content/181",
          description:
            '<p>bioRxiv (pronounced "bio-archive") is a free online archive and distribution service for unpublished preprints in the life sciences. It is operated by Cold Spring Harbor Laboratory, a not-for-profit research and educational institution. By posting preprints on bioRxiv, authors are able to make their findings immediately available to the scientific community and receive feedback on draft manuscripts before they are submitted to journals.</p><p>medRxiv (pronounced "med-archive") is a free online archive and distribution server for complete but unpublished manuscripts (preprints) in the medical, clinical, and related health sciences. Preprints are preliminary reports of work that have not been certified by peer review. They should not be relied on to guide clinical practice or health-related behavior and should not be reported in news media as established information.</p>'
        }
      ]
    },
    {
      category: "Clinical Trials",
      sources: [
        {
          id: "nct",
          name: "ClinicalTrials.gov",
          url: "https://clinicaltrials.gov/ct2/results?cond=COVID-19",
          description:
            "ClinicalTrials.gov is a database of privately and publicly funded clinical studies conducted around the world."
        },
        {
          id: "who",
          name: "WHO International Clinical Trials Registry Platform",
          url: "https://www.who.int/ictrp/en/",
          description:
            "The main aim of the WHO ICTRP is to facilitate the prospective registration of the WHO Trial Registration Data Set on all clinical trials, and the public accessibility of that information. Clinical trials are sourced from the Australian New Zealand Clinical Trials Registry (ANZCTR), Brazilian Clinical Trials Registry (ReBec), Chinese Clinical Trial Register (ChiCTR), Clinical Research Information Service (CRiS), Republic of Korea, Clinical Trials Registry - India (CTRI), Cuban Public Registry of Clinical Trials (RPCEC), EU Clinical Trials Register (EU-CTR), German Clinical Trials Register (DRKS), Iranian Registry of Clinical Trials (IRCT), ISRCTN, Japan Primary Registries Network (JPRN), Netherlands National Trial Register (NTR), Pan African Clinical Trial Registry (PACTR), Peruvian Clinical Trials Registry (REPEC), Sri Lanka Clinical Trials Registry (SLCTR), and Thai Clinical Trials Register (TCTR). Note that clinical trials also listed in ClinicalTrials.gov have been excluded from this source."
        }
      ]
    }
  ],
  updates: [
    {
      date: new Date("2020-04-06 0:0"),
      category: "data",
      title: "Changed United States epidemiology data source",
      description:
        'Switched the data source for U.S. epidemiological data from <a href="https://github.com/CSSEGISandData/COVID-19" target="_blank" rel="noreferrer">Johns Hopkins</a> to the <a href="https://github.com/nytimes/covid-19-data" target="_blank" rel="noreferrer">New York Times</a>.',
      route: {
        name: "Epidemiology",
        query: {
          location: "USA;USA_US-CA;METRO_41940;USA_US-CA_06085",
          variable: "confirmed"
        }
      }
    },
    {
      date: new Date("2020-04-06 0:0"),
      category: "feature",
      title: "Added United States Metropolitan Areas aggregations",
      description:
        "Using the U.S. Census Bureau's Core Based Statistical Areas, calculated case and death totals for metropolitan areas, which are groups of U.S. counties.",
      route: {
        name: "Epidemiology",
        query: {
          location: "METRO_28140;METRO_41180",
          variable: "confirmed"
        }
      }
    },
    {
      date: new Date("2020-03-31 0:0"),
      category: "feature",
      title: "Added daily case and death counts",
      description:
        "Created daily histograms of confirmed cases or deaths pre day by location.",
      route: {
        name: "Epidemiology",
        query: {
          location: "METRO_35620;ITA;ESP;USA",
          variable: "dead"
        }
      }
    },
    {
      date: new Date("2020-03-31 0:0"),
      category: "feature",
      title: "Created iframe-embeddable summary boxes",
      description:
        "Added customizable summary boxes, which can be embedded within iframes. Locations should be specified by `location_id` (usually the ISO3 or FIPS code) and should be separated by semicolons.",
      route: {
        name: "Summary",
        query: {
          location: "USA;USA_US-CA;USA_US-CA_06037;USA_US-CA_06073"
        }
      }
    },
    {
      date: new Date("2020-03-24 0:0"),
      category: "feature",
      title: "Added doubling rates",
      description:
        "Created summary of the doubling rates for a location in the last five days compared to the previous five days.",
      route: {
        name: "Doubling Rates",
        query: {
          location: "USA"
        }
      }
    },
    {
      date: new Date("2020-04-10 0:0"),
      category: "feature",
      title:
        "Normalize epidemiology plots by days since 100 cases, 10 deaths, or 50 deaths",
      description:
        "For epidemiology plots over time, allow the x-axis to shift to a normalized timepoint: when the location had 100 cumulative confirmed cases, 10 cumulative deaths, or 50 cumulative deaths.",
      route: {
        name: "Epidemiology",
        query: {
          location: "METRO_12060;METRO_35380;METRO_26420",
          log: "false",
          variable: "dead",
          xVariable: "daysSince10Deaths"
        }
      }
    },
    {
      date: new Date("2020-04-21 0:0"),
      category: "data",
      title:
        "Add testing and hospitalization data for states in the United States",
      description:
        'Incorporate testing and hospitalzation data from the <a href="https://covidtracking.com/" target="_blank" rel="noreferrer">The COVID Tracking Project</a>.',
      route: {
        name: "Epidemiology",
        query: {
          location: "USA_US-MA;USA_US-NY;USA_US-KS;USA_US-NJ",
          log: "false",
          variable: "testing_positivity",
          xVariable: "date"
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
