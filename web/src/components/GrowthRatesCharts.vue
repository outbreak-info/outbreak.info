<template>
  <div>
    <h2>{{ title }}</h2>
    <div class="wrapper" v-for="loc in selectedLocations" :key="loc">
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
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { quantile, min, max } from 'd3-array';
  import { scaleBand, scaleLinear, scaleDiverging } from 'd3-scale';
  import { interpolateRdYlBu } from 'd3-scale-chromatic';
  import GrowthRatesScatterplot from '@/components/GrowthRatesScatterplot.vue';

  const props = defineProps({
    data: Array,
    selectedLineage: String,
    selectedLocations: Array,
  });

  console.log("data received by child component", props.data);

  const title = `${props.data[0].lineage} grow rates in the ${props.data[0].location}`;

  const xAccessor = d => d.date;
  const yAccessor = d => d.growth_rate;
  const locationAccessor = d => d.location;

  const selectedLocations = computed(() => Array.from(new Set(props.data.map(locationAccessor))).sort());

  console.log("selectedLocations", selectedLocations.value);

  const lowerBound = computed(() => quantile(props.data, 0.1, yAccessor));
  const upperBound = computed(() => quantile(props.data, 0.9, yAccessor));

  console.log("lowerBound", lowerBound.value);
  console.log("upperBound", upperBound.value);

  const filteredData = computed(() => props.data.filter(
    d => d.growth_rate >= lowerBound.value && d.growth_rate <= upperBound.value,
  ));

  console.log("filteredData", filteredData.value);

  const margin = {
    top: 60,
    right: 120,
    bottom: 5,
    left: 60,
  };

  let width = 700;
  let height = 250;

  const innerWidth = computed(() => width - margin.left - margin.right);
  let innerHeight = height - margin.top - margin.bottom;

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

  console.log("xScale domain", xScale.value.domain());
  console.log("yScale domain", yScale.value.domain());

  const interpolator = t => interpolateRdYlBu(1 - t);

  const colorScale = computed(() => scaleDiverging(
    [min(filteredData.value, yAccessor), 0, max(filteredData.value, yAccessor)],
    interpolator,
  ));

  console.log("colorScale range", colorScale.value.range());  
</script>

<style>
  .wrapper {
    position: relative;
    width: 100%;
    max-width: 700px;
  }
</style>
