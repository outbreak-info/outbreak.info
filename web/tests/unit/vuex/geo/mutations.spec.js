import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import store from '../../../../src/store';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('geo mutations', () => {
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
