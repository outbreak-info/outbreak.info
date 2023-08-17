<template>
  <text 
    class="annotation"
    v-if="data.length > 1"
    :x="xAccessorScaled(startPoint) - 5"
    :y="yAccessorScaled(startPoint)"
    text-anchor="end"
    dy="0.34em"
  >
    {{ `${formatPrevalence(yAccessor(startPoint))}` }}
  </text>
  <text
    class="annotation"
    :x="xAccessorScaled(endPoint) + 5"
    :y="yAccessorScaled(endPoint)"
    text-anchor="start"
    dy="0.34em"
  >
    {{ `${formatPrevalence(yAccessor(endPoint))}` }}
  </text>
</template>
  
<script setup>
  import { computed } from 'vue';
  import { format } from 'd3-format';
  
  const props = defineProps({
    data: Array,
    xAccessorScaled: Function,
    yAccessorScaled: Function,
    yAccessor: Function,
  });
  
  const formatPrevalence = format(',.1f');
  
  // first and last line points
  const startPoint = computed(() => props.data[0]);
  const endPoint = computed(() => props.data[props.data.length - 1]);
</script>
  
<style scoped>
  .annotation {
    fill: "#2c3e50";
    font-size: 12px;
  }
</style>
