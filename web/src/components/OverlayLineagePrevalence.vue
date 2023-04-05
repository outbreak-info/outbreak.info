<template>
  <div>
    <div class="d-flex flex-wrap justify-content-center mt-2">
      <label
        v-for="option in options"
        :key="option.label"
        class="b-contain m-0 mr-3 mb-2 variant-checkbox"
        :data-tippy-info="option.tooltip"
      >
        <small>{{ option.label }}</small>
        <input
          v-model.lazy="selectedMutations"
          type="checkbox"
          :value="option"
          @change="debounceSelectMutation"
        />
        <div class="b-input" />
      </label>
      <font-awesome-icon
        class="fa-lg text-sec pointer"
        :icon="['far', 'plus-square']"
        data-toggle="modal"
        data-target="#change-mutations-modal"
      />
    </div>
    <ReportPrevalenceOverlay
      v-if="prevalences && epi"
      :routeName="routeTo"
      :data="prevalences"
      :seqCounts="seqCounts"
      :epi="epi"
      :xmin="xmin"
      :xmax="xmax"
      :locationID="locationID"
      :locationName="locationName"
      @update="updateDateRange($event)"
    />
  </div>
</template>

<script>
import uniq from 'lodash/uniq';
import debounce from 'lodash/debounce';
import tippy from 'tippy.js';

import {
  getEpiMutationPrevalence,
  getAllTemporalPrevalences,
} from '@/api/genomics.js';
import { lazyLoad } from '@/js/lazy-load';

import 'tippy.js/themes/light.css';

export default {
  name: 'OverlayLineagePrevalence',
  components: {
    ReportPrevalenceOverlay: lazyLoad('ReportPrevalenceOverlay'),
  },
  props: {
    options: Array,
    routeTo: String,
    seqCounts: Array,
    locationID: String,
    locationName: String,
    xmin: String,
    xmax: String,
    selected: [Array, String],
  },
  data() {
    return {
      // filters
      numPreselected: 3,
      selectedMutations: [],
      // data
      prevalences: null,
      epi: null,
    };
  },
  watch: {
    locationID() {
      this.setMutations();
      this.updateData();
    },
    selected() {
      this.setMutations();
      this.updateMutations();
    },
  },
  created() {
    this.debounceSelectMutation = debounce(this.selectMutation, 250);
  },
  mounted() {
    this.setMutations();
    this.updateData();

    tippy('.variant-checkbox', {
      content: 'Loading...',
      maxWidth: '200px',
      placement: 'bottom',
      animation: 'fade',
      theme: 'light',
      onShow(instance) {
        let info = instance.reference.dataset.tippyInfo;
        instance.setContent(info);
      },
    });
  },
  methods: {
    selectMutation() {
      const queryParams = this.$route.query;
      if (this.routeTo === 'GenomicsEmbedLocation')
        this.$router.push({
          name: 'GenomicsEmbed',
          params: {
            disableScroll: true,
          },
          query: {
            type: 'loc',
            loc: this.locationID,
            xmin: queryParams.xmin,
            xmax: queryParams.xmax,
            muts: queryParams.muts,
            alias: queryParams.alias,
            pango: queryParams.pango,
            variant: queryParams.variant,
            selected: this.selectedMutations.map((d) => d.label),
          },
        });
      else {
        this.$router.push({
          name: this.routeTo,
          params: {
            disableScroll: true,
          },
          query: {
            loc: this.locationID,
            xmin: queryParams.xmin,
            xmax: queryParams.xmax,
            muts: queryParams.muts,
            alias: queryParams.alias,
            pango: queryParams.pango,
            variant: queryParams.variant,
            selected: this.selectedMutations.map((d) => d.label),
          },
        });
      }
      // this.updateMutations();
    },
    setMutations() {
      if (this.selected && this.selected.length) {
        this.selectedMutations =
          typeof this.selected == 'string'
            ? this.options.filter((d) => this.selected === d.label)
            : this.options.filter((d) => uniq(this.selected).includes(d.label));
      } else {
        this.selectedMutations = this.options.slice(0, this.numPreselected);
      }
    },
    updateMutations() {
      this.prevalenceSubscription = getAllTemporalPrevalences(
        this.$genomicsurl,
        this.locationID,
        this.selectedMutations,
        this.xmin,
        this.xmax,
      ).subscribe((results) => {
        this.prevalences = results;
      });
    },
    updateData() {
      this.prevalenceSubscription = getEpiMutationPrevalence(
        this.$genomicsurl,
        this.$apiurl,
        this.locationID,
        this.selectedMutations,
        'location_id,date,confirmed,mostRecent,confirmed_numIncrease,confirmed_rolling,dead_numIncrease,dead_rolling',
        this.xmin,
        this.xmax,
      ).subscribe((results) => {
        this.epi = results.epi;
        this.prevalences = results.mutations;
      });
    },
    updateDateRange(event) {
      this.$emit('update', event);
    },
  },
};
</script>
