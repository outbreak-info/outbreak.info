<template>
  <div>
    <div :style="{ width: width + 'px' }">
      <div class="text-left line-height-1 mb-1">
        {{ variableLabel }}
      </div>
      <small
        v-if="isFiltered"
        class="d-block text-left text-muted line-height-1 mb-1"
      >
        <span v-html="filterString" />
      </small>
    </div>
    <svg
      ref="legend_svg"
      class="epi-map-svg epi-map-legend"
      :subtitle="filterString"
      :width="width"
      :height="height + margin.top + margin.bottom * 2 + 15"
    >
      <g
        ref="legend_bars"
        class="legend-bars"
        :transform="`translate(${margin.left},${margin.top})`"
      />
      <g
        ref="axis_x"
        class="axis axis--x"
        :transform="`translate(${margin.left},${height + margin.top})`"
      />
      <g
        class="legend"
        :transform="`translate(${margin.left},${
          height + margin.bottom + margin.top
        })`"
      >
        <!-- <g class="legend" :transform="`translate(${margin.left},${height + margin.bottom + margin.top})`" v-if="legendColors.length && legendColors[0].x0"> -->
        <template v-for="(item, idx) in legendColors">
          <rect
            v-if="item.width"
            :id="`legendrect${idx}`"
            :key="idx"
            x="0"
            y="0"
            :width="item.width"
            height="10"
            :fill="item.fill"
            :transform="`translate(${item.x0}, 0)`"
          />
        </template>
        <g v-if="isFiltered && x">
          <rect
            ref="rect_mask_right"
            :x="x(selectedMax)"
            y="0"
            :width="width - margin.left - margin.right"
            height="10"
            fill="white"
            fill-opacity="0.8"
          />
          <rect
            ref="rect_mask_left"
            x="0"
            y="0"
            :width="x(selectedMin)"
            height="10"
            fill="white"
            fill-opacity="0.8"
          />
        </g>
        <rect
          x="0"
          y="0"
          :width="width - margin.left - margin.right"
          height="10"
          stroke="black"
          fill="none"
          :stroke-width="0.5"
        />
      </g>
      <g
        v-if="x"
        class="slider-handle pointer"
        :transform="`translate(${margin.left},${
          height + margin.bottom + margin.top + 17
        })`"
      >
        <g stroke="#686868" fill="#d6d6d6" stroke-width="0.5">
          <line
            ref="slider_line"
            :x1="sliderLeft"
            :x2="sliderRight"
            :y1="4.1"
            :y2="4.1"
            stroke="#d6d6d6"
            stroke-width="4.5"
          />
          <polygon
            id="slider_left"
            ref="slider_left"
            :transform="`translate(${sliderLeft},0)`"
            points="4.1,10.3 0.1,10.3 0.1,-1.8 1.1,-1.8 4.1,-1.8 8.1,4.1 "
          />
          <polygon
            ref="slider_right"
            :transform="`translate(${sliderRight - 8},0)`"
            points="0.1,4.1 4.1,-1.8 7.1,-1.8 8.1,-1.8 8.1,10.3 4.1,10.3 "
          />
        </g>
        <g
          transform="translate(0,13)"
          dominant-baseline="hanging"
          font-size="8"
          style="font-family: 'DM Sans', Avenir, Helvetica, Arial, sans-serif"
          text-anchor="start"
        >
          <text :x="x(selectedMin)" :y="0">{{ formatLimit(selectedMin) }}</text>
          <text :x="x(selectedMax)" :y="0" text-anchor="end">
            {{ formatLimit(selectedMax) }}
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { max, extent, histogram } from 'd3-array';
import { axisBottom } from 'd3-axis';
import { drag } from 'd3-drag';
import { format } from 'd3-format';
import { select, selectAll, event } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import debounce from 'lodash/debounce';

const props = defineProps({
  data: Array,
  variable: String,
  variableLabel: String,
  minVal: Number,
  maxVal: Number,
  colorScale: Function,
  width: Number,
  transition1: Number,
  animate: Boolean,
});

// instead of this.$route
const route = useRoute();
// instead of this.$router
const router = useRouter();

const height = ref(100);
const margin = ref({
  top: 5,
  bottom: 25,
  left: 5,
  right: 15,
});
const selectedMin = ref(null);
const selectedMax = ref(null);
// axes
const x = ref(null);
const y = ref(null);
const xAxis = ref(null);
const legendColors = ref([]);
// binned data
const bins = ref(null);
const numBins = ref(50);
// refs
const chart = ref(null);
const xAxisRef = ref(null);
// variables to replace this.$refs
const legend_bars = ref(null);
const x_axis = ref(null);
const slider_left = ref(null);
const slider_right = ref(null);

const sliderRight = computed(() => {
  return x.value && (selectedMax.value || selectedMax.value === 0)
    ? x.value(selectedMax.value)
    : 8;
});

const sliderLeft = computed(() => {
  return x.value && (selectedMin.value || selectedMin.value === 0)
    ? x.value(selectedMin.value)
    : 0;
});

const isFiltered = computed(() => {
  return (
    route.query.min ||
    route.query.max ||
    route.query.min === 0 ||
    route.query.max === 0
  );
});

const domain = computed(() => {
  return extent(props.colorScale.domain());
});

const precision = computed(() => {
  return domain.value[1] - domain.value[0] <= 20 ? 10 : 1;
});

const formatLimit = computed(() => {
  return domain.value[1] - domain.value[0] <= 20
    ? format(',.1f')
    : format(',.0f');
});

const filterString = computed(() => {
  let filter = null;
  if (route.query.min && route.query.max) {
    filter = `${route.query.min.toLocaleString()} &mdash; ${route.query.max.toLocaleString()}`;
  }

  return filter
    ? `filtered ${filter} ${props.variableLabel}`
    : props.variableLabel;
});

const setupPlot = () => {
  chart.value = select(legend_bars.value);
  xAxisRef.value = select(x_axis.value);
};

const updateFilterLimits = () => {
  selectedMin.value =
    route.query.min || route.query.min === 0
      ? route.query.min
      : Math.floor((domain.value[0] + Number.EPSILON) * precision.value) /
        precision.value;
  selectedMax.value =
    route.query.max || route.query.max === 0
      ? route.query.max
      : Math.ceil((domain.value[1] + Number.EPSILON) * precision.value) /
        precision.value;
};

const updateAxes = () => {
  // x-axis
  x.value = scaleLinear()
    .range([0, props.width - margin.value.left - margin.value.right])
    .domain(domain.value)
    .clamp(true);

  xAxis.value = axisBottom(x.value).tickSizeOuter(0).ticks(5);
  xAxisRef.value.call(xAxis.value);

  // legend gradient
  legendColors.value = props.colorScale.range().map((color, i) => {
    return {
      fill: color,
      width:
        x.value(props.colorScale.domain()[i + 1]) -
        x.value(props.colorScale.domain()[i]),
      x0: x.value(props.colorScale.domain()[i]),
    };
  });

  selectAll('.axis').call(xAxis.value);

  // calculate bins
  bins.value = histogram()
    .domain(x.value.domain())
    .thresholds(x.value.ticks(numBins.value))(
    props.data.map((d) => d[props.variable]),
  );

  // pre-calc if the data should be selected or not
  bins.value.forEach((d) => {
    if (
      (props.minVal || props.minVal === 0) &&
      (props.maxVal || props.maxVal === 0)
    ) {
      d['selected'] = d.x0 >= props.minVal && d.x1 <= props.maxVal;
    } else if (props.minVal || props.minVal === 0) {
      d['selected'] = d.x0 >= props.minVal;
    } else if (props.maxVal || props.maxVal === 0) {
      d['selected'] = d.x1 <= props.maxVal;
    } else {
      d['selected'] = true;
    }
  });

  // y-axis
  y.value = scaleLinear()
    .range([height.value, 0])
    .domain([0, max(bins.value, (d) => d.length)]);
  //   select(this.$refs.slider_line)
  //   .attr("x1", this.x(this.selectedMin))
  //   .attr("x2", this.x(this.selectedMax))
};

const setupDrag = () => {
  // draggable filters
  select(slider_left.value).call(
    drag()
      .on('drag', () => updateDrag('left'))
      .on('end', () => changeFilters()),
  );
  select(slider_right.value).call(
    drag()
      .on('drag', () => updateDrag('right'))
      .on('end', () => changeFilters()),
  );
};

const updateDrag = (side) => {
  const newVal = x.value.invert(event.x);
  if (side === 'left') {
    selectedMin.value = newVal;
    select(slider_left.value).attr(
      'transform',
      `translate(${x.value(selectedMin.value)},0)`,
    );

    // select(this.$refs.rect_mask_left).attr("width", this.x(this.selectedMin))
  } else {
    selectedMax.value = newVal;

    select(slider_right.value).attr(
      'transform',
      `translate(${x.value(selectedMax.value) - 8},0)`,
    );

    // select(this.$refs.rect_mask_right)
    //   .attr("x", this.x(this.selectedMax))
  }
};

const changeFilters = () => {
  if (selectedMin.value > selectedMax.value) {
    const minVal = selectedMax.value;
    selectedMax.value =
      Math.ceil((selectedMin.value + Number.EPSILON) * precision.value) /
      this.precision;
    selectedMin.value =
      Math.floor((minVal + Number.EPSILON) * precision.value) / precision.value;
  } else {
    selectedMax.value =
      Math.ceil((selectedMax.value + Number.EPSILON) * precision.value) /
      precision.value;
    selectedMin.value =
      Math.floor((selectedMin.value + Number.EPSILON) * precision.value) /
      precision.value;
  }

  // renamed it since route is already declared
  const routeObj = route.query;
  router.push({
    path: 'maps',
    query: {
      location: routeObj.location,
      admin_level: routeObj.admin_level,
      variable: routeObj.variable,
      date: routeObj.date,
      min: String(selectedMin.value),
      max: String(selectedMax.value),
    },
  });
};

const updatePlot = () => {
  if (props.data && props.colorScale) {
    updateAxes();
    updateFilterLimits();

    chart.value
      .selectAll('rect')
      .data(bins.value)
      .join(
        (enter) => {
          enter
            .append('rect')
            .attr('class', 'histogram-bar')
            .attr('fill', (d) =>
              props.colorScale ? props.colorScale((d.x0 + d.x1) / 2) : 'none',
            )
            .attr('opacity', (d) => (d.selected ? 1 : 0.25))
            .attr('x', (d) => x.value(d.x0) + 1)
            .attr('width', (d) =>
              Math.max(0, x.value(d.x1) - x.value(d.x0) - 1),
            )
            .attr('y', (d) => y.value(d.length))
            .attr('height', (d) => y.value(0) - y.value(d.length));
        },
        (update) => {
          if (props.animate) {
            update
              .attr('fill', (d) =>
                props.colorScale ? props.colorScale((d.x0 + d.x1) / 2) : 'none',
              )
              .attr('opacity', (d) => (d.selected ? 1 : 0.25))
              .attr('x', (d) => x.value(d.x0) + 1)
              .attr('width', (d) =>
                Math.max(0, x.value(d.x1) - x.value(d.x0) - 1),
              )
              .transition()
              .duration(props.transition1)
              .attr('height', (d) => y.value(0) - y.value(d.length))
              .attr('y', (d) => y.value(d.length));
          } else {
            update
              .attr('fill', (d) =>
                props.colorScale ? props.colorScale((d.x0 + d.x1) / 2) : 'none',
              )
              .attr('opacity', (d) => (d.selected ? 1 : 0.25))
              .attr('x', (d) => x.value(d.x0) + 1)
              .attr('width', (d) =>
                Math.max(0, x.value(d.x1) - x.value(d.x0) - 1),
              )
              .attr('y', (d) => y.value(d.length))
              .attr('height', (d) => y.value(0) - y.value(d.length));
          }
        },
      );
  }
};

watch(
  () => props.data,
  () => {
    updatePlot();
  },
  { deep: true },
);

watch(
  () => props.variable,
  () => {
    updatePlot();
  },
);

watch(
  () => props.minVal,
  (newVal, oldVal) => {
    if (newVal) {
      updateFilterLimits();
    }
  },
  { immediate: true },
);

watch(
  () => props.maxVal,
  (newVal, oldVal) => {
    if (newVal) {
      updateFilterLimits();
    }
  },
  { immediate: true },
);

onMounted(() => {
  setupPlot();
  updatePlot();
  // this.$nextTick in optionsAPI
  nextTick(() => setupDrag());
});
</script>

<style lang="scss">
.histogram-bar {
  stroke: $base-grey;
  stroke-width: 0.5;
  shape-rendering: crispedges;
}
</style>
