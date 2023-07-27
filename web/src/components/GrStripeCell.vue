<template>
  <svg 
    role="img"
    :aria-label="ariaLabel" 
    :width="width" 
    :height="height"
  >
  <g :transform="`translate(${margin.left}, ${margin.top})`">
    <g v-for="(dataPoint, index) in data" :key="'stripe-' + index">
      <rect 
        :x="xAccessorScaled(dataPoint) - xScale.bandwidth() / 2"
        :y="0"
        :width="xScale.bandwidth()"
        :height="innerHeight"
        :fill="colorScale(dataPoint.G_7_linear)"
      />  
    </g>
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
  import { lazyLoad } from '@/js/lazy-load';

  const GrCellAxis = lazyLoad('GrCellAxis');
  
  const props = defineProps({
    location: String,
    lineage: String,
    data: Array,
    xScale: Function,
    xAccessorScaled: Function,
    colorScale: Function,
    width: Number,
    innerWidth: Number,
    height: Number,
    innerHeight: Number,
    margin: Object,
  });

  const ariaLabel = computed(() => `Stripe chart of ${props.lineage} growth rates in ${props.location}`);
</script>
