<template>
  <div
    :id="`bargraph-${id}-${variable}`"
    class="bargraph-group d-flex flex-column bargraph-group-margin"
    :style="{ transform: `scale(${transformChart})` }"
  >
    <h4 v-if="title">
      {{ title }}
    </h4>
    <div class="position-relative">
      <div
        id="barchart-wrapper"
        ref="barchart_wrapper"
        :style="{ transform: `translate(${margin.left}px,${margin.top}px)` }"
      >
        <div :class="tooltipIdx">
          <div class="tooltip p-2">
            <h6 class="country-name m-0" />
            <p class="date m-0" />
            <p class="count m-0" />
            <b class="count-avg m-0" />
          </div>
        </div>
      </div>
      <svg
        ref="svgRef"
        :width="width + margin.left + margin.right"
        :height="height + margin.top + margin.bottom"
        class="epi-bargraph"
        :name="plotTitle"
        :subtitle="title"
      >
        <defs>
          <marker
            id="arrow-start"
            markerWidth="13"
            markerHeight="10"
            refX="0"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M7,0 L0,5 L7,10" class="swoopy-arrowhead" />
          </marker>
          <marker
            id="arrow"
            markerWidth="13"
            markerHeight="10"
            refX="10"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M5,0 L12,5 L5,10" class="swoopy-arrowhead" />
          </marker>
        </defs>

        <g
          id="xAxis"
          ref="xAxisRef"
          :transform="`translate(${margin.left}, ${height + margin.top + 2})`"
          class="epi-axis axis--x axis-font"
        />
        <g
          id="yAxis"
          ref="yAxisRef"
          :transform="`translate(${margin.left - 5}, ${margin.top})`"
          class="epi-axis axis--y axis-font"
        />
        <g
          id="case-counts"
          ref="case_counts"
          :transform="`translate(${margin.left},${margin.top})`"
          class="bargraph"
        />
        <g
          id="rolling-average"
          ref="rolling_average"
          :transform="`translate(${margin.left},${margin.top})`"
          class="bargraph"
        />
        <g class="annotations" :class="{ hidden: noRollingAvg }">
          <line
            :style="{ stroke: colorAverage, 'stroke-width': 2.5 }"
            :x1="margin.left + 5"
            :x2="margin.left + 20"
            :y1="margin.top + 6"
            :y2="margin.top + 6"
          />
          <text
            class="annotation--rolling-average"
            :x="margin.left + 25"
            :y="margin.top"
            :style="{
              fill: colorAverage,
              'dominant-baseline': 'hanging',
              'font-family': 'DM Sans, Avenir, Helvetica, Arial, sans-serif',
            }"
          >
            7 day rolling average
          </text>
        </g>
      </svg>
      <svg
        ref="svg_arrows"
        :width="width + margin.left + margin.right"
        :height="height + margin.top + margin.bottom"
        style="left: 0; bottom: 0"
        class="epi-bargraph-arrows position-absolute"
      >
        <g
          v-if="includeAxis && loggable"
          ref="switch_btn"
          class="switch-button-group"
          transform="translate(5,0)"
        >
          <rect class="switch-button-rect" />
          <path
            id="switch-btn-swoopy-arrow"
            class="swoopy-arrow"
            marker-end="url(#arrow)"
          />
          <text class="switch-button" x="5" />
        </g>
      </svg>
    </div>

    <!-- Link location variant reports -->
    <router-link
      v-if="location_id"
      class="btn btn-main mt-3"
      :to="{ name: 'LocationReports', query: { loc: location_id } }"
    >
      View {{ title }} Variant Report
    </router-link>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { extent, max } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { format } from 'd3-format';
import { line } from 'd3-shape';
import { scaleBand, scaleLinear, scaleLog } from 'd3-scale';
import { select, selectAll } from 'd3-selection';
import { timeDay } from 'd3-time';
import { timeFormat, timeParse } from 'd3-time-format';
import cloneDeep from 'lodash/cloneDeep';
import { Application, Rectangle } from 'pixi.js';
import { SmoothGraphics } from '@pixi/graphics-smooth';

const props = defineProps({
  data: Array,
  width: Number,
  height: Number,
  transformChart: Number,
  tooltipIdx: String,
  variableObj: Object,
  id: String,
  color: String,
  colorAverage: {
    type: String,
    default: 'black',
  },
  title: String,
  log: Boolean,
  percapita: Boolean,
  location: String,
  includeAxis: {
    type: Boolean,
    default: false,
  },
  loggable: {
    type: Boolean,
    default: true,
  },
  includeTooltips: {
    type: Boolean,
    default: false,
  },
  fixedYMax: {
    type: Number,
    default: null,
  },
  xVariableLim: {
    type: Array,
    default: null,
  },
  date1: {
    type: String,
  },
  include2week: {
    type: Boolean,
    default: false,
  },
  animate: {
    type: Boolean,
    default: false,
  },
});

// instead of this.$router
const router = useRouter();

const margin = ref({
  top: 15,
  bottom: 60,
  left: 95,
  right: 35,
});
// axes
const y = ref(null);
const x = ref(scaleBand().paddingInner(0));
const numYTicks = ref(6);
const isLogY = ref(false);
const yMin = ref(0);
// renamed due to duplicated name - there is line function in d3
const lineMethod = ref(null);
// refs
const chart = ref(null);
const average = ref(null);
const noRollingAvg = ref(true);
const pixiApp = ref(null);
const location_id = ref(null);
// added these variables to replace this.$refs
const svgRef = ref(null);
const barchart_wrapper = ref(null);
const switch_btn = ref(null);
const xAxisRef = ref(null);
const yAxisRef = ref(null);
// missing variables
const wrapper = ref(null);
const plottedData = ref(null);
const logData = ref(null);
const switchBtn = ref(null);
const xAxis = ref(null);
const yAxis = ref(null);
// new variable
const variable = ref('confirmed_numIncrease');

const plotTitle = computed(() => {
  return props.percapita
    ? `Number of COVID-19 ${props.variableObj.label} per 100,000 residents`
    : `Number of COVID-19 ${props.variableObj.label}`;
});

const setupPlot = () => {
  svgRef.value = select(`#bargraph-${props.id}-${variable.value}`).select(
    'svg.epi-bargraph',
  );
  chart.value = svgRef.value.select('#case-counts');
  average.value = svgRef.value.select('#rolling-average');

  lineMethod.value = line()
    .x((d) => x.value(d.date))
    .y((d) => y.value(d[variable.value.replace('_numIncrease', '_rolling')]));
};

const setupBarChart = () => {
  wrapper.value = barchart_wrapper.value;
  pixiApp.value = new Application({
    backgroundAlpha: 0,
    width: 650,
    height: props.height,
  });
  wrapper.value.appendChild(pixiApp.value.view);
  prepData();
  if (plottedData.value && props.width && props.height) {
    updateScales();
    drawBarchart();
  }
};

const prepData = () => {
  location_id.value =
    props.data && props.data.length && props.data[0].admin_level >= 0
      ? props.data[0].location_id
      : null;

  if (props.percapita) {
    variable.value =
      variable.value.includes('_per_100k') ||
      props.variableObj.percapita === false
        ? variable.value
        : variable.value + '_per_100k';
  } else {
    variable.value = variable.value.replace('_per_100k', '');
  }

  if (props.data && props.includeAxis) {
    logData.value = cloneDeep(props.data).filter((d) => d[variable.value] >= 1);
    logData.value.forEach((d) => {
      d['confirmed_log'] = Math.log10(d.confirmed_numIncrease);
    });
    plottedData.value = isLogY.value
      ? logData.value
      : props.data.filter((d) => d[variable.value] >= 0);
  } else {
    plottedData.value = props.data.filter((d) => d[variable.value] >= 0);
  }
};

const updatePlot = () => {
  prepData();

  if (plottedData.value && props.width && props.height) {
    updateScales();
    drawPlot();
    drawBarchart();
  }
};

const updateScales = () => {
  const range = props.xVariableLim
    ? props.xVariableLim
    : extent(plottedData.value, (d) => d.date);

  x.value = x.value
    .range([0, props.width])
    .domain(timeDay.range(range[0], timeDay.offset(range[1], 1)));

  const yMax = props.fixedYMax
    ? props.fixedYMax
    : max(plottedData.value, (d) => d[variable.value]);

  if (isLogY.value) {
    yMin.value = 0.5;

    y.value = scaleLog().range([props.height, 0]).domain([yMin.value, yMax]);
  } else {
    yMin.value = 0;

    y.value = scaleLinear().range([props.height, 0]).domain([yMin.value, yMax]);
  }

  // --- update y-scale switch button --
  const dySwitch = 30;
  const xSwoop = 15;
  const ySwoop = -35;
  const swoopOffset = 5;

  switchBtn.value = select(switch_btn.value);

  switchBtn.value
    .select('.switch-button-rect')
    .attr('y', props.height + margin.value.top + dySwitch)
    .on('click', () => changeScale());

  switchBtn.value.select('path').attr(
    'd',
    `M ${xSwoop} ${
      props.height + margin.value.top + margin.value.bottom + ySwoop
    }
            C ${xSwoop} ${
      props.height + margin.value.top + margin.value.bottom + ySwoop - 10
    },
            ${margin.value.left + ySwoop - 10} ${
      props.height + margin.value.top + 5
    },
            ${margin.value.left + ySwoop + 5} ${
      props.height + margin.value.top
    }`,
  );

  switchBtn.value
    .select('text')
    .text(`switch to ${isLogY.value ? 'linear' : 'log'} scale`)
    .attr('y', props.height + margin.value.top + dySwitch + 20);

  if (switchBtn.value.select('text').node()) {
    switchBtn.value
      .select('rect')
      .attr('width', switchBtn.value.select('text').node().getBBox().width + 10)
      .attr(
        'height',
        switchBtn.value.select('text').node().getBBox().height + 5,
      );
  }

  if (props.includeAxis) {
    // ~ 4 tick marks, rounded to the nearest week interval (4*7)
    const plotInterval = Math.round(x.value.domain().length / 28) * 7;
    xAxis.value = axisBottom(x.value)
      .tickSizeOuter(0)
      .tickValues(
        x.value.domain().filter(function (d, i) {
          return !(i % plotInterval);
        }),
      )
      .tickFormat(timeFormat('%b %Y'));

    select(xAxisRef.value).call(xAxis.value);

    yAxis.value = isLogY.value
      ? axisLeft(y.value)
          .tickSizeOuter(0)
          .ticks(numYTicks.value)
          .tickFormat((d, i) => {
            const log = Math.log10(d);
            return Math.abs(Math.round(log) - log) < 1e-6 && log >= 0
              ? format(',')(d)
              : '';
          })
      : axisLeft(y.value).tickSizeOuter(0).ticks(numYTicks.value);

    select(yAxisRef.value).call(yAxis.value);
  }
};

const drawPlot = () => {
  if (chart.value) {
    const endDate = timeParse('%Y-%m-%d')(props.date1);
    // v-line to indicate dates
    if (props.date1) {
      const dateSelector = chart.value
        .selectAll(`.date-annotation_${variable.value}`)
        .data([endDate]);

      dateSelector.join(
        (enter) =>
          enter
            .append('line')
            .attr(
              'class',
              (d) => `.date-annotation_${variable.value} annotation-date1`,
            )
            .style('stroke', '#D13B62')
            .attr('x1', (d) => x.value(d))
            .attr('x2', (d) => x.value(d))
            .attr('y1', (d) => 0)
            .attr('y2', (d) => props.height),

        (update) =>
          update
            .attr('x1', (d) => x.value(d))
            .attr('x2', (d) => x.value(d))
            .attr('y1', (d) => 0)
            .attr('y2', (d) => props.height),

        (exit) =>
          exit.call((exit) =>
            exit.transition().duration(10).style('opacity', 1e-5).remove(),
          ),
      );

      if (props.include2week && x.value(endDate)) {
        const dateSelector = chart.value
          .selectAll(`.date-annotation_${variable.value}`)
          .data([endDate]);

        dateSelector.join(
          (enter) =>
            enter
              .append('rect')
              .attr(
                'class',
                (d) => `.date-annotation_${variable.value} annotation-date1`,
              )
              .style('fill', '#D13B62')
              .style('fill-opacity', 0.1)
              .attr('x', (d) => x.value(timeDay.offset(endDate, -14)))
              .attr(
                'width',
                (d) => x.value(d) - x.value(timeDay.offset(d, -14)),
              )
              .attr('y', 0)
              .attr('height', props.height),

          (update) =>
            update
              .attr('x1', (d) => x.value(d))
              .attr('x2', (d) => x.value(d))
              .attr('y1', (d) => 0)
              .attr('y2', (d) => props.height),

          (exit) =>
            exit.call((exit) =>
              exit.transition().duration(10).style('opacity', 1e-5).remove(),
            ),
        );
      }
    }

    let lineSelector;
    if (
      [
        'confirmed_numIncrease',
        'confirmed_numIncrease_per_100k',
        'dead_numIncrease',
        'dead_numIncrease_per_100k',
        'recovered_numIncrease',
        'recovered_numIncrease_per_100k',
      ].includes(variable.value)
    ) {
      const averageData = isLogY.value
        ? plottedData.value.filter(
            (d) => d[variable.value.replace('_numIncrease', '_rolling')] >= 1,
          )
        : plottedData.value.filter(
            (d) => d[variable.value.replace('_numIncrease', '_rolling')],
          );
      lineSelector = average.value
        .selectAll('.rolling-average')
        .data([averageData], (d) => d._id);
    } else {
      lineSelector = average.value
        .selectAll('.rolling-average')
        .data([], (d) => d._id);
    }

    lineSelector.join(
      (enter) => {
        enter

          .append('path')
          .attr('class', 'rolling-average')
          .style('stroke', props.colorAverage)
          .style('fill', 'none')
          .style('stroke-width', '2.5')
          .datum((d) => d)
          .join('path')
          .attr('d', lineMethod.value)
          .attr('stroke-dasharray', 0)
          .attr('stroke-dashoffset', 0);
      },
      (update) => {
        update

          .style('stroke', props.colorAverage)
          .attr('d', lineMethod.value)
          .attr('stroke-dasharray', 0)
          .attr('stroke-dashoffset', 0);
      },
      (exit) =>
        exit.call((exit) =>
          exit.transition().duration(10).style('opacity', 1e-5).remove(),
        ),
    );
  }
};

const drawBarchart = () => {
  // this.pixiApp.renderer.resize(this.width, this.height)
  if (pixiApp.value) {
    if (pixiApp.value.stage.children.length > 0) {
      pixiApp.value.stage.removeChildren();
    }

    let hoverLine = new SmoothGraphics();
    hoverLine.beginFill(0x000000);
    hoverLine.drawRect(0, 0, x.value.bandwidth() * 2, 40);
    hoverLine.endFill();
    hoverLine.alpha = 0;
    pixiApp.value.stage.addChild(hoverLine);

    let hoverCircle = new SmoothGraphics();
    hoverCircle.beginFill(0x000000, 1);
    hoverCircle
      .lineStyle(2, 0x000000, 1.0)
      .drawCircle(0, 0, x.value.bandwidth() * 4);
    hoverCircle.endFill();
    hoverCircle.alpha = 0;
    pixiApp.value.stage.addChild(hoverCircle);

    plottedData.value
      .filter((t) => t[variable.value])
      .forEach((d) => {
        let barchart = new SmoothGraphics();
        if (d.confirmed_numIncrease > d.confirmed_rolling) {
          barchart.hitArea = new Rectangle(
            x.value(d.date),

            y.value(d[variable.value.replace('_numIncrease', '_rolling')]) -
              100,
            x.value.bandwidth(),
            y.value(yMin.value) -
              (y.value(d[variable.value.replace('_numIncrease', '_rolling')]) -
                100),
          );
        } else {
          barchart.hitArea = new Rectangle(
            x.value(d.date),
            y.value(d[variable.value.replace('_numIncrease', '_rolling')]) -
              100,
            x.value.bandwidth(),
            y.value(yMin.value) -
              (y.value(d[variable.value.replace('_numIncrease', '_rolling')]) -
                100),
          );
        }
        barchart.beginFill(0x507ea3, 0.55);
        let bar = barchart
          .lineStyle(0.9, 0x507ea3, 0, 0.5)
          .drawRect(
            x.value(d.date),
            y.value(d[variable.value]),
            x.value.bandwidth(),
            y.value(yMin.value) - y.value(d[variable.value]),
          );

        barchart.endFill();
        if (props.includeTooltips) {
          bar.interactive = true;

          bar.on('pointerover', (event) => {
            const ttip = selectAll(`.${props.tooltipIdx}`)
              .selectAll('.tooltip')
              .style(
                'top',
                y.value(d[variable.value.replace('_numIncrease', '_rolling')]) +
                  'px',
              )
              .style('left', event.data.global.x + 'px')
              .style('opacity', 1);

            ttip.select('.country-name').text(d.name);
            ttip.select('.date').text(timeFormat('%d %b %Y')(d.date));
            ttip
              .select('.count')
              .text(
                `${format(',.1f')(d[variable.value])} ${
                  props.variableObj.ttip
                }`,
              );
            if (noRollingAvg.value) {
              ttip.select('.count-avg').text('');
            } else {
              ttip
                .select('.count-avg')
                .text(
                  `7 day average: ${format(',.1f')(
                    d[variable.value.replace('_numIncrease', '_rolling')],
                  )}`,
                );
            }

            hoverLine.alpha = 1;
            hoverLine.position.set(
              x.value(d.date),
              y.value(d[variable.value.replace('_numIncrease', '_rolling')]),
            );
            hoverLine.height =
              y.value(yMin.value) -
              y.value(d[variable.value.replace('_numIncrease', '_rolling')]);

            hoverCircle.alpha = 1;
            let circ_x = x.value(d.date) + x.value.bandwidth() / 2;
            hoverCircle.position.set(
              circ_x,
              y.value(d[variable.value.replace('_numIncrease', '_rolling')]),
            );
          });
          bar.on('pointerout', (event) => {
            selectAll('.tooltip').style('opacity', 0);
            hoverLine.alpha = 0;
            hoverCircle.alpha = 0;
          });
        }
        pixiApp.value.stage.addChild(barchart);
      });
  }
};

const changeScale = () => {
  isLogY.value = !isLogY.value;
  router.replace({
    path: 'epidemiology',
    name: 'Epidemiology',
    state: {
      disableScroll: true,
    },
    query: {
      location: props.location,
      log: String(isLogY.value),
      variable: variable.value.replace('_per_100k', ''),
      fixedY: String(!!props.fixedYMax),
      percapita: String(props.percapita),
    },
  });

  updatePlot();
  drawBarchart();
};

watch(
  () => props.data,
  () => {
    updatePlot();
    drawBarchart();
  },
  { deep: true },
);

watch(
  () => props.variableObj,
  (newObj, oldObj) => {
    variable.value = newObj.value;
    noRollingAvg.value =
      ![
        'confirmed_numIncrease',
        'dead_numIncrease',
        'recovered_numIncrease',
      ].includes(variable.value) || !props.animate;
    updatePlot();
    drawBarchart();
  },
  { deep: true },
);

//TODO: should check why it was commented before
watch(variable, () => {
  updatePlot();
});

watch(
  () => props.fixedYMax,
  () => {
    updatePlot();
    drawBarchart();
  },
);

watch(
  () => props.log,
  (newVal, oldVal) => {
    isLogY.value = newVal;
    updatePlot();
    drawBarchart();
  },
  { immediate: true },
);

watch(
  () => props.percapita,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      updatePlot();
      drawBarchart();
    }
  },
  { immediate: true },
);

watch(
  () => props.width,
  () => {
    updatePlot();
    drawBarchart();
  },
);

watch(
  () => props.height,
  () => {
    updatePlot();
    drawBarchart();
  },
);

onMounted(() => {
  if (!props.includeAxis) {
    margin.value = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    };
  }

  setupPlot();
  setupBarChart();
  updatePlot();
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

.switch-button-rect {
  cursor: pointer;
  fill: #fff;
  rx: 5;
  ry: 5;
  stroke: #126b93;
  stroke-width: 1;
  shape-rendering: crispedges;
}

.swoopy-arrow,
.swoopy-arrowhead {
  stroke: #698bac;
  fill: none;
  stroke-width: 0.8;
}

.epi-bargraph {
  pointer-events: none;
}

.epi-bargraph-arrows {
  pointer-events: none;

  & rect {
    pointer-events: auto !important;
  }
}

#barchart-wrapper {
  position: absolute;
}

.axis-font {
  font-size: 1rem;
}

.annotation--rolling-average {
  font-size: 0.75em;
}

@media only screen and (max-width: 790px) {
  h4 {
    font-size: 2.5rem;
  }
  .annotation--rolling-average {
    font-size: 1.2rem;
  }
  .axis-font {
    font-size: 1.5rem;
  }
  .bargraph-group-margin {
    margin-left: 1%;
  }
}
</style>
