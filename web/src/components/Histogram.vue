<template>
  <div class="d-flex flex-column">
    <h5 class="text-muted">{{ title }}</h5>

    <svg :width="width" :height="height" id="generic-histogram" name="title">
      <g ref="hist" :transform="`translate(${margin.left}, ${margin.top})`"></g>
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
import { nextTick, onMounted, ref, watch } from 'vue';
import { max, min } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { transition } from 'd3-transition';

const props = defineProps({
  data: Array,
  median: Number,
  title: String,
  setWidth: {
    type: Number,
    default: 500,
  },
  height: {
    type: Number,
    default: 400,
  },
  margin: {
    type: Object,
    default: () => {
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
  medianColor: {
    type: String,
    default: '#114068',
  },
});

//dims
const width = ref(500);
// axes
const x = ref(null);
const y = ref(null);
const xAxis = ref(null);
const yAxis = ref(null);
const numXTicks = ref(5);
const numYTicks = ref(5);
// refs
const chart = ref(null);
// variables to replace this.$refs
const hist = ref(null);
const xAxisRef = ref(null);
const yAxisLeft = ref(null);

const setupPlot = () => {
  // this.$nextTick in optionsAPI
  nextTick(() => {
    window.addEventListener('resize', setDims);

    // set initial dimensions for the plots.
    setDims();
  });

  chart.value = select(hist.value);
};

const setDims = () => {
  if (props.setWidth) {
    width.value = props.setWidth;
  }
};

const updateAxes = () => {
  const minVal = min(props.data, (d) => d.x0);
  const maxVal = max(props.data, (d) => d.x1);

  x.value = scaleLinear()
    .range([0, width.value - props.margin.left - props.margin.right])
    .domain([minVal, maxVal]);

  const maxCounts = max(props.data.map((d) => d.length));
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
  const xGap = 1;

  if (props.median) {
    const medianSelector = chart.value
      .selectAll('.median')
      .data([props.median]);

    medianSelector.join(
      (enter) => {
        const grp = enter.append('g').attr('class', 'median');

        grp
          .append('line')
          .attr('class', 'median-line')
          .attr('x1', (d) => x.value(d))
          .attr('x2', (d) => x.value(d))
          .attr('y1', 0)
          .attr('y2', props.height - props.margin.top - props.margin.bottom)
          .style('stroke', props.medianColor)
          .style('stroke-width', 1)
          .style('stroke-dasharray', '4,4');

        grp
          .append('text')
          .attr('class', 'median-annotation')
          .attr('x', (d) => x.value(d))
          .attr('dx', 10)
          .attr('y', props.margin.top)
          .attr('dy', 5)
          .text((d) => `median: ${d} days`)
          .style('fill', props.medianColor)
          .style('font-size', 18)
          .style(
            'font-family',
            "'DM Sans', Avenir, Helvetica, Arial, sans-serif",
          );
      },
      (update) => {
        update
          .select('.median-line')
          .attr('y2', props.height - props.margin.top - props.margin.bottom)
          .transition(t1)
          .attr('x1', (d) => x.value(d))
          .attr('x2', (d) => x.value(d));

        update
          .select('.median-annotation')
          .attr('y', props.margin.top)
          .text((d) => `median: ${d} days`)
          .transition(t1)
          .attr('x', (d) => x.value(d));
      },
      (exit) =>
        exit.call((exit) =>
          exit.transition().duration(10).style('opacity', 1e-5).remove(),
        ),
    );
  }

  const histSelector = chart.value.selectAll('.hist').data(props.data);

  histSelector.join(
    (enter) => {
      enter
        .append('rect')
        .attr('class', 'hist')
        .attr('x', (d) => x.value(d.x0) - xGap)
        .attr('width', (d) => x.value(d.x1) - x.value(d.x0) - xGap * 2)
        .attr('y', (d) => y.value(d.length))
        .attr('height', (d) => y.value(0) - y.value(d.length))
        .style('fill', props.fillColor);
    },
    (update) => {
      update
        .transition(t1)
        .attr('x', (d) => x.value(d.x0) - xGap)
        .attr('width', (d) => x.value(d.x1) - x.value(d.x0) - xGap * 2)
        .attr('y', (d) => y.value(d.length))
        .attr('height', (d) => y.value(0) - y.value(d.length));
    },
    (exit) =>
      exit.call((exit) =>
        exit.transition().duration(10).style('opacity', 1e-5).remove(),
      ),
  );
};

const updatePlot = () => {
  if (props.data) {
    updateAxes();
    drawPlot();
  }
};

watch(
  () => props.data,
  () => {
    updatePlot();
  },
);

onMounted(() => {
  setupPlot();
  updatePlot();
});
</script>

<style lang="scss">
#generic-histogram {
  .axis--x text,
  .axis--y text {
    font-size: 16px;
    fill: $grey-90;
  }
}
</style>
