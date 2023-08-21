<template>
  <text 
    class="annotation"
    v-if="data.length > 1"
    :x="xAccessorScaled(startPoint) - nudge"
    :y="yAccessorScaled(startPoint)"
    text-anchor="end"
    dy="0.34em"
  >
    {{ `${formatPrevalence(yAccessor(startPoint))}` }}
  </text>
  <text
    class="annotation"
    :x="xAccessorScaled(endPoint) + nudge"
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
    AreAnnotationsSmall: Boolean,
  });
  
  const formatPrevalence = format(',.1f');
  
  // first and last line points
  const startPoint = computed(() => props.data[0]);
  const endPoint = computed(() => props.data[props.data.length - 1]);

  const nudge = computed(() => props.AreAnnotationsSmall === true ? 5 : 12);

  const fontSize = computed(() => props.AreAnnotationsSmall === true ? 12 + 'px' : 13 + 'px');
</script>
  
<style scoped>
  .annotation {
    fill: "#2c3e50";
    font-size: v-bind(fontSize);
  }
</style>
