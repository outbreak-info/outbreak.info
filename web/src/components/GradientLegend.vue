<template>
  <div class="d-flex flex-column">
    <small :class="[dark ? 'text-light' : 'text-muted']">{{ label }}</small>
    <svg :width="legendWidth" height="30" transform="translate(0,0)">
      <defs>
        <linearGradient id="linear-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop
            :offset="(i * 100) / 10 + '%'"
            :style="{ 'stop-color': color }"
            v-for="(color, i) in legendColors"
            :key="i"
          />
        </linearGradient>
      </defs>
      <rect
        :width="legendWidth"
        height="15"
        fill="url(#linear-gradient)"
        stroke="#2c3e50"
        stroke-width="0.25"
      ></rect>
      <text
        x="0"
        y="18"
        :fill="legendColor"
        font-size="0.85em"
        dominant-baseline="hanging"
      >
        {{ minValue }}
      </text>
      <text
        :x="legendWidth"
        y="18"
        dominant-baseline="hanging"
        text-anchor="end"
        :fill="legendColor"
        font-size="0.85em"
      >
        {{ maxValue }}
      </text>
    </svg>
  </div>
</template>

<script>
import { range } from 'd3-array';

export default {
  name: 'GradientLegend',
  props: {
    label: String,
    dark: {
      type: Boolean,
      default: true,
    },
    legendWidth: {
      type: Number,
      default: 200,
    },
    minValue: {
      type: String,
      default: '0',
    },
    maxValue: String,
    colorScale: Function,
  },
  data() {
    return {
      legendColors: [],
    };
  },
  computed: {
    legendColor() {
      return this.dark ? '#f8f9fa' : '#6c757d';
    },
  },
  watch: {
    colorScale: {
      immediate: true,
      handler(newVal, oldVal) {
        if (this.colorScale) {
          // legend gradient
          const domain = this.colorScale.domain();
          const step = (domain[1] - domain[0]) / 10;
          this.legendColors = range(domain[0], domain[1] + step, step).map(
            (d) => this.colorScale(d),
          );
        }
      },
    },
  },
};
</script>
