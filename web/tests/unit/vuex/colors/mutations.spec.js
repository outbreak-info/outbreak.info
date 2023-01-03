import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import store from '../../../../src/store';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('colors mutations', () => {
  it('should change state with payload', () => {
    const payload = ['US'];
    store.commit('colors/setLocations', payload);
    expect(store.state.colors.epiLocations).toEqual(payload);
    expect(store.state.colors.locationScale).not.toEqual(null);
  });
});
