<template>
  <div class="slope-comparison flex-column align-left">
    <svg :width="width" :height="height" class="slope-comparison">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="13"
          markerHeight="10"
          refX="9"
          refY="5"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M5,0 L12,5 L5,10"
            class="slope-arrowhead"
            :class="[slope1 < slope2 ? 'worse' : 'better']"
          />
        </marker>
      </defs>
      <g
        ref="xAxisRef"
        :transform="`translate(${margin.left}, ${height - margin.bottom})`"
        class="epi-axis axis--x"
      />
      <!-- <g :transform="`translate(${margin.left}, ${margin.top})`" class="epi-axis axis--y" ref="yAxis"></g> -->
      <g
        ref="slopes"
        :transform="`translate(${margin.left},${margin.top})`"
        class="slopes"
      />
    </svg>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { axisBottom } from 'd3-axis';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';

const props = defineProps({
  slope1: Number,
  slope2: Number,
});

const width = ref(125);
const height = ref(75);
const margin = ref({
  top: 5,
  right: 50,
  bottom: 5,
  left: 5,
});
const x = ref(scaleLinear());
const y = ref(scaleLinear());
const xAxis = ref(null);
const yMax = ref(0.5);
const svg = ref(null);
const chart = ref(null);
const line = ref(null);
// variables to replace this.$refs
const xAxisRef = ref(null);

const updateScales = () => {
  x.value = x.value
    .range([0, width.value - margin.value.left - margin.value.right])
    .domain([0, 1]);

  y.value = scaleLinear()
    .range([height.value - margin.value.top - margin.value.bottom, 0])
    .domain([0, yMax.value]);

  xAxis.value = axisBottom(x.value).ticks(0).tickSizeOuter(0);

  select(xAxisRef.value).call(xAxis.value);

  // this.yAxis = axisLeft(this.y).ticks(this.numYTicks);

  // select(this.$refs.yAxis).call(this.yAxis);
};

const drawSlopes = () => {
  // --- poly fill and swoopy arrow ---
  chart.value
    .selectAll('.fit-diff')
    .data(
      props.slope1 && props.slope2
        ? [
            {
              slope1: props.slope1,
              slope2: props.slope2,
            },
          ]
        : [],
    )
    .join(
      (enter) =>
        enter
          .append('polygon')
          .attr('class', (d) =>
            props.slope1 < props.slope2 ? 'fit-diff worse' : 'fit-diff better',
          )
          .attr(
            'points',
            (d) =>
              `${x.value(0)},${y.value(0)} ${x.value(1)},${y.value(
                d.slope1,
              )} ${x.value(1)},${y.value(d.slope2)}`,
          ),
      (update) =>
        update.attr(
          'points',
          (d) =>
            `${x.value(0)},${y.value(0)} ${x.value(1)},${y.value(
              d.slope1,
            )} ${x.value(1)},${y.value(d.slope2)}`,
        ),
      (exit) => exit.call((exit) => exit.remove()),
    );

  chart.value
    .selectAll('.swoopy-arrow')
    .data(
      props.slope1 && props.slope2
        ? [
            {
              slope1: props.slope1,
              slope2: props.slope2,
            },
          ]
        : [],
    )
    .join(
      (enter) =>
        enter
          .append('path')
          .attr('transform', 'translate(15, 0)')
          .attr('marker-end', 'url(#arrowhead)')
          .attr(
            'd',
            (d) =>
              `M${x.value(1)} ${y.value(d.slope1)} C ${
                x.value(1) + 10
              } ${y.value(d.slope1)}, ${x.value(1) + 10} ${y.value(
                d.slope2,
              )}, ${x.value(1) - 4} ${y.value(d.slope2)}`,
          )
          .attr('class', (d) =>
            d.slope1 < d.slope2 ? 'swoopy-arrow worse' : 'swoopy-arrow better',
          ),
      (update) =>
        update
          .attr(
            'd',
            (d) =>
              `M${x.value(1)} ${y.value(d.slope1)} C ${
                x.value(1) + 10
              } ${y.value(d.slope1)}, ${x.value(1) + 10} ${y.value(
                d.slope2,
              )}, ${x.value(1) - 4} ${y.value(d.slope2)}`,
          )
          .attr('class', (d) =>
            d.slope1 < d.slope2 ? 'swoopy-arrow worse' : 'swoopy-arrow better',
          ),
      (exit) => exit.call((exit) => exit.remove()),
    );

  // --- slope lines ---
  chart.value
    .selectAll('.recent-slope')
    .data(props.slope2 ? [props.slope2] : [])
    .join(
      (enter) =>
        enter
          .append('line')
          .attr('x1', x.value(0))
          .attr('y1', y.value(0))
          .attr('x2', x.value(1))
          .attr('y2', (d) => y.value(d))
          .attr('class', 'recent-slope'),
      (update) =>
        update
          .attr('x1', x.value(0))
          .attr('y1', y.value(0))
          .attr('x2', x.value(1))
          .attr('y2', (d) => y.value(d)),
      (exit) => exit.call((exit) => exit.remove()),
    );

  chart.value
    .selectAll('.penultimate-slope')
    .data(props.slope1 ? [props.slope1] : [])
    .join(
      (enter) =>
        enter
          .append('line')
          .attr('x1', x.value(0))
          .attr('y1', y.value(0))
          .attr('x2', x.value(1))
          .attr('y2', (d) => y.value(d))
          .attr('class', 'penultimate-slope'),
      (update) =>
        update
          .attr('x1', x.value(0))
          .attr('y1', y.value(0))
          .attr('x2', x.value(1))
          .attr('y2', (d) => y.value(d)),
      (exit) => exit.call((exit) => exit.remove()),
    );

  // --- circles ---
  chart.value
    .selectAll('.recent-slope-end')
    .data(props.slope2 ? [props.slope2] : [])
    .join(
      (enter) =>
        enter
          .append('circle')
          .attr('r', 3)
          .attr('cx', x.value(1))
          .attr('cy', (d) => y.value(d))
          .attr('class', 'recent-slope-end'),
      (update) => update.attr('cx', x.value(1)).attr('cy', (d) => y.value(d)),
      (exit) => exit.call((exit) => exit.remove()),
    );

  chart.value
    .selectAll('.penultimate-slope-end')
    .data(props.slope1 ? [props.slope1] : [])
    .join(
      (enter) =>
        enter
          .append('circle')
          .attr('r', 3)
          .attr('cx', x.value(1))
          .attr('cy', (d) => y.value(d))
          .attr('class', 'penultimate-slope-end'),
      (update) => update.attr('cx', x.value(1)).attr('cy', (d) => y.value(d)),
      (exit) => exit.call((exit) => exit.remove()),
    );
};

const updatePlot = () => {
  updateScales();
  drawSlopes();
};

const setupPlot = () => {
  svg.value = select('svg.slope-comparison');
  chart.value = svg.value.select('.slopes');
};

watch(
  () => props.slope1,
  () => {
    updatePlot();
  },
);

watch(
  () => props.slope2,
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
.slope-comparison {
  $fit1-color: #59a14f;
  $fit2-color: #f28e2c;

  .recent-slope {
    stroke: $fit2-color;
    stroke-width: 3;
  }

  .penultimate-slope {
    stroke: $fit1-color;
    stroke-width: 1.5;
    stroke-dasharray: 6, 6;
  }

  .worse {
    fill: $warning-color;
    fill-opacity: 0.2;
  }

  .better {
    fill: $secondary-color;
    fill-opacity: 0.2;
  }

  .penultimate-slope-end {
    fill: $fit1-color;
  }

  .recent-slope-end {
    fill: $fit2-color;
  }

  .slope-comparison .axis--x path {
    stroke: $grey-60;
  }

  .swoopy-arrow.better,
  .slope-arrowhead.better {
    stroke: $secondary-color !important;
    fill: none;
    stroke-width: 1.5;
  }

  .swoopy-arrow.worse,
  .slope-arrowhead.worse {
    stroke: $warning-color !important;
    fill: none;
    stroke-width: 1.5;
  }
}
</style>
