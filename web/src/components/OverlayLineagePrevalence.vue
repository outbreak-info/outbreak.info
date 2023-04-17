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
    />
  </div>
</template>

<script setup>
import { ref, inject, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import uniq from 'lodash/uniq';
import debounce from 'lodash/debounce';
import tippy from 'tippy.js';

import {
  getEpiMutationPrevalence,
  getAllTemporalPrevalences,
} from '@/api/genomics.js';
import { lazyLoad } from '@/js/lazy-load';

import 'tippy.js/themes/light.css';

const ReportPrevalenceOverlay = lazyLoad('ReportPrevalenceOverlay');

const props = defineProps({
  options: Array,
  routeTo: String,
  seqCounts: Array,
  locationID: String,
  locationName: String,
  xmin: String,
  xmax: String,
  selected: [Array, String],
});

// global variable - equivalent with this.$apiurl
const apiUrl = inject('apiUrl');
// global variable - equivalent with this.$genomicsurl
const genomicsUrl = inject('genomicsUrl');

// this.$router
const router = useRouter();
// this.$route
const route = useRoute();

// filters
const numPreselected = ref(3);
const selectedMutations = ref([]);
// data
const prevalences = ref(null);
const epi = ref(null);
// missing variable in previous version
const prevalenceSubscription = ref(null);

const selectMutation = () => {
  const queryParams = route.query;
  if (props.routeTo === 'GenomicsEmbedLocation')
    router.push({
      name: 'GenomicsEmbed',
      state: {
        disableScroll: true,
      },
      query: {
        type: 'loc',
        loc: props.locationID,
        xmin: queryParams.xmin,
        xmax: queryParams.xmax,
        muts: queryParams.muts,
        alias: queryParams.alias,
        pango: queryParams.pango,
        variant: queryParams.variant,
        selected: selectedMutations.value.map((d) => d.label),
      },
    });
  else {
    router.push({
      name: props.routeTo,
      // we can't pass disableScroll in router param. It's not allowed.
      state: {
        disableScroll: true,
      },
      query: {
        loc: props.locationID,
        xmin: queryParams.xmin,
        xmax: queryParams.xmax,
        muts: queryParams.muts,
        alias: queryParams.alias,
        pango: queryParams.pango,
        variant: queryParams.variant,
        selected: selectedMutations.value.map((d) => d.label),
      },
    });
  }
  // this.updateMutations();
};

const setMutations = () => {
  if (props.selected && props.selected.length) {
    selectedMutations.value =
      typeof props.selected == 'string'
        ? props.options.filter((d) => props.selected === d.label)
        : props.options.filter((d) => uniq(props.selected).includes(d.label));
  } else {
    selectedMutations.value = props.options.slice(0, numPreselected.value);
  }
};

const updateMutations = () => {
  prevalenceSubscription.value = getAllTemporalPrevalences(
    genomicsUrl,
    props.locationID,
    selectedMutations.value,
  ).subscribe((results) => {
    prevalences.value = results;
  });
};

const updateData = () => {
  prevalenceSubscription.value = getEpiMutationPrevalence(
    genomicsUrl,
    apiUrl,
    props.locationID,
    selectedMutations.value,
  ).subscribe((results) => {
    epi.value = results.epi;
    prevalences.value = results.mutations;
  });
};

watch(
  () => props.locationID,
  () => {
    setMutations();
    updateData();
  },
);

watch(
  () => props.selected,
  () => {
    setMutations();
    updateMutations();
  },
  { deep: true },
);

const debounceSelectMutation = debounce(selectMutation, 250);

onMounted(() => {
  setMutations();
  updateData();

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
});

onUnmounted(() => {
  if (prevalenceSubscription.value) {
    prevalenceSubscription.value.unsubscribe();
  }
});
</script>
