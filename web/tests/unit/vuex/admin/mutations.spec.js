import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import store from '../../../../src/store';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('admin mutations test', () => {
  it('setLoading: change loading state', () => {
    store.commit('admin/setLoading', true);
    expect(store.state.admin.loading).toEqual(true);
  });

  it('setReportLoading: change reportLoading state', () => {
    store.commit('admin/setReportLoading', true);
    expect(store.state.admin.reportloading).toEqual(true);
  });
});
