<template>
  <div class="gr-charts">
    <div class="chart-header">
     <h3>{{ title }}</h3>
    </div>
    <div class="switch-container">
      <n-form-item
        label="Show confidence intervals" 
        class="confidence-interval"
      >
        <n-switch 
          v-model:value="isCIShown"
          @update:value="handleSwitchChange" 
        />
      </n-form-item>
    </div>
    <div 
      class="chart-wrapper" 
      :style="{ 'width': width + 'px' }"
      v-for="loc in selectedLocations" :key="loc"
      >
      <GrScatterplot
        :loc="loc" 
        :lineage="selectedLineage"
        :isCIShown="isCIShown"
        :data="filteredData.filter(element => element.label == loc)"
        :xAccessor="xAccessor"
        :yAccessor="yAccessor"
        :xScale="xScale"
        :yScale="yScale"
        :colorScale="colorScale"
        :greyScale="greyScale"
        :margin="margin"
        :width="width"
        :height="height"
        :innerWidth="innerWidth"
        :innerHeight="innerHeight"
        :hoveredLinePoint="hoveredLinePoint"
        @scatterplot-hovered="handleScatterplotHovered"
      />
      <GrLineChart
        :loc="loc"
        :lineage="selectedLineage"
        :data="filteredData.filter(element => element.label == loc)"
        :xAccessor="xAccessor"
        :yAccessor="yAccessorLine"
        :xScale="xScale"
        :colorScale="colorScale"
        :margin="marginLine"
        :width="width"
        :height="heightLine"
        :innerWidth="innerWidth"
        :innerHeight="innerHeightLine"
        :hoveredScatterplotPoint="hoveredScatterplotPoint"
        @line-hovered="handleLineHovered"
      />
      <GrVisLegend
        :loc="loc"
        :colorScale="colorScale" 
        :legendPoint="legendPoint"
      />
    </div>
  </div>
</template>

<script setup>
  import { computed, onMounted, onUnmounted, ref } from 'vue';
  import { NFormItem, NSwitch} from 'naive-ui'
  import { quantile, min, max } from 'd3-array';
  import { scaleBand, scaleLinear, scaleDiverging } from 'd3-scale';
  import { interpolateRdYlBu } from 'd3-scale-chromatic';
  import { lazyLoad } from '@/js/lazy-load';

  const GrScatterplot = lazyLoad('GrScatterplot');
  const GrLineChart = lazyLoad('GrLineChart');
  const GrVisLegend = lazyLoad('GrVisLegend');

  const props = defineProps({
    data: Array,
  });

  const isCIShown = ref(true);

  const xAccessor = d => d.date;
  const yAccessor = d => d.G_7_linear;
  const locationAccessor = d => d.label;
  const yAccessorLine = d => d.Prevalence_7_percentage;
  const greyAccessor = d => d.invDeltaG_7;

  const firstDay = computed(() => props.data.map(xAccessor).sort()[0]);
  const dayArray = computed(() => createDayArray(firstDay.value));
  
  const width = ref(900);
  const hoveredScatterplotPoint = ref(null);
  const hoveredLinePoint = ref(null);

  let height = 250;
  let heightLine = 60;

  onMounted(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });

  const handleResize = () => {
    if (window.innerWidth >= 1000) {
      width.value = 1000;
    }
    else {
      width.value = window.innerWidth;
    } 
  }

  const handleSwitchChange = (value) => {
    isCIShown.value = value;
  }

  const handleScatterplotHovered = (point) => {
    hoveredScatterplotPoint.value = point;
    if (hoveredScatterplotPoint.value) 
      legendPoint.value = hoveredScatterplotPoint.value;
  }

  const handleLineHovered = (point) => {
    hoveredLinePoint.value = point;
    if (hoveredLinePoint.value) 
      legendPoint.value = hoveredLinePoint.value;
  }

  const selectedLineage = computed(() => props.data[0].lineage);

  const title = computed(() => `${selectedLineage.value} growth rates`);

  const selectedLocations = computed(() => Array.from(new Set(props.data.map(locationAccessor))).sort());

  const lowerBound = computed(() => quantile(props.data, 0.1, yAccessor));
  const upperBound = computed(() => quantile(props.data, 0.9, yAccessor));

  const filteredData = computed(() => props.data.filter(
    d => d.G_7_linear >= lowerBound.value && d.G_7_linear <= upperBound.value,
  ));

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

  const createDayArray = (startDay) => {
    const tempArray = [];
    const lastDay = new Date();
    const day = new Date(startDay);
    while (day <= lastDay) {
      tempArray.push(day.toISOString().split("T")[0]);
      day.setUTCDate(day.getUTCDate() + 1);
    } 
    return tempArray;
  };

  const xScale = computed(() => scaleBand()
    .domain(dayArray.value)
    .range([0, innerWidth.value])
    .padding(0)
  );

  const yScale = computed(() => scaleLinear()
    .domain(
      padExtent(
        [min(filteredData.value, yAccessor), max(filteredData.value, yAccessor)],
        0.07,
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

  const greyScale = computed(() => scaleLinear()
    .domain([
      min(filteredData.value, greyAccessor),
      max(filteredData.value, greyAccessor),
    ])
    .range([0.1, 0.4])
  );

  const legendPoint = ref(null);
</script>

<style scoped>
  .gr-charts {
    display: flex;
    flex-direction: column;
    max-width: 1000px;
    width: 100%;
    text-align: left;
  }

  .chart-header {
    margin: 20px 50px 15px 50px;
    text-align: left;
  }

  .switch-container {
    margin-left: 50px;
    margin-right: 50px;
    text-align: left;
  }
  
  .chart-wrapper {
    position: relative;
    width: 100%;
    max-width: 1000px;
    margin-left: 50px;
    margin-right: 50px;
  }
</style>
