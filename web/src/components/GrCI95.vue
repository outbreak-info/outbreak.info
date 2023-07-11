<template>
  <GrCI95Top
    v-for="(dataPoint, index) in data" :key="'topCI-' + index"
    :dataPoint="dataPoint"
    :xAccessor="xAccessor"
    :xScale="xScale"
    :yScale="yScale"
    :minGrowthRate="minGrowthRate"
    :maxGrowthRate="maxGrowthRate"
  />
  <GrCI95Bottom
    v-for="(dataPoint, index) in data" :key="'topCI-' + index"
    :dataPoint="dataPoint"
    :xAccessor="xAccessor"
    :xScale="xScale"
    :yScale="yScale"
    :minGrowthRate="minGrowthRate"
    :maxGrowthRate="maxGrowthRate"
  />
</template>

<script setup>
  import { lazyLoad } from '@/js/lazy-load';

  const GrCI95Top = lazyLoad('GrCI95Top');
  const GrCI95Bottom = lazyLoad('GrCI95Bottom');

  const props = defineProps({
    data: Array,
    xAccessor: Function,
    xScale: Function,
    yScale: Function,
    minGrowthRate: Number,
    maxGrowthRate: Number,
  });
</script>
