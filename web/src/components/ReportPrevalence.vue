<template>
  <div
    id="report-prevalence"
    class="d-flex flex-column align-items-center w-100"
  >
    <!-- zoom btns -->
    <div class="d-flex justify-content-start" :style="{ width: width + 'px' }">
      <button
        class="btn btn-accent-flat text-highlight d-flex align-items-center m-0 p-2 mr-2"
        @click="enableZoom"
      >
        <font-awesome-icon class="text-right" :icon="['fas', 'search-plus']" />
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

    <div class="d-flex flex-column">
      <!-- LEGEND -->
      <div id="legend" class="d-flex flex-column mt-3">
        <!-- legend: rolling average -->
        <div class="d-flex">
          <svg width="15" height="15" class="mr-2">
            <line x1="0" x2="15" y1="8" y2="8" class="trace-legend" />
          </svg>
          <small class="text-muted">
            7 day rolling average of percent of {{ mutationName }}-positive
            sequences
          </small>
        </div>

        <!-- legend: confidence interval -->
        <div class="d-flex align-items-center mb-3">
          <div class="ci-legend mr-2" :style="{ background: CIColor }" />
          <small class="text-muted">95% confidence interval</small>
          <svg width="15" height="15" class="ml-4 mr-2">
            <rect
              x="0"
              y="0"
              :width="15"
              :height="15"
              fill="url(#diagonalHatchLight)"
            />
          </svg>
          <small class="text-muted">missing recent data</small>
        </div>
      </div>

      <!-- SVGs -->
      <div
        id="report-prevalence-svg"
        class="d-flex flex-column align-items-start mt-2"
      >
        <!-- TIME TRACE -->
        <svg
          ref="svgRef"
          :width="width"
          :height="height"
          class="prevalence-curve"
          :name="title"
        >
          <defs>
            <marker
              id="arrow"
              markerWidth="13"
              markerHeight="10"
              refX="10"
              refY="5"
              orient="auto"
              markerUnits="strokeWidth"
              stroke="#929292"
              fill="none"
            >
              <path d="M5,0 L12,5 L5,10" class="swoopy-arrowhead" />
            </marker>

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
            ref="xAxisRef"
            :transform="`translate(${margin.left}, ${height - margin.bottom})`"
            class="prevalence-axis axis--x"
          />
          <g
            ref="yAxisRef"
            :transform="`translate(${margin.left}, ${margin.top})`"
            class="prevalence-axis axis--y"
          />
          <g
            ref="chartRef"
            :transform="`translate(${margin.left}, ${margin.top})`"
          />
          <g v-if="!data.length" id="no-data">
            <text
              font-size="24px"
              fill="#888888"
              :x="width / 2"
              :y="height / 2 - margin.top"
              dominant-baseline="middle"
              text-anchor="middle"
            >
              No sequences found
            </text>
          </g>
          <g v-if="data.length < lengthThreshold && data.length" id="no-data">
            <text
              font-size="24px"
              fill="#888888"
              :x="width / 2"
              :y="height / 2 - margin.top"
              dominant-baseline="middle"
              text-anchor="middle"
            >
              Two points may make a line, but it's not very informative.
            </text>
            <text
              font-size="24px"
              fill="#888888"
              transform="translate(0, 28)"
              :x="width / 2"
              :y="height / 2 - margin.top"
              dominant-baseline="middle"
              text-anchor="middle"
            >
              {{ location }} only has {{ data.length }}
              {{ data.length === 1 ? 'date' : 'dates' }} with sequencing data
            </text>
          </g>
          <g
            id="weird-last values"
            :class="{ hidden: data.length < lengthThreshold }"
          >
            <text
              :x="width - margin.right"
              :y="-1"
              fill="#929292"
              font-size="13px"
              dominant-baseline="hanging"
              text-anchor="end"
              :style="`font-family: ${fontFamily};`"
            >
              Latest dates are noisy due to fewer samples, or missing from
              sequencing delays
            </text>
            <path
              stroke="#BBBBBB"
              fill="none"
              :d="`M ${width - margin.right - 75} 20 c 10 10, 20 20, 50 20`"
              marker-end="url(#arrow)"
            />
          </g>
          <g
            v-if="data"
            id="brush-zoom"
            ref="brush_ref"
            class="brush"
            :transform="`translate(${margin.left},${margin.top})`"
            :class="{ hidden: !zoomAllowed }"
          />
        </svg>

        <SequencingHistogram
          :data="data"
          :xInput="x"
          :width="width"
          :svgTitle="title"
          :margin="margin"
          :mutationName="mutationName"
          className="prevalence-curve prevalence-curve-counts"
        />
      </div>
    </div>

    <!-- TOOLTIPS -->
    <div
      id="tooltip-prevalence"
      ref="tooltip_prevalence"
      class="tooltip-basic box-shadow"
    >
      <h5 id="date" />
      <div class="d-flex align-items-center">
        <b id="proportion" class="font-size-2" />
        <span id="confidence-interval" class="text-muted ml-2" />
      </div>

      <div id="sequencing-count" />
      <div id="sequencing-count-rolling" />
    </div>

    <DownloadReportData
      :data="data"
      figureRef="prevalence-curve"
      :isVertical="true"
      dataType="Mutation Report Prevalence over Time"
    />
  </div>
</template>

<script setup>
import { ref, inject, computed, watch, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { min, max, extent } from 'd3-array';
import { axisLeft, axisBottom } from 'd3-axis';
import { brushX } from 'd3-brush';
import { format } from 'd3-format';
import { select, selectAll, event } from 'd3-selection';
import { scaleLinear, scaleTime } from 'd3-scale';
import { line, area } from 'd3-shape';
import {
  timeSecond,
  timeMinute,
  timeHour,
  timeDay,
  timeWeek,
  timeMonth,
  timeYear,
} from 'd3-time';
import { timeFormat, timeParse } from 'd3-time-format';
import { transition } from 'd3-transition';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';

import { lazyLoad } from '@/js/lazy-load';

const SequencingHistogram = lazyLoad('SequencingHistogram');
const DownloadReportData = lazyLoad('DownloadReportData');

const props = defineProps({
  data: Array,
  mutationName: String,
  location: String,
  xmin: String,
  xmax: String,
  setWidth: Number,
  includeToday: {
    type: Boolean,
    default: true,
  },
  routeName: {
    type: String,
    default: 'MutationReport',
  },
});

// instead of this.$router
const router = useRouter();
// instead of this.$route
const route = useRoute();

const width = ref(400);
const height = ref(400);
const margin = ref({
  top: 10,
  bottom: 40,
  left: 85,
  right: 135,
});
const lengthThreshold = ref(5);
const CIColor = ref('#df4ab7');
const fontFamily = ref("'DM Sans', Avenir, Helvetica, Arial, sans-serif;");
// data
const plottedData = ref(null);
// variables
const xVariable = ref('dateTime');
const yVariable = ref('proportion');
// axes
const x = ref(null);
const y = ref(scaleLinear());
const xAxis = ref(null);
const yAxis = ref(null);
const maxDate = ref(null);
const numXTicks = ref(5);
const numYTicks = ref(6);
// methods
const lineF = ref(null);
const areaF = ref(null);
const brush = ref(null);
// zoom
const zoomAllowed = ref(false);
// refs
const svg = ref(null);
const brushRef = ref(null);
const chart = ref(null);
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
const svgRef = ref(null);
const chartRef = ref(null);
const brush_ref = ref(null);
const xAxisRef = ref(null);
const yAxisRef = ref(null);
const tooltip_prevalence = ref(null);

// computed variables
const title = computed(() => {
  return props.location === 'Worldwide'
    ? `${props.mutationName} prevalence over time worldwide`
    : `${props.mutationName} prevalence over time in ${props.location}`;
});

const countMonth = computed(() => {
  if (props.xmin && props.xmax) {
    return timeMonth.count(new Date(props.xmin), new Date(props.xmax));
  } else {
    return 0;
  }
});

const setDims = () => {
  const mx = 0.7;
  const my = 0.9;
  const hwRatio = 0.525;
  if (!props.setWidth) {
    const svgContainer = document.getElementById('report-prevalence');

    let maxWidth = svgContainer ? svgContainer.offsetWidth : 800;
    maxWidth = maxWidth < 500 ? maxWidth * 0.98 : maxWidth * mx;
    const maxHeight = window.innerHeight * my;

    const idealHeight = hwRatio * maxWidth;
    if (idealHeight <= maxHeight) {
      height.value = idealHeight;
      width.value = maxWidth;
    } else {
      height.value = maxHeight;
      width.value = height.value / hwRatio;
    }
  } else {
    width.value = props.setWidth;
    height.value = hwRatio * width.value;
  }

  if (width.value < 600) {
    numXTicks.value = 2;
    numYTicks.value = 4;
  } else if (width.value < 1000) {
    numXTicks.value = 4;
    numYTicks.value = 5;
  } else {
    numXTicks.value = 6;
    numYTicks.value = 5;
  }
};

const setupPlot = () => {
  // read in the limits from the route params
  xMin.value = timeParse('%Y-%m-%d')(props.xmin);
  xMax.value = timeParse('%Y-%m-%d')(props.xmax);

  svg.value = select(svgRef.value);
  chart.value = select(chartRef.value);
  brushRef.value = select(brush_ref.value);

  // estimate
  lineF.value = line()
    .x((d) => x.value(d[xVariable.value]))
    .y((d) => y.value(d[yVariable.value]));

  // confidence interval area method
  areaF.value = area()
    .x((d) => x.value(d[xVariable.value]))
    .y0((d) => y.value(d.proportion_ci_lower))
    .y1((d) => y.value(d.proportion_ci_upper));

  setXScale();
};

const changeXScale = (_month) => {
  isZooming.value = false;
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
  updatePlot();

  // update the url
  updateUrl(newMin, newMax);
};

const setXScale = () => {
  let xDomain;

  if (xMin.value && xMax.value && xMin.value < xMax.value) {
    xDomain = [xMin.value, xMax.value];
    maxDate.value = max(props.data, (d) => d[xVariable.value]);
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

  plottedData.value = cloneDeep(props.data);

  plottedData.value = plottedData.value.filter(
    (d) => d[xVariable.value] >= xDomain[0] && d[xVariable.value] <= xDomain[1],
  );
};

const updateScales = () => {
  const avgMax = max(plottedData.value, (d) => d[yVariable.value]);
  const CIMax = max(plottedData.value, (d) => d.proportion_ci_upper);

  y.value = y.value
    .range([height.value - margin.value.top - margin.value.bottom, 0])
    .nice()
    .domain([0, (avgMax + CIMax) * 0.5]);
  // .domain([0, max(this.data, d => d[this.yVariable])])

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

  const yTickFormat = y.value.domain()[1] < 0.02 ? '.1%' : '.0%';

  yAxis.value = axisLeft(y.value)
    .tickSizeOuter(0)
    .ticks(numYTicks.value)
    .tickFormat(format(yTickFormat));

  select(yAxisRef.value).call(yAxis.value);
};

const tooltipOn = () => {
  const ttipShift = 20;

  // find the closest date
  const selectedX = x.value.invert(event.offsetX - margin.value.left);
  const selectedDate = timeDay.round(selectedX);
  const selected = plottedData.value.filter(
    (d) => Math.abs(d.dateTime - selectedDate) < 1e-12,
  );

  if (selected.length) {
    // tooltip on
    const ttip = select(tooltip_prevalence.value);

    // edit text
    ttip.select('h5').text(selected[0].date);

    ttip.select('#proportion').text(format('.0%')(selected[0].proportion));
    ttip
      .select('#confidence-interval')
      .text(
        `(95% CI: ${format('.0%')(selected[0].proportion_ci_lower)}-${format(
          '.0%',
        )(selected[0].proportion_ci_upper)})`,
      );
    ttip
      .select('#sequencing-count')
      .text(
        `Number of cases: ${format(',')(selected[0].lineage_count)}/${format(
          ',',
        )(selected[0].total_count)}`,
      );
    ttip
      .select('#sequencing-count-rolling')
      .text(
        `Rolling average: ${format(',.1f')(
          selected[0].lineage_count_rolling,
        )}/${format(',.1f')(selected[0].total_count_rolling)}`,
      );

    // fix location
    ttip
      .style('left', `${event.clientX + ttipShift}px`)
      .style('top', `${event.clientY + ttipShift}px`)
      .style('display', 'block');

    // histogram off/on
    selectAll('.raw-counts').style('opacity', 0.3);

    selectAll(`#date${selected[0].date}`).style('opacity', 1);
  }
};

const tooltipOff = () => {
  select(tooltip_prevalence.value).style('display', 'none');

  selectAll('.raw-counts').style('opacity', 1);
};

const updatePlot = () => {
  const t1 = transition().duration(2500);

  if (plottedData.value) {
    updateScales();

    // hash to highlight the gap between today
    if (props.includeToday) {
      const noDataSelector = chart.value.selectAll('.no-data').data([0]);
      noDataSelector.join(
        (enter) => {
          enter
            .append('rect')
            .attr('class', 'no-data')
            .attr('x', x.value(maxDate.value))
            .attr(
              'width',
              width.value -
                margin.value.left -
                margin.value.right -
                x.value(maxDate.value),
            )
            .attr(
              'height',
              height.value - margin.value.top - margin.value.bottom,
            )
            .style('fill', 'url(#diagonalHatchLight)');
        },
        (update) => {
          update
            .attr(
              'height',
              height.value - margin.value.top - margin.value.bottom,
            )
            .style('fill', 'url(#diagonalHatchLight)')
            .transition(100)
            .attr('x', x.value(maxDate.value))
            .attr(
              'width',
              width.value -
                margin.value.left -
                margin.value.right -
                x.value(maxDate.value),
            );
        },
        (exit) =>
          exit.call((exit) =>
            exit.transition().style('opacity', 1e-5).remove(),
          ),
      );
    }

    const CISelector = chart.value
      .selectAll('.confidence-interval')
      .data([plottedData.value]);

    CISelector.join(
      (enter) => {
        enter
          .append('path')
          .attr('class', 'confidence-interval')
          .style('fill', CIColor.value)
          .style('fill-opacity', 0.3)
          .attr('d', areaF.value);
      },
      (update) =>
        update
          // .transition(t1)
          .attr('d', areaF.value),
      (exit) =>
        exit.call((exit) => exit.transition().style('opacity', 1e-5).remove()),
    );

    const pathSelector = chart.value
      .selectAll('.prevalence-line')
      .data([plottedData.value]);

    pathSelector.join(
      (enter) => {
        enter
          .append('path')
          .attr('class', 'prevalence-line')
          .style('stroke', '#2c3e50')
          .style('fill', 'none')
          .style('stroke-width', '2.5')
          .datum((d) => d)
          .attr('d', lineF.value);
      },
      // update
      (update) =>
        update
          .datum((d) => d)
          // .transition(t1)
          .attr('d', lineF.value),

      // exit
      (exit) =>
        exit.call((exit) => exit.transition().style('opacity', 1e-5).remove()),
    );

    // event listener for tooltips
    chart.value
      .selectAll('.confidence-interval')
      .on('mousemove', () => tooltipOn())
      .on('mouseleave', () => tooltipOff());
  }
};

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

const zoom = (evt, ref) => {
  isZooming.value = true;
  // reset domain to new coords
  const selection = evt.selection;

  if (selection) {
    const newMin = x.value.invert(selection[0]);
    const newMax = x.value.invert(selection[1]);

    x.value = scaleTime()
      .range([0, width.value - margin.value.left - margin.value.right])
      .domain([newMin, newMax]);

    // update plotted data
    plottedData.value = cloneDeep(props.data);
    plottedData.value = plottedData.value.filter(
      (d) => d[xVariable.value] >= newMin && d[xVariable.value] <= newMax,
    );

    // move the brush
    brushRef.value.call(brush.value.move, null);
    zoomAllowed.value = false;
    updatePlot();

    // update route
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
  }
};

const resetZoom = () => {
  brushRef.value.call(brush.value.move, null);
  const queryParams = route.query;
  const params = route.params;

  xMin.value = null;
  xMax.value = null;
  isZooming.value = false;
  month.value = 0;
  isZooming.value = false;
  setXScale();

  if (props.routeName === 'MutationReport') {
    router.push({
      name: props.routeName,
      state: {
        disableScroll: true,
        alias: params.alias,
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
  }

  updatePlot();
};

const enableZoom = () => {
  zoomAllowed.value = true;
};

watch(width, () => {
  setXScale();
  updateBrush();
  updatePlot();
});

watch(
  () => props.setWidth,
  () => {
    setDims();
  },
);

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
  if (!props.setWidth) {
    nextTick(() => {
      window.addEventListener('resize', debounceSetDims);
    });
    updateBrush();
  }
  // set initial dimensions for the plots.
  setDims();
  setupPlot();
  updatePlot();
  if (!props.xmin && !props.xmax) {
    changeXScale(6);
  }
});
</script>

<style lang="scss">
#report-prevalence-svg {
  & .mutation-axis,
  & .prevalence-axis {
    font-size: 16px;
    @media (max-width: 664px) {
      font-size: 12px;
    }
    @media (min-width: 664px) {
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
    text {
      fill: $grey-90;
    }
  }
}

.ci-legend {
  width: 15px;
  height: 15px;
  opacity: 0.3;
}

.no-data-legend {
  width: 15px;
  height: 15px;
  opacity: 0.3;
}

.trace-legend {
  stroke: $base-grey;
  stroke-width: 2.5;
}
</style>
