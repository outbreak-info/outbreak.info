import { defineStore } from 'pinia';

export const genomicsStore = defineStore('genomics', {
  state: () => ({
    refSeq: {
      url: 'https://github.com/cov-lineages/pangolin/blob/master/pangolin/data/reference.fasta',
      name: 'Pangolin',
    },
    characteristicThreshold: 0.75,
    // loading indicators
    locationLoading1: false,
    locationLoading2: false,
    locationLoading3: false,
    locationLoading4: false,
    locationLoading5: false,
    locationLoading6: false,
    locationLoading7: false,
  }),
  getters: {},
  actions: {},
});
