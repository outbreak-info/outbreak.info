// initial state
const state = {
  regionDict: [
    {
      display: false,
      region: "China",
      countries: ["Mainland China"]
    },
    {
      display: false,
      region: "Asia (outside China)",
      countries: [
        "Thailand",
        "Japan",
        "South Korea",
        "Taiwan",
        "Macau",
        "Hong Kong",
        "Singapore",
        "Vietnam",
        "Nepal",
        "Malaysia",
        "Cambodia",
        "Sri Lanka",
        "Philippines",
        "India",
        "Indonesia",
        "Bhutan",
        "Bangladesh",
        "Maldives"
      ]
    },
    {
      display: false,
      region: "North America",
      countries: [
        "US",
        "Canada",
        "Mexico",
        "Dominican Republic",
        "Saint Barthelemy",
        "Martinique"
      ]
    },
    {
      display: false,
      region: "South America",
      countries: [
        "Brazil",
        "Ecuador",
        "Chile",
        "Argentina",
        "Paraguay",
        "Peru",
        "Costa Rica",
        "French Guiana",
        "Colombia"
      ]
    },
    {
      display: false,
      region: "Europe",
      countries: [
        "Bosnia and Herzegovina",
        "Slovenia",
        "Germany",
        "Finland",
        "France",
        "Croatia",
        "Austria",
        "Italy",
        "UK",
        "Russia",
        "Sweden",
        "Spain",
        "Belgium",
        "Switzerland",
        "Greece",
        "Georgia",
        "North Macedonia",
        "Norway",
        "Romania",
        "Denmark",
        "Estonia",
        "Netherlands",
        "San Marino",
        "Belarus",
        "Iceland",
        "Lithuania",
        "Ireland",
        "Republic of Ireland",
        "Moldova",
        "Bulgaria",
        "Serbia",
        "Vatican City",
        "Slovakia",
        "Malta",
        "Luxembourg",
        "Monaco",
        "Azerbaijan",
        "Czech Republic",
        "Armenia",
        "Portugal",
        "Andorra",
        "Latvia",
        "Hungary",
        "Liechtenstein",
        "Poland",
        "Gibraltar",
        "Faroe Islands",
        "Ukraine"
      ]
    },
    {
      display: false,
      region: "Middle East",
      countries: [
        "Palestine",
        "Egypt",
        "Iran",
        "United Arab Emirates",
        "Israel",
        "Lebanon",
        "Iraq",
        "Oman",
        "Afghanistan",
        "Bahrain",
        "Kuwait",
        "Pakistan",
        "Qatar",
        "Saudi Arabia",
        "Jordan"
      ]
    },
    {
      display: false,
      region: "Africa",
      countries: [
        "Algeria",
        "Nigeria",
        "Morocco",
        "Senegal",
        "Tunisia",
        "South Africa",
        "Cameroon",
        "Togo"
      ]
    },
    {
      display: false,
      region: "Diamond Princess Cruise",
      countries: ["Others"]
    },

    {
      display: false,
      region: "Australia/Oceania",
      countries: ["Australia", "New Zealand"]
    }
  ]
};

// getters
const getters = {};

// actions
const actions = {};

// mutations
const mutations = {
  setRegionTooltip(state, payload) {
    const idx = state.regionDict.findIndex(d => d.region === payload["region"]);
    if (idx > -1) {
      state.regionDict[idx]["display"] = payload["display"];
      state.regionDict[idx]["x"] = payload["x"];
      state.regionDict[idx]["y"] = payload["y"];
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
