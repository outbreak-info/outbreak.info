<template>
  <div
    id="map_container"
    ref="map_container"
    class="d-flex flex-wrap justify-content-center align-items-center"
  >
    <div class="d-flex flex-column align-items-center">
      <h4 ref="dateRef" />
      <svg
        ref="svgRef"
        :width="width"
        :height="height"
        class="epi-map-svg"
        :subtitle="title"
      >
        <g ref="blank_map" class="blank-map-group" />
        <g ref="regionsRef" class="region-group" />
        <g ref="overlayRef" class="overlay-map-group" />
      </svg>
    </div>
    <div
      ref="choropleth_tooltip"
      class="tooltip choropleth-tooltip box-shadow p-2"
    >
      <h6 class="country-name m-0" />
      <p class="value m-0" />
      <small
        v-if="variable.includes('_rolling')"
        class="m-0 text-right d-block mb-2"
      >
        (average over last {{ rollLength }} days)
      </small>

      <template v-if="timeTrace">
        <div class="d-flex m-0 mt-3">
          <div class="d-flex flex-column">
            <small class="">new cases per day</small>
            <Bargraph
              id="time-trace"
              :data="timeTrace"
              :date1="date1"
              :include2Week="isDiff"
              :variableObj="{ value: 'confirmed_numIncrease' }"
              :width="100"
              :height="40"
              :color="'#9f9f9f'"
              colorAverage="#2c3e50"
            />
          </div>
          <div class="d-flex flex-column ml-3">
            <small class="text-underline">on {{ date }}</small>
            <table>
              <tr>
                <td
                  class="line-height-1 text-right pb-1"
                  style="vertical-align: top"
                >
                  <b>{{ timeConfirmed }}</b>
                </td>
                <td
                  class="line-height-1 pl-2"
                  style="width: 125px; vertical-align: top"
                >
                  new cases
                </td>
              </tr>
              <tr>
                <td
                  class="line-height-1 text-right"
                  style="vertical-align: top"
                >
                  <b>{{ timeConfirmedPC }}</b>
                </td>
                <td
                  class="line-height-1 pl-2"
                  style="width: 125px; vertical-align: top"
                >
                  new cases per 100,000
                </td>
              </tr>
            </table>
          </div>
        </div>

        <div class="d-flex m-0 mt-3">
          <div class="d-flex flex-column">
            <small class="">new deaths per day</small>
            <Bargraph
              id="time-trace"
              :data="timeTrace"
              :date1="date1"
              :include2Week="isDiff"
              :variableObj="{ value: 'dead_numIncrease' }"
              :width="100"
              :height="40"
              :color="'#9f9f9f'"
              colorAverage="#2c3e50"
            />
          </div>
          <div class="d-flex flex-column ml-3">
            <small class="text-underline">on {{ date }}</small>
            <table>
              <tr>
                <td
                  class="line-height-1 text-right pb-1"
                  style="vertical-align: top"
                >
                  <b>{{ timeDead }}</b>
                </td>
                <td
                  class="line-height-1 pl-2"
                  style="width: 125px; vertical-align: top"
                >
                  new deaths
                </td>
              </tr>
              <tr>
                <td
                  class="line-height-1 text-right"
                  style="vertical-align: top"
                >
                  <b>{{ timeDeadPC }}</b>
                </td>
                <td
                  class="line-height-1 pl-2"
                  style="width: 125px; vertical-align: top"
                >
                  new deaths per 100,000
                </td>
              </tr>
            </table>
          </div>
        </div>
      </template>
    </div>
    <div class="d-flex flex-column">
      <HistogramLegend
        v-if="data && data.length"
        class="ml-2"
        :data="data"
        :animate="animate"
        :transition1="transition1"
        :minVal="selectedMin"
        :maxVal="selectedMax"
        :width="widthLegend"
        :variable="variable"
        :variableLabel="variableLabel"
        :colorScale="colorScale"
      />
      <div v-if="filteredData" class="d-flex justify-content-between mt-4">
        <DotPlot
          :data="filteredData"
          :variable="variable"
          :animate="animate"
          :transition1="transition1"
          :colorScale="colorScale"
          :sortAsc="false"
          :title="variableLabel"
          :width="widthLegend / 2 - 5"
          :rightAlign="rightAlignDesc"
          :varMax="varMax"
        />
        <DotPlot
          :data="filteredData"
          :variable="variable"
          :animate="animate"
          :transition1="transition1"
          :colorScale="colorScale"
          :sortAsc="true"
          :title="variableLabel"
          :width="widthLegend / 2 - 5"
          :rightAlign="rightAlignAsc"
          :varMax="varMax"
        />
      </div>
      <DataUpdated />
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import { useRouter } from 'vue-router';
import { geoEqualEarth, geoAlbersUsa, geoPath } from 'd3-geo';
import { max, min } from 'd3-array';
import { format } from 'd3-format';
import { select, selectAll } from 'd3-selection';
import { timeFormat, timeParse } from 'd3-time-format';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';

import { getSparklineTraces } from '@/api/epi-traces.js';
import { lazyLoad } from '@/js/lazy-load';
import { adminStore } from '@/stores/adminStore';

const HistogramLegend = lazyLoad('HistogramLegend');
const DataUpdated = lazyLoad('DataUpdated');
const Bargraph = lazyLoad('Bargraph');
const DotPlot = lazyLoad('DotPlot');

const props = defineProps({
  data: Array,
  outline: Array,
  blankMap: Object,
  variable: String,
  selectedMin: Number,
  selectedMax: Number,
  date1: String,
  maxDate: Date,
  variableLabel: String,
  colorScale: Function,
  adminLevel: String,
  animate: Boolean,
});

// global variable - equivalent with this.$apiurl
const apiUrl = inject('apiUrl');

// instead of this.$router
const router = useRouter();

const store = adminStore();

const width = ref(0);
const height = ref(350);
const widthLegend = ref(350);
const margin = ref({
  top: 2,
  right: 2,
  bottom: 2,
  left: 2,
});
// data
const filteredData = ref(null);
const projection = ref(null);
const timeTrace = ref(null);
const timeConfirmed = ref(null);
const timeConfirmedPC = ref(null);
const timeDead = ref(null);
const timeDeadPC = ref(null);
// refs
const svg = ref(null);
const blank = ref(null);
const overlay = ref(null);
const regions = ref(null);
const ttips = ref(null);
// methods
const path = ref(geoPath());
const transition1 = ref(500);
// variables to replace this.$refs
const map_container = ref(null);
const svgRef = ref(null);
const blank_map = ref(null);
const overlayRef = ref(null);
const regionsRef = ref(null);
const choropleth_tooltip = ref(null);
const dateRef = ref(null);

// missing variables
const dataSubscription = ref(null);
// new variable to get event clientX, clientY
const x = ref(0);
const y = ref(0);

// computed variables
const maxVal = computed(() => {
  return filteredData.value
    ? max(filteredData.value, (d) => d[props.variable])
    : null;
});

const minVal = computed(() => {
  return filteredData.value
    ? min(filteredData.value, (d) => d[props.variable])
    : null;
});

const varMax = computed(() => {
  return Math.max(Math.abs(minVal.value), maxVal.value);
});

const rightAlignAsc = computed(() => {
  return minVal.value < -1;
});

const rightAlignDesc = computed(() => {
  return maxVal.value < -1;
});

const isDiff = computed(() => {
  return props.variable.includes('_14days_ago_diff');
});

const dateTime = computed(() => {
  return props.date1 ? timeParse('%Y-%m-%d')(props.date1) : null;
});

const date = computed(() => {
  if (dateTime.value) {
    return timeFormat('%d %B %Y')(dateTime.value);
  } else {
    return null;
  }
});

const rollLength = computed(() => {
  const dateDiff = (props.maxDate - dateTime.value) / (1000 * 3600 * 24);
  return dateDiff > 2 ? 7 : dateDiff + 4;
});

const title = computed(() => {
  return props.date1
    ? `${props.variableLabel} as of ${date.value}`
    : props.variableLabel;
});

const setDims = (redraw = true) => {
  const whRatio = 1.72; // based on the
  const selector = map_container.value;
  const marginLegend = 25;
  const selectorsProportion = 1;

  if (selector) {
    const dims = selector.getBoundingClientRect();

    width.value =
      dims.width >= 800
        ? dims.width - marginLegend - widthLegend.value
        : dims.width;
    widthLegend.value = dims.width >= 225 ? widthLegend.value : dims.width; // make legend smaller on small screens

    const idealHeight = width.value / whRatio;
    if (idealHeight < window.innerHeight * selectorsProportion) {
      height.value = idealHeight * selectorsProportion;
    } else {
      height.value = window.innerHeight * selectorsProportion;
      width.value = height.value * whRatio - marginLegend - widthLegend.value;
    }

    // Set scale and projection for the map
    if (redraw) {
      drawMap();
    }
  }
};

const setupChoro = () => {
  svg.value = select(svgRef.value);
  blank.value = select(blank_map.value);
  overlay.value = select(overlayRef.value);
  regions.value = select(regionsRef.value);
  ttips.value = select(choropleth_tooltip.value);
};

const setupMap = () => {
  if (props.adminLevel === '0') {
    projection.value = geoEqualEarth()
      .center([30.05125, 11.528635]) // so this should be calcuable from the bounds of the geojson, but it's being weird, and it's constant for the world anyway...
      .scale(1)
      .translate([width.value / 2, height.value / 2]);
  } else {
    projection.value = geoAlbersUsa()
      .scale(1)
      .translate([width.value / 2, height.value / 2]);
  }

  path.value = path.value.projection(projection.value);
  // calc and set scale
  // from zoom to bounds: https://bl.ocks.org/mbostock/4699541
  const bounds = path.value.bounds(props.blankMap),
    dx = bounds[1][0] - bounds[0][0],
    dy = bounds[1][1] - bounds[0][1],
    xscale = (width.value / dx) * 0.98,
    yscale = (height.value / dy) * 0.98,
    scale = min([xscale, yscale]);

  projection.value = projection.value.scale(scale);
};

const drawMap = () => {
  setupMap();

  filteredData.value = cloneDeep(props.data);

  if (props.selectedMin || props.selectedMin === 0) {
    filteredData.value = filteredData.value.filter(
      (d) => d[props.variable] >= props.selectedMin,
    );
  }
  if (props.selectedMax || props.selectedMax === 0) {
    filteredData.value = filteredData.value.filter(
      (d) => d[props.variable] <= props.selectedMax,
    );
  }

  if (filteredData.value && width.value) {
    // blank map outline
    blank.value
      .selectAll('path')
      .data(props.blankMap.features)
      .join(
        (enter) => {
          enter
            .append('path')
            .attr('class', 'blank-outline')
            .style('fill', 'none')
            .style('stroke', '#8aa4be')
            .style('stroke-width', 0.25)
            // draw each region
            .attr('d', path.value);
        },
        (update) => update.attr('d', path.value),
        (exit) =>
          exit.call((exit) =>
            exit.transition().style('opacity', 1e-5).remove(),
          ),
      );

    // regional data
    regions.value
      .selectAll('path')
      .data(filteredData.value, (d) => d.location_id)
      .join(
        (enter) => {
          // update date
          select(dateRef.value).html(date.value);

          enter
            .append('path')
            .attr('class', 'region pointer')
            .attr('id', (d) => d.location_id)
            .style('stroke', '#8aa4be')
            .style('stroke-width', 0.25)
            // draw each region
            .attr('d', path.value)
            .attr('fill', (d) => (d.fill ? d.fill : 'none'));
        },
        (update) => {
          // update date
          select(dateRef.value).html(date.value);

          update
            .attr('id', (d) => d.location_id)
            .attr('d', path.value)
            .call((update) => {
              if (props.animate) {
                update
                  .transition()
                  .duration(transition1.value)
                  .attr('fill', (d) => (d.fill ? d.fill : 'none'));
              } else {
                update.attr('fill', (d) => (d.fill ? d.fill : 'none'));
              }
            });
        },
        (exit) =>
          exit.call((exit) =>
            exit.transition().style('opacity', 1e-5).remove(),
          ),
      );

    // state map overlay
    overlay.value
      .selectAll('path')
      .data(props.outline)
      .join(
        (enter) => {
          enter
            .append('path')
            .attr('class', 'outline')
            .style('fill', 'none')
            .style('stroke', '#3e5871')
            .style('stroke-width', '1')
            // draw each region
            .attr('d', path.value);
        },
        (update) => update.attr('d', path.value),
        (exit) =>
          exit.call((exit) =>
            exit.transition().style('opacity', 1e-5).remove(),
          ),
      );

    // tooltip
    regions.value
      .selectAll('path.region')
      .on('click', (d) => handleClick(d))
      .on('mouseenter', (d) => debounceMouseOn(d))
      .on('mouseleave', mouseOff);

    store.$patch({ dataloading: false });
  } else {
    store.$patch({ dataloading: false });
  }
};

const handleClick = (d) => {
  router.push({
    path: 'epidemiology',
    query: {
      location: d.location_id,
    },
  });
};
// https://stackoverflow.com/questions/43407947/how-to-throttle-function-call-on-mouse-event-with-d3-js/43448820
// modified to save the d3. event to vue::this

const mouseOn = (d) => {
  timeTrace.value = null; // reset to avoid seeing old data
  timeConfirmed.value =
    timeConfirmedPC.value =
    timeDead.value =
    timeDeadPC.value =
      null; // reset to avoid seeing old data
  if (d.value) {
    getTimetrace(d.location_id);

    const ttip = ttips.value
      .style('top', y.value + 'px')
      .style('left', x.value + 'px')
      .style('opacity', 1);

    regions.value.selectAll('path.region').style('opacity', 0.5);
    regions.value.selectAll('path.outline').style('opacity', 0.75);
    regions.value.selectAll(`#${d.location_id}`).style('opacity', 1);
    ttips.value.select('.country-name').text(d.name);
    ttips.value.select('.value').html(d.tooltip);
  }
};

const mouseOff = () => {
  timeTrace.value = []; // reset to avoid seeing old data
  timeConfirmed.value =
    timeConfirmedPC.value =
    timeDead.value =
    timeDeadPC.value =
      null; // reset to avoid seeing old data
  selectAll('.tooltip').style('opacity', 0);
  regions.value.selectAll('path.region').style('opacity', 1);
  regions.value.selectAll('path.outline').style('opacity', 1);
  // cancel data subscription
  if (dataSubscription.value) {
    dataSubscription.value.unsubscribe();
  }
};

const getTimetrace = (location_id) => {
  dataSubscription.value = getSparklineTraces(
    apiUrl,
    [location_id],
    'confirmed_numIncrease, confirmed_rolling, dead_numIncrease, dead_rolling, dead_rolling_per_100k, confirmed_rolling_per_100k',
  ).subscribe((results) => {
    timeTrace.value = results[0].value;
    const currentData = timeTrace.value.filter(
      (d) => d.date - dateTime.value === 0,
    );

    if (currentData.length === 1) {
      timeConfirmed.value = format(',.1f')(currentData[0].confirmed_rolling);
      timeConfirmedPC.value = format(',.1f')(
        currentData[0].confirmed_rolling_per_100k,
      );
      timeDead.value = format(',.1f')(currentData[0].dead_rolling);
      timeDeadPC.value = format(',.1f')(currentData[0].dead_rolling_per_100k);
    }
  });
};

watch(
  () => props.data,
  () => {
    drawMap();
  },
  { deep: true },
);

const debounceMouseOn = debounce(mouseOn, 250);

onMounted(() => {
  // this.$nextTick in optionsAPI
  nextTick(() => {
    window.addEventListener('resize', setDims);
    // set initial dimensions for the stacked area plots.
    setDims(false);

    // event listener to hide tooltips
    document.addEventListener(
      'mousemove',
      (evt) => {
        if (
          !evt.target.className ||
          !evt.target.className.baseVal ||
          !evt.target.className.baseVal.includes('region')
        ) {
          mouseOff();
        }
        if (
          evt.target.className &&
          evt.target.className.baseVal &&
          typeof evt.target.className.baseVal === 'string' &&
          evt.target.className.baseVal.includes('region')
        ) {
          x.value = evt.clientX;
          y.value = evt.clientY;
        }
      },
      {
        passive: true,
      },
    );
    document.addEventListener(
      'mouseleave',
      (evt) => {
        if (
          !evt.target.className ||
          !evt.target.className.baseVal ||
          !evt.target.className.baseVal.includes('region')
        ) {
          mouseOff();
        }
      },
      {
        passive: true,
      },
    );
  });

  setupChoro();
});

onBeforeUnmount(() => {
  if (dataSubscription.value) {
    dataSubscription.value.unsubscribe();
  }
});
</script>

<style lang="scss">
.region:hover {
  stroke: $base-grey;
  stroke-width: 1.5;
}

.choropleth-tooltip {
  position: fixed;
  z-index: 1000;
  background: #ffffff;
  opacity: 0;
  pointer-events: none;
}
</style>
