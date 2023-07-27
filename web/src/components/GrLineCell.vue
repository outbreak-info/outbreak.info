<template>
  <svg 
    role="img"
    :aria-label="ariaLabel" 
    :width="width" 
    :height="height"
  >
    <g :transform="`translate(${margin.left}, ${margin.top})`">
      <path 
        :d="prevalenceLine"
        stroke="#2c3e50"
        stroke-width="2px"
        fill="none"
        stroke-linecap="round"
      />
      <GrCellAxis
        :xScale="xScale"
        :innerWidth="innerWidth"
        :innerHeight="innerHeight"
      />
    </g>
  </svg>
</template>
  
<script setup>
  import { computed } from 'vue';
  import { scaleLinear } from 'd3-scale';
  import { max } from 'd3-array';
  import { line, curveMonotoneX } from 'd3-shape';
  import { lazyLoad } from '@/js/lazy-load';

  const GrCellAxis = lazyLoad('GrCellAxis');

  const props = defineProps({
    location: String,
    lineage: String,
    data: Array,
    xScale: Function,
    xAccessorScaled: Function,
    yAccessor: Function,
    colorScale: Function,
    width: Number,
    innerWidth: Number,
    height: Number,
    innerHeight: Number,
    margin: Object,
  });
  
  const yScale = computed(() => scaleLinear()
    .domain([0, max(props.data, props.yAccessor)])
    .range([props.innerHeight, 0])
    .nice()
  );

  const yAccessorScaled = computed(() => d => yScale.value(props.yAccessor(d)));

  const lineGenerator = computed(() => line()
    .x(props.xAccessorScaled)
    .y(yAccessorScaled.value)
    .defined(function (d) {
      return !Number.isNaN(d.Prevalence_7_percentage);
    })
    .curve(curveMonotoneX)
  );

  const prevalenceLine = computed(() => lineGenerator.value(props.data));

  const ariaLabel = computed(() => `Line chart of ${props.lineage} prevalence in ${props.location}`);
</script>
