<template>
  <!-- MINIMUM THRESHOLD SLIDER -->
  <svg
    ref="count_filter"
    id="count-filter"
    :width="width"
    :height="height"
    class="report-choropleth-legend my-2"
  >
    <g transform="translate(10,8)" id="threshold-slider">
      <text
        x="0"
        y="0"
        dominant-baseline="central"
        :fill="strokeColor"
        font-size="14px"
      >
        minimum number of total samples
      </text>
      <g transform="translate(0,18)">
        <line
          x1="0"
          :x2="filterWidth"
          y1="0"
          y2="0"
          stroke="#CCCCCC"
          stroke-linecap="round"
          stroke-width="8"
        />
        <line
          ref="selected_threshold"
          :x1="filterShift"
          :x2="filterWidth"
          y1="0"
          y2="0"
          :stroke="accentColor"
          stroke-linecap="round"
          stroke-width="8"
        />
        <circle
          ref="threshold_slider"
          :transform="`translate(${filterShift}, 0)`"
          cx="0"
          cy="0"
          r="8"
          :fill="accentColor"
          class="pointer"
        />
        <text
          ref="threshold_label"
          :transform="`translate(${filterShift}, 0)`"
          x="0"
          y="0"
          dy="12"
          font-size="14px"
          font-weight="700"
          :fill="accentColor"
          text-anchor="middle"
          dominant-baseline="hanging"
        >
          {{ newThreshold }}
        </text>
        <text
          :x="filterWidth"
          y="0"
          dy="12"
          font-size="12px"
          :fill="greyColor"
          text-anchor="end"
          dominant-baseline="hanging"
        >
          {{ maxCountFormatted }}
        </text>
      </g>
    </g>
  </svg>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue';
import { drag } from 'd3-drag';
import { format } from 'd3-format';
import { select, event } from 'd3-selection';
import { scaleLog } from 'd3-scale';

const props = defineProps({
  width: {
    type: Number,
    default: 235,
  },
  filterWidth: {
    type: Number,
    default: 200,
  },
  height: {
    type: Number,
    default: 50,
  },
  accentColor: {
    type: String,
    default: '#df4ab7',
  },
  greyColor: {
    type: String,
    default: '#A5A5A5',
  },
  strokeColor: {
    type: String,
    default: '#2c3e50',
  },
  countThreshold: Number,
  maxCount: Number,
});

const emit = defineEmits(['update:countThreshold']);

const xFilter = ref(null);
const newThreshold = ref(null);
const threshold_slider = ref(null);
const threshold_label = ref(null);

const filterShift = computed(() => {
  return xFilter.value ? xFilter.value(newThreshold.value) : 0;
});

const maxCountFormatted = computed(() => {
  return props.maxCount ? format(',')(props.maxCount) : null;
});

const updateAxes = () => {
  xFilter.value = scaleLog()
    .range([0, props.filterWidth])
    .domain([1, props.maxCount])
    .clamp(true);
};

const updateDrag = () => {
  newThreshold.value = Math.round(xFilter.value.invert(event.x));
  select(threshold_label.value).text(format(',')(newThreshold.value));
};

const changeFilters = () => {
  emit('update:countThreshold', newThreshold.value);
};

const setupDrag = () => {
  // draggable filters
  select(threshold_slider.value).call(
    drag()
      .on('drag', () => updateDrag())
      .on('end', () => changeFilters()),
  );
};

onMounted(() => {
  newThreshold.value = props.countThreshold;
  updateAxes();

  // this.$nextTick in optionsAPI
  nextTick(() => {
    // set up drag for threshold filter
    setupDrag();
  });
});
</script>
