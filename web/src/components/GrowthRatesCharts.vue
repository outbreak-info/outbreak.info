<template>
  <div>
    <h2>{{ title }}</h2>
    <GrowthRatesLegend
      :colorScale="colorScale"
    />
    <div 
      class="wrapper" 
      :style="{ 'width': width + 'px' }"
      v-for="loc in selectedLocations" :key="loc"
      >
      <GrowthRatesScatterplot 
        :loc="loc" 
        :data="filteredData.filter(element => element.location == loc)"
        :xAccessor="xAccessor"
        :yAccessor="yAccessor"
        :xScale="xScale"
        :yScale="yScale"
        :colorScale="colorScale"
        :margin="margin"
        :width="width"
        :height="height"
        :innerWidth="innerWidth"
        :innerHeight="innerHeight"
      />
      <GrowthRatesLineChart
        :loc="loc"
        :data="filteredData.filter(element => element.location == loc)"
        :xAccessor="xAccessor"
        :yAccessor="yAccessorLine"
        :xScale="xScale"
        :colorScale="colorScale"
        :margin="marginLine"
        :width="width"
        :height="heightLine"
        :innerWidth="innerWidth"
        :innerHeight="innerHeightLine"
      />
    </div>
  </div>
</template>

<script setup>
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { quantile, min, max } from 'd3-array';
  import { scaleBand, scaleLinear, scaleDiverging } from 'd3-scale';
  import { interpolateRdYlBu } from 'd3-scale-chromatic';
  import GrowthRatesLegend from './GrowthRatesLegend.vue';
  import GrowthRatesScatterplot from '@/components/GrowthRatesScatterplot.vue';
  import GrowthRatesLineChart from '@/components/GrowthRatesLineChart.vue';

  const width = ref(700);
  let height = 250;
  let heightLine = 60;

  onMounted(() => {
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });

  const handleResize = () => {
    if (window.innerWidth >= 900) {
      width.value = 700;
    }
    else {
      width.value = window.innerWidth;
    } 
    console.log(">>>>", width.value);
  }
  
  const props = defineProps({
    data: Array,
    selectedLineage: String,
    selectedLocations: Array,
  });

  console.log("data received by child component", props.data);

  const title = `${props.data[0].lineage} grow rates in selected locations`;

  const xAccessor = d => d.date;
  const yAccessor = d => d.growth_rate;
  const locationAccessor = d => d.location;
  const yAccessorLine = d => d.prevalence;

  const selectedLocations = computed(() => Array.from(new Set(props.data.map(locationAccessor))).sort());

  console.log("selectedLocations", selectedLocations.value);

  const lowerBound = computed(() => quantile(props.data, 0.1, yAccessor));
  const upperBound = computed(() => quantile(props.data, 0.9, yAccessor));

  const filteredData = computed(() => props.data.filter(
    d => d.growth_rate >= lowerBound.value && d.growth_rate <= upperBound.value,
  ));

  console.log("filteredData", filteredData.value);

  const margin = {
    top: 60,
    right: 120,
    bottom: 5,
    left: 65,
  };

  const marginLine = {
    top: 5,
    right: 120,
    bottom: 25,
    left: 65,
  };

  const innerWidth = computed(() => width.value - margin.left - margin.right);
  let innerHeight = height - margin.top - margin.bottom;
  let innerHeightLine = heightLine - marginLine.top - marginLine.bottom;

  const padExtent = ([min, max], paddingFactor) => {
    const delta = Math.abs(max - min);
    const padding = delta * paddingFactor;
    return [min - padding, max + padding];
  };

  const xScale = computed(() => scaleBand()
    .domain(filteredData.value.map(xAccessor).sort())
    .range([0, innerWidth.value])
    .padding(0)
  ); 

  const yScale = computed(() => scaleLinear()
    .domain(
      padExtent(
        [min(filteredData.value, yAccessor), max(filteredData.value, yAccessor)],
        0.05,
      )
    )
    .range([innerHeight, 0])
    .nice()
  );

  const interpolator = t => interpolateRdYlBu(1 - t);

  const extremeValue = computed(() => Math.max(Math.abs(min(filteredData.value, yAccessor)),
                                  Math.abs(max(filteredData.value, yAccessor))));  

  const colorScale = computed(() => scaleDiverging(
    [-Math.ceil(extremeValue.value), 0, Math.ceil(extremeValue.value)],
    interpolator,
  ));  
</script>

<style>
  .wrapper {
    position: relative;
    width: 100%;
    max-width: 700px;
  }
</style>
