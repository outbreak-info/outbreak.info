<template>
  <div class="d-flex flex-column">
    <h5 class="text-muted">{{ title }}</h5>
    <svg :width="width" :height="height" id="gap-over-time" :name="title">
      <g
        ref="chartRef"
        :transform="`translate(${margin.left}, ${margin.top})`"
      ></g>
      <g
        :transform="`translate(${margin.left}, ${height - margin.bottom + 1})`"
        class="prevalence-axis total-axis axis--x"
        ref="xAxisRef"
      ></g>
      <g
        :transform="`translate(${margin.left}, ${margin.top})`"
        class="prevalence-axis total-axis axis--y"
        ref="yAxisLeft"
      ></g>
    </svg>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { max, extent } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import { scaleLinear, scaleTime } from 'd3-scale';
import { line, area } from 'd3-shape';
import { transition } from 'd3-transition';

const props = defineProps({
  data: Array,
  location: String,
  setWidth: {
    type: Number,
    default: 1000,
  },
  height: {
    type: Number,
    default: 400,
  },
  margin: {
    type: Object,
    default() {
      return {
        top: 10,
        bottom: 30,
        left: 50,
        right: 10,
      };
    },
  },
  fillColor: {
    type: String,
    default: '#9edae5',
  },
});
// dims
const width = ref(1000);
// axes
const x = ref(null);
const y = ref(null);
const xAxis = ref(null);
const yAxis = ref(null);
const numXTicks = ref(5);
const numYTicks = ref(5);
// variables
const radius = ref(7);
const xVariable = ref('maxDate');
const yVariable = ref('median');
// refs
const chart = ref(null);
// methods
const lineF = ref(null);
const areaF = ref(null);
// variables to replace this.$refs
const xAxisRef = ref(null);
const yAxisLeft = ref(null);
const chartRef = ref(null);

const title = computed(() => {
  return props.location
    ? `Weekly median difference between sample collection and sequence submission in days ${props.location}`
    : 'Weekly median difference between sample collection and sequence submission in days';
});

const updatePlot = () => {
  if (props.data) {
    updateAxes();
    drawPlot();
  }
};

const setupPlot = () => {
  // this.$nextTick in optionsAPI
  nextTick(() => {
    window.addEventListener('resize', setDims);

    // set initial dimensions for the plots.
    setDims();
  });

  chart.value = select(chartRef.value);

  // line method
  lineF.value = line()
    .x((d) => x.value(d[xVariable.value]))
    .y((d) => y.value(d[yVariable.value]));

  // area method
  areaF.value = area()
    .x((d) => x.value(d[xVariable.value]))
    .y0((d) => y.value(d.quartile25))
    .y1((d) => y.value(d.quartile75));
};

const setDims = () => {
  if (props.setWidth) {
    width.value = props.setWidth;
  }
};

const updateAxes = () => {
  x.value = scaleTime()
    .range([0, width.value - props.margin.left - props.margin.right])
    .domain(extent(props.data, (d) => d[xVariable.value]));

  const maxCounts = max(props.data.map((d) => d.quartile25));
  // const maxCounts = max(this.data.map(d => d[this.yVariable]));
  y.value = scaleLinear()
    .range([props.height - props.margin.top - props.margin.bottom, 0])
    .domain([0, maxCounts]);

  xAxis.value = axisBottom(x.value).ticks(numXTicks.value).tickSizeOuter(0);
  select(xAxisRef.value).call(xAxis.value);

  yAxis.value = axisLeft(y.value).ticks(numYTicks.value).tickSizeOuter(0);
  select(yAxisLeft.value).call(yAxis.value);
};

const drawPlot = () => {
  const t1 = transition().duration(1500);

  const areaSelector = chart.value
    .selectAll('.quartile-trace')
    .data([props.data]);

  areaSelector.join(
    (enter) => {
      enter
        .append('path')
        .attr('class', 'quartile-trace')
        .attr('d', areaF.value)
        .style('stroke', props.fillColor)
        .style('fill', props.fillColor)
        .style('fill-opacity', 0.15)
        .style('stroke-width', 1)
        .style('stroke-dasharray', '4,4');
    },
    (update) => {
      update.transition(t1).attr('d', areaF.value);
    },
    (exit) =>
      exit.call((exit) => exit.transition(10).style('opacity', 1e-5).remove()),
  );

  const lineSelector = chart.value.selectAll('.time-trace').data([props.data]);

  lineSelector.join(
    (enter) => {
      enter
        .append('path')
        .attr('class', 'time-trace')
        .attr('d', lineF.value)
        .style('stroke', props.fillColor)
        .style('fill', 'none')
        .style('stroke-width', '2.5');
    },
    (update) => {
      update.transition(t1).attr('d', lineF.value);
    },
    (exit) =>
      exit.call((exit) => exit.transition(10).style('opacity', 1e-5).remove()),
  );
};

watch(
  () => props.data,
  () => {
    updatePlot();
  },
  { deep: true },
);

onMounted(() => {
  setupPlot();
  updatePlot();
});
</script>

<style lang="scss">
#gap-over-time {
  .axis--x text,
  .axis--y text {
    font-size: 16px;
    fill: $grey-90;
  }
}
</style>
