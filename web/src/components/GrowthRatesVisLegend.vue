<template>
  <div class="legend" v-if="ticks.length > 0">
    <svg :width="width" :height="height">
      <g :transform="`translate(${margin.left}, 10)`">
        <text
          text-anchor="start"
          fill="#2c3e50" 
          font-size="13px"
        >
          growth rate (%)
        </text>
        <circle
          v-if="legendPoint && legendPoint.label == loc"
          r="4"
          :cx="legendXScale(legendPoint.G_7_linear)"
          :cy="10"
          fill="#2c3e50"
        />
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
          :y="20"
          :width="innerWidth"
          :height="15"
          fill="url(#linear-gradient)"
          stroke="#2c3e50"
          stroke-width="0.25"
        />
        <g :transform="`translate(0 35)`">
          <g 
            v-for="(tick, index) in ticks" :key="'tick-' + index"
            :transform="`translate(${legendXScale(tick)} 10)`"
          >
            <text :y="6" text-anchor="middle" fill="#2c3e50" font-size="13px">
              {{ tick }}
            </text>    
          </g>  
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import { scaleLinear } from 'd3-scale';

  const props = defineProps({
    loc: String,
    colorScale: Function,
    legendPoint: Object,
  });

  const width = 250;
  const height = 65;

  const margin = {
    right: 15,
    left: 65,
  };

  const innerWidth = width - margin.left - margin.right;

  const colors = [
    '#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf',
    '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'];

  const minValue = computed(() => props.colorScale.domain()[0]);
  const maxValue = computed(() => props.colorScale.domain()[2]);

  const legendXScale = computed(() => scaleLinear()
    .domain([minValue.value, maxValue.value])
    .range([0, innerWidth])
    .nice()
  );

  const ticks = computed(() => legendXScale.value.domain());
</script>

<style scoped>
  .legend {
    text-align: left;
    margin-bottom: 30px;
  }
</style>
