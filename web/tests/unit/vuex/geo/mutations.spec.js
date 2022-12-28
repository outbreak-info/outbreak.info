import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import store from '../../../../src/store';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('geo mutations', () => {
  const state = {
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
  };

  it('setRegionToolTip', () => {
    const payload = {
      region: 'North America',
      display: true,
      displayMore: true,
      currentCases: null,
      x: 1,
      y: 1,
    };

    store.commit('geo/setRegionTooltip', payload);
    expect(store.state.geo.regionDict[2]).toEqual({
      display: true,
      displayMore: true,
      region: 'North America',
      currentCases: null,
      x: 1,
      y: 1,
    });
  });
});
