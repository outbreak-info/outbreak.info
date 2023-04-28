<template>
  <div class="legend">
    <div class="legend__title">
      <span>growth rate (%)</span>
    </div>
    <svg :transform="`translate(0,0)`" :width="width" :height="height">
      <defs>
        <linearGradient id="linear-gradient" x1="0" x2="1" y1="0" y2="0">
         <stop 
           v-for="(color, index) in colors" :key="color"
           :stop-color="color"
           :offset="`${index / (colors.length - 1)}`"
         />
        </linearGradient>
      </defs>
      <rect
        :width="width"
        :height="20"
        fill="url(#linear-gradient)"
        stroke="#2c3e50"
        stroke-width="0.25"
      />
      <text 
        class="legend__text"
        :x="0"
        :y="25"
        dominant-baseline="hanging"
      >
        {{ formatGrowthRate(minValue) }}
      </text>
      <text
        class="legend__text"
        :x="width"
        :y="25"
        dominant-baseline="hanging"
        text-anchor="end"
      >
        {{ formatGrowthRate(maxValue) }}
      </text>
    </svg>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import { format } from 'd3-format';
  import { schemeRdYlBu } from 'd3-scale-chromatic';

  const props = defineProps({
    colorScale: Function,
  });

  const formatGrowthRate = format(',.2f');

  const width = 250;
  const height = 50;

  const colors = computed(() => schemeRdYlBu[11].reverse());

  console.log(colors.value);

  console.log(props.colorScale.domain());

  const minValue = computed(() => props.colorScale.domain()[0]);
  const maxValue = computed(() => props.colorScale.domain()[2]);
  
  console.log("minv", minValue.value);
  console.log("maxv", maxValue.value);
</script>

<style>
  .legend {
    margin-bottom: 20px;
  }

  .legend__title {
    margin-bottom: 5px;
    text-align: center;
    font-size: 14px;
  }

  .legend__text {
    fill: #2c3e50;
    font-size: 13px;
  }
</style>
