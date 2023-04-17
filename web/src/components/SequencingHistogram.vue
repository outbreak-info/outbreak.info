<template>
  <div>
    <!-- LEGEND -->
    <div v-if="!downward" class="d-flex">
      <small class="text-uppercase" :style="{ color: notDetectedColor }">
        {{ title }}
      </small>
      <small
        v-if="!onlyTotals"
        class="text-uppercase ml-3"
        :style="{ color: detectedColor }"
      >
        <span v-if="showDetected">*</span>
        {{ mutationName }} detected
      </small>
    </div>

    <!-- SEQUENCING HISTOGRAM -->
    <svg
      ref="svg-counts"
      :width="width"
      :height="height"
      :class="className"
      :name="svgTitle"
    >
      <g
        ref="countsRef"
        :transform="`translate(${margin.left}, ${margin.top})`"
      />
      <g
        ref="xAxisRef"
        :transform="`translate(${margin.left}, ${height - margin.bottom + 1})`"
        class="prevalence-axis total-axis axis--x"
        :class="{ hidden: !includeXAxis }"
      />
      <g
        ref="yAxisLeftRef"
        :transform="`translate(${margin.left - xBandwidth / 2 - 5}, ${
          margin.top
        })`"
        class="prevalence-axis total-axis axis--y"
        :class="{ hidden: !data.length }"
      />
      <g
        ref="yAxisRightRef"
        :transform="`translate(${width - margin.right + xBandwidth / 2 + 5}, ${
          margin.top
        })`"
        class="prevalence-axis total-axis axis--y"
        :class="{ hidden: !data.length }"
      />
    </svg>

    <!-- LEGEND -->
    <div v-if="downward" class="d-flex">
      <small
        v-if="width > 250"
        class="text-uppercase"
        :style="{
          'margin-left': margin.left + 'px',
          color: notDetectedColor,
        }"
      >
        {{ title }}
      </small>
      <small v-else class="text-uppercase" :style="{ color: notDetectedColor }">
        {{ title }}
      </small>
      <small
        v-if="!onlyTotals"
        class="text-uppercase ml-3"
        :style="{ color: detectedColor }"
      >
        <span v-if="showDetected">*</span>
        {{ mutationName }} detected
      </small>
    </div>

    <!-- TOOLTIPS -->
    <div
      v-if="onlyTotals"
      id="tooltip-prevalence"
      ref="tooltip_prevalence"
      class="tooltip-basic box-shadow"
    >
      <h5 id="date" />
      <b id="sequencing-count" class="font-size-2" />
    </div>

    <div
      v-else
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
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { max, extent } from 'd3-array';
import { axisLeft, axisBottom, axisRight } from 'd3-axis';
import { format } from 'd3-format';
import { scaleLinear, scaleTime } from 'd3-scale';
import { select, selectAll, event } from 'd3-selection';
import { timeDay } from 'd3-time';

const props = defineProps({
  data: Array,
  mutationName: String,
  svgTitle: String,
  title: {
    type: String,
    default: 'Total samples sequenced per day',
  },
  xInput: Function,
  className: {
    type: String,
    default: 'sequencing-histogram',
  },
  width: Number,
  height: {
    type: Number,
    default: 80,
  },
  margin: Object,
  notDetectedColor: {
    type: String,
    default: '#af88a5',
  },
  detectedColor: {
    type: String,
    default: '#980072',
  },
  downward: {
    type: Boolean,
    default: true,
  },
  includeXAxis: {
    type: Boolean,
    default: false,
  },
  onlyTotals: {
    type: Boolean,
    default: false,
  },
});

const showDetected = ref(null);
const detectedDisplayThresh = ref(50);
// variables
const xVariable = ref('dateTime');
const totalVariable = ref('total_count');
// axes
const x = ref(null);
const y = ref(scaleLinear());
const maxCounts = ref(null);
const xBandwidth = ref(1);
const xAxis = ref(null);
const yAxisLeft = ref(null);
const yAxisRight = ref(null);
const numXTicks = ref(2);
const counts = ref(null);
const countsRef = ref(null);
const xAxisRef = ref(null);
const yAxisLeftRef = ref(null);
const yAxisRightRef = ref(null);
const tooltip_prevalence = ref(null);

const setupPlot = () => {
  counts.value = select(countsRef.value);
};

const updateScales = () => {
  if (!props.xInput) {
    x.value = scaleTime()
      .range([0, props.width - props.margin.left - props.margin.right])
      .domain(extent(props.data.map((d) => d[xVariable.value])));
  } else {
    x.value = props.xInput;
  }

  maxCounts.value = max(props.data, (d) => d[totalVariable.value]);
  if (props.downward) {
    y.value = scaleLinear()
      .range([0, props.height - props.margin.top - props.margin.bottom])
      .domain([0, maxCounts.value]);
  } else {
    y.value = scaleLinear()
      .range([props.height - props.margin.top - props.margin.bottom, 0])
      .domain([0, maxCounts.value]);
  }

  const numDays = timeDay.count(...x.value.domain());
  xBandwidth.value =
    (0.65 * (props.width - props.margin.left - props.margin.right)) / numDays;

  xAxis.value = axisBottom(x.value).ticks(numXTicks.value);
  select(xAxisRef.value).call(xAxis.value);

  yAxisLeft.value = axisLeft(y.value)
    .tickSizeOuter(0)
    .tickValues([0, maxCounts.value]);

  yAxisRight.value = axisRight(y.value)
    .tickSizeOuter(0)
    .tickValues([0, maxCounts.value]);

  if (props.includeXAxis) {
    select(xAxisRef.value).call(xAxis.value);
  }

  select(yAxisLeftRef.value).call(yAxisLeft.value);
  select(yAxisRightRef.value).call(yAxisRight.value);
};

const tooltipOn = () => {
  const ttipShift = 20;

  // find the closest date
  const selectedX = x.value.invert(event.offsetX - props.margin.left);
  const selectedDate = timeDay.round(selectedX);
  const selected = props.data.filter(
    (d) => Math.abs(d[xVariable.value] - selectedDate) < 1e-12,
  );

  if (selected.length) {
    // tooltip on
    const ttip = select(tooltip_prevalence.value);

    // edit text
    ttip.select('h5').text(selected[0].date);

    if (props.onlyTotals) {
      ttip
        .select('#sequencing-count')
        .text(`Samples sequenced: ${format(',')(selected[0].total_count)}`);
    } else {
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
    }
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
  if (props.data) {
    updateScales();

    let detected = props.data.filter((d) => d.lineage_count);
    showDetected.value = detected.length < detectedDisplayThresh.value;
    if (!showDetected.value) {
      detected = [];
    }
    const detectedSelector = counts.value.selectAll('.detected').data(detected);

    detectedSelector.join(
      (enter) => {
        enter
          .append('text')
          .attr('class', 'detected')
          .attr('id', (d) => `date${d.date}`)
          .attr('x', (d) => x.value(d[xVariable.value]))
          .attr('y', (d) => y.value(d[totalVariable.value]))
          .attr('dy', 3)
          .style('dominant-baseline', 'hanging')
          .style('text-anchor', 'middle')
          .text('*')
          .style('fill', props.detectedColor);
      },
      (update) =>
        update
          .attr('class', 'detected')
          .attr('id', (d) => `date${d.date}`)
          .attr('x', (d) => x.value(d[xVariable.value]))
          .attr('y', (d) => y.value(d[totalVariable.value])),
      (exit) =>
        exit.call((exit) => exit.transition().style('opacity', 1e-5).remove()),
    );

    const countSelector = counts.value
      .selectAll('.raw-counts')
      .data(props.data);
    countSelector.join(
      (enter) => {
        enter
          .append('line')
          .attr('class', 'raw-counts')
          .attr('id', (d) => `date${d.date}`)
          .attr('x1', (d) => x.value(d[xVariable.value]))
          .attr('x2', (d) => x.value(d[xVariable.value]))
          .attr('y1', (d) => y.value(0))
          .attr('y2', (d) => y.value(d[totalVariable.value]))
          .classed(
            'hidden',
            (d) =>
              x.value(d[xVariable.value]) < 0 ||
              x.value(d[xVariable.value]) >
                props.width - props.margin.left - props.margin.right,
          )
          .style('stroke-width', xBandwidth.value)
          .style('stroke', (d) =>
            d.lineage_count ? props.detectedColor : props.notDetectedColor,
          );
      },
      (update) =>
        update
          .attr('id', (d) => `date${d.date}`)
          .attr('x1', (d) => x.value(d[xVariable.value]))
          .attr('x2', (d) => x.value(d[xVariable.value]))
          .attr('y1', (d) => y.value(0))
          .attr('y2', (d) => y.value(d[totalVariable.value]))
          .classed(
            'hidden',
            (d) =>
              x.value(d[xVariable.value]) < 0 ||
              x.value(d[xVariable.value]) >
                props.width - props.margin.left - props.margin.right,
          )
          .style('stroke', (d) =>
            d.lineage_count ? props.detectedColor : props.notDetectedColor,
          )
          .style('stroke-width', xBandwidth.value),
      (exit) =>
        exit.call((exit) => exit.transition().style('opacity', 1e-5).remove()),
    );

    // tooltip event listener
    counts.value
      .selectAll('.raw-counts')
      .on('mousemove', () => tooltipOn())
      .on('mouseleave', () => tooltipOff());
  }
};

watch(
  () => props.xInput,
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
  () => props.data,
  () => {
    updatePlot();
  },
  { deep: true },
);

onMounted(() => {
  setupPlot();
  updatePlot();
});
</script>

<style>
.axis--x {
  font-size: 12px;
}

.axis--y {
  font-size: 12px;
}
</style>
