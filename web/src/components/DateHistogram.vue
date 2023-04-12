<template>
  <div :id="`donut-${id}`" class="donut-group d-flex flex-column">
    <svg
      :width="width + margin.left + margin.right"
      :height="height + margin.top + margin.bottom"
      class="date-histogram"
    >
      <g ref="hist" :transform="`translate(${margin.left},${margin.top})`" />
      <g
        ref="axis_x"
        class="axis axis--x"
        :transform="`translate(${margin.left},${height + margin.top})`"
      />
    </svg>
    <svg
      :class="{ hidden: !filterable }"
      :width="width + margin.left + margin.right"
      height="38"
    >
      <g
        v-if="x"
        class="slider-handle pointer"
        :transform="`translate(${margin.left},${5})`"
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
          font-family="'DM Sans', Avenir, Helvetica, Arial, sans-serif;"
          text-anchor="start"
        >
          <text :x="x(selectedMin)" :y="0">
            &gt; {{ formatLimit(selectedMin) }}
          </text>
          <text :x="x(selectedMax)" :y="10" text-anchor="end">
            &lt; {{ formatLimit(selectedMax) }}
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { nest } from 'd3-collection';
import { axisBottom } from 'd3-axis';
import { min, max, sum, extent } from 'd3-array';
import { drag } from 'd3-drag';
import { select, selectAll, event } from 'd3-selection';
import { scaleLinear, scaleTime } from 'd3-scale';
import { timeWeek } from 'd3-time';
import { timeFormat, timeParse, isoParse } from 'd3-time-format';

const props = defineProps({
  data: Array,
  id: String,
  minVal: Date,
  maxVal: Date,
  filterable: {
    type: Boolean,
    default: true,
  },
  width: {
    type: Number,
    default: 125,
  },
  height: {
    type: Number,
    default: 60,
  },
});

// instead of this.$route
const route = useRoute();
// instead of this.$router
const router = useRouter();

const margin = ref({
  top: 5,
  bottom: 25,
  left: 15,
  right: 15,
});
// data
const bins = ref(null);
// axes
const x = ref(null);
const y = ref(null);
const xAxis = ref(null);
// filters
const selectedMin = ref(null);
const selectedMax = ref(null);
// refs
const svg = ref(null);
const xAxisRef = ref(null);
// below variables to replace this.$refs
const hist = ref(null);
const x_axis = ref(null);
const slider_left = ref(null);
const slider_right = ref(null);

const sliderRight = computed(() => {
  return x.value && selectedMax.value ? x.value(selectedMax.value) : 8;
});

const sliderLeft = computed(() => {
  return x.value && selectedMin.value ? x.value(selectedMin.value) : 0;
});

const formatLimit = (val) => {
  return timeFormat('%d %b %Y')(val);
};

const formatDate = (val) => {
  return timeFormat('%Y-%m-%d')(val);
};

const parseDate = (val) => {
  return timeParse('%Y-%m-%d')(val);
};

const setupPlot = () => {
  svg.value = select(hist.value);
  xAxisRef.value = select(x_axis.value);
};

const updatePlot = () => {
  if (props.data && props.width) {
    updateAxes();
    drawPlot();
  }
};

const updateAxes = () => {
  const dateRange = extent(props.data, (d) => d.date);

  // x-axis
  // Add 1 week pad on either side of the histogram to pad the ends
  x.value = scaleTime()
    .range([0, props.width])
    .domain([
      timeWeek.offset(dateRange[0], -1),
      timeWeek.offset(dateRange[1], 1),
    ])
    .clamp(true);

  xAxis.value = axisBottom(x.value).tickSizeOuter(0).ticks(2);
  xAxisRef.value.call(xAxis.value);

  selectAll('.axis').call(xAxis.value);

  // calculate bins
  // rolled up to every week
  bins.value = nest()
    .key((d) => timeWeek(d.date))
    .rollup((values) => sum(values, (d) => d.count))
    .entries(props.data);

  // gotta reconvert dates from strings
  bins.value.forEach((d) => {
    d['date'] = isoParse(d.key);
  });

  // // y-axis
  y.value = scaleLinear()
    .range([props.height, 0])
    .domain([0, max(bins.value, (d) => d.value)]);
};

const changeFilters = () => {
  // renamed it to avoid duplicated declare since route is already defined
  const routeObj = route.query;

  router.push({
    name: 'Resources',
    state: {
      disableScroll: true,
    },
    query: {
      q: routeObj.q,
      page: routeObj.page,
      size: routeObj.size,
      filter: routeObj.filter,
      sort: routeObj.sort,
      dateMin: formatDate(selectedMin.value),
      dateMax: formatDate(selectedMax.value),
    },
  });
};

const setSliders = () => {
  selectedMin.value = route.query.dateMin
    ? parseDate(route.query.dateMin)
    : min(
        props.data.filter((d) => d.count),
        (x) => x.date,
      );
  selectedMax.value = route.query.dateMax
    ? parseDate(route.query.dateMax)
    : max(
        props.data.filter((d) => d.count),
        (x) => x.date,
      );
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
  } else {
    selectedMax.value = newVal;

    select(slider_right.value).attr(
      'transform',
      `translate(${x.value(selectedMax.value) - 8},0)`,
    );
  }
};

const drawPlot = () => {
  const barSelector = svg.value.selectAll('rect').data(bins.value);

  barSelector.join(
    (enter) => {
      enter
        .append('rect')
        .attr('class', 'date-bar')
        .style('fill', '#66c2a5')
        // .style("fill", d => d.date <= this.selectedMax && d.date >= this.selectedMin ? "#66c2a5" : "#bababa")
        .attr('x', (d) => x.value(d.date))
        .attr(
          'width',
          (d) => (x.value(timeWeek.offset(d.date, 1)) - x.value(d.date)) * 0.9,
        )
        .attr('y', (d) => y.value(d.value))
        .attr('height', (d) => y.value(0) - y.value(d.value));
    },
    (update) =>
      update
        .style('fill', '#66c2a5')
        .attr('x', (d) => x.value(d.date))
        .attr(
          'width',
          (d) => (x.value(timeWeek.offset(d.date, 1)) - x.value(d.date)) * 0.9,
        )
        .attr('y', (d) => y.value(d.value))
        .attr('height', (d) => y.value(0) - y.value(d.value)),
  );
};

watch(
  () => props.data,
  () => {
    if (props.data) {
      if (props.filterable) {
        setSliders();
      }
      updatePlot();
    }
  },
  { deep: true },
);

onMounted(() => {
  setupPlot();
  updatePlot();
  if (props.filterable) {
    setSliders();
    // this.$nextTick in optionsAPI
    nextTick(() => setupDrag());
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss"></style>
