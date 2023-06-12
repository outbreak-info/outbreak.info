<template>
  <line
    v-for="(interval, index) in intervals" :key="'bottom-' + index"
    :x1="xScale(xAccessor(dataPoint))"
    :x2="xScale(xAccessor(dataPoint))"
    :y1="yScale(dataPoint.G_7_linear)"
    :y2="yScale(dataPoint.G_7_linear - interval < minGrowthRate ? minGrowthRate : dataPoint.G_7_linear - interval)"
    stroke="#979797"
    :stroke-width="xScale.bandwidth()"
    :stroke-opacity="greyScale(dataPoint.invDeltaG_7)"
  />
  <line
    v-if="intervals[intervals.length - 1] && dataPoint.G_7_linear - intervals[intervals.length - 1] < minGrowthRate"
    :x1="xScale(xAccessor(dataPoint))"
    :x2="xScale(xAccessor(dataPoint))"
    :y1="yScale(minGrowthRate + 0.5)"
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
  