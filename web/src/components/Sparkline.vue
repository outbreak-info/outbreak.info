<template>
  <div :id="`sparkline-${id}-${variable}`" class="sparkline-group">
    <svg ref="svg" :width="width" :height="height" class="epi-sparkline" />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { max, extent } from 'd3-array';
import { scaleLinear, scaleTime } from 'd3-scale';
import { select } from 'd3-selection';
import { area } from 'd3-shape';

const props = defineProps({
  data: Array,
  width: Number,
  height: Number,
  variable: String,
  id: String,
  color: String,
});

const y = ref(scaleLinear());
const x = ref(scaleTime());
const chart = ref(null);
const areaValue = ref(null);
const svg = ref(null);

const setupPlot = () => {
  svg.value = select(`#sparkline-${props.id}-${props.variable}`).select(
    'svg.epi-sparkline',
  );
  chart.value = svg.value.select('#case-counts');

  chart.value = svg.value.append('g').attr('class', 'sparkline');

  areaValue.value = area()
    .x((d) => x.value(d.date))
    .y0((d) => y.value(0))
    .y1((d) => y.value(d[props.variable]));
};

const updateScales = () => {
  x.value = x.value
    .range([0, props.width])
    .domain(extent(props.data[0], (d) => d.date));

  y.value = y.value
    .range([props.height, 0])
    .domain([0, max(props.data[0], (d) => d[props.variable])]);
};

const drawPlot = () => {
  const sparkSelector = chart.value.selectAll('.sparkline').data(props.data);

  const sparkEnter = sparkSelector
    .enter()
    .append('path')
    .attr('class', 'sparkline');

  // merge
  sparkSelector
    .merge(sparkEnter)
    .datum((d) => d)
    .join('path')
    .style('fill', props.color)
    .attr('d', areaValue.value);

  const curtainSelector = chart.value
    .selectAll('.curtainline')
    .data(props.data);

  const curtainEnter = curtainSelector
    .enter()
    .append('path')
    .attr('class', 'curtainline');

  // merge
  curtainSelector
    .merge(curtainEnter)
    .datum((d) => d)
    .join('path')
    .style('fill', props.color)
    .attr('d', areaValue.value);
};

const updatePlot = () => {
  if (props.data && props.data[0] && props.width && props.height) {
    updateScales();
    drawPlot();
  }
};

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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss"></style>
