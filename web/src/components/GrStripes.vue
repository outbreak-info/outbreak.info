<template>
  <div>
    <svg 
       role="img"
       class="chart"
       :width="width" 
       :height="stripeHeight"
    >
      <g :transform="`translate(${margin.left}, ${margin.top})`">
        <text
          text-anchor="end"
          x="-10"
          :y="stripeHeight / 2"
          dy=".32em"
          fill="#2c3e50"
          font-size="13px"
        >
         {{location }}
        </text>
        <g v-for="(dataPoint, index) in data" :key="'stripe-' + index">
          <rect 
             v-if="dataPoint.snr >= snrThreshold"
             :x="xAccessorScaled(dataPoint) - xScale.bandwidth() / 2"
             :y="0"
             :width="xScale.bandwidth()"
             :height="stripeHeight"
             :fill="colorScale(dataPoint.G_7_linear)"
          />  
        </g>  
      </g>
    </svg>
  </div>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    location: String,
    data: Array,
    xScale: Function,
    xAccessor: Function,
    colorScale: Function,
    stripeHeight: Number,
    margin: Object,
    width: Number,
    snrThreshold: Number,
  });

  const xAccessorScaled = computed(() => d => props.xScale(props.xAccessor(d)));
</script>
