<template>
  <div class="timeline-group d-flex flex-column text-left">
    <h6 class="m-0">Results by publication date</h6>
    <small class="text-accent text-right">7 day rolling average</small>
    <svg ref="timeline" :width="width" :height="height" class="epi-sparkline">
      <g
        ref="xAxisRef"
        :transform="`translate(${margin.left}, ${height - margin.bottom + 3})`"
        class="resource-timeline-axis axis--x"
      />
      <g
        ref="yAxisRef"
        :transform="`translate(${margin.left}, ${margin.top})`"
        class="resource-timeline-axis axis--y"
      />
    </svg>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { max, extent, min, sum } from 'd3-array';
import { axisLeft, axisBottom } from 'd3-axis';
import { scaleLinear, scaleTime, scaleBand } from 'd3-scale';
import { select } from 'd3-selection';
import { line } from 'd3-shape';
import { timeDay } from 'd3-time';
import { timeFormat } from 'd3-time-format';

const props = defineProps({
  data: Array,
  width: {
    type: Number,
    default: 400,
  },
  height: {
    type: Number,
    default: 225,
  },
});

const margin = ref({
  top: 10,
  right: 20,
  bottom: 25,
  left: 25,
});

// data
const plotted = ref(null);
// axes
const y = ref(scaleLinear());
const x = ref(scaleTime());
const xBand = ref(scaleBand());
const xAxis = ref(null);
const yAxis = ref(null);
// refs
const chart = ref(null);
const svg = ref(null);
// methods
const areaF = ref(null);
// instead of this.$refs
const xAxisRef = ref(null);
const yAxisRef = ref(null);
const timeline = ref(null);

const prepData = () => {
  const movingAverage = (date, values, firstDate, lastDate, N = 3) => {
    const lowDate = Math.max(timeDay.offset(date, -1 * N), firstDate);
    const highDate = Math.min(timeDay.offset(date, N), lastDate);
    const filtered = values.filter(
      (d) => d.date <= highDate && d.date >= lowDate,
    );
    const daySpan = Math.round((highDate - lowDate) / (24 * 3600 * 1000)) + 1;
    return sum(filtered, (d) => d.count) / daySpan;
  };

  const firstDate = min(props.data, (d) => d.date);
  const lastDate = max(props.data, (d) => d.date);

  props.data.forEach((d) => {
    d['avg'] = movingAverage(d.date, props.data, firstDate, lastDate);
  });

  props.data.sort((a, b) => a.date - b.date);

  // Filter out ridiculous dates
  plotted.value = props.data.filter((d) => d.date > new Date('2019-12-01'));
};

const setupPlot = () => {
  svg.value = select(timeline.value);

  chart.value = svg.value
    .append('g')
    .attr('class', 'resource-timeline')
    .attr('transform', `translate(${margin.value.left}, ${margin.value.top})`);

  // this.line = area()
  //   .x(d => this.x(d.date))
  //   .y0(d => this.y(0))
  //   .y1(d => this.y(d.avg));
  areaF.value = line()
    .x((d) => x.value(d.date))
    .y((d) => y.value(d.avg));
};

const updateScales = () => {
  const dateRange = extent(plotted.value, (d) => d.date);

  x.value = x.value
    .range([0, props.width - margin.value.left - margin.value.right])
    .domain(extent(plotted.value, (d) => d.date));

  xBand.value = xBand.value
    .range([0, props.width - margin.value.left - margin.value.right])
    .domain(timeDay.range(dateRange[0], timeDay.offset(dateRange[1], 1)));

  y.value = y.value
    .range([props.height - margin.value.top - margin.value.bottom, 0])
    .domain([0, max(plotted.value, (d) => d.count)]);

  xAxis.value = axisBottom(x.value)
    .tickSizeOuter(0)
    .ticks(4)
    // .tickValues(
    //   this.x.domain().filter(function(d, i) {
    //     return !(i % 28);
    //   })
    // )
    .tickFormat(timeFormat('%d %b'));

  yAxis.value = axisLeft(y.value)
    .tickSizeOuter(0)
    .tickSize(-(props.width - margin.value.left - margin.value.right))
    .ticks(6);

  select(xAxisRef.value).call(xAxis.value);
  select(yAxisRef.value).call(yAxis.value);
};

const drawPlot = () => {
  const sparkSelector = chart.value
    .selectAll('.sparkline')
    .data([plotted.value]);

  const barSelector = chart.value
    .append('g')
    .attr('class', 'timeline-count-group')
    .selectAll('rect')
    .data(plotted.value);

  barSelector.join((enter) => {
    enter
      .append('rect')
      .attr('class', 'resource-timeline-bar')
      .attr('x', (d) => xBand.value(d.date))
      .attr('y', (d) => y.value(d.count))
      .attr('width', xBand.value.bandwidth())
      .attr('height', (d) => y.value(0) - y.value(d.count));
  });

  const sparkEnter = sparkSelector
    .enter()
    .append('path')
    .attr('class', 'sparkline');

  // merge
  sparkSelector
    .merge(sparkEnter)
    .datum((d) => d)
    .join('path')
    .attr('d', areaF.value);
};

const updatePlot = () => {
  if (props.data) {
    prepData();
    setupPlot();
    updateScales();
    drawPlot();
  }
};

onMounted(() => {
  updatePlot();
});
</script>
<style lang="scss">
.timeline-group .text-accent {
  color: $warning-color;
  margin-right: 20px;
}

.resource-timeline path {
  stroke: $warning-color;
  stroke-width: 2;
  fill: none;
}

.resource-timeline-bar {
  fill: $grey-45;
  stroke: none;
}

.resource-timeline-axis {
  font-size: 16px;
}
.resource-timeline-axis.axis--y {
  font-size: 13px;
}

.resource-timeline-axis.axis--y path {
  display: none;
}

.resource-timeline-axis.axis--y line {
  stroke: $grey-60;
  stroke-width: 0.5;
  shape-rendering: crispedges;
}
</style>
