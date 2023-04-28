<template>
    <div class="line-chart" v-if="data.length > 0">
      <svg class="chart" :width="width" :height="height">
        <g :transform="`translate(${margin.left}, ${margin.top})`">
          <rect 
            v-for="(dataPoint, index) in data" :key="'stripe-' + index"
            :x="xAccessorScaled(dataPoint) - xScale.bandwidth() / 2"
            :y="0"
            :width="xScale.bandwidth()"
            :height="innerHeight"
            :fill="colorScale(dataPoint.growth_rate)"
          />  
          <GrowthRatesXAxis
            :xScale="xScale"
            :innerWidth="innerWidth"
            :innerHeight="innerHeight"
          />
          <path
            v-for="(attribute, index) in lineAttributes" :key="'line-' + index" 
            class="line"
            :d="prevalenceLine"
            :stroke="attribute.color"
            :stroke-width="attribute.strokeWidth"
            fill="none"
            stroke-linecap="round"
          />
        </g>
      </svg>
    
    </div>
</template>

<script setup>
  import { computed } from 'vue';
  import { max } from 'd3-array';
  import { scaleLinear } from 'd3-scale';
  import { line, curveMonotoneX } from 'd3-shape';
  import GrowthRatesXAxis from '@/components/GrowthRatesXAxis.vue';

  const props = defineProps({
    loc: String,
    data: Array,
    xAccessor: Function,
    yAccessor: Function,
    xScale: Function,
    colorScale: Function,
    margin: Object,
    width: Number,
    height: Number,
    innerWidth: Number,
    innerHeight: Number,
  });

  console.log("prev", props.loc)

  const yScale = computed(() => scaleLinear()
    .domain([0, max(props.data, props.yAccessor)])
    .range([props.innerHeight, 0])
    .nice()
  );

  const xAccessorScaled = computed(() => d => props.xScale(props.xAccessor(d)));
  const yAccessorScaled = computed(() => d => yScale.value(props.yAccessor(d)));

  const lineGenerator = computed(() => line()
    .x(xAccessorScaled.value)
    .y(yAccessorScaled.value)
    .defined(function (d) {
      return !Number.isNaN(d.prevalence);
    })
    .curve(curveMonotoneX)
  );

  const prevalenceLine = lineGenerator.value(props.data);
  
  const lineAttributes = [{color: "#ffffff", strokeWidth: "6px"}, 
                          {color: "#2c3e50", strokeWidth: "2px"}];
</script>

<style>
  .line-chart {
    margin-top: 0px;
    margin-bottom: 20px;
  } 
</style>
