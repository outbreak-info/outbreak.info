<template>
  <div :id="`donut-${id}`" class="donut-group d-flex">
    <svg :width="width" :height="width" class="donut">
      <g ref="pieRef" :transform="`translate(${width / 2},${width / 2})`" />
    </svg>
    <div class="ml-2" style="max-width: 150px">
      <div
        v-for="(d, idx) in nonZero"
        :key="idx"
        class="line-height-sm text-left text-break"
      >
        <small
          v-if="colorScale && idx < 5"
          :style="{ color: colorScale(d.term) }"
        >
          {{ d.term }}
        </small>
      </div>
      <small
        v-if="nonZero.length > 5"
        style="color: #bababa"
        class="line-height-sm text-left d-block"
      >
        other
      </small>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { select } from 'd3-selection';
import { scaleOrdinal } from 'd3-scale';
import { pie, arc } from 'd3-shape';
import { schemeSet2 } from 'd3-scale-chromatic';

const props = defineProps({
  data: Array,
  id: String,
  width: {
    type: Number,
    default: 60,
  },
});

const holeFrac = ref(0.4);
// data
const nonZero = ref([]);
// refs
const svg = ref(null);
//methods
const pieF = ref(null);
const arcF = ref(null);
const colorScale = ref(null);
// variables to replace this.$refs
const pieRef = ref(null);

const setupPlot = () => {
  svg.value = select(pieRef.value);

  pieF.value = pie()
    .sort((a, b) => (a.value > b.value ? -1 : 1))
    .value((d) => d.count);

  arcF.value = arc()
    .innerRadius((props.width / 2) * holeFrac.value)
    .outerRadius(props.width / 2 - 1);
};

const updatePlot = () => {
  if (props.data && props.data[0] && props.width) {
    // this.updateScales();
    drawPlot();
  }
};

const drawPlot = () => {
  nonZero.value = props.data.filter((d) => d.count);
  const arcs = pieF.value(nonZero.value);
  if (props.id === 'Type') {
    colorScale.value = scaleOrdinal()
      .range([
        '#507ea3', // blue (Dataset)
        '#f28e2c', // orange (WebSite)
        '#e15759', // coral (Publication)
        '#76b7b2', // teal (Analysis)
        '#59a14f', // green (Protocol)
        '#edc949', // yellow (ImageObject)
        '#b475a3', // purple (ClinicalTrial)
        '#ff98a8', // pink (Book)
        '#a97252', // brown (ComputationalTool)
        '#9c755f',
      ])
      .domain([
        'Dataset',
        'WebSite',
        'Publication',
        'Analysis',
        'Protocol',
        'ImageObject',
        'ClinicalTrial',
        'Book',
        'ComputationalTool',
      ])
      .unknown('#bababa');
  } else {
    colorScale.value = scaleOrdinal(schemeSet2)
      .domain(nonZero.value.map((d) => d.term).slice(0, 5))
      .unknown('#bababa');
  }

  const donutSelector = svg.value.selectAll('path').data(arcs);

  donutSelector.join(
    (enter) => {
      enter
        .append('path')
        .attr('d', arcF.value)
        .style('fill', (d) => colorScale.value(d.data.term));
    },
    (update) =>
      update
        .attr('d', arcF.value)
        .style('fill', (d) => colorScale.value(d.data.term)),
  );
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
