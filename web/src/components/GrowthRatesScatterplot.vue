<template>
   <div class="scatterplot" v-if="data.length > 0">
    <svg class="chart" :width="width" :height="height">
      <g :transform="`translate(${margin.left}, ${margin.top})`">
        <GrowthRatesYAxis 
          :yScale="yScale"
          :innerWidth="innerWidth"
        />
        <circle 
          v-for="(dataPoint, index) in data" :key="'point-' + index"
            :r="xScale.bandwidth() / 2"
            :cx="xAccessorScaled(dataPoint)"
            :cy="yAccessorScaled(dataPoint)"
            :fill="colorScale(dataPoint.growth_rate)"
            stroke="#2c3e50"
            stroke-width="1px"
          />
      </g>
    </svg>
  </div>
  <p>{{ loc }}</p>
</template>

<script setup>
  import { computed } from 'vue'
  import GrowthRatesYAxis from '@/components/GrowthRatesYAxis.vue';

  const props = defineProps({
    loc: String,
    data: Array,
    xAccessor: Function,
    yAccessor: Function,
    xScale: Function,
    yScale: Function,
    colorScale: Function,
    margin: Object,
    width: Number,
    height: Number,
    innerWidth: Number,
    innerHeight: Number,
  });

  console.log("scatter loc", props.loc);
  console.log("scatter data", props.data);
  console.log("scatter xScale", props.xScale.domain());
  console.log("scatter yScale", props.yScale.domain());
  console.log("scatter colorScale", props.colorScale.domain());
  console.log("scatter margin", props.margin);
  console.log("scatter width", props.width);
  console.log("scatter height", props.height);
  console.log("scatter innerWidth", props.innerWidth);
  console.log("scatter innerHeight", props.innerHeight);

  const xAccessorScaled = computed(() => d => props.xScale(props.xAccessor(d)));
  const yAccessorScaled = computed(() => d => props.yScale(props.yAccessor(d)));
</script>


