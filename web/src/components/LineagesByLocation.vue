<template>
  <div id="streamgraph">
    <div
      v-if="!recent"
      class="alert bg-highlight text-light px-2 py-1 m-0 rounded-0 mb-2 suggest-note"
    >
      <p class="m-0 x-small">
        All lineages are grouped into the other category. Try increasing the
        most recent data window.
      </p>
    </div>
    <div class="px-3" :style="{ width: width + 'px' }">
      <h5 class="m-0">
        {{ plotTitle }}
      </h5>
      <div class="d-flex justify-content-start align-items-start mt-3 mb-3">
        <button
          class="btn btn-accent-flat text-highlight d-flex align-items-center m-0 p-2 mr-2"
          @click="enableZoom"
        >
          <font-awesome-icon
            class="text-right"
            :icon="['fas', 'search-plus']"
          />
        </button>
        <button
          v-for="(beforeTime, lIdx) in timeOptions"
          :key="lIdx"
          class="btn btn-accent-outline timeline-btn m-0 px-2 py-1 mr-2"
          :class="{
            'time-btn-active': beforeTime.value === countMonth && !isZooming,
          }"
          @click="changeXScale(beforeTime.value)"
        >
          {{ beforeTime.label }}
        </button>
        <button
          class="btn btn-accent-outline timeline-btn text-highlight d-flex align-items-center m-0 px-2 py-1"
          :class="{ 'time-btn-active': countMonth === 0 && !isZooming }"
          @click="resetZoom"
        >
          all time
          <font-awesome-icon
            class="text-right ml-1"
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
      <defs>
        <pattern
          id="diagonalHatchLight"
          width="7"
          height="7"
          patternTransform="rotate(45 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <rect x="-2" y="-2" width="10" height="10" fill="#efefef" />
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="25"
            :style="`stroke:#CCC; stroke-width:4`"
          />
        </pattern>
      </defs>

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
        ref="brushFRef"
        class="brush"
        :transform="`translate(${margin.left},${margin.top})`"
        :class="{ hidden: !zoomAllowed }"
      />
    </svg>

    <!-- Histogram of sequencing counts -->
    <SequencingHistogram
      v-if="seqCounts && seqCounts.length && x"
      :data="seqCounts"
      :xInput="x"
      :width="width"
      :svgTitle="title"
      :margin="marginHist"
      :mutationName="mutationName"
      className="lineages-by-location"
      :onlyTotals="onlyTotals"
      detectedColor="#79706E"
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
      <div v-if="tooltipTotal" class="d-flex align-items-center">
        Total found:
        <b id="proportion" class="ml-1" />
      </div>
      <div v-else class="d-flex align-items-center">
        Prevalence in the last {{ recentWindow }} days:
        <b id="proportion" class="ml-1" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { max, min, extent } from 'd3-array';
import { axisLeft, axisBottom } from 'd3-axis';
import { brushX } from 'd3-brush';
import { format } from 'd3-format';
import { scaleLinear, scaleTime } from 'd3-scale';
import { select, selectAll, event } from 'd3-selection';
import { stack, area, stackOrderInsideOut } from 'd3-shape';
import {
  timeSecond,
  timeMinute,
  timeHour,
  timeDay,
  timeWeek,
  timeMonth,
  timeYear,
} from 'd3-time';
import { timeParse, timeFormat } from 'd3-time-format';
import { transition } from 'd3-transition';
import cloneDeep from 'lodash/cloneDeep';
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
  setWidth: Number,
  mutationName: String,
  xmin: String,
  xmax: String,
  includeToday: {
    type: Boolean,
    default: true,
  },
  routeName: {
    type: String,
    default: 'LocationReport',
  },
  plotTitle: {
    type: String,
    default: 'Lineage prevalence over time',
  },
  onlyTotals: {
    type: Boolean,
    default: true,
  },
  tooltipTotal: {
    type: Boolean,
    default: false,
  },
});

// this.$route
const route = useRoute();
// this.$router
const router = useRouter();

// dimensions
const margin = ref({
  top: 18,
  bottom: 30,
  left: 85,
  right: 135,
});
const marginHist = ref({
  top: 5,
  bottom: 10,
  left: 85,
  right: 135,
});
const width = ref(null);
const minWidth = ref(450);
const height = ref(500);
// variables
const xVariable = ref('date_time');
// axes
const x = ref(null);
const y = ref(scaleLinear());
const xAxis = ref(null);
const yAxis = ref(null);
const maxDate = ref(null);
const numXTicks = ref(5);
const numYTicks = ref(5);
// methods
const areaF = ref(null); // renamed as areaF; already exist area function in d3 -> avoid duplicated name
const brushF = ref(null);
// data
const series = ref(null);
const lineages = ref(null);
const plottedData = ref(null);
// refs
const svg = ref(null);
const legend = ref(null);
const chart = ref(null);
const brushRef = ref(null);
// controls
const zoomAllowed = ref(false);
const month = ref(6);
const timeOptions = ref([
  { label: '3 months', value: 3 },
  { label: '6 months', value: 6 },
  { label: '1 year', value: 12 },
]);
const isZooming = ref(false);
// missing variables in previous version
const xMax = ref(null);
const xMin = ref(null);
// variables to replace this.$refs
const lineages_by_location = ref(null);
const chartRef = ref(null);
const legendRef = ref(null);
const brushFRef = ref(null);
const xAxisRef = ref(null);
const yAxisRef = ref(null);
const tooltip_streamgraph = ref(null);

const title = computed(() => {
  return `Lineage prevalence over time in ${props.location}`;
});

const countMonth = computed(() => {
  if (props.xmin && props.xmax) {
    return timeMonth.count(new Date(props.xmin), new Date(props.xmax));
  } else {
    return 0;
  }
});

const recent = computed(() => {
  return !!props.recentData;
});

const updateBrush = () => {
  // Update brush so it spans the whole of the area
  brushF.value = brushX()
    .extent([
      [0, 0],
      [
        width.value ? width.value - margin.value.left - margin.value.right : 0,
        height.value - margin.value.top - margin.value.bottom,
      ],
    ])
    .on('end', () => debounceZoom(event));

  brushRef.value.call(brushF.value).on('dblclick', resetZoom);
};

const setDims = () => {
  const svgContainer = document.getElementById('most-recent-lineages');
  let containerWidth = svgContainer ? svgContainer.offsetWidth : 500;
  const pageContainer = document.getElementById('location-report');
  let maxWidth = pageContainer ? pageContainer.offsetWidth : 500;
  const idealWidth = (maxWidth - containerWidth) * 0.95;

  width.value = props.setWidth
    ? props.setWidth
    : idealWidth < minWidth.value || idealWidth > maxWidth
    ? maxWidth * 0.95
    : idealWidth;

  numXTicks.value = width.value < 500 ? 2 : 5;
};

const setupPlot = () => {
  // read in the limits from the route params
  xMin.value = timeParse('%Y-%m-%d')(props.xmin);
  xMax.value = timeParse('%Y-%m-%d')(props.xmax);

  svg.value = select(lineages_by_location.value);
  // legend.value = select(legendRef.value);
  chart.value = select(chartRef.value);
  brushRef.value = select(brushFRef.value);

  areaF.value = area()
    .x((d) => x.value(d.data[xVariable.value]))
    .y0((d) => y.value(d[0]))
    .y1((d) => y.value(d[1]));

  setXScale();
};

const changeXScale = (_month) => {
  month.value = _month;
  isZooming.value = false;
  const newMax = new Date();
  const newMin = timeMonth.offset(newMax, -_month);

  x.value = scaleTime()
    .range([0, width.value - margin.value.left - margin.value.right])
    .domain([newMin, newMax]);

  plottedData.value = cloneDeep(props.data);

  plottedData.value = plottedData.value.filter(
    (d) => d[xVariable.value] >= newMin && d[xVariable.value] <= newMax,
  );

  // reset the axis
  xAxis.value = axisBottom(x.value)
    .ticks(numXTicks.value)
    .tickFormat(function (date) {
      return (
        timeSecond(date) < date
          ? timeFormat('.%L')
          : timeMinute(date) < date
          ? timeFormat(':%S')
          : timeHour(date) < date
          ? timeFormat('%I:%M')
          : timeDay(date) < date
          ? timeFormat('%I %p')
          : timeMonth(date) < date
          ? timeWeek(date) < date
            ? timeFormat('%a %d')
            : timeFormat('%b %d')
          : timeYear(date) < date
          ? timeFormat('%b')
          : timeFormat('%Y')
      )(date);
    });

  select(xAxisRef.value).call(xAxis.value);

  // move the brush
  // this.brushRef.call(this.brush.move, null);
  zoomAllowed.value = false;
  drawPlot();

  // update the url
  updateUrl(newMin, newMax);
};

const setXScale = () => {
  let xDomain;
  if (xMin.value && xMax.value && xMin.value < xMax.value) {
    xDomain = [xMin.value, xMax.value];
  } else {
    if (props.includeToday) {
      const today = new Date();
      maxDate.value = max(props.data, (d) => d[xVariable.value]);
      xDomain = [min(props.data, (d) => d[xVariable.value]), today];
    } else {
      xDomain = extent(props.data.map((d) => d[xVariable.value]));
    }

    if (xMin.value && xMin.value < xDomain[1]) {
      xDomain[0] = xMin.value;
    }

    if (xMax.value && xMax.value > xDomain[0]) {
      xDomain[1] = xMax.value;
    }
  }

  x.value = scaleTime()
    .range([0, width.value - margin.value.left - margin.value.right])
    .domain(xDomain);

  xAxis.value = axisBottom(x.value)
    .tickSizeOuter(0)
    .ticks(numXTicks.value)
    .tickFormat(function (date) {
      return (
        timeSecond(date) < date
          ? timeFormat('.%L')
          : timeMinute(date) < date
          ? timeFormat(':%S')
          : timeHour(date) < date
          ? timeFormat('%I:%M')
          : timeDay(date) < date
          ? timeFormat('%I %p')
          : timeMonth(date) < date
          ? timeWeek(date) < date
            ? timeFormat('%a %d')
            : timeFormat('%b %d')
          : timeYear(date) < date
          ? timeFormat('%b')
          : timeFormat('%Y')
      )(date);
    });

  select(xAxisRef.value).call(xAxis.value);

  plottedData.value = cloneDeep(props.data);

  plottedData.value = plottedData.value.filter(
    (d) => d[xVariable.value] >= xDomain[0] && d[xVariable.value] <= xDomain[1],
  );
};

const updateScales = () => {
  y.value = y.value
    // .range([0, this.height - this.margin.top - this.margin.bottom])
    .range([height.value - margin.value.top - margin.value.bottom, 0])
    .nice()
    .domain([0, 1]);

  lineages.value = Object.keys(props.data[0]).filter(
    (d) => d !== xVariable.value,
  );

  yAxis.value = axisLeft(y.value)
    .tickSizeOuter(0)
    .ticks(numYTicks.value)
    .tickFormat(format('.0%'));

  // stacking
  series.value = stack().keys(lineages.value).order(stackOrderInsideOut)(
    plottedData.value,
  );

  select(yAxisRef.value).call(yAxis.value);
};

const updatePlot = () => {
  if (plottedData.value && props.colorScale) {
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

  chart.value.selectAll('.no-data').style('fill-opacity', 0);

  // turn on the selected region
  chart.value
    .select(`#area_${key.replace(/\./g, '-')}`)
    .style('fill-opacity', 1);

  select(`#${key.replace(/\./g, '-')}`).style('fill-opacity', 1);

  const ttip = select(tooltip_streamgraph.value);

  ttip.select('#lineage').text(key);

  const recentPrev = props.recentData[key];
  if (props.tooltipTotal) {
    if (recentPrev) {
      ttip.select('#proportion').text(format(',')(recentPrev));
    } else {
      ttip.select('#proportion').text('');
    }
  } else {
    if (recentPrev) {
      ttip
        .select('#proportion')
        .text(recentPrev < 0.005 ? '< 0.5%' : format('.0%')(recentPrev));
    } else {
      ttip.select('#proportion').text('Grouped into "other" category');
    }
  }

  // fix location
  ttip
    .style('left', `${event.clientX + ttipShift}px`)
    .style('top', `${event.clientY + ttipShift}px`)
    .style('display', 'block');
};

const tooltipOff = () => {
  chart.value.selectAll('.no-data').style('fill-opacity', 1);

  chart.value
    .selectAll('.stacked-area-chart')
    .style('stroke', '#555')
    .style('fill-opacity', 1);

  selectAll('.stacked-bar-chart').style('fill-opacity', 1);

  select(tooltip_streamgraph.value).style('display', 'none');
};

const zoom = (evt) => {
  isZooming.value = true;
  // reset domain to new coords
  const selection = evt.selection;

  if (selection) {
    const newMin = x.value.invert(selection[0]);
    const newMax = x.value.invert(selection[1]);

    x.value = scaleTime()
      .range([0, width.value - margin.value.left - margin.value.right])
      .domain([newMin, newMax]);

    plottedData.value = cloneDeep(props.data);

    plottedData.value = plottedData.value.filter(
      (d) => d[xVariable.value] >= newMin && d[xVariable.value] <= newMax,
    );

    // reset the axis
    xAxis.value = axisBottom(x.value).ticks(numXTicks.value);

    select(xAxisRef.value).call(xAxis.value);

    // move the brush
    brushRef.value.call(brushF.value.move, null);
    zoomAllowed.value = false;
    drawPlot();

    // update the url
    updateUrl(newMin, newMax);
  }
};

const updateUrl = (newMin, newMax) => {
  const queryParams = route.query;
  if (props.routeName === 'MutationReport') {
    const params = route.params;
    router.push({
      name: props.routeName,
      state: {
        disableScroll: true,
      },
      params: { alias: params.alias },
      query: {
        xmin: timeFormat('%Y-%m-%d')(newMin),
        xmax: timeFormat('%Y-%m-%d')(newMax),
        loc: queryParams.loc,
        muts: queryParams.muts,
        pango: queryParams.pango,
        selected: queryParams.selected,
      },
    });
  } else if (props.routeName === 'GenomicsEmbedVariant') {
    const params = route.params;
    router.push({
      name: 'GenomicsEmbed',
      state: {
        disableScroll: true,
      },
      query: {
        type: 'var',
        alias: queryParams.alias,
        xmin: timeFormat('%Y-%m-%d')(newMin),
        xmax: timeFormat('%Y-%m-%d')(newMax),
        loc: queryParams.loc,
        muts: queryParams.muts,
        pango: queryParams.pango,
        selected: queryParams.selected,
      },
    });
  } else if (props.routeName === 'LocationReport') {
    router.push({
      name: 'LocationReport',
      state: {
        disableScroll: true,
      },
      query: {
        xmin: timeFormat('%Y-%m-%d')(newMin),
        xmax: timeFormat('%Y-%m-%d')(newMax),
        loc: queryParams.loc,
        muts: queryParams.muts,
        alias: queryParams.alias,
        pango: queryParams.pango,
        variant: queryParams.variant,
        selected: queryParams.selected,
      },
    });
  } else if (props.routeName === 'GenomicsEmbedLocation') {
    router.push({
      name: 'GenomicsEmbed',
      state: {
        disableScroll: true,
      },
      query: {
        var: 'loc',
        xmin: timeFormat('%Y-%m-%d')(newMin),
        xmax: timeFormat('%Y-%m-%d')(newMax),
        loc: queryParams.loc,
        muts: queryParams.muts,
        alias: queryParams.alias,
        pango: queryParams.pango,
        variant: queryParams.variant,
        selected: queryParams.selected,
      },
    });
  }
};

const resetZoom = () => {
  brushRef.value.call(brushF.value.move, null);
  const queryParams = route.query;

  xMin.value = null;
  xMax.value = null;
  month.value = 0;
  isZooming.value = false;
  setXScale();

  if (props.routeName === 'MutationReport') {
    const params = route.params;
    router.push({
      name: props.routeName,
      state: {
        disableScroll: true,
      },
      params: { alias: params.alias },
      query: {
        loc: queryParams.loc,
        muts: queryParams.muts,
        pango: queryParams.pango,
        selected: queryParams.selected,
      },
    });
  } else if (props.routeName === 'GenomicsEmbedVariant') {
    const params = route.params;
    router.push({
      name: 'GenomicsEmbed',
      state: {
        disableScroll: true,
      },
      query: {
        type: 'var',
        alias: queryParams.alias,
        loc: queryParams.loc,
        muts: queryParams.muts,
        pango: queryParams.pango,
        selected: queryParams.selected,
      },
    });
  } else if (props.routeName === 'LocationReport') {
    router.push({
      name: 'LocationReport',
      state: {
        disableScroll: true,
      },
      query: {
        loc: queryParams.loc,
        muts: queryParams.muts,
        alias: queryParams.alias,
        pango: queryParams.pango,
        variant: queryParams.variant,
        selected: queryParams.selected,
      },
    });
  } else if (props.routeName === 'GenomicsEmbedLocation') {
    router.push({
      name: 'GenomicsEmbed',
      state: {
        disableScroll: true,
      },
      query: {
        type: 'loc',
        loc: queryParams.loc,
        muts: queryParams.muts,
        alias: queryParams.alias,
        pango: queryParams.pango,
        variant: queryParams.variant,
        selected: queryParams.selected,
      },
    });
  }

  updatePlot();
  isZooming.value = false;
};

const enableZoom = () => {
  zoomAllowed.value = true;
};

const drawPlot = () => {
  if (props.includeToday) {
    const noDataSelector = chart.value.selectAll('.no-data').data([0]);

    noDataSelector.join(
      (enter) => {
        enter
          .append('rect')
          .attr('class', 'no-data')
          .attr('x', 0)
          .attr(
            'width',
            width.value
              ? width.value - margin.value.left - margin.value.right
              : 0,
          )
          .attr('height', height.value - margin.value.top - margin.value.bottom)
          .style('fill', 'url(#diagonalHatchLight)');
      },
      (update) => {
        update
          .attr('x', 0)
          .attr(
            'width',
            width.value
              ? width.value - margin.value.left - margin.value.right
              : 0,
          )
          .attr('height', height.value - margin.value.top - margin.value.bottom)
          .style('fill', 'url(#diagonalHatchLight)');
      },
      (exit) =>
        exit.call((exit) => exit.transition().style('opacity', 1e-5).remove()),
    );
  }

  const areaSelector = chart.value
    .selectAll('.stacked-area-chart')
    .data(series.value);

  areaSelector.join(
    (enter) => {
      const selector = enter
        .append('path')
        .attr('fill', ({ key }) => props.colorScale(key))
        .attr('class', 'stacked-area-chart')
        .classed('pointer', ({ key }) => key.toLowerCase() !== 'other')
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
  if (props.recentMin) {
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
          .style(
            'font-family',
            "'DM Sans', Avenir, Helvetica, Arial, sans-serif",
          )
          .style('dominant-baseline', 'text-top')
          .style('font-size', '14px');
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
  }

  chart.value
    .selectAll('.stacked-area-chart')
    .on('mousemove', ({ key }) => tooltipOn(key))
    .on('click', ({ key }) => route2Mutation(key))
    .on('mouseleave', tooltipOff);
};

const route2Mutation = (d) => {
  if (d.toLowerCase() !== 'other') {
    const queryParams = route.query;
    console.log(props.routeName);
    if (props.routeName.includes('GenomicsEmbed')) {
      router.push({
        name: 'GenomicsEmbed',
        query: {
          type: 'var',
          pango: d,
          loc: queryParams.loc,
          selected: queryParams.loc,
        },
      });
    } else {
      const selected =
        props.routeName === 'LocationReport'
          ? queryParams.loc
          : queryParams.selected;
      router.push({
        name: 'MutationReport',
        query: {
          pango: d,
          loc: queryParams.loc,
          selected: selected,
        },
      });
    }
  }
};

watch(width, () => {
  setXScale();
  updateBrush();
  updatePlot();
});

watch(
  () => props.data,
  () => {
    xMin.value = timeParse('%Y-%m-%d')(props.xmin);
    xMax.value = timeParse('%Y-%m-%d')(props.xmax);
    setXScale();
    updatePlot();
  },
  { deep: true },
);

watch(
  () => props.xmin,
  () => {
    xMin.value = timeParse('%Y-%m-%d')(props.xmin);
    xMax.value = timeParse('%Y-%m-%d')(props.xmax);
    setXScale();
    updatePlot();
  },
);

watch(
  () => props.xmax,
  () => {
    xMin.value = timeParse('%Y-%m-%d')(props.xmin);
    xMax.value = timeParse('%Y-%m-%d')(props.xmax);
    setXScale();
    updatePlot();
  },
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
  if (!props.xmin && !props.xmax) {
    changeXScale(6);
  }
});
</script>

<style lang="scss">
.lineages-by-location {
  .axis--x text {
    font-size: 16px;
    @media (max-width: 812px) {
      font-size: 12px;
    }
    @media (min-width: 812px) {
      font-size: 12px;
    }
    @media (min-width: 900px) {
      font-size: 14px;
    }
    @media (min-width: 1000px) {
      font-size: 14px;
    }
    @media (min-width: 1200px) {
      font-size: 16px;
    }
    @media (min-width: 1310px) {
      font-size: 16px;
    }
  }

  .axis--y text {
    font-size: 12px;
  }

  .stream-axis.axis--y text {
    font-size: 16px;
  }
}
.suggest-note {
  display: inline-block;
}
</style>
