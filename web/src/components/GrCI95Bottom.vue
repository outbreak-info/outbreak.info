<template>
  <line
    :x1="xScale(xAccessor(dataPoint))"
    :x2="xScale(xAccessor(dataPoint))"
    :y1="yScale(dataPoint.G_7_linear)"
    :y2="yScale(dataPoint.G_7_linear - ci95 < minGrowthRate ? minGrowthRate : dataPoint.G_7_linear - ci95)"
    stroke="#979797"
    :stroke-width="xScale.bandwidth()"
    stroke-opacity="0.25"
  />
  <line
    v-if="dataPoint.G_7_linear - ci95 < minGrowthRate"
    :x1="xScale(xAccessor(dataPoint))"
    :x2="xScale(xAccessor(dataPoint))"
    :y1="yScale(minGrowthRate) + 2"
    :y2="yScale(minGrowthRate)"
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
      