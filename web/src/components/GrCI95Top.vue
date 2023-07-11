<template>
  <line
    :x1="xScale(xAccessor(dataPoint))"
    :x2="xScale(xAccessor(dataPoint))"
    :y1="yScale(dataPoint.G_7_linear + ci95 > maxGrowthRate ? maxGrowthRate : dataPoint.G_7_linear + ci95)"
    :y2="yScale(dataPoint.G_7_linear)"
    stroke="#979797"
    :stroke-width="xScale.bandwidth()"
    stroke-opacity="0.25"
  />
  <line
    v-if="dataPoint.G_7_linear + ci95 > maxGrowthRate"
    :x1="xScale(xAccessor(dataPoint))"
    :x2="xScale(xAccessor(dataPoint))"
    :y1="yScale(maxGrowthRate)"
    :y2="yScale(maxGrowthRate) - 2"
    stroke="#808080"
    :stroke-width="xScale.bandwidth()"
    stroke-opacity="1"
  />
</template>
      
<script setup>
  import { computed } from 'vue';
      
  const props = defineProps({
    dataPoint: Object,
    xAccessor: Function,
    xScale: Function,
    yScale: Function,
    minGrowthRate: Number,
    maxGrowthRate: Number,
  });
  
  const ci95 = computed(() => props.dataPoint.confidenceInterval95);
</script>
