<template>
  <div
    class="col-sm-12 epidemiology-curves flex-column align-items-center"
    style="margin-bottom: 45px"
  >
    <!-- zoom btns -->
    <div
      class="d-flex justify-content-end px-3"
      :style="{ width: width + 'px' }"
    >
      <button
        class="btn btn-accent-flat text-highlight d-flex align-items-center m-0 p-2"
        @click="enableZoom"
      >
        <font-awesome-icon class="text-right" :icon="['fas', 'search-plus']" />
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

    <svg
      ref="svgRef"
      :width="width"
      :height="height - 45"
      class="epi-curve"
      :name="title"
    >
      <g
        class="tooltip-cover"
        :transform="`translate(${margin.left}, ${margin.top})`"
      >
        <line class="mouse-line" />
        <rect id="tooltip-cover-rect" />
      </g>

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
        ref="xAxisRef"
        :transform="`translate(${margin.left}, ${height - margin.bottom + 5})`"
        class="epi-axis axis--x"
      />
      <g
        ref="yAxisRef"
        :transform="`translate(${margin.left}, ${margin.top})`"
        class="epi-axis axis--y"
      />
      <g
        id="epi-curve"
        ref="epi_curve"
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

    <svg
      ref="svg_arrows"
      :width="width"
      :height="height"
      class="swoopy-arrow-group position-absolute"
    >
      <g
        v-if="loggable"
        ref="switchY"
        class="switch-y-button-group"
        transform="translate(5,0)"
      >
        <path id="switch-y-btn-swoopy-arrow" class="swoopy-arrow" />
        <rect id="switch-y-btn-rect" class="switch-button-rect" />
        <text id="switch-y-btn-text" class="switch-button" />
      </g>
    </svg>
    <div class="tooltip p-2">
      <p class="date m-0" />
      <div v-for="line1 in plottedData" :key="line1.key" :class="line1.key">
        <h6 class="country-name m-0" />
        <b class="count-avg m-0" />
      </div>
    </div>

    <div v-if="plottedData && plottedData.length" class="mt-4">
      <router-link
        v-for="_line in plottedData"
        :key="_line.key"
        class="btn btn-main mr-2"
        :to="{
          name: 'LocationReports',
          query: { loc: _line.value[0].location_id },
        }"
      >
        View {{ _line.value[0].name }} Variant Report
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { max, extent, bisector } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { brushX } from 'd3-brush';
import { format } from 'd3-format';
import { forceSimulation, forceCollide, forceY } from 'd3-force';
import { select, selectAll, event } from 'd3-selection';
import { scaleLinear, scaleLog, scaleTime } from 'd3-scale';
import { line } from 'd3-shape';
import { timeParse, timeFormat } from 'd3-time-format';
import { transition } from 'd3-transition';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';

import { colorsStore } from '@/stores/colorsStore';

const props = defineProps({
  data: Array,
  location: String,
  xmin: String,
  xmax: String,
  variableObj: Object,
  log: Boolean,
  percapita: Boolean,
  loggable: Boolean,
  percent: Boolean,
});

// this.$route
const route = useRoute();
// this.$router
const router = useRouter();

const store = colorsStore();

const width = ref(500);
const height = ref(300);
const margin = ref({
  top: 15,
  right: 225,
  bottom: 75,
  left: 125,
});
const radius = ref(3.5);
const transitionDuration = ref(1500);
// data
const dataSubscription = ref(null);
const plottedData = ref(null);
// button interfaces
const zoomAllowed = ref(false);
const xVariable = ref('date');
// axes
const numXTicks = ref(6);
const numYTicks = ref(6);
const x = ref(scaleTime());
const y = ref(scaleLinear());
const xAxis = ref(null);
const yAxis = ref(null);
// refs
const svg = ref(null);
const chart = ref(null);
const switchBtn = ref(null);
const brushRef = ref(null);
// methods
const lineF = ref(null);
const brushF = ref(null);
const isLoggable = ref(true);
// missing variables in previous version
const xMin = ref(null);
const xMax = ref(null);
let isLogY = ref(false);
// this.$refs
const switchY = ref(null);
const svgRef = ref(null);
const epi_curve = ref(null);
const brushFRef = ref(null);
const xAxisRef = ref(null);
const yAxisRef = ref(null);

const dataUpdated = computed(() => {
  // Combo property to check if the data has changed, or the normalization has.
  // TODO: in Vue 3, this can be streamlined as a dual watcher
  return (
    JSON.stringify(props.data) +
    selectedVariable.value +
    String(props.percapita)
  );
});

const selectedVariable = computed(() => {
  if (props.percapita) {
    return props.variableObj.percapita === false
      ? props.variableObj.value
      : props.variableObj.value + '_per_100k';
  }
  return props.variableObj.value;
});

const title = computed(() => {
  if (props.data.length === 1) {
    return props.percapita && props.variableObj.percapita !== false
      ? `Number of COVID-19 ${props.variableObj.label} in ${props.data[0].value[0].name} per 100,000 residents`
      : `Number of COVID-19 ${props.variableObj.label} in ${props.data[0].value[0].name}`;
  } else {
    return props.percapita && props.variableObj.percapita !== false
      ? `Number of COVID-19 ${props.variableObj.label} per 100,000 residents`
      : `Number of COVID-19 ${props.variableObj.label}`;
  }
});

const prepData = () => {
  isLoggable.value = selectedVariable.value !== 'testing_positivity';
  isLogY.value = isLoggable.value && props.log;

  if (props.data) {
    plottedData.value = cloneDeep(props.data);

    plottedData.value.forEach((d) => {
      d['value'] =
        isLogY.value && isLoggable.value
          ? d.value.filter(
              (
                _x, // renamed as _x: giving error with previous name because we declared x as reactive variable
              ) =>
                _x[selectedVariable.value] >= 1 &&
                _x[xVariable.value] >= x.value.domain()[0] &&
                _x[xVariable.value] <= x.value.domain()[1] &&
                (_x[xVariable.value] || _x[xVariable.value] === 0),
            )
          : d.value.filter(
              (_x) =>
                _x[selectedVariable.value] &&
                _x[xVariable.value] >= x.value.domain()[0] &&
                _x[xVariable.value] <= x.value.domain()[1] &&
                (_x[xVariable.value] || _x[xVariable.value] === 0),
            );

      // ensure dates are sorted
      d.value.sort((a, b) => a[xVariable.value] - b[xVariable.value]);
    });
  }
};

const setPlotDims = () => {
  // let idealWidth = 750;
  const padding = 0.85;
  let idealWidth = document.getElementById('curveContainer')
    ? document.getElementById('curveContainer').offsetWidth
    : 750;

  const whRatio = 5 / 3;
  const framePadding = 32; // left / right padding on the div of 16px ea.
  const newWidth =
    window.innerWidth < idealWidth
      ? window.innerWidth * padding - framePadding
      : idealWidth * padding - framePadding;
  const newHeight = newWidth / whRatio;
  // check height within limits
  if (newHeight > window.innerHeight * padding) {
    width.value = window.innerHeight * whRatio * padding;
    height.value = window.innerHeight * padding;
  } else {
    width.value = newWidth;
    height.value = newHeight;
  }

  margin.value.right = width.value < 600 ? 115 : 205;

  numXTicks.value = width.value < 750 ? 2 : 6;
  numYTicks.value = height.value < 250 ? 2 : 6;
};

const colorScale = (location) => {
  const scale = store.getColor;
  return scale(location);
};

const changeYScale = () => {
  isLogY.value = !isLogY.value;
  changeScale();
};

const changeScale = () => {
  router.replace({
    path: 'epidemiology',
    name: 'Epidemiology',
    state: {
      disableScroll: true,
    },
    query: {
      location: props.location,
      log: String(isLogY.value),
      variable: selectedVariable.value.replace('_per_100k', ''),
      xmin: props.xmin,
      xmax: props.xmax,
      percapita: String(props.percapita),
    },
  });

  updatePlot();
};

const updateBrush = () => {
  // Update brush so it spans the whole of the area
  brushF.value = brushX()
    .extent([
      [0, 0],
      [
        width.value - margin.value.left - margin.value.right,
        height.value - margin.value.top - margin.value.bottom,
      ],
    ])
    .on('end', () => debounceZoom(event));

  brushRef.value.call(brushF.value).on('dblclick', resetZoom);
};

const zoom = (evt, ref) => {
  selectAll('.tooltip').style('opacity', 0);
  selectAll('.mouse-line').style('opacity', 0);
  // reset domain to new coords
  const selection = evt.selection;

  if (selection) {
    const newMin = x.value.invert(selection[0]);
    const newMax = x.value.invert(selection[1]);

    x.value = scaleTime()
      .range([0, width.value - margin.value.left - margin.value.right])
      .domain([newMin, newMax]);

    // update plotted data
    prepData();

    // move the brush
    brushRef.value.call(brushF.value.move, null);
    zoomAllowed.value = false;
    updatePlot();

    // update route
    const queryParams = route.query;

    router.push({
      name: 'Epidemiology',
      state: {
        disableScroll: true,
      },
      query: {
        xmin: timeFormat('%Y-%m-%d')(newMin),
        xmax: timeFormat('%Y-%m-%d')(newMax),
        location: queryParams.location,
        variable: queryParams.variable,
        log: queryParams.log,
        fixedY: queryParams.fixedY,
        percapita: queryParams.percapita,
      },
    });
  }
};

const resetZoom = () => {
  brushRef.value.call(brushF.value.move, null);
  const queryParams = route.query;

  xMin.value = null;
  xMax.value = null;
  setXScale();

  router.push({
    name: 'Epidemiology',
    state: {
      disableScroll: true,
    },
    query: {
      location: queryParams.location,
      variable: queryParams.variable,
      log: queryParams.log,
      fixedY: queryParams.fixedY,
      percapita: queryParams.percapita,
    },
  });

  updatePlot();
};

const enableZoom = () => {
  zoomAllowed.value = true;
};

const tooltipOn = (d, location_id) => {
  select(`#tooltip-${d._id}`).attr('display', 'block');
  select(`#${d._id}`).attr('r', radius.value * 2);

  selectAll(`#${d[location_id]}`).select('text').style('font-weight', 700);

  selectAll(`.epi-region`).style('opacity', 0.35);
  selectAll(`.epi-line`).style('opacity', 0.35);

  selectAll(`.${d[location_id]}`).style('opacity', 1);
  selectAll(`#${d[location_id]}`).style('opacity', 1);
};

const tooltipOff = (d) => {
  selectAll('.tooltip--epi-curve').attr('display', 'none');

  selectAll('circle').attr('r', radius.value);

  selectAll('.annotation--region-name').style('font-weight', 400);

  selectAll(`.epi-region`).style('opacity', 1);
  selectAll(`.epi-line`).style('opacity', 1);
};

const mouseOn = () => {
  const ttip = selectAll('.tooltip')
    .style('pointer-events', 'none')
    .style('top', event.y + 'px')
    .style('left', event.x + 'px')
    .style('opacity', 1);

  let date = x.value.invert(
    event.pageX -
      document.getElementById('tooltip-cover-rect').getBoundingClientRect().x,
  );

  plottedData.value.forEach((line, ind) => {
    const bisect = bisector((d) => d.date);
    let i = bisect.left(line.value, date, 1);
    const a = line.value[i - 1];
    const b = line.value[i];
    let dat = date - a.date > b.date - date ? b : a;

    ttip.select(`.${dat.location_id}`).select(`.country-name`).text(dat.name);
    if (ind === 0) {
      ttip.select(`.date`).text(`${timeFormat('%d %b %Y')(dat.date)}`);
      const mouseLine = selectAll('.mouse-line')
        .attr('x1', x.value(dat.date))
        .attr('x2', x.value(dat.date))
        .style('opacity', 1);
    }
    ttip
      .select(`.${dat.location_id}`)
      .select(`.count-avg`)
      .text(`${format(',.1f')(dat[selectedVariable.value])}`);
  });
};

const mouseOff = () => {
  selectAll('.tooltip').style('opacity', 0);
  selectAll('.mouse-line').style('opacity', 0);
};

const updatePlot = () => {
  if (props.data && chart.value) {
    // create slice, so you create a copy, and sorting doesn't lead to an infinite update callback loop
    updateScales();
    drawPlot();
  }
};

const setupPlot = () => {
  // Event listener for mobile responsiveness
  // $nextTick waits till DOM rendered
  // this.$nextTick in optionsAPI
  nextTick(() => {
    window.addEventListener('resize', setPlotDims);
    // set initial dimensions for the stacked area plots.
    setPlotDims();
  });

  setPlotDims();

  svg.value = select(svgRef.value);
  chart.value = select(epi_curve.value);

  lineF.value = line()
    .x((d) => x.value(d[xVariable.value]))
    .y((d) => y.value(d[selectedVariable.value]));

  brushRef.value = select(brushFRef.value);
  setXScale();
};

const setXScale = () => {
  let xDomain;

  if (xMin.value && xMax.value && xMin.value < xMax.value) {
    xDomain = [xMin.value, xMax.value];
  } else {
    xDomain = extent(
      props.data.flatMap((d) => d.value).map((d) => d[xVariable.value]),
    );

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

  prepData();
};

const updateScales = () => {
  if (isLogY.value && isLoggable.value) {
    y.value = scaleLog()
      .range([height.value - margin.value.top - margin.value.bottom, 0])
      .nice()
      .domain([
        1,
        max(
          plottedData.value
            .flatMap((d) => d.value)
            .map((d) => d[selectedVariable.value]),
        ),
      ]);
  } else {
    y.value = scaleLinear()
      .range([height.value - margin.value.top - margin.value.bottom, 0])
      .domain([
        0,
        max(
          plottedData.value
            .flatMap((d) => d.value)
            .map((d) => d[selectedVariable.value]),
        ),
      ]);
  }

  xAxis.value = axisBottom(x.value).ticks(numXTicks.value);

  select(xAxisRef.value).call(xAxis.value);

  if (isLogY.value && isLoggable.value) {
    yAxis.value = axisLeft(y.value)
      .tickSizeOuter(0)
      .ticks(numYTicks.value)
      .tickFormat((d, i) => {
        const log = Math.log10(d);
        return Math.abs(Math.round(log) - log) < 1e-6 ? format(',')(d) : '';
      });
  } else {
    yAxis.value = axisLeft(y.value).tickSizeOuter(0).ticks(numYTicks.value);
  }

  if (props.percent) {
    yAxis.value.tickFormat(format('.0%'));
  }

  select(yAxisRef.value).call(yAxis.value);

  // --- update y-scale switch button --
  const xSwoop = 30;
  const ySwoop = -35;
  const swoopOffset = 10;
  if (isLoggable.value) {
    switchBtn.value = select(switchY.value);

    select(switchY.value)
      .select('rect')
      .attr('x', 0)
      .attr('width', 0)
      .attr('height', 26.5)
      .attr('y', height.value - 28)
      .on('mouseover', () =>
        switchBtn.value.select('rect').classed('switch-button-hover', true),
      )
      .on('mouseout', () =>
        switchBtn.value.select('rect').classed('switch-button-hover', false),
      )
      .on('click', () => changeYScale());

    select(switchY.value)
      .select('path')
      .attr('marker-end', 'url(#arrow)')
      // M x-start y-start C x1 y1, x2 y2, x-end y-end -- where x1/y1/x2/y2 are the coordinates of the bezier curve.
      .attr(
        'd',
        `M ${xSwoop} ${height.value + ySwoop}
          C ${xSwoop + swoopOffset} ${height.value + ySwoop},
          ${margin.value.left + ySwoop + 20} ${
          height.value - margin.value.bottom + 15 + swoopOffset
        },
          ${margin.value.left + ySwoop + 20} ${
          height.value - margin.value.bottom + 15
        }`,
      );

    const switchTextEnter = switchBtn.value
      .select('text')
      .attr('class', 'switch-button')
      .attr('x', 3.84 * 2)
      .text(`switch to ${isLogY.value ? 'linear' : 'log'} scale`)
      .attr('y', height.value + 6 - 12.8);

    if (switchBtn.value.select('text').node()) {
      switchBtn.value
        .select('rect')
        .attr(
          'width',
          switchBtn.value.select('text').node().getBBox().width + 3.84 * 4,
        );
      // .attr(
      //   "height",
      //   .select("text")
      //   .node()
      //   .getBBox().height + 3.84*2
      // );
    }
  }
};

const drawPlot = () => {
  if (plottedData.value && plottedData.value.length) {
    const t1 = transition().duration(transitionDuration.value);
    const t2 = transition().duration(500);
    const formatDate = timeFormat('%d %b %Y');

    // --- location annotation ---
    // using force direction to make sure they don't overlap.
    // based off https://bl.ocks.org/wdickerson/bd654e61f536dcef3736f41e0ad87786
    const labelHeight = 16;
    // Create nodes of the text labels for force direction
    plottedData.value.forEach((d) => {
      d['fx'] = 0;
      const filtered = d.value.slice(-1);
      const yMax = filtered.map((d) => d[selectedVariable.value]);
      d['xMax'] =
        filtered.length === 1 ? x.value(filtered[0][xVariable.value]) : null;
      d['targetY'] = yMax[0] ? y.value(yMax[0]) : height.value;
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
      .nodes(plottedData.value)
      .force('collide', forceCollide(labelHeight / 2).strength(0.1))
      .force('y', forceY((d) => d.targetY).strength(1))
      .force(
        'clamp',
        forceClamp(0, height.value - margin.value.top - margin.value.bottom),
      )
      .stop();

    // Execute the simulation
    for (let i = 0; i < 300; i++) force.tick();

    // --- create groups for each region ---
    const regionGroups = chart.value
      .selectAll('.epi-region')
      .data(plottedData.value, (d) => d.key);

    regionGroups.join(
      (enter) => {
        const grps = enter
          .append('g')
          .attr('class', 'epi-region')
          .attr('id', (d) => d.key)
          .attr('fill', (d) => colorScale(d.key));

        grps
          .append('text')
          .attr('dx', 8)
          .attr('class', (d) => `annotation--region-name ${d.key}`)
          .attr('x', width.value - margin.value.left - margin.value.right)
          .attr('y', (d) => d.y)
          .text((d) => (d.value[0] ? d.value[0].name : ''))
          .style(
            'font-family',
            "'DM Sans', Avenir, Helvetica, Arial, sans-serif",
          )
          // .transition(t1)
          // .delay(1000)
          .style('opacity', 1);

        grps
          .append('path')
          .attr('class', (d) => `epi-line ${d.key}`)
          .attr('stroke', (d) => colorScale(d.key))
          .style('fill', 'none')
          .style('stroke-width', '2.5')
          .attr('id', (d) => (d.key ? `epi-line-${d.key}` : 'epi-line-blank'))
          .datum((d) => d.value)
          .attr('d', lineF.value);

        // .attr("stroke-dasharray", () => {
        //   var totalLength = this.getTotalLength();
        //   return totalLength + " " + totalLength;
        // })
        // .attr("stroke-dashoffset", () => {
        //   var totalLength = this.getTotalLength();
        //   return totalLength;
        // })
        // .transition(t1)
        // .ease(easeLinear)
        // .attr("stroke-dashoffset", 0)

        grps
          .append('circle')
          .attr('class', (d) => `epi-point ${d.key}`)
          .attr('id', (d) => `${d.key}`)
          .attr('r', radius.value)
          .attr('cx', (d) => d.xMax)
          .attr('cy', (d) => d.y)
          .style('opacity', 1);
      },
      (update) => {
        update.attr('id', (d) => d.key).attr('fill', (d) => colorScale(d.key));

        update
          .select('.annotation--region-name')
          .attr('x', width.value - margin.value.left - margin.value.right)
          .text((d) => (d.value[0] ? d.value[0].name : ''))
          .style('opacity', 1)
          .transition(t2)
          .attr('y', (d) => d.y);

        update
          .select('.epi-line')
          .attr('stroke', (d) => colorScale(d.key))
          .attr('id', (d) => (d.key ? `epi-line-${d.key}` : 'epi-line-blank'))
          .attr('class', (d) => `epi-line ${d.key}`)
          .datum((d) => d.value)
          .attr('stroke-dashoffset', 0)
          .attr('stroke-dasharray', 'none')
          .transition(t2)
          .attr('d', lineF.value);

        update
          .select('.epi-point')
          .attr('class', (d) => `epi-point ${d.key}`)
          .attr('id', (d) => `${d.key}`)
          .attr('cx', (d) => d.xMax)
          .transition(t2)
          .attr('cy', (d) => d.y);
      },
      (exit) =>
        exit.call((exit) => exit.transition().style('opacity', 1e-5).remove()),
    );

    // --- event listeners ---
    selectAll('.annotation--region-name')
      .on('mouseover', (d) => tooltipOn(d, 'key'))
      .on('mouseout', (d) => tooltipOff(d));

    const mouseRect = select('#tooltip-cover-rect')
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .attr('width', width.value - margin.value.left - margin.value.right)
      .attr('height', height.value - margin.value.top - margin.value.bottom)
      .on('touchmove mouseover mousemove', mouseOn)
      .on('touchend mouseout', mouseOff);

    selectAll('.mouse-line')
      .attr('y1', height.value - margin.value.top - margin.value.bottom)
      .attr('y2', 0)
      .attr('stroke', 'currentColor')
      .style('stroke-width', '1')
      .style('opacity', 0);
  }
};

watch(dataUpdated, () => {
  xMin.value = timeParse('%Y-%m-%d')(props.xmin);
  xMax.value = timeParse('%Y-%m-%d')(props.xmax);
  setXScale();
  updatePlot();
});

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

watch(
  () => props.variableObj,
  () => {
    setXScale();
    updatePlot();
  },
  { deep: true },
);

watch(width, () => {
  setXScale();
  updatePlot();
});

onMounted(() => {
  isLoggable.value = props.loggable;
  setupPlot();
  updateBrush();
  updatePlot();
});

const debounceZoom = debounce(zoom, 150);

onUnmounted(() => {
  window.removeEventListener('resize', setPlotDims);
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.tooltip {
  position: fixed;
  z-index: 1000;
  background: #ffffffcf;
  opacity: 0;
  pointer-events: none;
}
.epi-axis text {
  font-size: 12pt;
}

.epi-point {
  // opacity: 0.4;
}

.annotation--region-name {
  dominant-baseline: middle;
  stroke: none !important;
  font-family: $font-family;
}

.tooltip--text {
  dominant-baseline: hanging;
  stroke: none !important;
}

.tooltip--date {
  font-weight: 400;
}

.tooltip--case-count {
  font-weight: 700;
}

.switch-button {
  pointer-events: none;
  dominant-baseline: text-after-edge;
  // fill: $grey-90 !important;
  font-weight: 300 !important;
  font-size: 12.8px;
  fill: $secondary-color;

  &:hover {
  }
}

.swoopy-arrow,
.swoopy-arrowhead {
  stroke: $grey-70;
  fill: none;
  stroke-width: 0.8;
}
.swoopy-arrowhead {
  stroke-width: 1;
}

.switch-button-rect {
  cursor: pointer;
  fill: white;
  rx: 5;
  ry: 5;
  stroke: $secondary-color;
  stroke-width: 1;
  shape-rendering: crispedges;
  &:hover {
    fill: $secondary-bright;
  }
}

.switch-button-hover {
}

.epidemiology-curves line.case-def-changed-line {
  stroke: $grey-60;
  stroke-width: 0.75;
  shape-rendering: crispedges;
  stroke-dasharray: 6, 6;
}
.epidemiology-curves .case-def-changed text {
  text-anchor: start;
}

.x-axis-select {
  // top: -29px;
  // right: 20px;
}

.swoopy-arrow-group {
  pointer-events: none;
  & rect {
    pointer-events: auto !important;
  }
}
</style>
