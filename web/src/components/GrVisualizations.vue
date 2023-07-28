<template>
  <div class="gr-visualizations">
    <div class="visualization-info">
      <div class="title-container">
        <h2>{{ title }}</h2>
      </div>
      <n-form-item
        label="show 95% confidence intervals"
        label-placement="left"
        class="switch-container"
      >
        <n-switch
          v-model:value="isCIShown"
          @update:value="handleSwitchChange" 
          size="small"
         />
      </n-form-item>
    </div>
    <GrSlider 
      @slider-value-updated="handleSnrUpdate"
    />
    <GrOverview
      v-if="data.length > 0"
      :lineage="selectedLineage"
      :locations="selectedLocations"
      :data="data.filter(element => element.snr >= snrThreshold)"
      :xAccessor="xAccessor"
      :yAccessor="lineChartYAccessor"
      :xScaleDomain="xScaleDomain"
      :colorScale="colorScale"
      :width="width"
    />
    <div 
      :id="loc.replace(/\s+/g, '-').toLowerCase()"
      class="visualization-wrapper" 
      v-for="loc in selectedLocations" :key="loc"
    >
      <h3>{{ loc }}</h3>
      <GrScatterplot
        :loc="loc" 
        :lineage="selectedLineage"
        :isCIShown="isCIShown"
        :data="data.filter(element => element.label == loc && element.snr >= snrThreshold)"
        :xAccessor="xAccessor"
        :yAccessor="scatterplotYAccessor"
        :xScale="xScale"
        :yScale="scatterplotYScale"
        :colorScale="colorScale"
        :margin="scatterplotMargin"
        :width="width"
        :height="scatterplotHeight"
        :innerWidth="innerWidth"
        :innerHeight="scatterplotInnerHeight"
        :hoveredLinePoint="hoveredLinePoint"
        @scatterplot-hovered="handleScatterplotHovered"
      />
      <GrLineChart
        :loc="loc"
        :lineage="selectedLineage"
        :data="data.filter(element => element.label == loc && element.snr >= snrThreshold)"
        :xAccessor="xAccessor"
        :yAccessor="lineChartYAccessor"
        :xScale="xScale"
        :colorScale="colorScale"
        :margin="lineChartMargin"
        :width="width"
        :height="lineChartHeight"
        :innerWidth="innerWidth"
        :innerHeight="lineChartInnerHeight"
        :hoveredScatterplotPoint="hoveredScatterplotPoint"
        @line-hovered="handleLineHovered"
      />
      <GrLegendWithPointer 
        :loc="loc" 
        :colorScale="colorScale"
        :legendPointer="legendPointer"
      />
    </div>
  </div>
</template>

<script setup>
  import { computed, onMounted, onUnmounted, ref } from 'vue';
  import { NFormItem, NSwitch} from 'naive-ui';
  import { min, max } from 'd3-array';
  import { scaleBand, scaleLinear, scaleDiverging } from 'd3-scale';
  import { interpolateRdYlBu } from 'd3-scale-chromatic';
  import { lazyLoad } from '@/js/lazy-load';

  const GrSlider = lazyLoad('GrSlider');
  const GrOverview = lazyLoad('GrOverview');
  const GrScatterplot = lazyLoad('GrScatterplot');
  const GrLineChart = lazyLoad('GrLineChart');
  const GrLegendWithPointer = lazyLoad('GrLegendWithPointer');

  const props = defineProps({
    data: Array,
  });

  const isCIShown = ref(true);

  const snrThreshold = ref(0);

  const xAccessor = d => d.date;
  const scatterplotYAccessor = d => d.G_7_linear;
  const locationAccessor = d => d.label;
  const lineChartYAccessor = d => d.Prevalence_7_percentage;

  const firstDay = computed(() => props.data.map(xAccessor).sort()[0]);
  const lastDay = computed(() => props.data.map(xAccessor).sort()[props.data.length - 1]);

  const xScaleDomain = computed(() => createDayArray(firstDay.value, lastDay.value));
  
  const width = ref(900);
  const hoveredScatterplotPoint = ref(null);
  const hoveredLinePoint = ref(null);

  let scatterplotHeight = 250;
  let lineChartHeight = 85;

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
      legendPointer.value = hoveredScatterplotPoint.value;
  }

  const handleLineHovered = (point) => {
    hoveredLinePoint.value = point;
    if (hoveredLinePoint.value) 
      legendPointer.value = hoveredLinePoint.value;
  }

  const handleSnrUpdate = (threshold) => {
    snrThreshold.value = threshold;
  }

  const selectedLineage = computed(() => props.data[0].lineage);

  const title = computed(() => `${selectedLineage.value} growth rates`);

  const selectedLocations = computed(() => Array.from(new Set(props.data.map(locationAccessor))).sort());

  const scatterplotMargin = {
    top: 30,
    right: 125,
    bottom: 5,
    left: 45,
  };

  const lineChartMargin = {
    top: 30,
    right: 125,
    bottom: 25,
    left: 45,
  };

  const innerWidth = computed(() => width.value - scatterplotMargin.left - scatterplotMargin.right);
  let scatterplotInnerHeight = scatterplotHeight - scatterplotMargin.top - scatterplotMargin.bottom;
  let lineChartInnerHeight = lineChartHeight - lineChartMargin.top - lineChartMargin.bottom;

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

  const scatterplotYScale = computed(() => scaleLinear()
    .domain(
      padExtent(
        [min(props.data,scatterplotYAccessor), max(props.data, scatterplotYAccessor)],
        0.07,
      )
    )
    .range([scatterplotInnerHeight, 0])
    .nice()
  );

  const interpolator = t => interpolateRdYlBu(1 - t);

  // color scale endpoints
  const extremeValue = computed(() => Math.max(Math.abs(min(props.data, scatterplotYAccessor)),
    Math.abs(max(props.data, scatterplotYAccessor))));  

  const colorScale = computed(() => scaleDiverging(
    [-Math.ceil(extremeValue.value), 0, Math.ceil(extremeValue.value)],
    interpolator,
  ));  

  const legendPointer = ref(null);
</script>

<style scoped>
  .gr-visualizations {
    display: flex;
    flex-direction: column;
    max-width: 1000px;
    width: 100%;
    text-align: left;
    margin-top: 25px;
  }
  .visualization-info {
    display: flex; 
    flex-flow: row wrap;
    margin-left: 50px;
    margin-right: 50px;
    gap: 10px;
  }
  .title-container {
    flex: 200 1 auto; 
    text-align: left;
  }
  .title-container h2 {
    font-size: 24px;
    font-weight: 700;
  }
  .switch-container {
    flex: 1 1 auto; 
  }
  .visualization-wrapper {
    position: relative;
    margin-left: 50px;
    margin-right: 50px;
    margin-bottom: 50px;
  }
  .visualization-wrapper h3 {
    color: #2c3e50;
    font-size: 18px;
    font-weight: 700;
  }
</style>
