<template>
  <div
    id="location-report-prevalence"
    class="d-flex flex-column align-items-center w-100"
  >
    <div class="d-flex flex-column">
      <!-- SVGs -->
      <div class="d-flex flex-column align-items-start">
        <!-- TIME TRACE -->
        <div class="d-flex w-100 justify-content-between mt-3 mb-2">
          <h5 class="p-0 m-0">
            {{ title }}
          </h5>
        </div>

        <!-- zoom btns -->
        <div
          class="d-flex justify-content-start ml-0 mt-2 mb-2"
          :style="{ width: width + 'px' }"
        >
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
            class="btn btn-accent-outline timeline-btn text-highlight d-flex align-items-center m-0 p-2"
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

        <div class="d-flex mt-2">
          <svg width="15" height="15" class="mr-2">
            <line x1="0" x2="15" y1="8" y2="8" class="trace-legend" />
          </svg>
          <small class="text-muted">
            7 day rolling average of percent sequences with mutation(s)
          </small>
        </div>

        <!-- legend: confidence interval -->
        <div class="d-flex mb-2">
          <div class="ci-legend mr-2" :style="{ background: '#999' }" />
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

        <div class="d-flex mb-4">
          <label class="b-contain m-auto pr-3">
            <small>show confidence intervals</small>
            <input
              v-model="showCI"
              type="checkbox"
              :value="showCI"
              @change="hideCIs"
            />
            <div class="b-input" />
          </label>
        </div>

        <svg
          ref="svgRef"
          :width="width"
          :height="height"
          class="mutation-epi-prevalence"
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
            class="mutation-axis axis--x"
          />
          <g
            ref="yAxisRef"
            :transform="`translate(${margin.left}, ${margin.top})`"
            class="mutation-axis axis--y"
          />
          <g
            ref="chartRef"
            :transform="`translate(${margin.left}, ${margin.top})`"
          />
          <g
            v-if="data"
            id="brush2-zoom"
            ref="brush2"
            class="brush"
            :transform="`translate(${margin.left},${margin.top})`"
            :class="{ hidden: !zoomAllowed }"
          />
          <g v-if="noData" id="no-data">
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
          <!-- <g id="no-data" v-if="data.length < lengthThreshold && data.length">
          <text font-size="24px" fill="#888888" :x="width/2" :y="height/2 - margin.top" dominant-baseline="middle" text-anchor="middle">Two points may make a line, but it's not very informative.</text>
          <text font-size="24px" fill="#888888" transform="translate(0, 28)" :x="width/2" :y="height/2 - margin.top" dominant-baseline="middle" text-anchor="middle">{{location}} only has {{data.length}} {{data.length === 1 ? "date" : "dates"}} with
            sequencing data</text>
        </g> -->
          <g
            id="weird-last values"
            :class="{ hidden: data && data.length < lengthThreshold }"
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
        </svg>

        <!-- Histogram of sequencing counts -->
        <SequencingHistogram
          v-if="seqCounts && seqCounts.length"
          :data="seqCounts"
          :xInput="x"
          :width="width"
          :svgTitle="title"
          :margin="marginHist"
          :mutationName="mutationName"
          :onlyTotals="onlyTotals"
          notDetectedColor="#bab0ab"
          detectedColor="#79706E"
          className="mutation-epi-prevalence"
        />

        <!-- EPI TRACE -->
        <div class="mt-5" :class="{ hidden: !epi.length }">
          <h5 class="">
            Daily COVID-19 cases in
            <router-link
              :to="{ name: 'Epidemiology', query: { location: locationID } }"
            >
              {{ locationName }}
            </router-link>
          </h5>

          <!-- zoom btns -->
          <div
            class="d-flex justify-content-start mt-3 mb-3"
            :style="{ width: width + 'px' }"
            :class="{ hidden: !epi.length }"
          >
            <button
              class="btn btn-accent-flat text-highlight d-flex align-items-start m-0 p-2"
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
                'time-btn-active':
                  beforeTime.value === countMonth && !isZooming,
              }"
              @click="changeXScale(beforeTime.value)"
            >
              {{ beforeTime.label }}
            </button>
            <button
              class="btn btn-accent-outline timeline-btn text-highlight d-flex align-items-center m-0 p-2"
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

          <div class="d-flex mt-3 mb-4">
            <svg width="15" height="15" class="mr-2">
              <line x1="0" x2="15" y1="8" y2="8" class="trace-legend" />
            </svg>
            <small class="text-muted">
              7 day rolling average of confirmed cases
            </small>
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

          <svg
            ref="epiRef"
            :width="width"
            :height="epiHeight"
            class="mutation-epi-prevalence"
            :name="title"
          >
            <g
              ref="xEpiAxis"
              :transform="`translate(${margin.left}, ${
                epiHeight - margin.bottom
              })`"
              class="epi-axis epi-x axis--x"
            />
            <g
              ref="yEpiAxisRef"
              :transform="`translate(${margin.left}, ${margin.top})`"
              class="epi-axis epi-y axis--y"
            />
            <g
              ref="epiChartRef"
              :transform="`translate(${margin.left}, ${margin.top})`"
            />
            <g
              v-if="data"
              id="brush-zoom"
              ref="brush1"
              class="brush"
              :transform="`translate(${margin.left},${margin.top})`"
              :class="{ hidden: !zoomAllowed }"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- TOOLTIPS -->
    <div
      id="tooltip-mutations"
      ref="tooltip_mutations"
      class="tooltip-basic box-shadow"
    >
      <h5 id="mutation" class="p-2 m-0" />
      <small id="sublineages" class="line-height-sm" />
    </div>
    <!-- <div ref="tooltip_prevalence" class="tooltip-basic box-shadow" id="tooltip-prevalence">
    <h5 id="date"></h5>
    <div class="d-flex align-items-center">
      <b id="proportion" class="font-size-2"></b>
      <span id="confidence-interval" class="text-muted ml-2"></span>
    </div>

    <div id="sequencing-count"></div>
    <div id="sequencing-count-rolling"></div>
  </div> -->

    <DownloadReportData
      :data="data"
      figureRef="mutation-epi-prevalence"
      :isVertical="true"
      dataType="Mutation Report Prevalence over Time"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { max, extent, map } from 'd3-array';
import { axisLeft, axisBottom } from 'd3-axis';
import { brushX } from 'd3-brush';
import { format } from 'd3-format';
import { forceY, forceCollide, forceSimulation } from 'd3-force';
import { scaleLinear, scaleTime, scaleOrdinal } from 'd3-scale';
import { select, selectAll, event } from 'd3-selection';
import { area, line } from 'd3-shape';
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

const DownloadReportData = lazyLoad('DownloadReportData');
const SequencingHistogram = lazyLoad('SequencingHistogram');

const props = defineProps({
  data: Array,
  seqCounts: Array,
  epi: Array,
  locationName: String,
  locationID: String,
  setWidth: Number,
  xmin: String,
  xmax: String,
  setColorScale: Function,
  mutationName: String,
  includeToday: {
    type: Boolean,
    default: true,
  },
  routeName: {
    type: String,
    default: 'LocationReport',
  },
  onlyTotals: {
    type: Boolean,
    default: true,
  },
});

// instead of this.$router
const router = useRouter();
// instead of this.$route
const route = useRoute();

const width = ref(800);
const height = ref(400);
const epiHeight = ref(300);
const margin = ref({
  top: 15,
  bottom: 25,
  left: 85,
  right: 135,
});
const marginHist = ref({
  top: 7,
  bottom: 7,
  left: 85,
  right: 110,
});

const lengthThreshold = ref(1);
const showCI = ref(true);
const fontFamily = ref("'DM Sans', Avenir, Helvetica, Arial, sans-serif;");
// variables
const xVariable = ref('dateTime');
const fillVariable = ref('label');
const xEpiVariable = ref('date');
const yVariable = ref('proportion');
const yEpiVariable = ref('confirmed_rolling');
// axes
const x = ref(scaleTime());
const y = ref(scaleLinear());
const yEpi = ref(scaleLinear());
const colorScale = ref(
  scaleOrdinal([
    '#4E79A7', // dk blue
    '#f28e2b', // orange
    '#59a14f', // green
    '#e15759', // red
    '#499894', // teal
    '#F1CE63', // yellow
    '#D37295', // dk pink
    '#B07AA1', // dk purple
    '#9D7660', // brown
    '#bcbd22', // puce,
    '#79706E',
    '#aecBe8', // lt blue
    '#FFBE7D', // lt. orange
    '#8CD17D', // lt. green
    '#FF9D9A', // lt. red
    '#86BCB6', // lt. teal
    '#B6992D', // dk yellow
    '#FABFD2', // lt. pink,
    '#D4A6C8', // lt. purple
    '#D7B5A6', // lt. brown
  ]),
);

const xMin = ref(null);
const xMax = ref(null);
const maxDate = ref(null);
const maxEpiDate = ref(null);
const today = ref(null);
const xAxis = ref(null);
const yAxis = ref(null);
const yEpiAxis = ref(null);
const numXTicks = ref(5);
const numYTicks = ref(6);
const zoomAllowed = ref(false);
const plottedData = ref(null);
const plottedEpi = ref(null);
// methods
const lineF = ref(null);
const epiLine = ref(null);
const areaF = ref(null);
const brush = ref(null);
// refs
const svg = ref(null);
const chart = ref(null);
const epiChart = ref(null);
const counts = ref(null);
const brushRef = ref(null);
const brushRef2 = ref(null);
const month = ref(6);
const timeOptions = ref([
  { label: '3 months', value: 3 },
  { label: '6 months', value: 6 },
  { label: '1 year', value: 12 },
]);
const isZooming = ref(false);
// this.$refs
const svgRef = ref(null);
const chartRef = ref(null);
const epiChartRef = ref(null);
const countsRef = ref(null);
const brush1 = ref(null);
const brush2 = ref(null);
const xAxisRef = ref(null);
const yAxisRef = ref(null);
const yEpiAxisRef = ref(null);
const xEpiAxis = ref(null);
const tooltip_mutations = ref(null);

// computed variables
const noData = computed(() => {
  return props.data.flatMap((d) => d.data).length === 0;
});

const title = computed(() => {
  return props.locationName === 'Worldwide'
    ? `Mutation and case prevalence over time worldwide`
    : `Mutation and case prevalence over time in ${props.locationName}`;
});

const countMonth = computed(() => {
  if (props.xmin && props.xmax) {
    return timeMonth.count(new Date(props.xmin), new Date(props.xmax));
  } else {
    return 0;
  }
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

  brushRef2.value.call(brush.value).on('dblclick', resetZoom);
};

const setDims = () => {
  const mx = 0.85;
  const my = 0.4;
  const hwRatio = 0.4;
  if (!props.setWidth) {
    const svgContainer = document.getElementById('location-report-prevalence');

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

const zoom = (evt, ref) => {
  isZooming.value = true;
  // reset domain to new coords
  const selection = evt.selection;

  if (selection) {
    const newMin = x.value.invert(selection[0]);
    const newMax = x.value.invert(selection[1]);

    x.value = scaleTime()
      .range([0, width.value - margin.value.left - margin.value.right])
      .domain([newMin, newMax])
      .clamp(true);

    // update plotted data
    plottedData.value = cloneDeep(props.data);
    plottedData.value.forEach((mutation) => {
      mutation.data = mutation.data.filter(
        (d) => d[xVariable.value] >= newMin && d[xVariable.value] <= newMax,
      );
    });

    plottedData.value = plottedData.value.filter((d) => d.data.length);
    plottedEpi.value = props.epi.filter(
      (d) => d[xEpiVariable.value] >= newMin && d[xEpiVariable.value] <= newMax,
    );
    // move the brush
    brushRef.value.call(brush.value.move, null);
    brushRef2.value.call(brush.value.move, null);
    zoomAllowed.value = false;
    updatePlot();

    // update route
    updateUrl(newMin, newMax);
  }
};

const resetZoom = () => {
  brushRef.value.call(brush.value.move, null);
  brushRef2.value.call(brush.value.move, null);
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
  }
  if (props.routeName === 'LocationReport') {
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
  }

  updatePlot();
};

const enableZoom = () => {
  zoomAllowed.value = true;
};

const setupPlot = () => {
  xMin.value = timeParse('%Y-%m-%d')(props.xmin);
  xMax.value = timeParse('%Y-%m-%d')(props.xmax);
  svg.value = select(svgRef.value);
  chart.value = select(chartRef.value);
  counts.value = select(countsRef.value);
  epiChart.value = select(epiChartRef.value);
  brushRef.value = select(brush1.value);
  brushRef2.value = select(brush2.value);

  // estimate
  lineF.value = line()
    .x((d) => x.value(d[xVariable.value]))
    .y((d) => y.value(d[yVariable.value]));

  // epi trace
  epiLine.value = line()
    .x((d) => x.value(d['date']))
    .y((d) => yEpi.value(d[yEpiVariable.value]));

  // confidence interval area method
  areaF.value = area()
    .x((d) => x.value(d[xVariable.value]))
    .y0((d) => y.value(d.proportion_ci_lower))
    .y1((d) => y.value(d.proportion_ci_upper));

  setXScale();
};

const changeXScale = (_month) => {
  month.value = _month;
  isZooming.value = false;
  const newMax = new Date();
  const newMin = timeMonth.offset(newMax, -_month);

  x.value = scaleTime()
    .range([0, width.value - margin.value.left - margin.value.right])
    .domain([newMin, newMax])
    .clamp(true);

  // update plotted data
  plottedData.value = cloneDeep(props.data);
  plottedData.value.forEach((mutation) => {
    mutation.data = mutation.data.filter(
      (d) => d[xVariable.value] >= newMin && d[xVariable.value] <= newMax,
    );
  });

  plottedData.value = plottedData.value.filter((d) => d.data.length);
  plottedEpi.value = props.epi.filter(
    (d) => d[xEpiVariable.value] >= newMin && d[xEpiVariable.value] <= newMax,
  );
  // move the brush
  // this.brushRef.call(this.brush.move, null);
  // this.brushRef2.call(this.brush.move, null);
  zoomAllowed.value = false;
  updatePlot();

  // update route
  updateUrl(newMin, newMax);
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
        loc: queryParams.loc,
        muts: queryParams.muts,
        alias: queryParams.alias,
        pango: queryParams.pango,
        variant: queryParams.variant,
        selected: queryParams.selected,
        xmin: timeFormat('%Y-%m-%d')(newMin),
        xmax: timeFormat('%Y-%m-%d')(newMax),
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
        xmin: timeFormat('%Y-%m-%d')(newMin),
        xmax: timeFormat('%Y-%m-%d')(newMax),
      },
    });
  }
};

const setXScale = () => {
  let xDomain;

  if (xMin.value && xMax.value && xMin.value < xMax.value) {
    xDomain = [xMin.value, xMax.value];
  } else {
    const mutExtent = extent(
      props.data.flatMap((d) => d.data).map((d) => d[xVariable.value]),
    );
    let minDate;
    if (props.epi && props.epi.length) {
      const epiExtent = extent(props.epi.map((d) => d[xEpiVariable.value]));
      maxDate.value = mutExtent[1];
      maxEpiDate.value = epiExtent[1];
      minDate = Math.min(epiExtent[0], mutExtent[0]);
    } else {
      maxDate.value = mutExtent[1];
      minDate = mutExtent[0];
    }

    if (props.includeToday) {
      today.value = new Date();
      xDomain = [minDate, today.value];
    } else {
      xDomain = [minDate, Math.max(maxDate.value, maxEpiDate.value)];
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
    .domain(xDomain)
    .clamp(true);

  plottedData.value = cloneDeep(props.data);
  plottedEpi.value = props.epi;
  plottedData.value.forEach((mutation) => {
    mutation.data = mutation.data.filter(
      (d) =>
        d[xVariable.value] >= xDomain[0] && d[xVariable.value] <= xDomain[1],
    );
  });

  plottedData.value = plottedData.value.filter((d) => d.data.length);
  plottedEpi.value = props.epi.filter(
    (d) =>
      d[xEpiVariable.value] >= xDomain[0] &&
      d[xEpiVariable.value] <= xDomain[1],
  );

  colorScale.value = props.setColorScale
    ? props.setColorScale
    : colorScale.value.domain(map(props.data, (d) => d[fillVariable.value]));
};

const updateScales = () => {
  const avgMax = max(
    plottedData.value.flatMap((d) => d.data),
    (d) => d[yVariable.value],
  );
  const CIMax = max(
    plottedData.value.flatMap((d) => d.data),
    (d) => d.proportion_ci_upper,
  );

  y.value = y.value
    .range([height.value - margin.value.top - margin.value.bottom, 0])
    .nice()
    .domain([0, (avgMax + CIMax) * 0.5]);

  yEpi.value = scaleLinear()
    .range([epiHeight.value - margin.value.top - margin.value.bottom, 0])
    .domain([0, max(plottedEpi.value, (d) => d[yEpiVariable.value])])
    .nice();

  xAxis.value = axisBottom(x.value)
    .ticks(numXTicks.value)
    .tickSize(-height.value)
    .tickSizeOuter(0)
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
  select(xEpiAxis.value).call(xAxis.value);

  const yTickFormat = y.value.domain()[1] < 0.02 ? '.1%' : '.0%';

  yAxis.value = axisLeft(y.value)
    .tickSizeOuter(0)
    .ticks(numYTicks.value)
    .tickFormat(format(yTickFormat));

  yEpiAxis.value = axisLeft(yEpi.value).tickSizeOuter(0).ticks(numYTicks.value);

  select(yAxisRef.value).call(yAxis.value);
  select(yEpiAxisRef.value).call(yEpiAxis.value);
};

const hideCIs = () => {
  chart.value
    .selectAll('.confidence-interval')
    .classed('hidden', !showCI.value);
};

const tooltipOn = () => {
  // const ttipShift = 20;
  //
  // // find closest date
  // const selectedX = this.x.invert(event.offsetX - this.margin.left);
  // const selectedDate = timeDay.round(selectedX);
  // const selected = this.data.filter(d => Math.abs(d.dateTime - selectedDate) < 1e-12);
  //
  // if (selected.length) {
  //   // tooltip on
  //   const ttip = select(this.$refs.tooltip_prevalence);
  //
  //   // edit text
  //   ttip.select("h5").text(selected[0].date)
  //
  //   ttip.select("#proportion").text(format(".0%")(selected[0].proportion))
  //   ttip.select("#confidence-interval").text(`(95% CI: ${format(".0%")(selected[0].proportion_ci_lower)}-${format(".0%")(selected[0].proportion_ci_upper)})`)
  //   ttip.select("#sequencing-count").text(`Number of cases: ${format(",")(selected[0].lineage_count)}/${format(",")(selected[0].total_count)}`)
  //   ttip.select("#sequencing-count-rolling").text(`Rolling average: ${format(",.1f")(selected[0].lineage_count_rolling)}/${format(",.1f")(selected[0].total_count_rolling)}`)
  //
  //   // fix location
  //   ttip
  //     .style("left", `${event.clientX + ttipShift}px`)
  //     .style("top", `${event.clientY + ttipShift}px`)
  //     .style("display", "block");
  //
  //   // histogram off/on
  //   selectAll(".raw-counts")
  //     .style("opacity", 0.3);
  //
  //   selectAll(`#date${selected[0].date}`)
  //     .style("opacity", 1);
  // }
};

const tooltipOff = () => {
  select(tooltip_mutations.value).style('display', 'none');

  chart.value.selectAll('.mutation-trace').style('opacity', 1);

  selectAll('.raw-counts').style('opacity', 1);
};

const tooltipOnMutation = (d) => {
  const ttipShift = 20;
  const ttip = select(tooltip_mutations.value);

  // dim all
  chart.value.selectAll('.mutation-trace').style('opacity', 0.3);

  chart.value.select(`#${d.id}`).style('opacity', 1);

  // edit text
  ttip.select('h5').text(d.label).style('color', colorScale.value(d.label));

  ttip
    .select('#sublineages')
    .text(d.pango_descendants ? d.pango_descendants.join(', ') : '')
    .style('color', colorScale.value(d.label));

  // fix location
  ttip
    .style('left', `${event.clientX + ttipShift}px`)
    .style('top', `${event.clientY + ttipShift}px`)
    .style('display', 'block');
};

const tooltipOffMutation = () => {
  chart.value.selectAll('.mutation-trace').style('opacity', 1);

  select(tooltip_mutations.value).style('display', 'none');
};

const updatePlot = () => {
  const t1 = transition().duration(1500);

  if (plottedData.value && plottedEpi.value) {
    updateScales();
    today.value = new Date();
    const epiExtent = extent(props.epi.map((d) => d[xEpiVariable.value]));
    maxEpiDate.value = epiExtent[1];
    const mutExtent = extent(
      props.data.flatMap((d) => d.data).map((d) => d[xVariable.value]),
    );
    maxDate.value = mutExtent[1];

    // EPI DATA
    // hashed area to highlight the gap between today
    if (props.includeToday) {
      const noDataSelectorEpi = epiChart.value
        .selectAll('.no-data-epi')
        .data([0]);

      noDataSelectorEpi.join(
        (enter) => {
          enter
            .append('rect')
            .attr('class', 'no-data-epi')
            .attr('x', x.value(maxEpiDate.value))
            .attr('width', x.value(today.value) - x.value(maxEpiDate.value))
            .attr(
              'height',
              epiHeight.value - margin.value.top - margin.value.bottom,
            )
            .style('fill', 'url(#diagonalHatchLight)');
        },
        (update) => {
          update
            .attr(
              'height',
              epiHeight.value - margin.value.top - margin.value.bottom,
            )
            .style('fill', 'url(#diagonalHatchLight)')
            .attr('x', x.value(maxEpiDate.value))
            .attr('width', x.value(today.value) - x.value(maxEpiDate.value));
        },
        (exit) =>
          exit.call((exit) =>
            exit.transition().style('opacity', 1e-5).remove(),
          ),
      );
    }

    const epiSelector = epiChart.value
      .selectAll('.epi-curve')
      .data([plottedEpi.value]);

    epiSelector.join(
      (enter) => {
        enter
          .append('path')
          .attr('class', 'epi-curve')
          .attr('d', epiLine.value)
          .style('fill', 'none')
          .style('stroke', '#333333')
          .style('stroke-width', 1.75);
      },
      (update) => {
        update.attr('d', epiLine.value);
      },
      (exit) =>
        exit.call((exit) =>
          exit
            .transition()
            .style('opacity', 1e-5)
            .style('opacity', 1e-5)
            .remove(),
        ),
    );

    // MUTATION TRACES
    // hashed area to highlight the gap between today
    if (props.includeToday) {
      const noDataSelector = chart.value.selectAll('.no-data').data([0]);

      noDataSelector.join(
        (enter) => {
          enter
            .append('rect')
            .attr('class', 'no-data')
            .attr('x', x.value(maxDate.value))
            .attr('width', x.value(today.value) - x.value(maxDate.value))
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
            .attr('x', x.value(maxDate.value))
            .attr('width', x.value(today.value) - x.value(maxDate.value));
        },
        (exit) =>
          exit.call((exit) =>
            exit.transition().style('opacity', 1e-5).remove(),
          ),
      );
    }

    // calculate the end point labels
    // Create nodes of the text labels for force direction
    const labelHeight = 18;
    const endLabels = plottedData.value.map((d) => {
      return {
        label: d[fillVariable.value],
        id: d.id,
        pango_descendants: d.pango_descendants,
        route: d.route,
        params: d.params,
        fx: 0,
        targetY: y.value(d.data.slice(-1)[0][yVariable.value]),
      };
    });

    // Define a custom force
    const forceClamp = (min, max) => {
      let nodes;
      const force = () => {
        nodes.forEach((n) => {
          if (n.y > max) n.y = max;
          if (n.y < min) n.y = min;
        });
      };
      force.initialize = (_) => (nodes = _);
      return force;
    };

    // Set up the force simulation
    const force = forceSimulation()
      .nodes(endLabels)
      .force('collide', forceCollide(labelHeight / 2).strength(1))
      .force('y', forceY((d) => d.targetY).strength(1))
      .force(
        'clamp',
        forceClamp(0, height.value - margin.value.top - margin.value.bottom),
      )
      .stop();

    // Execute the simulation
    for (let i = 0; i < 300; i++) force.tick();

    const labelSelector = chart.value
      .selectAll('.mutation-label')
      .data(endLabels);

    labelSelector.join(
      (enter) => {
        enter
          .append('text')
          .attr('class', 'mutation-label pointer')
          .attr('x', width.value - margin.value.left - margin.value.right)
          .attr('dx', 5)
          .attr('y', (d) => d.y)
          .style('font-size', '16px')
          .style(
            'font-family',
            "'DM Sans', Avenir, Helvetica, Arial, sans-serif",
          )
          .style('fill', (d) => colorScale.value(d.label))
          .text((d) => d.label);
      },
      (update) => {
        update
          .attr('x', width.value - margin.value.left - margin.value.right)
          .attr('y', (d) => d.y)
          .style('fill', (d) => colorScale.value(d.label))
          .text((d) => d.label);
      },
      (exit) =>
        exit.call((exit) => exit.transition().style('opacity', 1e-5).remove()),
    );

    chart.value
      .selectAll('.mutation-label')
      .on('mouseover', (d) => tooltipOnMutation(d))
      .on('mouseout', () => tooltipOffMutation())
      .on('click', (d) => route2Mutation(d));

    const mutSelector = chart.value
      .selectAll('.mutation-trace')
      .data(plottedData.value);

    mutSelector.join(
      (enter) => {
        const mutGrp = enter
          .append('g')
          .attr('class', 'mutation-trace')
          .attr('id', (d) => d.id);

        mutGrp
          .append('path')
          .attr('class', 'confidence-interval')
          .style('fill', (d) => colorScale.value(d[fillVariable.value]))
          .style('fill-opacity', 0.2)
          .attr('d', (d) => areaF.value(d.data))
          .classed('hidden', !showCI.value);

        mutGrp
          .append('path')
          .attr('class', 'prevalence-line pointer')
          .style('stroke', (d) => colorScale.value(d[fillVariable.value]))
          .style('fill', 'none')
          .style('stroke-width', '2.5')
          .attr('d', (d) => lineF.value(d.data));
      },
      (update) => {
        update.attr('id', (d) => d.id);

        update
          .select('.confidence-interval')
          .style('fill', (d) => colorScale.value(d[fillVariable.value]))
          .attr('d', (d) => areaF.value(d.data))
          .classed('hidden', !showCI.value);

        update
          .select('.prevalence-line')
          .style('stroke', (d) => colorScale.value(d[fillVariable.value]))
          .style('fill', 'none')
          .style('stroke-width', '2.5')
          .attr('d', (d) => lineF.value(d.data));
      },
      (exit) =>
        exit.call((exit) => exit.transition().style('opacity', 1e-5).remove()),
    );

    // event listener for tooltips
    chart.value
      .selectAll('.mutation-trace')
      .on('mousemove', (d) => tooltipOnMutation(d))
      .on('mouseleave', () => tooltipOff())
      .on('click', (d) => route2Mutation(d));

    counts.value
      .selectAll('.raw-counts')
      .on('mousemove', (d) => tooltipOnMutation(d))
      .on('mouseleave', () => tooltipOff());
  }
};

const route2Mutation = (d) => {
  const params = d.params ? d.params : {};
  if (props.routeName.includes('GenomicsEmbed')) {
    const pango = params.alias ? null : d.label;
    router.push({
      name: 'GenomicsEmbed',
      params: params,
      query: {
        alias: params.alias,
        type: 'var',
        pango: pango,
        loc: props.locationID,
        selected: props.locationID,
      },
    });
  } else {
    router.push({
      name: 'MutationReport',
      params: params,
      query: {
        pango: d.label,
        loc: props.locationID,
        selected: props.locationID,
      },
    });
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
  (newVal, oldVal) => {
    xMin.value = timeParse('%Y-%m-%d')(newVal);
    xMax.value = timeParse('%Y-%m-%d')(props.xmax);
    setXScale();
    updatePlot();
  },
);

watch(
  () => props.xmax,
  (newVal, oldVal) => {
    xMin.value = timeParse('%Y-%m-%d')(props.xmin);
    xMax.value = timeParse('%Y-%m-%d')(newVal);
    setXScale();
    updatePlot();
  },
);

// created
const debounceSetDims = debounce(setDims, 150);
const debounceZoom = debounce(zoom, 150);

onMounted(() => {
  nextTick(() => {
    if (!props.setWidth) {
      window.addEventListener('resize', debounceSetDims);
    }
    updateBrush();
  });

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
#location-report-prevalence {
  & .count-axis,
  & .mutation-axis {
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

    text {
      fill: $grey-90;
    }
  }

  & .mutation-axis.axis--y text {
    font-size: 16px;
  }

  & .epi-y.axis--y text {
    font-size: 16px;
  }

  & .epi-x {
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

  & .axis--y text {
    font-size: 12px;
  }

  & .axis--x line {
    stroke: #555;
    stroke-width: 0.25;
  }
}

.ci-legend {
  width: 15px;
  height: 15px;
  opacity: 0.3;
}

.trace-legend {
  stroke: #777;
  stroke-width: 2.5;
}
</style>
