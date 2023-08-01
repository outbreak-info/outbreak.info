<template>
  <div class="vis-legend" v-if="ticks.length > 0 && !nanInArray">
    <svg 
      role="img"
      :aria-label="ariaLabel"
      :width="width" 
      :height="height"
    >
      <g :transform="`translate(${margin.left}, ${margin.top})`">
        <text
          text-anchor="start"
          fill="#2c3e50" 
          font-size="13px"
          dy="0.12em"
        >
          growth rate (%)
        </text>
        <g 
          v-if="legendPointer && legendPointer.label == loc"
          :transform="`translate(${legendXScale(legendPointer.G_7_linear)}, 10)rotate(-180)`"
        >
          <path 
            :d="trianglePath"
            fill="#2c3e50"
          />
        </g>
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
          :y="18"
          :width="innerWidth"
          :height="12"
          fill="url(#linear-gradient)"
          stroke="#2c3e50"
          stroke-width="0.25"
        />
        <g :transform="`translate(0 30)`">
          <g 
            v-for="(tick, index) in ticks" :key="'tick-' + index"
            :transform="`translate(${legendXScale(tick)} 10)`"
          >
            <text :y="4" text-anchor="middle" fill="#2c3e50" font-size="13px">
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
  import { symbol, symbolTriangle } from 'd3-shape';

  const props = defineProps({
    loc: String,
    colorScale: Function,
    legendPointer: Object,
  });

  const width = 200;
  const height = 65;

  const margin = {
    top: 15,
    right: 10,
    left: 15,
  };

  const innerWidth = width - margin.left - margin.right;

  const colors = [
    '#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf',
    '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'
  ];

  const triangleSymbol = symbol().type(symbolTriangle).size(25);
  const trianglePath = triangleSymbol();

  const minValue = computed(() => props.colorScale.domain()[0]);
  const maxValue = computed(() => props.colorScale.domain()[2]);

  const legendXScale = computed(() => scaleLinear()
    .domain([minValue.value, maxValue.value])
    .range([0, innerWidth])
  );

  const ticks = computed(() => legendXScale.value.domain());

  // component will not be rendered if ticks include NaN
  const nanInArray = computed(() => ticks.value.includes(NaN));

  const ariaLabel = computed(() => `Legend for the growth rate color scale. The color scale varies from dark blue (${ticks.value[0]}%) to dark red (${ticks.value[1]}%).`)
</script>

<style scoped>
  .vis-legend {
    display: flex;
    justify-content: center;
  }
</style>
