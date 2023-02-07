import { scaleOrdinal } from 'd3-scale';
import chroma from 'chroma-js';
import { defineStore } from 'pinia';

import { geoStore } from '@/stores/geoStore';

const blankFunc = function (location) {
  return null;
};

// based off Tableau 10, sync'd without color palette and with a slight increase in saturation for many.
const categoricalPalette = [
  '#507ea3', // blue (Dataset)
  '#f28e2c', // orange (WebSite)
  '#e15759', // coral (Publication)
  '#76b7b2', // teal (Analysis)
  '#59a14f', // green (Protocol)
  '#edc949', // yellow (ImageObject)
  '#b475a3', // purple (ClinicalTrial)
  '#ff98a8', // pink (Book)
  '#9c755f', // brown (SoftwareSourceCode)
  '#bab0ab', // grey
  '#154d7e', // dark blue
  '#ba6000',
  '#aa2230',
  '#418d88',
  '#277223',
  '#b7990e',
  '#834874',
  '#828282',
];

export const colorsStore = defineStore('colors', {
  state: () => ({
    scale: blankFunc,
    locationScale: blankFunc,
    colors: categoricalPalette,
    epiLocations: [],
  }),
  getters: {
    getColor:
      (state) =>
      (location, pct = 0) => {
        if (!state.locationScale) {
          return null;
        }
        return pct
          ? chroma(state.locationScale(location)).luminance(pct)
          : state.locationScale(location);
      },
    getLightColor:
      (state) =>
      (location, pct = 0.65) => {
        const color = state.locationScale(location);
        return state.scale && color ? chroma(color).luminance(pct) : null;
      },
    getDarkColor:
      (state) =>
      (location, pct = 1.25) => {
        const color = state.locationScale(location);
        return state.scale && color ? chroma(color).darken(pct) : null;
      },
    getRegionColor:
      (state, _) =>
      (location, pct = null) => {
        const storeGeo = geoStore();
        const regions = storeGeo.regionDict.map((d) => d.region);
        const scale = scaleOrdinal(['#BBB'].concat(categoricalPalette)).domain(
          regions,
        );

        if (pct) {
          return chroma(scale(location)).luminance(pct);
        }
        return scale(location);
      },
    getRegionColorFromLocation: (state) => (location) => {
      const storeGeo = geoStore();
      const regions = storeGeo.regionDict.map((d) => d.region);
      const scale = scaleOrdinal(['#BBB'].concat(categoricalPalette)).domain(
        regions,
      );
      // const regionFunc = rootGetters["epidata/getRegion"];
      return scale(location);
    },
    getRegionColorPalette: (state, _) => (region, numEntries, idx) => {
      const storeGeo = geoStore();
      const regions = storeGeo.regionDict.map((d) => d.region);
      const scale = scaleOrdinal(['#BBB'].concat(categoricalPalette)).domain(
        regions,
      );
      const color = scale(region);

      const colorScale = chroma
        .scale([
          chroma(color).luminance(0.5),
          color,
          chroma(color).darken(1.25),
        ])
        .domain([0, numEntries - 1]);
      return colorScale(idx);
    },
  },
  actions: {
    setLocations(payload) {
      this.epiLocations = payload;
      this.locationScale = scaleOrdinal(categoricalPalette).domain(
        this.epiLocations,
      );
    },
  },
});
