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
      <GrVisHeader 
        :loc="loc" 
        :colorScale="colorScale"
        :legendPoint="legendPoint"
      />
      <GrScatterplot
        :loc="loc" 
        :lineage="selectedLineage"
        :isCIShown="isCIShown"
        :data="data.filter(element => element.label == loc)"
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
        :data="data.filter(element => element.label == loc)"
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
      <!-- <GrVisLegend
        :loc="loc"
        :colorScale="colorScale" 
        :legendPoint="legendPoint"
      /> -->
    </div>
  </div>
</template>

<script setup>
  import { computed, onMounted, onUnmounted, ref } from 'vue';
  import { NFormItem, NSwitch} from 'naive-ui'
  import { min, max } from 'd3-array';
  import { scaleBand, scaleLinear, scaleDiverging } from 'd3-scale';
  import { interpolateRdYlBu } from 'd3-scale-chromatic';
  import { lazyLoad } from '@/js/lazy-load';

  const GrVisHeader = lazyLoad('GrVisHeader');
  const GrScatterplot = lazyLoad('GrScatterplot');
  const GrLineChart = lazyLoad('GrLineChart');
 // const GrVisLegend = lazyLoad('GrVisLegend');

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
  const lastDay = computed(() => props.data.map(xAccessor).sort()[props.data.length - 1]);

  const xScaleDomain = computed(() => createDayArray(firstDay.value, lastDay.value));
  
  const width = ref(900);
  const hoveredScatterplotPoint = ref(null);
  const hoveredLinePoint = ref(null);

  let height = 250;
  let heightLine = 85;

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

  const margin = {
    top: 30,
    right: 125,
    bottom: 5,
    left: 45,
  };

  const marginLine = {
    top: 30,
    right: 125,
    bottom: 25,
    left: 45,
  };

  const innerWidth = computed(() => width.value - margin.left - margin.right);
  let innerHeight = height - margin.top - margin.bottom;
  let innerHeightLine = heightLine - marginLine.top - marginLine.bottom;

  const padExtent = ([min, max], paddingFactor) => {
    const delta = Math.abs(max - min);
    const padding = delta * paddingFactor;
    return [min - padding, max + padding];
  };

  const createDayArray = (first, last) => {
    const tempArray = [];
    const aDayInMs = 24 * 60 * 60 * 1000; 
    const firstDate = new Date(first);
    const lastDate = new Date(last);
    const numberOfDays = Math.round(Math.abs((lastDate - firstDate) / aDayInMs));
    const xScaleFirstDate = numberOfDays == 90 ? firstDate : new Date(lastDate - 90 * aDayInMs);
    while (xScaleFirstDate <= lastDate) {
      tempArray.push(xScaleFirstDate.toISOString().split("T")[0]);
      xScaleFirstDate.setUTCDate(xScaleFirstDate.getUTCDate() + 1);
    } 
    return tempArray;
  }

  const xScale = computed(() => scaleBand()
    .domain(xScaleDomain.value)
    .range([0, innerWidth.value])
    .padding(0)
  );

  const yScale = computed(() => scaleLinear()
    .domain(
      padExtent(
        [min(props.data, yAccessor), max(props.data, yAccessor)],
        0.07,
      )
    )
    .range([innerHeight, 0])
    .nice()
  );

  const interpolator = t => interpolateRdYlBu(1 - t);

  const extremeValue = computed(() => Math.max(Math.abs(min(props.data, yAccessor)),
    Math.abs(max(props.data, yAccessor))));  

  const colorScale = computed(() => scaleDiverging(
    [-Math.ceil(extremeValue.value), 0, Math.ceil(extremeValue.value)],
    interpolator,
  ));  

  const greyScale = computed(() => scaleLinear()
    .domain([
      min(props.data, greyAccessor),
      max(props.data, greyAccessor),
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
    margin-bottom: 50px;
  }
</style>
