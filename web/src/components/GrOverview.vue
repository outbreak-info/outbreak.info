<template>
  <div 
    class="wrapper"
    v-if="width >= 500"
    :style="{ 'width': width + 'px' }"
  >
    <h3>Overview</h3>
    <div class="table">
      <div class="table-row row-heading">
        <div class="table-cell location-cell column-heading">Location</div>
        <div class="table-cell growth-rate-cell column-heading">Growth rates</div>
         <div class="table-cell prevalence-cell column-heading">Prevalence</div>
      </div>
      <div 
        class="table-row row-content"
        v-for="location in locations" :key="location"
      >
        <div class="table-cell location-cell">
          <a 
            :href="`#${location.replace(/\s+/g, '-').toLowerCase()}`"
          >
            {{ location }}
          </a>
        </div>
        <div class="table-cell growth-rate-cell">
          <GrStripeCell 
            :location="location"
            :lineage="lineage"
            :data="data.filter(element => element.label == location)"
            :xScale="xScale"
            :xAccessorScaled="xAccessorScaled"
            :colorScale="colorScale"
            :width="miniChartWidth"
            :innerWidth="miniChartInnerWidth"
            :height="miniChartHeight"
            :innerHeight="miniChartInnerHeight"
            :margin="miniChartMargin"
          />
        </div>
        <div class="table-cell prevalence-cell">
          <GrLineCell
            :location="location"
            :lineage="lineage"
            :data="data.filter(element => element.label == location)"
            :xScale="xScale"
            :xAccessorScaled="xAccessorScaled"
            :yAccessor="yAccessor"
            :colorScale="colorScale"
            :width="miniChartWidth"
            :innerWidth="miniChartInnerWidth"
            :height="miniChartHeight"
            :innerHeight="miniChartInnerHeight"
            :margin="miniChartMargin"
          />
        </div>
      </div>      
    </div>
    <GrLegend
      :colorScale="colorScale" 
    />
  </div>
</template>
    
<script setup>
  import { computed } from 'vue';
  import { scaleBand } from 'd3-scale';
  import { lazyLoad } from '@/js/lazy-load';

  const GrStripeCell = lazyLoad('GrStripeCell');
  const GrLineCell = lazyLoad('GrLineCell');
  const GrLegend = lazyLoad('GrLegend');

  const props = defineProps({
    lineage: String,
    locations: Array,
    data: Array,
    xAccessor: Function,
    yAccessor: Function,
    xScaleDomain: Array,
    colorScale: Function,
    width: Number,
  });

  const miniChartMargin = {
    top: 5,
    right: 25,
    bottom: 25,
    left: 25,
  };

  const miniChartWidth = computed(() => props.width * 0.3);

  const miniChartHeight = 55;

  const miniChartInnerWidth = computed(() => miniChartWidth.value - miniChartMargin.left - miniChartMargin.right);

  const miniChartInnerHeight = miniChartHeight - miniChartMargin.top - miniChartMargin.bottom;

  const xScale = computed(() => scaleBand()
    .domain(props.xScaleDomain)
    .range([0, miniChartInnerWidth.value])
    .padding(0)
  );

  const xAccessorScaled = computed(() => d => xScale.value(props.xAccessor(d)));
</script>
    
<style scoped> 
  .wrapper {
    position: relative;
    width: 100%;
    max-width: 1000px;
    padding: 0 50px 0 50px;
    margin: 0px auto 35px;
  }
  .wrapper h3 {
    color: #2c3e50;
    font-size: 18px;
    font-weight: 700;
  }
  .location-cell {
    width: 25%;
  }  
  .location-cell a {
    color: #d13b62;
  }
  .growth-rate-cell {
    width: 37.5%;
  }  
  .prevalence-cell {
    width: 37.5%;
  }
  .table {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 0px;
  }
  .table-row {  
    display: flex;
    align-items: center;
    width: 100%; 
    padding-top: 5px;
    padding-bottom: 5px;
  }
  .table-cell {
    box-sizing: border-box;
    flex-grow: 1;
    color: #2c3e50;
    font-size: 14px;
    padding-left: 10px;
  }
  .column-heading {
    color: #2c3e50;
    font-size: 16px;
    font-weight: 700;
  }
  .row-heading {
    border-bottom: 1px solid rgb(44, 62, 80, 0.4);
  }
  .row-content {
    border-bottom: 1px solid rgb(44, 62, 80, 0.1);
  }
</style>
    