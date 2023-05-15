<template>
  <line
    v-for="(interval, index) in intervals" :key="'top-' + index"
    :x1="xScale(xAccessor(dataPoint))"
    :x2="xScale(xAccessor(dataPoint))"
    :y1="yScale(dataPoint.G_7_linear + interval > maxGrowthRate ? maxGrowthRate : dataPoint.G_7_linear + interval)"
    :y2="yScale(dataPoint.G_7_linear)"
    stroke="#979797"
    :stroke-width="xScale.bandwidth()"
    :stroke-opacity="greyScale(dataPoint.invDeltaG_7)"
  />
  <line
    v-if="intervals[intervals.length - 1] && dataPoint.G_7_linear + intervals[intervals.length - 1] > maxGrowthRate"
    :x1="xScale(xAccessor(dataPoint))"
    :x2="xScale(xAccessor(dataPoint))"
    :y1="yScale(maxGrowthRate)"
    :y2="yScale(maxGrowthRate - 0.5)"
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
    greyScale: Function,
    minGrowthRate: Number,
    maxGrowthRate: Number,
  });
  
  const intervals = computed(() => [
    props.dataPoint.confidenceInterval5,
    props.dataPoint.confidenceInterval20,
    props.dataPoint.confidenceInterval35,
    props.dataPoint.confidenceInterval50,
    props.dataPoint.confidenceInterval65,
    props.dataPoint.confidenceInterval80,
    props.dataPoint.confidenceInterval95,
  ]);
</script>
  