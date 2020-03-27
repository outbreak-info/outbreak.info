// initial state
const state = {
  regionDict: [{
      display: false,
      displayMore: false,
      region: "East Asia & Pacific: China"
    },
    {
      display: false,
      displayMore: false,
      region: "East Asia & Pacific"
    },
    {
      display: false,
      displayMore: false,
      region: "North America"
    },
    {
      display: false,
      displayMore: false,
      region: "Sub-Saharan Africa"
    },
    {
      display: false,
      displayMore: false,
      region: "Europe & Central Asia"
    },

    {
      display: false,
      displayMore: false,
      region: "Middle East & North Africa"
    },

    {
      display: false,
      displayMore: false,
      region: "Latin America & Caribbean"
    },
    {
      display: false,
      displayMore: false,
      region: "South Asia"
    },
    {
      display: false,
      displayMore: false,
      region: "Cruises"
    },
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
      state.regionDict[idx]["displayMore"] =
        payload["displayMore"] || payload["displayMore"] === false ?
        payload["displayMore"] :
        state.regionDict[idx]["displayMore"];
      state.regionDict[idx]["currentCases"] = payload["currentCases"] ?
        payload["currentCases"].toLocaleString() :
        null;
      state.regionDict[idx]["x"] = payload["x"];
      state.regionDict[idx]["y"] = payload["y"];
    } else if (payload["region"] === "all") {
      // reset everything
      state.regionDict.forEach(d => {
        d["display"] = false;
        d["displayMore"] = false;
      });
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
