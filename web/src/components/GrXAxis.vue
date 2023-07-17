<template>
  <g :transform="`translate(0 ${innerHeight})`">
    <g 
      v-for="(tick, index) in ticksToBeRendered" :key="'tick-' + index"
      :transform="`translate(${xScale(tick)} 0)`"
    >
      <line class="axis__tick" :y1="0" :y2="6" />
      <text :y="22" text-anchor="middle" fill="#2c3e50" font-size="13px">
        {{ formatTime(parseTime(tick)) }}
      </text>    
    </g>    
  </g>
</template>
  
<script setup>
  import { computed } from 'vue';
  import { timeFormat, timeParse } from 'd3-time-format';
  
  const parseTime = timeParse('%Y-%m-%d');
  const formatTime = timeFormat('%b %e');
    
  const props = defineProps({
    xScale: Function,
    innerWidth: Number,
    innerHeight: Number,
  });
  
  const allTicks = computed(() => props.xScale.domain());

  // use width to determine the number of ticks rendered 
  const filterTicks = (width) => {
    if (width > 700)
      return allTicks.value.filter((d, i) => !(i % 7));
    else if (width > 550 && width <= 700)
      return allTicks.value.filter((d, i) => !(i % 10));
    else if (width > 400 && width <= 550)
      return allTicks.value.filter((d, i) => !(i % 14));
    else return allTicks.value.filter((d, i) => !(i % 30));
  }
  
  const ticksToBeRendered = computed(() => filterTicks(props.innerWidth));
</script>
  
<style>
  .axis__tick {
    stroke: #999999;
  }
</style>
  