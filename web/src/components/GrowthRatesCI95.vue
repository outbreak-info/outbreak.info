<template>
  <GrowthRatesCI95Top
    v-for="(dataPoint, index) in data" :key="'topCI-' + index"
    :dataPoint="dataPoint"
    :xAccessor="xAccessor"
    :xScale="xScale"
    :yScale="yScale"
    :greyScale="greyScale"
    :minGrowthRate="minGrowthRate"
    :maxGrowthRate="maxGrowthRate"
  />
  <GrowthRatesCI95Bottom
    v-for="(dataPoint, index) in data" :key="'topCI-' + index"
    :dataPoint="dataPoint"
    :xAccessor="xAccessor"
    :xScale="xScale"
    :yScale="yScale"
    :greyScale="greyScale"
    :minGrowthRate="minGrowthRate"
    :maxGrowthRate="maxGrowthRate"
  />
</template>

<script setup>
  import GrowthRatesCI95Top from '@/components/GrowthRatesCI95Top.vue';
  import GrowthRatesCI95Bottom from '@/components/GrowthRatesCI95Bottom.vue';

  const props = defineProps({
    data: Array,
    xAccessor: Function,
    xScale: Function,
    yScale: Function,
    greyScale: Function,
    minGrowthRate: Number,
    maxGrowthRate: Number,
  });
</script>