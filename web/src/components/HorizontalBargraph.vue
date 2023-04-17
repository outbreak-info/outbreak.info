<template>
  <div class="horizontal-bargraph d-flex flex-column text-left">
    <h6 class="m-0">
      {{ title }}
    </h6>
    <small class="text-muted">{{ subtitle }}</small>
    <svg :width="width" :height="height">
      <g
        ref="horizontal_bargraph"
        :transform="`translate(${margin.left}, ${margin.top})`"
      />
      <g
        ref="yAxisRef"
        :transform="`translate(${width - margin.right + 3}, ${margin.top})`"
        class="horizontal-bargraph-y axis--y"
      />
    </svg>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { max } from 'd3-array';
import { axisRight } from 'd3-axis';
import { scaleLinear, scaleBand } from 'd3-scale';
import { select } from 'd3-selection';

const props = defineProps({
  data: Array,
  title: String,
  subtitle: String,
  width: {
    type: Number,
    default: 250,
  },
  height: {
    type: Number,
    default: 250,
  },
  num2Show: {
    type: Number,
    default: 15,
  },
  fill: {
    type: String,
    default: '#cbd7e3',
  },
});

const margin = ref({
  top: 10,
  bottom: 3,
  left: 3,
  right: 150,
});
// axes
const x = ref(null);
const y = ref(scaleBand());
const yAxis = ref(null);
// refs
const svg = ref(null);
const yAxisRef = ref(null);
const horizontal_bargraph = ref(null);

const filtered = computed(() => {
  if (props.data) {
    return props.data.slice(0, props.num2Show);
  } else {
    return null;
  }
});

const setupPlot = () => {
  svg.value = select(horizontal_bargraph.value);
};

const updateAxes = () => {
  x.value = scaleLinear()
    .range([props.width - margin.value.left - margin.value.right, 0])
    .domain([0, max(filtered.value, (d) => d.value)]);

  y.value = scaleBand()
    .paddingInner(0.2)
    .range([0, props.height - margin.value.top - margin.value.bottom])
    .domain(filtered.value.map((d) => d.key));

  yAxis.value = axisRight(y.value).tickSizeOuter(0);

  select(yAxisRef.value).call(yAxis.value);
};

const drawBars = () => {
  const rectSelector = svg.value.selectAll('rect').data(filtered.value);

  rectSelector.join((enter) => {
    enter
      .append('rect')
      .attr('x', (d) => x.value(d.value))
      .attr('width', (d) => x.value(0) - x.value(d.value))
      .attr('y', (d) => y.value(d.key))
      .attr('height', (d) => y.value.bandwidth())
      .style('fill', props.fill);
  });
};

const updatePlot = () => {
  if (filtered.value) {
    updateAxes();
    drawBars();
  }
};

onMounted(() => {
  setupPlot();
  updatePlot();
});
</script>

<style lang="scss">
.horizontal-bargraph {
  rect {
    stroke: $grey-70;
  }
}

.horizontal-bargraph-y path {
  display: none;
}
</style>
