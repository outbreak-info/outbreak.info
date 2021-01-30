<template>
<div class="d-flex flex-column">
  <small class="text-muted">{{label}}</small>
  <svg :width="legendWidth" height="30" transform="translate(0,0)">
    <defs>
      <linearGradient id="linear-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
        <stop :offset="i*100/10 + '%'" :style="{'stop-color':color}" v-for="(color, i) in legendColors" :key="i" />
      </linearGradient>
    </defs>
    <rect :width="legendWidth" height="15" fill="url(#linear-gradient)" stroke="#2c3e50" stroke-width="0.25"></rect>
    <text x="0" y="18" fill="#555" font-size="0.85em" dominant-baseline="hanging">{{ minValue }}</text>
    <text :x="legendWidth" y="18" dominant-baseline="hanging" text-anchor="end" fill="#555" font-size="0.85em">{{ maxValue }}</text>
  </svg>
</div>
</template>

<script>
import Vue from "vue";
import {
  range
} from "d3";
export default Vue.extend({
  name: "ReportPrevalenceByLocation",
  props: {
    label: String,
    legendWidth: {
      type: Number,
      default: 150
    },
    minValue: {
      type: String,
      default: "0"
    },
    maxValue: String,
    colorScale: Function
  },
  data() {
    return {
      legendColors: []
    }
  },
  watch: {
    colorScale: {
      immediate: true,
      handler(newVal, oldVal) {
        // legend gradient
        this.legendColors = range(11).map(d => this.colorScale(d / 10));
      }
    }
  }
})
</script>
