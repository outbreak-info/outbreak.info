<template>
  <div class="stripe-chart">
    <GrStripes 
      v-for="location in locations" :key="location"
      :location="location"
      :data="data.filter(element => element.label == location)"
      :xScale="xScale"
      :stripeHeight="stripeHeight"
      :xAccessor="xAccessor"
      :colorScale="colorScale"
      :margin="margin"
      :width="width"
      :snrThreshold="snrThreshold"
    />   
    <GrStripeChartAxis
      :xScale="xScale"
      :margin="margin"
      :innerWidth="innerWidth"
      :width="width"
    />
  </div>
</template>
  
<script setup>
  import { computed } from 'vue';
  import { scaleBand } from 'd3-scale';
  import { lazyLoad } from '@/js/lazy-load';
  
  const GrStripes = lazyLoad('GrStripes');
  const GrStripeChartAxis = lazyLoad('GrStripeChartAxis');
  
  const props = defineProps({
    locations: Array,
    data: Array,
    xScaleDomain: Array,
    xAccessor: Function,
    colorScale: Function,
    snrThreshold: Number,
    width: Number,
  });
  
  const margin = {
    top: 0,
    right: 95,
    bottom: 0,
    left: 150,
  };
  
  const stripeHeight = 30;
    
  const innerWidth = computed(() => props.width - margin.left - margin.right);
    
  const xScale = computed(() => scaleBand()
    .domain(props.xScaleDomain)
    .range([0, innerWidth.value])
    .padding(0)
  );
</script>
  
<style scoped>
  .stripe-chart {
    margin-top: 20px;   
  }
</style>
  