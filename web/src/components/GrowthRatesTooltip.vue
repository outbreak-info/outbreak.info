<template>
  <div
    class="gr-tooltip"
    :style='{
      top: `${y + 10}px`,
      left: `${x}px`,
    }'
  >
    <div 
      class="title"
    >
      {{ hoveredPoint.lineage }}  &#183; {{ loc }}
    </div>
    <div class="date">
      {{ formatTime(parseTime(hoveredPoint.date)) }}
      <hr class="divider" />
    </div>
    <div class="grid">
      <span>Growth rate</span>
      <span class="data">{{ `${formatGrowthRate(hoveredPoint.growth_rate)}%` }}</span>
      <span>95% CI</span>
      <span class="data end-block">
        &#177;{{ `${formatGrowthRate(hoveredPoint.uncertainty95)}%` }}
      </span>
      <span>Prevalence</span>
      <span class="data">
        {{ `${formatGrowthRate(hoveredPoint.prevalence)}%` }}
      </span>
      <span>{{ `${hoveredPoint.lineage} sequences` }}</span>
      <span class="data">{{ formatSequence(hoveredPoint.N_7) }}</span>
      <span>Total sequences</span>
      <span class="data end-block">{{ formatSequence(hoveredPoint.totalSequences) }}</span>
      <span>Ratio over background</span>
      <span class="data">{{ `1 : ${formatSequence(ratio)}` }}</span>
      <span 
        class="ci-alert"
        v-if="wasCIClipped"
      >
        CI bar has been cut off
      </span>
    </div>
    <div>
      <span
        class="bar"
        :style='{background: `${colorScale(hoveredPoint.growth_rate)}`}' 
      />
    </div>
  </div>
</template>
  
<script setup>
  import { computed} from 'vue';
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
    minGrowthRate: Number,
    maxGrowthRate: Number,
  });
  
  const formatTime = timeFormat('%b %e, %Y');
  const parseTime = timeParse('%Y-%m-%d');
  const formatGrowthRate = format(',.2f');
  const formatSequence = format(',.0f');
    
  const x = computed(() => props.xScale(props.xAccessor(props.hoveredPoint)) + props.margin.left);  
  const y = computed(() => props.yScale(props.yAccessor(props.hoveredPoint)) + props.margin.top);

  const ratio = computed(() => Math.trunc(
    (props.hoveredPoint.totalSequences - props.hoveredPoint.sequences) / props.hoveredPoint.sequences, 
  ));

  const ci95 = computed(() => props.hoveredPoint.intervals[props.hoveredPoint.intervals.length - 1]);

  const wasCIClipped = computed(() => 
    props.hoveredPoint.growth_rate + ci95.value > props.maxGrowthRate ||
    props.hoveredPoint.growth_rate - ci95.value < props.minGrowthRate ||
    (props.hoveredPoint.growth_rate + ci95.value > props.maxGrowthRate &&
      props.hoveredPoint.growth_rate - ci95.value < props.minGrowthRate));
</script>
  
<style>
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
  