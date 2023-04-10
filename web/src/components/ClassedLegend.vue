<template>
  <div :class="{ 'd-flex': horizontal }">
    <!-- CATEGORICAL LEGEND -->
    <div>
      <div class="text-muted">
        {{ label }}
      </div>
      <div v-if="colorScale" class="d-flex flex-wrap mt-n2">
        <svg
          :width="35"
          :height="rectWidth + 15"
          class="categorical-rect my-1"
          style="margin-right: 15px"
        >
          <g transform="translate(2,2)">
            <rect
              :width="rectWidth"
              :height="rectWidth"
              x="0"
              y="0"
              :fill="colorScale(0)"
              :stroke="strokeColor"
              stroke-width="1"
            />
            <text
              :x="0"
              :y="rectWidth"
              dy="5"
              dominant-baseline="hanging"
              text-anchor="start"
              :fill="strokeColor"
              font-size="10px"
            >
              0-{{ colorDomain[0] * 100 }}
            </text>
          </g>
        </svg>

        <svg
          v-for="(color, i) in colorDomain"
          :key="i"
          :width="35"
          :height="rectWidth + 15"
          class="categorical-rect my-1"
          style="margin-right: 15px"
        >
          <g transform="translate(2,2)">
            <rect
              :width="rectWidth"
              :height="rectWidth"
              x="0"
              y="0"
              :fill="colorScale(color)"
              :stroke="strokeColor"
              stroke-width="1"
            />
            <text
              v-if="i < colorDomain.length - 1"
              :x="0"
              :y="rectWidth"
              dy="5"
              dominant-baseline="hanging"
              text-anchor="start"
              :fill="strokeColor"
              font-size="10px"
            >
              {{ color * 100 }}-{{ colorDomain[i + 1] * 100 }}
            </text>
            <text
              v-if="i === colorDomain.length - 1"
              :x="0"
              :y="rectWidth"
              dy="5"
              dominant-baseline="hanging"
              text-anchor="start"
              :fill="strokeColor"
              font-size="10px"
            >
              {{ color * 100 }}-100%
            </text>
          </g>
        </svg>
      </div>
    </div>

    <!-- WEIRDO LEGEND -->
    <svg
      v-if="includeNulls"
      id="manual-legend"
      ref="manual-legend"
      :width="280"
      :height="58"
      class="report-choropleth-legend my-2"
      role="legend"
    >
      <defs>
        <pattern
          id="diagonalHatchLegend"
          width="10"
          height="10"
          patternTransform="rotate(45 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="10"
            :style="`stroke:${strokeColor}; stroke-width:1.75`"
          />
        </pattern>
      </defs>

      <g transform="translate(1,1)">
        <rect
          x="0"
          y="40"
          :width="rectWidth"
          :height="rectWidth"
          :fill="filteredColor"
          :stroke="strokeColor"
          stroke-width="1"
        />
        <rect
          x="0"
          y="20"
          :width="rectWidth"
          :height="rectWidth"
          fill="url(#diagonalHatchLegend)"
          :stroke="strokeColor"
          stroke-width="1"
        />
        <rect
          x="0"
          y="0"
          :width="rectWidth"
          :height="rectWidth"
          :fill="nullColor"
          :stroke="strokeColor"
          stroke-width="1"
        />

        <text
          style="font-family: 'DM Sans', Avenir, Helvetica, Arial, sans-serif"
          x="22"
          y="40"
          dy="7"
          dominant-baseline="central"
          :fill="strokeColor"
          font-size="14px"
        >
          sequenced &lt; {{ countThreshold }} samples
        </text>
        <text
          style="font-family: 'DM Sans', Avenir, Helvetica, Arial, sans-serif"
          x="22"
          y="20"
          dy="7"
          dominant-baseline="central"
          :fill="strokeColor"
          font-size="14px"
        >
          {{ mutationName }} not detected
        </text>
        <text
          style="font-family: 'DM Sans', Avenir, Helvetica, Arial, sans-serif"
          x="22"
          y="0"
          dy="7"
          dominant-baseline="central"
          :fill="strokeColor"
          font-size="14px"
        >
          no sequencing
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { select, selectAll } from 'd3-selection';

const props = defineProps({
  colorScale: Function,
  strokeColor: {
    type: String,
    default: '#2c3e50',
  },
  filteredColor: {
    type: String,
    default: '#A5A5A5',
  },
  nullColor: {
    type: String,
    default: '#EFEFEF',
  },
  label: String,
  mutationName: String,
  countThreshold: Number,
  horizontal: {
    type: Boolean,
    default: true,
  },
  includeNulls: {
    type: Boolean,
    default: true,
  },
});

const rectWidth = ref(15);
const colorDomain = ref([]);

const updateColorLegend = () => {
  if (props.colorScale) {
    colorDomain.value = props.colorScale.domain();
    selectAll('.categorical-rect').each(function () {
      const bbox = this.getBBox();
      select(this).attr('width', bbox.width + 1 < 18 ? 18 : bbox.width + 1);

      select(this)
        .select('rect')
        .attr('x', (bbox.width + 1 - 15) / 2);
    });
  }
};

watch(
  () => props.colorScale,
  (newVal, oldVal) => {
    updateColorLegend();
  },
  { immediate: true, deep: true },
);
</script>
