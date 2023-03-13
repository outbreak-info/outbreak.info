<template>
  <div class="epidemiology-area">
    <svg
      :id="id"
      :width="width"
      :height="height"
      class="epi-summary-svg"
      :name="title"
    >
      <defs>
        <marker
          id="arrow"
          markerWidth="13"
          markerHeight="10"
          refX="9"
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M5,0 L12,5 L5,10" class="swoopy-arrowhead" />
        </marker>
      </defs>
      <g
        :transform="`translate(${margin.left},${margin.top})`"
        class="epi-summary"
      >
        <g class="annotation-group case-def-changed" />
      </g>
      <g class="epi-axis axis--x" />
      <g class="epi-axis axis--y" />

      <g
        :transform="`translate(${margin.left},${-margin.top})`"
        class="legend"
      />
    </svg>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { max, extent } from 'd3-array';
import { axisLeft, axisBottom } from 'd3-axis';
import { select, selectAll, event } from 'd3-selection';
import { scaleLinear, scaleTime } from 'd3-scale';
import { area, stack, stackOrderReverse } from 'd3-shape';

import { colorsStore } from '@/stores/colorsStore';

const props = defineProps({
  id: String,
  title: String,
  data: Array,
  width: Number,
  height: Number,
  includeChinaAnnot: Boolean,
});

const emit = defineEmits(['regionSelected']);

const margin = ref({
  top: 10,
  right: 50,
  bottom: 25,
  left: 90,
});

const series = ref(null);
// axes
const x = ref(scaleTime());
const y = ref(scaleLinear());
const xAxis = ref(null);
const yAxis = ref(null);
// refs
const svg = ref(null);
const chart = ref(null);
const legend = ref(null);
// methods
const areaF = ref(null);

const store = colorsStore();

const handleClick = (key) => {
  emit('regionSelected', {
    region: key,
    display: false,
    displayMore: true,
  });
};

const handleMouseover = (d) => {
  selectAll('.legend-group').style('opacity', 0.4);

  selectAll('.stacked-area-chart').style('opacity', 0.4);

  selectAll(
    `.${d.key
      .replace(/\s/g, '_')
      .replace(/\//g, '_')
      .replace(/&/g, '_')
      .replace(/:/g, '_')
      .replace(/\(/g, '_')
      .replace(/\)/g, '_')}`,
  ).style('opacity', 1);

  emit('regionSelected', {
    region: d.key,
    display: true,
    currentCases: d.slice(-1)[0].data[d.key],
    x: event.x + 10,
    y: event.y + 10,
  });
};

const handleMouseout = (key) => {
  selectAll('.legend-group').style('opacity', 1);

  selectAll('.stacked-area-chart').style('opacity', 1);

  emit('regionSelected', {
    region: key,
    display: false,
  });
};

const colorScale = (location) => {
  const scale = store.getRegionColor;
  return scale(location);
};

const updatePlot = () => {
  if (props.data) {
    setupPlot();
    updateScales();
    drawPlot();
  }
};

const setupPlot = () => {
  svg.value = select(`#${props.id}`);
  chart.value = svg.value.select('.epi-summary');
  legend.value = svg.value.select('.legend');
};

const updateScales = () => {
  const keys = Object.keys(props.data[0]).filter((d) => d !== 'date');

  series.value = stack()
    .keys(keys)
    // .order(stackOrderDescending)
    // .order(stackOrderAscending)
    // .order(stackOrderAppearance)
    // .order(stackOrderNone)
    .order(stackOrderReverse)(
    // .order(stackOrderInsideOut)
    props.data,
  );

  x.value = x.value
    .domain(extent(props.data.map((d) => d.date)))
    .range([0, props.width - margin.value.left - margin.value.right]);

  y.value = y.value
    .range([props.height - margin.value.top - margin.value.bottom, 0])
    .domain([0, max(series.value, (d) => max(d, (d) => d[1]))])
    .nice();

  const numXTicks = props.width < 575 ? 2 : 4;
  xAxis.value = axisBottom(x.value).ticks(numXTicks);

  svg.value
    .select('.axis--x')
    .attr(
      'transform',
      `translate(${margin.value.left}, ${
        props.height - margin.value.bottom + 2
      })`,
    )
    .call(xAxis.value);

  const numYTicks = props.height < 375 ? 5 : 8;
  yAxis.value = axisLeft(y.value).ticks(numYTicks);
  yAxis.value = yAxis.value
    .tickFormat((d, i) =>
      i === yAxis.value.scale().ticks().length - 1
        ? d / 1e6 + ' million'
        : d / 1e6,
    )
    .tickSizeOuter(0);

  svg.value
    .select('.axis--y')
    .attr('transform', `translate(${margin.value.left}, ${margin.value.top})`)
    .call(yAxis.value);
};

const drawPlot = () => {
  // --- annotations ---
  areaF.value = area()
    .x((d) => x.value(d.data.date))
    .y0((d) => y.value(d[0]))
    .y1((d) => y.value(d[1]));

  const areaSelector = chart.value
    .selectAll('.stacked-area-chart')
    .data(series.value);

  areaSelector
    .join('path')
    .style('fill', ({ key }) => colorScale(key))
    .attr(
      'class',
      (d) =>
        `stacked-area-chart ${d.key
          .replace(/\s/g, '_')
          .replace(/&/g, '_')
          .replace(/:/g, '_')
          .replace(/\//g, '_')
          .replace(/\(/g, '_')
          .replace(/\)/g, '_')}`,
    )
    .attr('d', areaF.value)
    .append('title')
    .text(({ key }) => key);

  const legendRectWidth = 15;

  const legendData = legend.value.selectAll('.legend-group').data(series.value);

  const legendEnter = legendData
    .enter()
    .append('g')
    .attr(
      'class',
      (d) =>
        `legend-group ${d.key
          .replace(/\s/g, '_')
          .replace(/&/g, '_')
          .replace(/:/g, '_')
          .replace(/\//g, '_')
          .replace(/\(/g, '_')
          .replace(/\)/g, '_')}`,
    );

  legendEnter
    .append('rect')
    .attr('y', (d, i) => i * (legendRectWidth + 4) + legendRectWidth)
    .attr('x', 10)
    .attr('width', legendRectWidth)
    .attr('height', legendRectWidth)
    .style('fill', ({ key }) => colorScale(key));

  legendEnter
    .append('text')
    .attr('y', (d, i) => i * (legendRectWidth + 4) + legendRectWidth * 1.5)
    .attr('x', 10 + legendRectWidth)
    .attr('dx', 8)
    .attr('class', 'legend-name')
    .style('font-family', "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
    .style('font-size', '10px')
    .style('dominant-baseline', 'middle')
    .text(({ key }) => key);

  // --- tooltips ---
  chart.value
    .selectAll('path.stacked-area-chart')
    .on('mouseover', (d) => handleMouseover(d))
    .on('mouseout', (d) => handleMouseout(d.key))
    .on('click', (d) => handleClick(d.key));

  legend.value
    .selectAll('.legend-group')
    .on('mouseover', (d) => handleMouseover(d))
    .on('mouseout', (d) => handleMouseout(d.key))
    .on('click', (d) => handleClick(d.key));
};

watch(
  () => props.data,
  () => {
    updatePlot();
  },
  { deep: true },
);

watch(
  () => props.width,
  () => {
    updatePlot();
  },
);

watch(
  () => props.height,
  () => {
    updatePlot();
  },
);

onMounted(() => {
  updatePlot();
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.legend-name {
  &:hover {
    text-decoration: underline;
  }
}

.epi-axis text {
  font-size: 12pt;
}

.annotation--region-name {
  dominant-baseline: middle;
}

.legend-group,
path.stacked-area-chart {
  cursor: pointer;
}

.stacked-area-title {
  margin: 0.5em 0 0;
}

.case-def-changed {
  font-size: 0.85em;
  text-anchor: middle;
  fill: $grey-60;
}

.swoopy-arrow,
.swoopy-arrowhead {
  stroke: $grey-60;
  fill: none;
  stroke-width: 0.8;
}
.swoopy-arrowhead {
  stroke-width: 1;
}
</style>
