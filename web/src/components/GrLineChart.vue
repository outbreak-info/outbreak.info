<template>
  <div class="line-chart" v-if="data.length > 0">
    <svg 
      role="img"
      class="chart"
      :aria-label="ariaLabel" 
      :width="width" 
      :height="height"
    >
      <g :transform="`translate(${margin.left}, ${margin.top})`">
        <g>
          <rect 
            v-for="(dataPoint, index) in data" :key="'stripe-' + index"
            :x="xAccessorScaled(dataPoint) - xScale.bandwidth() / 2"
            :y="0"
            :width="xScale.bandwidth()"
            :height="innerHeight"
            :fill="colorScale(dataPoint.G_7_linear)"
            @mousemove="handleMouseMove"
            @mouseleave="handleMouseLeave"
          />  
        </g>  
        <text
          x="0"
          :y="yMax - 40"
          text-anchor="middle"
          fill="#2c3e50"
          font-size="13px"
        >
          prevalence (%)
        </text>
        <GrXAxis
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
        <GrAnnotations 
          :data="data"
          :xAccessor="xAccessor"
          :yAccessor="yAccessor"
          :xScale="xScale"
          :yScale="yScale"
        />
        <circle 
          v-if="hoveredPoint"
          :r="(xScale.bandwidth() / 2)"
          :cx="xAccessorScaled(hoveredPoint)"
          :cy="yAccessorScaled(hoveredPoint)"
          fill="#2c3e50"
          stroke="#ffffff"
          stroke-width="2px"
        />
        <!-- circle rendered when visitor hovers over scatterplot -->
        <circle 
          v-if="hoveredScatterplotPoint && hoveredScatterplotPoint.label == loc"
          :r="(xScale.bandwidth() / 2)"
          :cx="xAccessorScaled(hoveredScatterplotPoint)"
          :cy="yAccessorScaled(hoveredScatterplotPoint)"
          fill="#2c3e50"
          stroke="#ffffff"
          stroke-width="2px"  
        />
      </g>
    </svg>
  </div>
</template>
  
<script setup>
  import { computed, ref } from 'vue';
  import { max } from 'd3-array';
  import { scaleLinear } from 'd3-scale';
  import { line, curveMonotoneX } from 'd3-shape';
  import { lazyLoad } from '@/js/lazy-load';

  const GrXAxis = lazyLoad('GrXAxis');
  const GrAnnotations = lazyLoad('GrAnnotations');
  
  const props = defineProps({
    loc: String,
    lineage: String,
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
    hoveredScatterplotPoint: Object,
  });
  
  const emit = defineEmits(['line-hovered']);
  
  const hoveredPoint = ref(null);
  
  const yScale = computed(() => scaleLinear()
    .domain([0, max(props.data, props.yAccessor)])
    .range([props.innerHeight, 0])
    .nice()
  );

  const yMax = computed(() => yScale.value.range()[0]);
  
  const xAccessorScaled = computed(() => d => props.xScale(props.xAccessor(d)));
  const yAccessorScaled = computed(() => d => yScale.value(props.yAccessor(d)));
  
  const lineGenerator = computed(() => line()
    .x(xAccessorScaled.value)
    .y(yAccessorScaled.value)
    .defined(function (d) {
      return !Number.isNaN(d.Prevalence_7_percentage);
    })
    .curve(curveMonotoneX)
  );
  
  const prevalenceLine = computed(() => lineGenerator.value(props.data));
    
  const lineAttributes = [
    {color: "#ffffff", strokeWidth: "6px"}, 
    {color: "#2c3e50", strokeWidth: "2px"}
  ];
  
  const handleMouseMove = (e) => {
    const step = props.xScale.step();
    const domainIndex = Math.round((e.offsetX - props.margin.left) / step)
    const dateString = props.xScale.domain()[domainIndex];
    hoveredPoint.value = props.data.find(item => item.date === dateString);
    emit('line-hovered', hoveredPoint.value);
  }
  
  const handleMouseLeave = () => {
    hoveredPoint.value = null;
    emit('line-hovered', hoveredPoint.value);
  }
  
  const ariaLabel = computed(() => `Line chart of ${props.lineage} prevalence in ${props.loc}`);
</script>
  
<style>
  .line-chart {
    margin-top: 0px;
    margin-bottom: 10px;
  } 
</style>
  