import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import store from '../../../../src/store';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('colors getters', () => {
  it('getLightColor', () => {
    const payload = ['US'];
    store.commit('colors/setLocations', payload);
    const result = store.getters['colors/getLightColor']('GBR');
    expect(result).not.toEqual(null);
    expect(typeof result).toEqual('object');
  });

  it('getDarkColor', () => {
    const payload = ['US'];
    store.commit('colors/setLocations', payload);
    const result = store.getters['colors/getDarkColor']('GBR');
    expect(result).not.toEqual(null);
    expect(typeof result).toEqual('object');
  });

  it('getRegionColor', () => {
    const result = store.getters['colors/getRegionColor']('North America');
    expect(result).toEqual('#f28e2c');
  });

  it('getRegionColorFromLocation', () => {
    const result =
      store.getters['colors/getRegionColorFromLocation']('North America');
    expect(result).not.toEqual(null);
    expect(result).toEqual('#f28e2c');
  });

  it('getRegionColorPalette', () => {
    store.commit('colors/setLocations', []);
    const result = store.getters['colors/getRegionColorPalette'](
      'North America',
      2,
      1,
    );
    expect(result).not.toEqual(null);
    expect(typeof result).toEqual('object');
  });
});
