<template>
    <div class="line-chart" v-if="data.length > 0">
      <svg class="chart" :width="width" :height="height">
        <g :transform="`translate(${margin.left}, ${margin.top})`">
          <path 
            class="line" 
            :d="prevalenceLine"
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

</script>

<style>
  .line-chart {
    margin-top: 0px;
    margin-bottom: 20px;
  }

  .line {
    fill: none;
    stroke: #2c3e50;
    stroke-width: 2px;
    stroke-linecap: round;
  }  
</style>
