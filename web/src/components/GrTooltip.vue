<template>
  <div
    class="gr-tooltip"
    :style='{
      top: `${yPosition}px`,
      left: `${xPosition}px`,
      width: `${tooltipWidth}px`,
    }'   
  >
    <div 
      class="title"
    >
      {{ hoveredPoint.lineage }}  &#183; {{ hoveredPoint.label }}
    </div>
    <div class="date">
      {{ formatTime(parseTime(hoveredPoint.date)) }}
      <hr class="divider" />
    </div>
    <div class="grid">
      <span>Growth rate</span>
      <span class="data">{{ `${formatGrowthRate(hoveredPoint.G_7_linear)}%` }}</span>
      <span>95% CI</span>
      <span class="data end-block">
        &#177;{{ `${formatGrowthRate(hoveredPoint.confidenceInterval95)}%` }}
      </span>
      <span>Prevalence</span>
      <span class="data">
        {{ `${formatGrowthRate(hoveredPoint.Prevalence_7_percentage)}%` }}
      </span>
      <span>{{ `${hoveredPoint.lineage} sequences` }}</span>
      <span class="data">{{ formatSequence(hoveredPoint.N_7) }}</span>
      <span>Total sequences</span>
      <span class="data end-block">{{ formatSequence(hoveredPoint.deltaN_7) }}</span>
      <span>Ratio over background</span>
      <span class="data">{{ ratioOverBackground }}</span>
      <span>Gr-uncertainty ratio</span>
      <span class="data">{{ formatSnr(hoveredPoint.snr) }}</span>
      <span 
        class="ci-alert"
        v-if="isCIClipped"
      >
        CI bar has been cut off
      </span>
    </div>
    <div>
      <span
        class="bar"
        :style='{background: `${colorScale(hoveredPoint.G_7_linear)}`}' 
      />
    </div>
  </div>
</template>
    
<script setup>
  import { computed } from 'vue';
  import { timeFormat, timeParse } from 'd3-time-format';
  import { format } from 'd3-format';
    
  const props = defineProps({
    loc: String,
    hoveredPoint: Object,
    xAccessor: Function,
    yAccessor: Function,
    xScale: Function,
    yScale: Function,
    colorScale: Function,
    margin: Object,
    innerWidth: Number,
    minGrowthRate: Number,
    maxGrowthRate: Number,
  });
    
  const formatTime = timeFormat('%b %e, %Y');
  const parseTime = timeParse('%Y-%m-%d');
  const formatGrowthRate = format(',.2f');
  const formatSequence = format(',.0f');
  const formatSnr = format(',.1f');
  
  const tooltipWidth = 240;
  
  const rightNudge = 60;
  const leftNudge = 110;
  const yNudge = 205;
      
  const x = computed(() => props.xScale(props.xAccessor(props.hoveredPoint))); 
  const y = computed(() => props.yScale(props.yAccessor(props.hoveredPoint)));
  
  const ratio = computed(() => Math.trunc(
    (props.hoveredPoint.deltaN_7 - props.hoveredPoint.N_7) / props.hoveredPoint.N_7, 
  ));

  const ratioOverBackground = computed(() =>
    ratio.value !== ratio.value ? 'N/A' : `1 : ${formatSequence(ratio.value)}`
  );
  
  const ci95 = computed(() => props.hoveredPoint.confidenceInterval95);
  
  const isCIClipped = computed(() => 
    props.hoveredPoint.G_7_linear + ci95.value > props.maxGrowthRate ||
    props.hoveredPoint.G_7_linear - ci95.value < props.minGrowthRate ||
    (props.hoveredPoint.G_7_linear + ci95.value > props.maxGrowthRate &&
      props.hoveredPoint.G_7_linear - ci95.value < props.minGrowthRate)
  );
  
  const xPosition = computed(() => (x.value + tooltipWidth) >= props.innerWidth ? x.value - leftNudge : x.value + rightNudge);
  const yPosition = computed(() => y.value - yNudge);
</script>
    
<style scoped>
  .gr-tooltip {
    background: #ffffff;
    box-shadow: 1px 2px 7px rgba(0, 0, 0, 0.2);
    border-radius: 3px;
    position: absolute;
    padding: 0.8em;
    pointer-events: none;
    text-align: left;
    font-size: 14px;
    line-height: 18px;
    z-index: 1;    
  }
  .title {
    font-weight: 700;
    font-size: 15px;
    line-height: 16px;
  }
  .date {
    font-size: 12px;
    text-transform: uppercase;
  }
  .divider {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    margin-top: 5px;
    margin-bottom: 5px;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr auto;
    column-gap: 20px;
    font-weight: 400;
  }
  .data {
    text-align: right;
  }
  .bar {
    position: absolute;
    height: 7px;
    width: 100%;
    bottom: 0;
    left: 0;
  }
  .end-block {
    margin-bottom: 8px;
  }
  .ci-alert {
    margin-top: 8px;
  }
</style>
    