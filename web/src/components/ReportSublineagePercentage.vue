<template>
  <div id="streamgraph">
    <div
      class="d-flex justify-content-between px-3"
      :style="{ width: width + 'px' }"
    >
      <h5 class="m-0">Lineage prevalence over time</h5>
      <div class="d-flex justify-content-end">
        <button
          class="btn btn-accent-flat text-highlight d-flex align-items-center m-0 p-2"
          @click="enableZoom"
        >
          <font-awesome-icon
            class="text-right"
            :icon="['fas', 'search-plus']"
          />
        </button>
        <button
          class="btn btn-accent-flat text-highlight d-flex align-items-center m-0 p-2"
          @click="resetZoom"
        >
          <font-awesome-icon
            class="text-right"
            :icon="['fas', 'compress-arrows-alt']"
          />
        </button>
      </div>
    </div>

    <svg
      ref="lineages_by_location"
      :width="width"
      :height="height"
      class="lineages-by-location"
      :name="title"
    >
      <g
        ref="chartRef"
        :transform="`translate(${margin.left},${margin.top})`"
      />
      <g
        ref="xAxisRef"
        class="stream-axis axis--x"
        :transform="`translate(${margin.left},${height - margin.bottom})`"
      />
      <g
        ref="yAxisRef"
        class="stream-axis axis--y"
        :transform="`translate(${margin.left},${margin.top})`"
      />
      <g
        v-if="data"
        id="brush-zoom"
        ref="brush_ref"
        class="brush"
        :transform="`translate(${margin.left},${margin.top})`"
        :class="{ hidden: !zoomAllowed }"
      />
    </svg>

    <!-- Histogram of sequencing counts -->
    <SequencingHistogram
      v-if="seqCounts && x"
      :data="seqCounts"
      :xInput="x"
      :width="width"
      :svgTitle="title"
      :margin="marginHist"
      :mutationName="null"
      className="lineages-by-location"
      :onlyTotals="true"
      notDetectedColor="#bab0ab"
    />

    <DownloadReportData
      :data="data"
      figureRef="lineages-by-location"
      :isVertical="true"
      dataType="Mutation Report Prevalence over Time"
    />

    <div
      id="tooltip-streamgraph"
      ref="tooltip_streamgraph"
      class="tooltip-basic box-shadow"
    >
      <h5 id="lineage" class="my-1" />
      <div class="d-flex align-items-center">
        Prevalence in the last {{ recentWindow }} days:
        <b id="proportion" class="ml-1" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { extent } from 'd3-array';
import { axisLeft, axisBottom } from 'd3-axis';
import { brushX } from 'd3-brush';
import { format } from 'd3-format';
import { scaleLinear, scaleTime } from 'd3-scale';
import { select, selectAll, event } from 'd3-selection';
import { area, stack, stackOrderInsideOut } from 'd3-shape';
import { transition } from 'd3-transition';
import debounce from 'lodash/debounce';

import { lazyLoad } from '@/js/lazy-load';

const SequencingHistogram = lazyLoad('SequencingHistogram');
const DownloadReportData = lazyLoad('DownloadReportData');

const props = defineProps({
  data: Array,
  recentData: Object,
  seqCounts: Array,
  recentWindow: String,
  location: String,
  recentMin: Date,
  colorScale: Function,
});

// dimensions
const margin = ref({
  top: 18,
  bottom: 30,
  left: 55,
  right: 55,
});
const marginHist = ref({
  top: 5,
  bottom: 10,
  left: 55,
  right: 55,
});
const width = ref(null);
const minWidth = ref(null);
const height = ref(500);
// axes
const x = ref(null);
const y = ref(scaleLinear());
const xAxis = ref(null);
const yAxis = ref(null);
const numXTicks = ref(5);
const numYTicks = ref(5);
// methods
const areaF = ref(null);
const brush = ref(null);
// data
const series = ref(null);
const lineages = ref(null);
// refs
const svg = ref(null);
const chart = ref(null);
const brushRef = ref(null);
const legend = ref(null);
// controls
const zoomAllowed = ref(false);
// variables to replace this.$refs
const chartRef = ref(null);
const legendRef = ref(null);
const brush_ref = ref(null); // to avoid duplication name like this;
const xAxisRef = ref(null); // xAxis is already declared, so renamed
const yAxisRef = ref(null); // yAxis is already declared, so renamed
const tooltip_streamgraph = ref(null);
const lineages_by_location = ref(null);

// computed variables
const title = computed(() => {
  return `Lineage prevalence over time in ${props.location}`;
});

const updateBrush = () => {
  // Update brush so it spans the whole of the area
  brush.value = brushX()
    .extent([
      [0, 0],
      [
        width.value - margin.value.left - margin.value.right,
        height.value - margin.value.top - margin.value.bottom,
      ],
    ])
    .on('end', () => debounceZoom(event));

  brushRef.value.call(brush.value).on('dblclick', resetZoom);
};

const setDims = () => {
  const svgContainer = document.getElementById('most-recent-lineages');
  let containerWidth = svgContainer ? svgContainer.offsetWidth : 500;
  const pageContainer = document.getElementById('location-report');
  let maxWidth = pageContainer ? pageContainer.offsetWidth : 500;
  const idealWidth = (maxWidth - containerWidth) * 0.95;
  width.value =
    idealWidth < minWidth.value || idealWidth > maxWidth
      ? maxWidth * 0.95
      : idealWidth;

  numXTicks.value = width.value < 500 ? 2 : 5;
};

const setupPlot = () => {
  // this.svg = select(this.$refs.svg); TODO: should confirm where svg ref
  svg.value = select(lineages_by_location.value);
  legend.value = select(legendRef.value); // TODO: should confirm where legend ref
  chart.value = select(chartRef.value);
  brushRef.value = select(brush_ref.value);

  areaF.value = area()
    .x((d) => x.value(d.data.date_time))
    .y0((d) => y.value(d[0]))
    .y1((d) => y.value(d[1]));
};

const updateScales = () => {
  x.value = scaleTime()
    .range([0, width.value - margin.value.left - margin.value.right])
    .domain(extent(props.data.map((d) => d.date_time)))
    .clamp(true);

  y.value = y.value
    // .range([0, this.height - this.margin.top - this.margin.bottom])
    .range([height.value - margin.value.top - margin.value.bottom, 0])
    .nice()
    .domain([0, 1]);

  lineages.value = Object.keys(props.data[0]).filter((d) => d !== 'date_time');

  xAxis.value = axisBottom(x.value).ticks(numXTicks.value);

  select(xAxisRef.value).call(xAxis.value);

  yAxis.value = axisLeft(y.value)
    .tickSizeOuter(0)
    .ticks(numYTicks.value)
    .tickFormat(format('.0%'));

  // stacking
  series.value = stack().keys(lineages.value).order(stackOrderInsideOut)(
    props.data,
  );

  select(yAxisRef.value).call(yAxis.value);
};

const updatePlot = () => {
  if (props.data && props.colorScale) {
    updateScales();
    drawPlot();
  }
};

const tooltipOn = (key) => {
  const ttipShift = 20;
  // turn everything off
  chart.value
    .selectAll('.stacked-area-chart')
    .style('stroke', '#BBB')
    .style('fill-opacity', 0.2);

  selectAll('.stacked-bar-chart').style('fill-opacity', 0.2);

  // turn on the selected region
  chart.value
    .select(`#area_${key.replace(/\./g, '-')}`)
    .style('fill-opacity', 1);

  select(`#${key.replace(/\./g, '-')}`).style('fill-opacity', 1);

  const ttip = select(tooltip_streamgraph.value);

  ttip.select('#lineage').text(key);

  const recentPrev = props.recentData[key];
  if (recentPrev) {
    ttip
      .select('#proportion')
      .text(recentPrev < 0.005 ? '< 0.5%' : format('.0%')(recentPrev));
  } else {
    ttip.select('#proportion').text('Grouped into "other" category');
  }

  // fix location
  ttip
    .style('left', `${event.clientX + ttipShift}px`)
    .style('top', `${event.clientY + ttipShift}px`)
    .style('display', 'block');
};

const tooltipOff = () => {
  chart.value
    .selectAll('.stacked-area-chart')
    .style('stroke', '#555')
    .style('fill-opacity', 1);

  selectAll('.stacked-bar-chart').style('fill-opacity', 1);

  select(tooltip_streamgraph.value).style('display', 'none');
};

const zoom = (evt) => {
  // reset domain to new coords
  const selection = evt.selection;

  if (selection) {
    const newMin = x.value.invert(selection[0]);
    const newMax = x.value.invert(selection[1]);

    x.value = scaleTime()
      .range([0, width.value - margin.value.left - margin.value.right])
      .domain([newMin, newMax])
      .clamp(true);

    // reset the axis
    xAxis.value = axisBottom(x.value).ticks(numXTicks.value);

    select(xAxisRef.value).call(xAxis.value);

    // move the brush
    brushRef.value.call(brush.value.move, null);
    zoomAllowed.value = false;
    drawPlot();
  }
};

const resetZoom = () => {
  x.value = x.value.domain(extent(props.data.map((d) => d.date_time)));
  brushRef.value.call(brush.value.move, null);
  updatePlot();
};

const enableZoom = () => {
  zoomAllowed.value = true;
};

const drawPlot = () => {
  const areaSelector = chart.value
    .selectAll('.stacked-area-chart')
    .data(series.value);

  areaSelector.join(
    (enter) => {
      const selector = enter
        .append('path')
        .attr('fill', ({ key }) => props.colorScale(key))
        .attr('class', 'stacked-area-chart')
        .attr('id', ({ key }) => `area_${key.replace(/\./g, '-')}`)
        .attr('d', areaF.value)
        .style('stroke', '#555')
        .style('stroke-width', 0.5);
    },
    (update) => {
      update
        .attr('fill', ({ key }) => props.colorScale(key))
        .attr('id', ({ key }) => `area_${key.replace(/\./g, '-')}`)
        .attr('d', areaF.value);
    },
    (exit) =>
      exit.call((exit) => exit.transition().style('opacity', 1e-5).remove()),
  );

  // annotation for the most recent date
  const recentSelector = chart.value
    .selectAll('.recent-date-annotation')
    .data([props.recentMin]);

  const t1 = transition().duration(500);

  recentSelector.join(
    (enter) => {
      const grp = enter.append('g').attr('class', 'recent-date-annotation');

      grp
        .append('line')
        .attr('class', 'annotation-line')
        .attr('x1', (d) => x.value(d))
        .attr('x2', (d) => x.value(d))
        .attr('y1', 0)
        .attr('y2', height.value)
        .style('stroke', 'white')
        .style('stroke-dasharray', '6,6');

      grp
        .append('line')
        .attr('class', 'text-line')
        .attr('x1', (d) => x.value(d))
        .attr('x2', (d) => x.value(d))
        .attr('y1', 0)
        .attr('y2', -5)
        .style('stroke', '#2c3e50');

      grp
        .append('text')
        .attr('x', (d) => x.value(d))
        .attr('y', 0)
        .attr('dy', -8)
        .text(`${props.recentWindow} days`)
        .style('text-anchor', (d) =>
          x.value(d) > width.value / 2 ? 'end' : 'start',
        )
        .style('font-family', "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
        .style('dominant-baseline', 'text-top')
        .style('font-size', '9pt');
    },
    (update) => {
      update
        .select('.annotation-line')
        .attr('y1', 0)
        .attr('y2', height.value)
        .transition(t1)
        .attr('x1', (d) => x.value(d))
        .attr('x2', (d) => x.value(d));

      update
        .select('.text-line')
        .transition(t1)
        .attr('x1', (d) => x.value(d))
        .attr('x2', (d) => x.value(d));

      update
        .select('text')
        .text(`${props.recentWindow} days`)
        .style('text-anchor', (d) =>
          x.value(d) > width.value / 2 ? 'end' : 'start',
        )
        .transition(t1)
        .attr('x', (d) => x.value(d));
    },
    (exit) =>
      exit.call((exit) => exit.transition().style('opacity', 1e-5).remove()),
  );

  chart.value
    .selectAll('.stacked-area-chart')
    .on('mousemove', ({ key }) => tooltipOn(key))
    .on('mouseleave', tooltipOff);
};

watch(width, () => {
  updateBrush();
  updatePlot();
});

watch(
  () => props.data,
  () => {
    updatePlot();
  },
  { deep: true },
);

const debounceSetDims = debounce(setDims, 150);
const debounceZoom = debounce(zoom, 150);

onMounted(() => {
  // this.$nextTick in optionsAPI
  nextTick(() => {
    window.addEventListener('resize', debounceSetDims);

    updateBrush();
    // set initial dimensions for the plots.
    debounceSetDims();
  });

  setupPlot();
  updatePlot();
});
</script>

<style lang="scss">
.lineages-by-location {
  .axis--x text {
    font-size: 16pt;
  }
  .axis--y text {
    font-size: 9pt;
  }
  .stream-axis.axis--y text {
    font-size: 14pt;
  }
}
</style>
