<template>
  <div>
    <svg
      ref="stacked_bar"
      :width="width"
      :height="height"
      class="report-stacked-bar"
      :name="title"
    >
      <g
        ref="chartRef"
        :transform="`translate(${margin.left},${margin.top})`"
      />
      <!-- <g class="epi-axis axis--x" ref="xAxis" :transform="`translate(${margin.left},${height - margin.bottom})`"></g> -->
      <g
        ref="yAxisRef"
        class="epi-axis axis--y"
        :transform="`translate(${margin.left},${margin.top})`"
      />
    </svg>
    <!-- Histogram of sequencing counts -->
    <SequencingHistogram
      v-if="seqCounts"
      :data="seqCounts"
      :width="width"
      :svgTitle="title"
      :margin="marginHist"
      :mutationName="null"
      className="stacked-seq-histogram"
      :onlyTotals="true"
      notDetectedColor="#bab0ab"
      :title="`Sequences over last ${recentWindow} days`"
    />

    <DownloadReportData
      :data="data"
      figureRef="report-stacked-bar"
      dataType="Mutation Report Prevalence over Time"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { axisLeft } from 'd3-axis';
import { format } from 'd3-format';
import { forceY, forceCollide, forceSimulation } from 'd3-force';
import { scaleLinear, scaleTime } from 'd3-scale';
import { select } from 'd3-selection';
import { stack, stackOrderAscending } from 'd3-shape';
import debounce from 'lodash/debounce';

import { lazyLoad } from '@/js/lazy-load';

const SequencingHistogram = lazyLoad('SequencingHistogram');
const DownloadReportData = lazyLoad('DownloadReportData');

const props = defineProps({
  data: Array,
  seqCounts: Array,
  locationID: String,
  locationName: String,
  colorScale: Function,
  recentWindow: String,
  routeTo: {
    type: String,
    default: 'MutationReport',
  },
  rectWidth: {
    type: Number,
    default: 25,
  },
});

// this.$router
const router = useRouter();

// dimensions
const margin = ref({
  top: 18,
  bottom: 30,
  left: 55,
  right: 10,
});
const marginHist = ref({
  top: 5,
  bottom: 10,
  left: 55,
  right: 55,
});
const width = ref(200);
const height = ref(500);
// axes
const x = ref(scaleTime());
const y = ref(scaleLinear());
const xAxis = ref(null);
const yAxis = ref(null);
const numXTicks = ref(5);
const numYTicks = ref(5);

// data
const series = ref(null);
const lineages = ref(null);
// refs
const chart = ref(null);
const legend = ref(null);
// variables to replace this.$refs
const chartRef = ref(null);
const yAxisRef = ref(null); // renamed by adding -Ref since xAxis was declared already
const xAxisRef = ref(null);

const title = computed(() => {
  return props.locationName
    ? `Lineage prevalence over time in ${props.locationName}`
    : 'Lineage prevalence over time';
});

const setupPlot = () => {
  chart.value = select(chartRef.value);
};

const updateScales = () => {
  y.value = y.value
    .range([height.value - margin.value.top - margin.value.bottom, 0])
    .nice()
    .domain([0, 1]);

  lineages.value = Object.keys(props.data[0]);

  yAxis.value = axisLeft(y.value)
    .tickSizeOuter(0)
    .ticks(numYTicks.value)
    .tickFormat(format('.0%'));

  // stacking
  series.value = stack()
    .keys(lineages.value)
    // .order(stackOrderDescending)
    .order(stackOrderAscending)(
    // .order(stackOrderAppearance)
    // .order(stackOrderNone)
    // .order(stackOrderReverse)
    // .order(stackOrderInsideOut)
    props.data,
  );

  select(yAxisRef.value).call(yAxis.value);
};

const drawPlot = () => {
  const barSelector = chart.value
    .selectAll('.stacked-bar-chart')
    .data(series.value);

  // calculate label positions so they don't overlap
  const labelHeight = 18;
  series.value.forEach((d) => {
    d['fx'] = 0;
    d['targetY'] = y.value(d[0][0]) + (y.value(d[0][1]) - y.value(d[0][0])) / 2;
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
    .nodes(series.value)
    .force('collide', forceCollide(labelHeight / 2).strength(1))
    .force('y', forceY((d) => d.targetY).strength(1))
    .force(
      'clamp',
      forceClamp(0, height.value - margin.value.top - margin.value.bottom),
    )
    .stop();

  // Execute the simulation
  for (let i = 0; i < 300; i++) force.tick();

  barSelector.join(
    (enter) => {
      const barGrp = enter
        .append('g')
        .attr('class', 'stacked-bar-chart')
        .attr('id', (d) => d.key.replace(/\./g, '-'));

      barGrp
        .append('rect')
        .attr('x', 0)
        .attr('width', props.rectWidth)
        .attr('y', (d) => y.value(d[0][1]))
        .attr('height', (d) => y.value(d[0][0]) - y.value(d[0][1]))
        .style('fill', (d) => props.colorScale(d.key));

      const tspan = barGrp
        .append('text')
        .attr('class', 'lineage_name')
        .attr('x', props.rectWidth)
        .attr('dx', 10)
        .attr('y', (d) => d.y)
        .style('font-family', "'DM Sans', Avenir, Helvetica, Arial, sans-serif")
        .style('fill', (d) => props.colorScale(d.key))
        .style('dominant-baseline', 'central');

      tspan
        .append('tspan')
        .attr('class', 'lineage')
        .text((d) => d.key)
        .style('font-weight', '700')
        .classed('pointer', (d) => d.key.toLowerCase() !== 'other')
        .classed('hover-underline', (d) => d.key.toLowerCase() !== 'other')
        .on('click', (d) => route2Lineage(d.key));

      tspan
        .append('tspan')
        .attr('class', 'percent')
        .attr('dx', 5)
        .text((d) => `(${format('.0%')(d[0].data[d.key])})`);
    },
    (update) => {
      update.attr('id', (d) => d.key.replace(/\./g, '-'));

      update
        .select('rect')
        .attr('y', (d) => y.value(d[0][1]))
        .attr('height', (d) => y.value(d[0][0]) - y.value(d[0][1]))
        .style('fill', (d) => props.colorScale(d.key));

      update
        .select('text')
        .attr('y', (d) => d.y)
        .style('fill', (d) => props.colorScale(d.key));

      update
        .select('text')
        .select('.lineage')
        .text((d) => d.key)
        .classed('pointer', (d) => d.key.toLowerCase() !== 'other')
        .classed('hover-underline', (d) => d.key.toLowerCase() !== 'other')
        .on('click', (d) => route2Lineage(d.key));

      update
        .select('text')
        .select('.percent')
        .text((d) => `(${format('.0%')(d[0].data[d.key])})`);
    },
    (exit) =>
      exit.call((exit) => exit.transition().style('opacity', 1e-5).remove()),
  );
};

const updatePlot = () => {
  if (props.data) {
    updateScales();
    drawPlot();
  }
};

const route2Lineage = (pango) => {
  if (pango.toLowerCase() !== 'other') {
    if (props.routeTo === 'GenomicsEmbedLocation') {
      router.push({
        name: 'GenomicsEmbed',
        query: {
          loc: props.locationID,
          type: 'var',
          pango: pango,
          selected: props.locationID,
        },
      });
    } else {
      router.push({
        name: 'MutationReport',
        query: {
          loc: props.locationID,
          pango: pango,
          selected: props.locationID,
        },
      });
    }
  }
};

const setDims = () => {};

watch(width, () => {
  updatePlot();
});

watch(
  () => props.data,
  () => {
    updatePlot();
  },
  { deep: true },
); // props.data is array, so deep option is required

const debounceSetDims = debounce(setDims, 150);

onMounted(() => {
  // this.$nextTick in optionsAPI
  nextTick(() => {
    window.addEventListener('resize', debounceSetDims);
  });

  // set initial dimensions for the plots.
  setDims();
  setupPlot();
  updatePlot();
});
</script>

<style lang="scss">
.hover-underline:hover {
  text-decoration: underline;
}

.report-stacked-bar {
  .axis--y text {
    font-size: 16px;
  }
}
</style>
