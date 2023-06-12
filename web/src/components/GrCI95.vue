<template>
  <GrCI95Top
    v-for="(dataPoint, index) in data" :key="'topCI-' + index"
    :dataPoint="dataPoint"
    :xAccessor="xAccessor"
    :xScale="xScale"
    :yScale="yScale"
    :greyScale="greyScale"
    :minGrowthRate="minGrowthRate"
    :maxGrowthRate="maxGrowthRate"
  />
  <GrCI95Bottom
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
  import GrCI95Top from '@/components/GrCI95Top.vue';
  import GrCI95Bottom from '@/components/GrCI95Bottom.vue';

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