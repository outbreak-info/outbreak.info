import { defineStore } from 'pinia';

export const geoStore = defineStore('geo', {
  state: () => ({
    allPlaces: [],
    regionDict: [
      {
        display: false,
        displayMore: false,
        region: 'East Asia & Pacific: China',
      },
      {
        display: false,
        displayMore: false,
        region: 'East Asia & Pacific',
      },
      {
        display: false,
        displayMore: false,
        region: 'North America',
      },
      {
        display: false,
        displayMore: false,
        region: 'Sub-Saharan Africa',
      },
      {
        display: false,
        displayMore: false,
        region: 'Europe & Central Asia',
      },

      {
        display: false,
        displayMore: false,
        region: 'Middle East & North Africa',
      },

      {
        display: false,
        displayMore: false,
        region: 'Latin America & Caribbean',
      },
      {
        display: false,
        displayMore: false,
        region: 'South Asia',
      },
      {
        display: false,
        displayMore: false,
        region: 'Cruises',
      },
    ],
  }),
  getters: {},
  actions: {
    setRegionTooltip(payload) {
      const idx = this.regionDict.findIndex(
        (d) => d.region === payload['region'],
      );
      if (idx > -1) {
        this.regionDict[idx]['display'] = payload['display'];
        this.regionDict[idx]['displayMore'] =
          payload['displayMore'] || payload['displayMore'] === false
            ? payload['displayMore']
            : this.regionDict[idx]['displayMore'];
        this.regionDict[idx]['currentCases'] = payload['currentCases']
          ? payload['currentCases'].toLocaleString()
          : null;
        this.regionDict[idx]['x'] = payload['x'] ? payload['x'] : null;
        this.regionDict[idx]['y'] = payload['y'] ? payload['y'] : null;
      } else if (payload['region'] === 'all') {
        // reset everything
        this.regionDict.forEach((d) => {
          d['display'] = false;
          d['displayMore'] = false;
        });
      }
    },
  },
});
