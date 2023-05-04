<template>
  <line
    v-for="(interval, index) in intervals" :key="'bottom-' + index"
    :x1="xScale(xAccessor(dataPoint))"
    :x2="xScale(xAccessor(dataPoint))"
    :y1="yScale(dataPoint.growth_rate)"
    :y2="yScale(dataPoint.growth_rate - interval < minGrowthRate ? minGrowthRate : dataPoint.growth_rate - interval)"
    stroke="#979797"
    :stroke-width="xScale.bandwidth()"
    :stroke-opacity="greyScale(dataPoint.invUncertainty)"
  />
  <line
    v-if="intervals[intervals.length - 1] && dataPoint.growth_rate - intervals[intervals.length - 1] < minGrowthRate"
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

  const intervals = computed(() => props.dataPoint.intervals);
</script>
