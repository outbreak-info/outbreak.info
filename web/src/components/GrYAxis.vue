<template>
  <g :transform="`translate(${-xScale.bandwidth() / 2}, 0)`">
    <line class="axis__line" :x1="0" :x2="0" :y1="yMin" :y2="yMax" />
    <text
      :x="5"
      :y="yMax - 15"
      text-anchor="middle"
      fill="#2c3e50"
      font-size="13px"
    >
      growth rate (%)
    </text>
    <g 
      :transform="`translate(0 ${yScale(tick)})`"
      v-for="(tick, index) in ticks" :key="'tick-' + index"
    >
      <line 
        v-if="tick == 0" 
        class="axis__tick" 
        :x1="-6"
        :x2="innerWidth"
      />
      <line 
        v-else 
        class="axis__tick" 
        :x1="-6"
        :x2="0"
      />
      <text
        :dx="-10"
        dy="0.34em"
        text-anchor="end"
        fill="#2c3e50"
        font-size="13px"
      >
        {{ tick }} 
      </text>
    </g>
  </g>
</template>
  
<script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    xScale: Function,
    yScale: Function,
    innerWidth: Number,
  });
  
  const numberOfTicks = (pixelsAvailable, pixelsPerTick = 30) =>
    Math.floor(Math.abs(pixelsAvailable) / pixelsPerTick);
  
  const yMin = computed(() => props.yScale.range()[0]);
  const yMax = computed(() => props.yScale.range()[1]);
    
  const ticks = computed(() => props.yScale.ticks(numberOfTicks(yMax.value - yMin.value)));
</script>
  
<style>
  .axis__tick {
    stroke: #999999;
  }
  
  .axis__line {
    stroke: #999999;
  }
</style>
  