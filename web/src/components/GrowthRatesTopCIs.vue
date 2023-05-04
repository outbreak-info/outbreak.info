<template>
  <line
    v-for="(interval, index) in intervals" :key="'top-' + index"
    :x1="xScale(xAccessor(dataPoint))"
    :x2="xScale(xAccessor(dataPoint))"
    :y1="yScale(dataPoint.growth_rate + interval > maxGrowthRate ? maxGrowthRate : dataPoint.growth_rate + interval)"
    :y2="yScale(dataPoint.growth_rate)"
    stroke="#979797"
    :stroke-width="xScale.bandwidth()"
    :stroke-opacity="greyScale(dataPoint.invUncertainty)"
  />
  <line
    v-if="intervals[intervals.length - 1] && dataPoint.growth_rate + intervals[intervals.length - 1] > maxGrowthRate"
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

  const intervals = computed(() => props.dataPoint.intervals);
</script>
