<template>
  <div class="scatterplot" v-if="data.length > 0">
    <svg 
      role="img"
      class="chart"
      :aria-label="ariaLabel"
      :width="width" 
      :height="height"
    >
      <g :transform="`translate(${margin.left}, ${margin.top})`">
        <GrYAxis 
          :xScale="xScale"
          :yScale="yScale"
          :innerWidth="innerWidth"
        />
        <GrCI95 
          v-if="isCIShown"
          :data="data"
          :xAccessor="xAccessor"
          :xScale="xScale"
          :yScale="yScale"
          :minGrowthRate="minGrowthRate"
          :maxGrowthRate="maxGrowthRate"
        />
        <rect
          :width="innerWidth"
          :height="innerHeight"
          :x="0"
          :y="0"
          fill="#ffffff"
          fill-opacity="0"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseLeave"
        />
        <g>
          <circle 
            v-for="(dataPoint, index) in data" :key="'point-' + index"
            :r="xScale.bandwidth() / 2"
            :cx="xAccessorScaled(dataPoint)"
            :cy="yAccessorScaled(dataPoint)"
            :fill="colorScale(dataPoint.G_7_linear)"
            stroke="#2c3e50"
            stroke-width="1px"
          />
        </g>
        <circle
          v-if="hoveredPoint"
          :r="(xScale.bandwidth() / 2) + 3"
          :cx="xAccessorScaled(hoveredPoint)"
          :cy="yAccessorScaled(hoveredPoint)"
          fill="none" 
          stroke="#2c3e50"
          stroke-width="2px"
        />
        <!-- circle rendered when visitor hovers over line chart -->
        <circle
          v-if="hoveredLinePoint && hoveredLinePoint.label == loc"
          :r="(xScale.bandwidth() / 2) + 3"
          :cx="xAccessorScaled(hoveredLinePoint)"
          :cy="yAccessorScaled(hoveredLinePoint)"
          fill="none" 
          stroke="#2c3e50"
          stroke-width="2px"
        />
      </g>
    </svg>
  </div>
  <GrTooltip
    v-if="hoveredPoint"
    :loc="loc"
    :hoveredPoint="hoveredPoint"
    :xAccessor="xAccessor"
    :yAccessor="yAccessor"
    :xScale="xScale"
    :yScale="yScale"
    :colorScale="colorScale"
    :margin="margin"  
    :innerWidth="innerWidth"
    :minGrowthRate="minGrowthRate"
    :maxGrowthRate="maxGrowthRate"
  />
  <!-- tooltip rendered when visitor hovers over line chart -->
  <GrTooltip
    v-if="hoveredLinePoint && hoveredLinePoint.label == loc"
    :loc="loc"
    :hoveredPoint="hoveredLinePoint"
    :xAccessor="xAccessor"
    :yAccessor="yAccessor"
    :xScale="xScale"
    :yScale="yScale"
    :colorScale="colorScale"
    :margin="margin"  
    :innerWidth="innerWidth"
    :minGrowthRate="minGrowthRate"
    :maxGrowthRate="maxGrowthRate"
  />
</template>
  
<script setup>
  import { computed, ref } from 'vue';
  import { quadtree } from 'd3-quadtree';
  import { lazyLoad } from '@/js/lazy-load';

  const GrYAxis = lazyLoad('GrYAxis');
  const GrCI95 = lazyLoad('GrCI95');
  const GrTooltip = lazyLoad('GrTooltip');
  
  const props = defineProps({
    loc: String,
    lineage: String,
    isCIShown: Boolean,
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
    hoveredLinePoint: Object,
  });
  
  const emit = defineEmits(['scatterplot-hovered']);
  
  const hoveredPoint = ref(null);
   
  const xAccessorScaled = computed(() => d => props.xScale(props.xAccessor(d)));
  const yAccessorScaled = computed(() => d => props.yScale(props.yAccessor(d)));
  
  // create a quadtree to improve the user experience when visitor interacts with scatterplot points
  const quadtreeInstance = computed (() => quadtree()
    .x(d => props.xScale(props.xAccessor(d)))
    .y(d => props.yScale(props.yAccessor(d)))
    .addAll(props.data)
  );
  
  const handleMouseMove = (e) => {
    const xPosition = e.offsetX - props.margin.left;
    const yPosition = e.offsetY - props.margin.top;
    hoveredPoint.value = quadtreeInstance.value.find(xPosition, yPosition);
    emit('scatterplot-hovered', hoveredPoint.value);
  }
  
  const handleMouseLeave = () => {
    hoveredPoint.value = null;
    emit('scatterplot-hovered', null);
  }
  
  const minGrowthRate = computed(() => props.yScale.domain()[0]);
  const maxGrowthRate = computed(() => props.yScale.domain()[1]);
  
  const ariaLabel = computed(() => `Scatterplot of ${props.lineage} growth rates in ${props.loc}`);
</script>
  